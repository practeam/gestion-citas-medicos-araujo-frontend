/**
 * `ScheduleOverrideResponse` de OpenAPI: intervalo puntual extraordinario que
 * puede **habilitar** disponibilidad (no ausencias ni cierres: eso son
 * excepciones). Exactamente uno de los dos objetivos está informado.
 */
export interface ScheduleOverride {
  id: number;
  clinic_id: number | null;
  staff_member_id: number | null;
  /** `date-time` con zona horaria. */
  starts_at: string;
  ends_at: string;
  reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `ScheduleOverrideCreateRequest`: exactamente uno de `clinic_id` / `staff_member_id`, el otro `null`. */
export interface ScheduleOverrideCreateRequest {
  clinic_id: number | null;
  staff_member_id: number | null;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  /** El contrato admite enviarlo; por defecto el backend usa `true`. */
  is_active: boolean;
}

/**
 * `ScheduleOverrideUpdateRequest`: solo intervalo y motivo. El objetivo no se
 * puede cambiar (se crea otro override) y el estado va por `/status`.
 */
export interface ScheduleOverrideUpdateRequest {
  starts_at?: string;
  ends_at?: string;
  reason?: string | null;
}

/** Parámetros de `GET /schedule-overrides`. `range_*` son instantes `date-time` con zona horaria. */
export interface ScheduleOverrideListParams {
  page: number;
  page_size: number;
  clinic_id?: number;
  staff_member_id?: number;
  is_active?: boolean;
  /** Intervalos que terminan después de este instante. */
  range_start?: string;
  /** Intervalos que empiezan antes de este instante. */
  range_end?: string;
}

export type TargetType = "clinic" | "staff";
export type OverrideStatusFilter = "all" | "active" | "inactive";
