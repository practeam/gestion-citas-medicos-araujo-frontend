import type { SpecialCondition } from "@/modules/special-conditions";

/**
 * `PatientSpecialConditionResponse` de OpenAPI: la condición (con `is_active`)
 * y las notas de la relación. Las notas pertenecen a la relación, no al paciente.
 */
export interface PatientSpecialCondition {
  patient_id: number;
  special_condition: SpecialCondition;
  notes: string | null;
}

/** Condición elegida (aún no guardada) con las notas de su futura relación. */
export interface SelectedCondition {
  condition: SpecialCondition;
  notes: string;
}

export interface ConditionOperation {
  /** `assign` = PUT, `updateNotes` = PATCH, `remove` = DELETE. */
  kind: "assign" | "updateNotes" | "remove";
  condition: SpecialCondition;
  /** Notas a enviar (solo `assign` / `updateNotes`); `null` las borra. */
  notes?: string | null;
}

/** Resultado de una operación; `error` está definido solo si falló. */
export interface ConditionOperationResult {
  operation: ConditionOperation;
  error?: unknown;
}
