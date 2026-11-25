import { apiClient, type PageResult } from "@/services/api";
import type {
  GuardedPatient,
  GuardedPatientListParams,
  Guardian,
  GuardianCreateRequest,
  GuardianListParams,
  GuardianRelationship,
} from "../types/guardian.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Apoderados de pacientes (`patient_guardian` del backend). No crean personas
 * ni pacientes; `guardian_id` es el id de la **asociación**. `DELETE` elimina
 * solo la asociación, nunca a la persona ni al paciente.
 */
export const guardianApi = {
  listByPatient: (
    patientId: number,
    params: GuardianListParams,
    { signal }: Options = {},
  ) =>
    apiClient.get<PageResult<Guardian>>(`/patients/${patientId}/guardians`, {
      params: { ...params },
      signal,
    }),

  getById: (patientId: number, guardianId: number, { signal }: Options = {}) =>
    apiClient.get<Guardian>(`/patients/${patientId}/guardians/${guardianId}`, {
      signal,
    }),

  create: (patientId: number, body: GuardianCreateRequest) =>
    apiClient.post<Guardian>(`/patients/${patientId}/guardians`, body),

  updateRelationship: (
    patientId: number,
    guardianId: number,
    relationship: GuardianRelationship,
  ) =>
    apiClient.patch<Guardian>(
      `/patients/${patientId}/guardians/${guardianId}`,
      { relationship },
    ),

  remove: (patientId: number, guardianId: number) =>
    apiClient.delete<Guardian>(
      `/patients/${patientId}/guardians/${guardianId}`,
    ),

  /** Pacientes de los que una persona es apoderada. */
  listGuardedPatients: (
    personId: number,
    params: GuardedPatientListParams,
    { signal }: Options = {},
  ) =>
    apiClient.get<PageResult<GuardedPatient>>(`/persons/${personId}/patients`, {
      params: { ...params },
      signal,
    }),
};
