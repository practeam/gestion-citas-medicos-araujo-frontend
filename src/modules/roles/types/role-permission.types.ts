import type { Permission } from "@/modules/permissions";

/** `RolePermissionResponse` de OpenAPI: vínculo con los datos mínimos del permiso. */
export interface RolePermission {
  role_id: number;
  permission: Permission;
}

export interface PermissionOperation {
  kind: "assign" | "remove";
  permission: Permission;
}

/** Resultado de una operación; `error` está definido solo si falló. */
export interface PermissionOperationResult {
  operation: PermissionOperation;
  error?: unknown;
}
