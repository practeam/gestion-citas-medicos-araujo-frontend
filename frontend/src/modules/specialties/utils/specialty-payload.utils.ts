import type { SpecialtyFormValues } from "../schemas/specialty-schema";
import type {
  Specialty,
  SpecialtyCreateRequest,
  SpecialtyUpdateRequest,
} from "../types/specialty.types";

export function toCreatePayload(
  values: SpecialtyFormValues,
): SpecialtyCreateRequest {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    ...(description && { description }),
  };
}

/** Solo incluye lo modificado; `description: null` elimina el contenido. */
export function toUpdatePayload(
  values: SpecialtyFormValues,
  specialty: Specialty,
): SpecialtyUpdateRequest {
  const payload: SpecialtyUpdateRequest = {};
  const name = values.name.trim();
  const description = values.description.trim();

  if (name !== specialty.name) payload.name = name;
  if (description !== (specialty.description ?? "")) {
    payload.description = description || null;
  }
  return payload;
}
