import {
  centsToPrice,
  multiplyPrice,
  priceToCents,
} from "@/modules/procedures";
import type {
  AppointmentDetail,
  AppointmentDetailCreateRequest,
  AppointmentDetailUpdateRequest,
} from "../types/appointment.types";

export const MAX_QUANTITY = 1000;

/** Datos del catálogo necesarios para mostrar y estimar una línea. */
export interface ProcedureInfo {
  id: number;
  name: string;
  code: string | null;
  isActive: boolean;
  /** `null` si no se pudo consultar el catálogo. */
  basePrice: string | null;
  baseDurationMinutes: number | null;
}

/**
 * Línea de procedimiento del formulario: un detalle ya guardado (`saved`,
 * identificado por su `detail_id`) o uno nuevo aún sin guardar. `saved` es la
 * referencia confirmada por la API; la edición se calcula contra ella, de modo
 * que reintentar solo ejecuta lo que falta.
 */
export interface AppointmentLine {
  key: string;
  procedure: ProcedureInfo;
  quantity: string;
  /** Precio de la línea tal como se escribe (decimal con hasta 2 decimales). */
  unitPrice: string;
  notes: string;
  saved: AppointmentDetail | null;
  removed: boolean;
  /** Error de la última operación sobre esta línea. */
  error: string | null;
}

export type LineOperation = "create" | "update" | "delete" | "none";

/** Entero positivo de 1 a 1000 (sin decimales, ceros a la izquierda ni signos). */
export function parseQuantity(value: string): number | null {
  const text = value.trim();
  if (!/^[1-9]\d*$/.test(text)) return null;
  const quantity = Number(text);
  return quantity <= MAX_QUANTITY ? quantity : null;
}

export function createLine(
  procedure: ProcedureInfo,
  saved: AppointmentDetail | null = null,
): AppointmentLine {
  return {
    key: saved ? `detail-${saved.id}` : `new-${procedure.id}-${Date.now()}`,
    procedure,
    quantity: String(saved?.quantity ?? 1),
    unitPrice: saved?.unit_price ?? procedure.basePrice ?? "",
    notes: saved?.notes ?? "",
    saved,
    removed: false,
    error: null,
  };
}

/** Precio válido (decimal no negativo con hasta 2 decimales). */
export function isPriceValid(line: AppointmentLine): boolean {
  return priceToCents(line.unitPrice) !== null;
}

/** El precio escrito es válido y distinto del precio guardado del detalle. */
function isPriceChanged(line: AppointmentLine): boolean {
  if (!line.saved) return false;
  const cents = priceToCents(line.unitPrice);
  return cents !== null && cents !== priceToCents(line.saved.unit_price);
}

export function getLineOperation(line: AppointmentLine): LineOperation {
  if (line.removed) return line.saved ? "delete" : "none";
  if (!line.saved) return "create";
  const quantity = parseQuantity(line.quantity);
  const notesChanged = line.notes.trim() !== (line.saved.notes ?? "");
  return quantity !== line.saved.quantity ||
    notesChanged ||
    isPriceChanged(line)
    ? "update"
    : "none";
}

/** Precio unitario de la línea: el que se escribió, si es válido. */
export function getUnitPrice(line: AppointmentLine): string | null {
  return isPriceValid(line) ? line.unitPrice.trim() : null;
}

/**
 * Duración de la línea. Con el detalle sin cambios es la que entregó el backend
 * (no se vuelve a multiplicar); si se cambió la cantidad es una **estimación**
 * hasta guardar (duración por unidad × nueva cantidad).
 */
export function getLineDuration(line: AppointmentLine): number | null {
  const quantity = parseQuantity(line.quantity);
  if (line.saved) {
    if (quantity === null || quantity === line.saved.quantity)
      return line.saved.duration_minutes;
    return (line.saved.duration_minutes / line.saved.quantity) * quantity;
  }
  const base = line.procedure.baseDurationMinutes;
  return quantity === null || base === null ? null : base * quantity;
}

/** Importe de la línea (`unit_price × quantity`) en céntimos exactos, sin `float`. */
export function getLineAmount(line: AppointmentLine): string | null {
  const quantity = parseQuantity(line.quantity);
  if (
    line.saved &&
    !isPriceChanged(line) &&
    (quantity === null || quantity === line.saved.quantity)
  )
    return line.saved.line_amount;
  const unitPrice = getUnitPrice(line);
  if (unitPrice === null || quantity === null) return null;
  return multiplyPrice(unitPrice, quantity);
}

/** `true` si el importe o la duración mostrados son estimaciones locales. */
export function isEstimate(line: AppointmentLine): boolean {
  const quantity = parseQuantity(line.quantity);
  return (
    !line.saved ||
    isPriceChanged(line) ||
    (quantity !== null && quantity !== line.saved.quantity)
  );
}

export interface LinesSummary {
  count: number;
  totalAmount: string;
  totalDuration: number;
  /** Alguna línea no tiene datos suficientes para calcular su importe o duración. */
  incomplete: boolean;
  hasEstimates: boolean;
}

export function summarizeLines(lines: AppointmentLine[]): LinesSummary {
  let cents = 0n;
  let duration = 0;
  let incomplete = false;
  let hasEstimates = false;
  const active = lines.filter((line) => !line.removed);

  for (const line of active) {
    const amount = getLineAmount(line);
    const lineDuration = getLineDuration(line);
    const amountCents = amount === null ? null : priceToCents(amount);
    if (amountCents === null || lineDuration === null) incomplete = true;
    else {
      cents += amountCents;
      duration += lineDuration;
    }
    if (isEstimate(line)) hasEstimates = true;
  }

  return {
    count: active.length,
    totalAmount: centsToPrice(cents),
    totalDuration: duration,
    incomplete,
    hasEstimates,
  };
}

export function toCreateDetailPayload(
  line: AppointmentLine,
): AppointmentDetailCreateRequest {
  const notes = line.notes.trim();
  // El precio se envía solo si el usuario lo cambió respecto al del catálogo.
  const cents = priceToCents(line.unitPrice);
  const baseCents =
    line.procedure.basePrice === null
      ? null
      : priceToCents(line.procedure.basePrice);
  const customPrice = cents !== null && cents !== baseCents;
  return {
    procedure_id: line.procedure.id,
    quantity: parseQuantity(line.quantity) ?? 1,
    ...(customPrice && { unit_price: centsToPrice(cents) }),
    ...(notes && { notes }),
  };
}

/** Solo lo modificado (cantidad, precio, notas); las notas vaciadas se envían como `null`. */
export function toUpdateDetailPayload(
  line: AppointmentLine,
): AppointmentDetailUpdateRequest {
  const saved = line.saved!;
  const payload: AppointmentDetailUpdateRequest = {};
  const quantity = parseQuantity(line.quantity);
  if (quantity !== null && quantity !== saved.quantity)
    payload.quantity = quantity;
  if (isPriceChanged(line))
    payload.unit_price = centsToPrice(priceToCents(line.unitPrice)!);
  const notes = line.notes.trim();
  if (notes !== (saved.notes ?? "")) payload.notes = notes || null;
  return payload;
}

/** Minutos entre dos horas `HH:mm` del mismo día; `null` si no son válidas o no hay duración positiva. */
export function getReservedMinutes(
  startTime: string,
  endTime: string,
): number | null {
  const toMinutes = (value: string) => {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  return start === null || end === null || end <= start ? null : end - start;
}

/** `HH:mm` resultante de sumar minutos a una hora; `null` si cruza la medianoche. */
export function addMinutes(time: string, minutes: number): string | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const total = Number(match[1]) * 60 + Number(match[2]) + Math.ceil(minutes);
  if (total >= 24 * 60) return null;
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  return `${hours}:${String(total % 60).padStart(2, "0")}`;
}
