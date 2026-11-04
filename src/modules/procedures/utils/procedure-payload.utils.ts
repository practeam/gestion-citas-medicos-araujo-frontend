import type { ProcedureFormValues } from "../schemas/procedure-schema";
import type {
  Procedure,
  ProcedureCreateRequest,
  ProcedureUpdateRequest,
} from "../types/procedure.types";
import { normalizePrice, priceToCents } from "./procedure-price.utils";

/** Los opcionales vacíos no se envían al crear; nunca `is_active` ni auditoría. */
export function toCreatePayload(
  values: ProcedureFormValues,
): ProcedureCreateRequest {
  const code = values.code.trim();
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    base_price: normalizePrice(values.basePrice) ?? values.basePrice.trim(),
    base_duration_minutes: Number(values.baseDurationMinutes.trim()),
    ...(values.parentProcedureId !== null && {
      parent_procedure_id: values.parentProcedureId,
    }),
    ...(code && { code }),
    ...(description && { description }),
  };
}

/** Solo incluye lo modificado; los opcionales vaciados se envían como `null`. */
export function toUpdatePayload(
  values: ProcedureFormValues,
  procedure: Procedure,
): ProcedureUpdateRequest {
  const payload: ProcedureUpdateRequest = {};

  const name = values.name.trim();
  if (name !== procedure.name) payload.name = name;

  // El precio se compara por valor ("150" y "150.00" son lo mismo).
  const price = normalizePrice(values.basePrice);
  if (
    price !== null &&
    priceToCents(price) !== priceToCents(procedure.base_price)
  ) {
    payload.base_price = price;
  }

  const duration = Number(values.baseDurationMinutes.trim());
  if (duration !== procedure.base_duration_minutes) {
    payload.base_duration_minutes = duration;
  }

  if (values.parentProcedureId !== procedure.parent_procedure_id) {
    payload.parent_procedure_id = values.parentProcedureId;
  }

  for (const field of ["code", "description"] as const) {
    const value = values[field].trim();
    if (value !== (procedure[field] ?? "")) payload[field] = value || null;
  }
  return payload;
}
