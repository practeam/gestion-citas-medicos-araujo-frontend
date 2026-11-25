import { apiClient } from "@/services/api";
import type { StaffRole } from "../types/staff-role.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Asignaciones de roles de un integrante: `/staff-members/{id}/roles`
 * (independiente de las rutas CRUD `/staff`). Una solicitud por rol.
 */
export const staffRoleApi = {
  /** Con `includeInactive` también devuelve asignaciones a roles que luego quedaron inactivos. */
  list: (
    staffMemberId: number,
    {
      includeInactive = true,
      signal,
    }: Options & { includeInactive?: boolean } = {},
  ) =>
    apiClient.get<StaffRole[]>(`/staff-members/${staffMemberId}/roles`, {
      params: { include_inactive: includeInactive },
      signal,
    }),

  assign: (staffMemberId: number, roleId: number) =>
    apiClient.post<StaffRole>(`/staff-members/${staffMemberId}/roles`, {
      role_id: roleId,
    }),

  remove: (staffMemberId: number, roleId: number) =>
    apiClient.delete<StaffRole>(
      `/staff-members/${staffMemberId}/roles/${roleId}`,
    ),
};
