import type { Translator } from "@/i18n";
import { isApiError } from "@/services/api";
import { patientSpecialConditionApi } from "../services/patient-special-condition-api";
import type {
  ConditionOperation,
  ConditionOperationResult,
  PatientSpecialCondition,
  SelectedCondition,
} from "../types/patient-special-condition.types";

export const CONDITION_NOTES_MAX_LENGTH = 1000;

/**
 * Ejecuta las operaciones de forma secuencial (una solicitud por condición) y
 * sin detenerse ante un fallo, para informar el resultado de cada una.
 */
export async function runConditionOperations(
  patientId: number,
  operations: ConditionOperation[],
): Promise<ConditionOperationResult[]> {
  const results: ConditionOperationResult[] = [];
  for (const operation of operations) {
    const conditionId = operation.condition.id;
    try {
      if (operation.kind === "assign") {
        await patientSpecialConditionApi.assign(
          patientId,
          conditionId,
          operation.notes,
        );
      } else if (operation.kind === "updateNotes") {
        await patientSpecialConditionApi.updateNotes(
          patientId,
          conditionId,
          operation.notes ?? null,
        );
      } else {
        await patientSpecialConditionApi.remove(patientId, conditionId);
      }
      results.push({ operation });
    } catch (error) {
      results.push({ operation, error });
    }
  }
  return results;
}

/** Operaciones de alta (PUT) para las condiciones elegidas al crear o editar. */
export function toAssignOperations(
  selected: SelectedCondition[],
): ConditionOperation[] {
  return selected.map(({ condition, notes }) => ({
    kind: "assign",
    condition,
    notes: notes.trim() || null,
  }));
}

interface ChangeSet {
  assignments: PatientSpecialCondition[];
  toAdd: SelectedCondition[];
  toRemove: number[];
  /** Notas editadas de asociaciones existentes, por id de condición. */
  notesDraft: Record<number, string>;
}

/**
 * Calcula únicamente las operaciones necesarias: altas, cambios de notas
 * (solo si difieren de lo guardado y la asociación no se retira) y retiros.
 */
export function buildConditionOperations({
  assignments,
  toAdd,
  toRemove,
  notesDraft,
}: ChangeSet): ConditionOperation[] {
  const updates = assignments
    .filter(({ special_condition: condition, notes }) => {
      const draft = notesDraft[condition.id];
      return (
        draft !== undefined &&
        !toRemove.includes(condition.id) &&
        draft.trim() !== (notes ?? "")
      );
    })
    .map(({ special_condition: condition }): ConditionOperation => ({
      kind: "updateNotes",
      condition,
      notes: notesDraft[condition.id].trim() || null,
    }));
  const removals = assignments
    .filter(({ special_condition: condition }) =>
      toRemove.includes(condition.id),
    )
    .map(({ special_condition: condition }): ConditionOperation => ({
      kind: "remove",
      condition,
    }));
  return [...toAssignOperations(toAdd), ...updates, ...removals];
}

/**
 * Mensaje comprensible para un fallo de operación. `t` debe estar en el
 * namespace `patients.conditions.errors`.
 */
export function getConditionOperationErrorMessage(
  error: unknown,
  kind: ConditionOperation["kind"],
  t: Translator,
): string {
  if (!isApiError(error)) return t("unexpected");
  if (error.kind === "network") return t("network");
  if (error.status >= 500) return t("server");
  if (error.status === 404) return t("notFound");
  return error.message || t(`${kind}Failed`);
}
