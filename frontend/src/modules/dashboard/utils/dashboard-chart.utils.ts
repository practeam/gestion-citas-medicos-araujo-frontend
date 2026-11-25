import type {
  DashboardGranularity,
  StatusSlice,
  TimeSeriesPoint,
} from "../types/dashboard.types";

/** Color fijo por estado de cita, igual en toda la pantalla. */
export const STATUS_COLORS: Record<string, string> = {
  pending: "#F79009",
  confirmed: "#465FFF",
  completed: "#12B76A",
  cancelled: "#F04438",
};
const FALLBACK_STATUS_COLOR = "#98A2B3";

export interface ChartSeries {
  categories: string[];
  values: number[];
}

/**
 * `period_start` llega como fecha local `YYYY-MM-DD`; se formatea en UTC para
 * que el huso del navegador no corra el día.
 */
function formatPeriodStart(
  isoDate: string,
  granularity: DashboardGranularity,
  locale: string,
): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return isoDate;
  const options: Intl.DateTimeFormatOptions =
    granularity === "month"
      ? { month: "short", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Serie del backend → categorías y valores para ApexCharts (ya viene continua, con ceros). */
export function toChartSeries(
  points: TimeSeriesPoint[],
  granularity: DashboardGranularity,
  locale: string,
): ChartSeries {
  return {
    categories: points.map((point) =>
      formatPeriodStart(point.period_start, granularity, locale),
    ),
    values: points.map((point) => point.count),
  };
}

/** Hay al menos un valor distinto de cero; si no, se muestra el estado vacío. */
export function hasData(points: TimeSeriesPoint[] | undefined): boolean {
  return (points ?? []).some((point) => point.count > 0);
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? FALLBACK_STATUS_COLOR;
}

export function hasStatusData(slices: StatusSlice[]): boolean {
  return slices.some((slice) => slice.count > 0);
}
