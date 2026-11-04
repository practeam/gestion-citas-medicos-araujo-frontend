import { apiClient } from "@/services/api";
import type { RolePermission } from "../types/role-permission.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Asignaciones de permisos de un rol: `/roles/{id}/permissions`. Una solicitud
 * por permiso; nunca se envían permisos en `POST` / `PATCH /roles`.
 */
export const rolePermissionApi = {
  /** Incluye los permisos que permanecen asociados aunque estén inactivos. */
  list: (roleId: number, { signal }: Options = {}) =>
    apiClient.get<RolePermission[]>(`/roles/${roleId}/permissions`, {
      signal,
    }),

  assign: (roleId: number, permissionId: number) =>
    apiClient.post<RolePermission>(`/roles/${roleId}/permissions`, {
      permission_id: permissionId,
    }),

  remove: (roleId: number, permissionId: number) =>
    apiClient.delete<RolePermission>(
      `/roles/${roleId}/permissions/${permissionId}`,
    ),
};
