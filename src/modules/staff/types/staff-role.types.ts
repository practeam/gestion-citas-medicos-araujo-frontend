import type { Role } from "@/modules/roles";

/** `StaffRoleResponse` de OpenAPI: vínculo con los datos mínimos del rol (sin permisos). */
export interface StaffRole {
  staff_member_id: number;
  role: Role;
}

export interface RoleOperation {
  kind: "assign" | "remove";
  role: Role;
}

/** Resultado de una operación; `error` está definido solo si falló. */
export interface RoleOperationResult {
  operation: RoleOperation;
  error?: unknown;
}
