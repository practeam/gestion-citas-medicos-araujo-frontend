import type { SpecialConditionFormValues } from "../schemas/special-condition-schema";
import type {
  SpecialCondition,
  SpecialConditionCreateRequest,
  SpecialConditionUpdateRequest,
} from "../types/special-condition.types";

export function toCreatePayload(
  values: SpecialConditionFormValues,
): SpecialConditionCreateRequest {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    ...(description && { description }),
  };
}

/** Solo incluye lo modificado; `description: null` elimina el contenido. */
export function toUpdatePayload(
  values: SpecialConditionFormValues,
  specialCondition: SpecialCondition,
): SpecialConditionUpdateRequest {
  const payload: SpecialConditionUpdateRequest = {};
  const name = values.name.trim();
  const description = values.description.trim();

  if (name !== specialCondition.name) payload.name = name;
  if (description !== (specialCondition.description ?? "")) {
    payload.description = description || null;
  }
  return payload;
}
