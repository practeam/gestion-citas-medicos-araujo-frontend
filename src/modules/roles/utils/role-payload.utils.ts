import type { RoleFormValues } from "../schemas/role-schema";
import type {
  Role,
  RoleCreateRequest,
  RoleUpdateRequest,
} from "../types/role.types";

export function toCreatePayload(values: RoleFormValues): RoleCreateRequest {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    ...(description && { description }),
  };
}

/** Solo incluye lo modificado; `description: null` elimina el contenido. */
export function toUpdatePayload(
  values: RoleFormValues,
  role: Role,
): RoleUpdateRequest {
  const payload: RoleUpdateRequest = {};
  const name = values.name.trim();
  const description = values.description.trim();

  if (name !== role.name) payload.name = name;
  if (description !== (role.description ?? "")) {
    payload.description = description || null;
  }
  return payload;
}
