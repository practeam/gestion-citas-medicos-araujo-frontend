import { isApiError } from "@/services/api";
import type { Translator } from "@/i18n";

/**
 * Mensaje comprensible para la interfaz. `t` debe estar en el namespace
 * `specialConditions.errors`. Los errores de red y 5xx no exponen detalles técnicos.
 */
export function getSpecialConditionErrorMessage(
  error: unknown,
  t: Translator,
): string {
  if (!isApiError(error)) return t("unexpected");
  if (error.kind === "network") return t("network");
  if (error.status === 404) return t("notFound");
  if (error.status >= 500) return t("server");
  return error.message || t("unexpected");
}
