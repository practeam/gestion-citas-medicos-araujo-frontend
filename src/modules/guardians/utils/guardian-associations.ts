import { guardianApi } from "../services/guardian-api";
import type { StagedGuardian } from "../types/guardian.types";

/** Resultado de asociar un apoderado; `error` está definido solo si falló. */
export interface GuardianAssociationResult {
  guardian: StagedGuardian;
  error?: unknown;
}

/**
 * Asocia los apoderados indicados con un paciente **ya creado**: una solicitud
 * por apoderado (`POST /patients/{id}/guardians`), de forma secuencial. No
 * crea personas ni pacientes; si algo falla, quien llama conserva los
 * apoderados fallidos para reintentar solo esos (el backend rechaza duplicados
 * con 409, así que un reintento nunca duplica una asociación).
 */
export async function runGuardianAssociations(
  patientId: number,
  guardians: StagedGuardian[],
): Promise<GuardianAssociationResult[]> {
  const results: GuardianAssociationResult[] = [];
  for (const guardian of guardians) {
    try {
      await guardianApi.create(patientId, {
        person_id: guardian.person.id,
        relationship: guardian.relationship,
      });
      results.push({ guardian });
    } catch (error) {
      results.push({ guardian, error });
    }
  }
  return results;
}
