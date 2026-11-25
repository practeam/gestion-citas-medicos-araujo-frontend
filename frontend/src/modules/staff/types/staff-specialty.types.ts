import type { Specialty } from "@/modules/specialties";

/**
 * `StaffSpecialtyResponse` de OpenAPI: asociación declarada en el sistema. No
 * certifica ni autoriza procedimientos.
 */
export interface StaffSpecialty {
  staff_member_id: number;
  specialty: Specialty;
}

export interface SpecialtyOperation {
  kind: "assign" | "remove";
  specialty: Specialty;
}

/** Resultado de una operación; `error` está definido solo si falló. */
export interface SpecialtyOperationResult {
  operation: SpecialtyOperation;
  error?: unknown;
}
