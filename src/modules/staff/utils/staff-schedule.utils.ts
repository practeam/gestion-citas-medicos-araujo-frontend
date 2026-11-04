import type { Translator } from "@/i18n";
import { isApiError } from "@/services/api";
import { staffScheduleApi } from "../services/staff-schedule-api";
import type {
  StaffSchedule,
  StaffScheduleCreateRequest,
  StaffScheduleUpdateRequest,
  ScheduleDraft,
  ScheduleFormValues,
  ScheduleOperation,
  ScheduleOperationResult,
} from "../types/staff-schedule.types";

/** 1 = lunes … 7 = domingo, tal como los define el backend. */
export const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

const MAX_DATE = "9999-12-31";

/** Las horas locales se envían como `HH:MM`, sin conversión de zona horaria. */
export function normalizeTime(value: string) {
  return value.slice(0, 5);
}

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function emptyScheduleValues(): ScheduleFormValues {
  return {
    day_of_week: 1,
    starts_at: "",
    ends_at: "",
    valid_from: todayIsoDate(),
    valid_until: "",
  };
}

export function newDraft(): ScheduleDraft {
  return { key: crypto.randomUUID(), values: emptyScheduleValues() };
}

export function toFormValues(schedule: StaffSchedule): ScheduleFormValues {
  return {
    day_of_week: schedule.day_of_week,
    starts_at: normalizeTime(schedule.starts_at),
    ends_at: normalizeTime(schedule.ends_at),
    valid_from: schedule.valid_from,
    valid_until: schedule.valid_until ?? "",
  };
}

/**
 * Validación preventiva de un intervalo. Devuelve una clave i18n relativa a
 * `staff.schedules.validation` o `null` si es válido. El backend decide
 * definitivamente.
 */
export function validateSchedule(values: ScheduleFormValues): string | null {
  if (
    !Number.isInteger(values.day_of_week) ||
    values.day_of_week < 1 ||
    values.day_of_week > 7
  ) {
    return "dayInvalid";
  }
  if (!values.starts_at) return "startsRequired";
  if (!values.ends_at) return "endsRequired";
  // Sin duración cero ni cruce de medianoche: el inicio debe ser anterior al fin.
  if (values.starts_at >= values.ends_at) return "timeOrder";
  if (!values.valid_from) return "validFromRequired";
  if (values.valid_until && values.valid_until < values.valid_from) {
    return "validUntilBeforeFrom";
  }
  return null;
}

/** Dos intervalos activos chocan si coinciden el día, las horas y las vigencias. */
function overlaps(a: ScheduleFormValues, b: ScheduleFormValues) {
  return (
    a.day_of_week === b.day_of_week &&
    a.starts_at < b.ends_at &&
    b.starts_at < a.ends_at &&
    a.valid_from <= (b.valid_until || MAX_DATE) &&
    b.valid_from <= (a.valid_until || MAX_DATE)
  );
}

export interface ScheduleEntry {
  key: string;
  values: ScheduleFormValues;
  isActive: boolean;
}

/**
 * Detecta solapamientos preventivos entre intervalos **activos** (día, horas y
 * vigencia). Los inactivos no participan. Devuelve la clave de cada intervalo
 * implicado. El backend es la autoridad definitiva.
 */
export function findOverlappingKeys(entries: ScheduleEntry[]): Set<string> {
  const active = entries.filter(
    (entry) => entry.isActive && validateSchedule(entry.values) === null,
  );
  const result = new Set<string>();
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      if (overlaps(active[i].values, active[j].values)) {
        result.add(active[i].key);
        result.add(active[j].key);
      }
    }
  }
  return result;
}

export function toCreateRequest(
  values: ScheduleFormValues,
): StaffScheduleCreateRequest {
  return {
    day_of_week: values.day_of_week,
    starts_at: values.starts_at,
    ends_at: values.ends_at,
    valid_from: values.valid_from,
    valid_until: values.valid_until || null,
  };
}

/** Solo los campos que cambiaron respecto del horario guardado. */
export function toUpdateRequest(
  values: ScheduleFormValues,
  schedule: StaffSchedule,
): StaffScheduleUpdateRequest {
  const current = toFormValues(schedule);
  const payload: StaffScheduleUpdateRequest = {};
  if (values.day_of_week !== current.day_of_week) {
    payload.day_of_week = values.day_of_week;
  }
  if (values.starts_at !== current.starts_at)
    payload.starts_at = values.starts_at;
  if (values.ends_at !== current.ends_at) payload.ends_at = values.ends_at;
  if (values.valid_from !== current.valid_from) {
    payload.valid_from = values.valid_from;
  }
  if (values.valid_until !== current.valid_until) {
    payload.valid_until = values.valid_until || null;
  }
  return payload;
}

/**
 * Ejecuta las operaciones de forma secuencial (una solicitud por cambio) y sin
 * detenerse ante un fallo, para informar el resultado de cada una.
 */
export async function runScheduleOperations(
  staffMemberId: number,
  operations: ScheduleOperation[],
): Promise<ScheduleOperationResult[]> {
  const results: ScheduleOperationResult[] = [];
  for (const operation of operations) {
    try {
      if (operation.kind === "create" && operation.values) {
        await staffScheduleApi.create(
          staffMemberId,
          toCreateRequest(operation.values),
        );
      } else if (operation.kind === "update" && operation.scheduleId) {
        await staffScheduleApi.update(
          staffMemberId,
          operation.scheduleId,
          operation.payload ?? {},
        );
      } else if (operation.scheduleId) {
        await staffScheduleApi.updateStatus(
          staffMemberId,
          operation.scheduleId,
          operation.kind === "activate",
        );
      }
      results.push({ operation });
    } catch (error) {
      results.push({ operation, error });
    }
  }
  return results;
}

/**
 * Mensaje comprensible para un fallo de operación. `t` debe estar en el
 * namespace `staff.schedules.errors`. Los 409/422 (solapamiento, vigencia)
 * muestran el mensaje del backend.
 */
export function getScheduleOperationErrorMessage(
  error: unknown,
  kind: ScheduleOperation["kind"],
  t: Translator,
): string {
  if (!isApiError(error)) return t("unexpected");
  if (error.kind === "network") return t("network");
  if (error.status >= 500) return t("server");
  if (error.status === 404) return t("notFound");
  return error.message || t(`${kind}Failed`);
}
