import type {
  DashboardParams,
  DashboardPeriodKey,
} from "../types/dashboard.types";

export type CustomRangeError = "required" | "order";

/** Fechas `YYYY-MM-DD` (campo `type="date"`): se comparan como texto. */
export function validateCustomRange(
  startDate: string,
  endDate: string,
): CustomRangeError | null {
  if (!startDate || !endDate) return "required";
  if (startDate > endDate) return "order";
  return null;
}

/** Parámetros para la API, o `null` si el rango personalizado aún no es válido. */
export function buildDashboardParams(
  period: DashboardPeriodKey,
  startDate: string,
  endDate: string,
): DashboardParams | null {
  if (period !== "custom") return { period };
  if (validateCustomRange(startDate, endDate)) return null;
  return { period, start_date: startDate, end_date: endDate };
}
