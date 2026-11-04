import { isApiError } from "@/services/api";
import type { Translator } from "@/i18n";
import { staffRoleApi } from "../services/staff-role-api";
import type {
  RoleOperation,
  RoleOperationResult,
} from "../types/staff-role.types";

/**
 * Ejecuta las operaciones de forma secuencial (una solicitud por rol) y sin
 * detenerse ante un fallo, para informar el resultado de cada una.
 */
export async function runRoleOperations(
  staffMemberId: number,
  operations: RoleOperation[],
): Promise<RoleOperationResult[]> {
  const results: RoleOperationResult[] = [];
  for (const operation of operations) {
    try {
      if (operation.kind === "assign") {
        await staffRoleApi.assign(staffMemberId, operation.role.id);
      } else {
        await staffRoleApi.remove(staffMemberId, operation.role.id);
      }
      results.push({ operation });
    } catch (error) {
      results.push({ operation, error });
    }
  }
  return results;
}

/** Una asignación duplicada (409) significa que el rol ya está asignado. */
export function isDuplicateAssignment(result: RoleOperationResult) {
  return (
    result.operation.kind === "assign" &&
    isApiError(result.error) &&
    result.error.status === 409
  );
}

/**
 * Mensaje comprensible para un fallo de asignación o retiro. `t` debe estar en
 * el namespace `staff.roles.errors`.
 */
export function getRoleOperationErrorMessage(
  error: unknown,
  kind: RoleOperation["kind"],
  t: Translator,
): string {
  if (!isApiError(error)) return t("unexpected");
  if (error.kind === "network") return t("network");
  if (error.status >= 500) return t("server");
  if (error.status === 409 && kind === "assign") return t("duplicate");
  if (error.status === 404) return t("notFound");
  return (
    error.message || t(kind === "assign" ? "assignFailed" : "removeFailed")
  );
}
