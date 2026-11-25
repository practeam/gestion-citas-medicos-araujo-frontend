import type { Translator } from "@/i18n";
import { isApiError } from "@/services/api";
import { staffSpecialtyApi } from "../services/staff-specialty-api";
import type {
  SpecialtyOperation,
  SpecialtyOperationResult,
} from "../types/staff-specialty.types";

/**
 * Ejecuta las operaciones de forma secuencial (una solicitud por especialidad)
 * y sin detenerse ante un fallo, para informar el resultado de cada una.
 */
export async function runSpecialtyOperations(
  staffMemberId: number,
  operations: SpecialtyOperation[],
): Promise<SpecialtyOperationResult[]> {
  const results: SpecialtyOperationResult[] = [];
  for (const operation of operations) {
    try {
      if (operation.kind === "assign") {
        await staffSpecialtyApi.assign(staffMemberId, operation.specialty.id);
      } else {
        await staffSpecialtyApi.remove(staffMemberId, operation.specialty.id);
      }
      results.push({ operation });
    } catch (error) {
      results.push({ operation, error });
    }
  }
  return results;
}

/**
 * Mensaje comprensible para un fallo de asignación o retiro. `t` debe estar en
 * el namespace `staff.specialties.errors`. `PUT` es idempotente, por lo que un
 * 409 es un conflicto real y se muestra con el mensaje del backend.
 */
export function getSpecialtyOperationErrorMessage(
  error: unknown,
  kind: SpecialtyOperation["kind"],
  t: Translator,
): string {
  if (!isApiError(error)) return t("unexpected");
  if (error.kind === "network") return t("network");
  if (error.status >= 500) return t("server");
  if (error.status === 404) return t("notFound");
  return (
    error.message || t(kind === "assign" ? "assignFailed" : "removeFailed")
  );
}
