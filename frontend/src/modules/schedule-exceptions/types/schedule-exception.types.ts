/** Lista cerrada de `exception_type` definida por el backend (valores de API, no etiquetas). */
export const EXCEPTION_TYPES = [
  "closure",
  "absence",
  "maintenance",
  "other",
] as const;
export type ExceptionType = (typeof EXCEPTION_TYPES)[number];

/** `ScheduleExceptionResponse` de OpenAPI. Exactamente uno de los dos objetivos está informado. */
export interface ScheduleException {
  id: number;
  clinic_id: number | null;
  staff_member_id: number | null;
  /** El backend lo declara como `string`; los valores esperados son `ExceptionType`. */
  exception_type: string;
  reason: string | null;
  /** `date-time` con zona horaria. */
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

/** `ScheduleExceptionCreateRequest`: exactamente uno de `clinic_id` / `staff_member_id`, el otro `null`. */
export interface ScheduleExceptionCreateRequest {
  clinic_id: number | null;
  staff_member_id: number | null;
  exception_type: ExceptionType;
  reason: string | null;
  starts_at: string;
  ends_at: string;
}

/** `ScheduleExceptionUpdateRequest`: parcial; al cambiar objetivo o intervalo el backend revalida todo. */
export interface ScheduleExceptionUpdateRequest {
  clinic_id?: number | null;
  staff_member_id?: number | null;
  exception_type?: ExceptionType;
  reason?: string | null;
  starts_at?: string;
  ends_at?: string;
}

/** Parámetros de `GET /schedule-exceptions`. `range_*` son instantes `date-time` con zona horaria. */
export interface ScheduleExceptionListParams {
  page: number;
  page_size: number;
  clinic_id?: number;
  staff_member_id?: number;
  exception_type?: ExceptionType;
  /** Excepciones que terminan después de este instante. */
  range_start?: string;
  /** Excepciones que empiezan antes de este instante. */
  range_end?: string;
}

export type TargetType = "clinic" | "staff";
