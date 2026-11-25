import { apiClient } from "@/services/api";
import type { PatientSpecialCondition } from "../types/patient-special-condition.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Condiciones especiales de un paciente: `/patients/{id}/special-conditions`.
 * Una solicitud por condición; nunca se envían dentro de `POST` / `PATCH /patients`.
 */
export const patientSpecialConditionApi = {
  list: (patientId: number, { signal }: Options = {}) =>
    apiClient.get<PatientSpecialCondition[]>(
      `/patients/${patientId}/special-conditions`,
      { signal },
    ),

  /**
   * `PUT` idempotente: crea la relación o reemplaza sus notas. `{}` equivale a
   * asignarla sin notas.
   */
  assign: (patientId: number, conditionId: number, notes?: string | null) =>
    apiClient.put<PatientSpecialCondition>(
      `/patients/${patientId}/special-conditions/${conditionId}`,
      notes ? { notes } : {},
    ),

  /** `PATCH` modifica únicamente las notas (`notes` es obligatorio; `null` las borra). */
  updateNotes: (patientId: number, conditionId: number, notes: string | null) =>
    apiClient.patch<PatientSpecialCondition>(
      `/patients/${patientId}/special-conditions/${conditionId}`,
      { notes },
    ),

  /** Retira solo la relación; no elimina al paciente ni la condición del catálogo. */
  remove: (patientId: number, conditionId: number) =>
    apiClient.delete<PatientSpecialCondition>(
      `/patients/${patientId}/special-conditions/${conditionId}`,
    ),
};
