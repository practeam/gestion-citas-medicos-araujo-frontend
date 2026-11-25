/** Contratos de `GET /dashboard` (OpenAPI: DashboardResult y relacionados). */
export const DASHBOARD_PERIODS = [
  "current_month",
  "last_30_days",
  "last_6_months",
  "current_year",
  "custom",
] as const;
export type DashboardPeriodKey = (typeof DASHBOARD_PERIODS)[number];

export type DashboardGranularity = "day" | "week" | "month";

/** Parámetros de consulta; `start_date`/`end_date` solo con `period=custom`. */
export interface DashboardParams {
  period: DashboardPeriodKey;
  start_date?: string;
  end_date?: string;
  group_by?: DashboardGranularity;
}

export interface DashboardPeriod {
  period: DashboardPeriodKey;
  start_date: string;
  end_date: string;
  time_zone: string;
  today: string;
  granularity: DashboardGranularity;
}

export interface DashboardCards {
  total_patients: number;
  new_patients: number;
  total_appointments: number;
  appointments_today: number;
}

export interface TimeSeriesPoint {
  /** Fecha local `YYYY-MM-DD`: día, lunes de la semana o día 1 del mes. */
  period_start: string;
  count: number;
}

export interface StatusSlice {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

export interface DashboardResult {
  period: DashboardPeriod;
  cards: DashboardCards;
  appointments_evolution: TimeSeriesPoint[];
  patients_evolution: TimeSeriesPoint[];
  appointments_by_status: StatusSlice[];
  patients_by_month: TimeSeriesPoint[];
  appointments_by_month: TimeSeriesPoint[];
}
