import type { Translator } from "@/i18n";
import { isApiError } from "@/services/api";
import { rolePermissionApi } from "../services/role-permission-api";
import type {
  PermissionOperation,
  PermissionOperationResult,
} from "../types/role-permission.types";

/**
 * Ejecuta las operaciones de forma secuencial (una solicitud por permiso) y sin
 * detenerse ante un fallo, para informar el resultado de cada una.
 */
export async function runPermissionOperations(
  roleId: number,
  operations: PermissionOperation[],
): Promise<PermissionOperationResult[]> {
  const results: PermissionOperationResult[] = [];
  for (const operation of operations) {
    try {
      if (operation.kind === "assign") {
        await rolePermissionApi.assign(roleId, operation.permission.id);
      } else {
        await rolePermissionApi.remove(roleId, operation.permission.id);
      }
      results.push({ operation });
    } catch (error) {
      results.push({ operation, error });
    }
  }
  return results;
}

/** Una asignación duplicada (409) significa que el permiso ya está asignado. */
export function isDuplicateAssignment(result: PermissionOperationResult) {
  return (
    result.operation.kind === "assign" &&
    isApiError(result.error) &&
    result.error.status === 409
  );
}

/**
 * Mensaje comprensible para un fallo de asignación o retiro. `t` debe estar en
 * el namespace `roles.permissions.errors`.
 */
export function getPermissionOperationErrorMessage(
  error: unknown,
  kind: PermissionOperation["kind"],
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
