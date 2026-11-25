import type { Translator } from "@/i18n";
import { isApiError } from "@/services/api";

/**
 * Mensaje comprensible. `t` debe estar en el namespace `appointments.errors`.
 * Los 409 (solapamiento, disponibilidad, transición no permitida) y 422 se
 * muestran con el mensaje del backend, que es la autoridad.
 */
export function getAppointmentErrorMessage(
  error: unknown,
  t: Translator,
): string {
  if (!isApiError(error)) return t("unexpected");
  if (error.kind === "network") return t("network");
  if (error.status === 404) return t("notFound");
  if (error.status >= 500) return t("server");
  return error.message || t("unexpected");
}
