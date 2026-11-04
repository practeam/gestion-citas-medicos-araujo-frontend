import type { PermissionFormValues } from "../schemas/permission-schema";
import type {
  Permission,
  PermissionCreateRequest,
  PermissionUpdateRequest,
} from "../types/permission.types";

export function toCreatePayload(
  values: PermissionFormValues,
): PermissionCreateRequest {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    ...(description && { description }),
  };
}

/** Solo `description`; `null` elimina el contenido. `undefined` si no hay cambios. */
export function toUpdatePayload(
  values: PermissionFormValues,
  permission: Permission,
): PermissionUpdateRequest | undefined {
  const description = values.description.trim();
  if (description === (permission.description ?? "")) return undefined;
  return { description: description || null };
}
