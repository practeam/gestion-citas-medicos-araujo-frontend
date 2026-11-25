import { apiClient } from "@/services/api";
import type { StaffSpecialty } from "../types/staff-specialty.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Especialidades de un integrante: `/staff-members/{id}/specialties`
 * (independiente de las rutas CRUD `/staff`). Una solicitud por especialidad;
 * nunca dentro de `POST` / `PATCH /staff`.
 */
export const staffSpecialtyApi = {
  /** Incluye las especialidades que permanecen asociadas aunque estén inactivas. */
  list: (staffMemberId: number, { signal }: Options = {}) =>
    apiClient.get<StaffSpecialty[]>(
      `/staff-members/${staffMemberId}/specialties`,
      { signal },
    ),

  /** `PUT` idempotente y sin cuerpo: repetirlo no crea asociaciones duplicadas. */
  assign: (staffMemberId: number, specialtyId: number) =>
    apiClient.put<StaffSpecialty>(
      `/staff-members/${staffMemberId}/specialties/${specialtyId}`,
      undefined,
    ),

  /** Retira solo la asociación; no elimina al integrante ni la especialidad del catálogo. */
  remove: (staffMemberId: number, specialtyId: number) =>
    apiClient.delete<StaffSpecialty>(
      `/staff-members/${staffMemberId}/specialties/${specialtyId}`,
    ),
};
