/** `StaffScheduleResponse` de OpenAPI: intervalo semanal recurrente en hora local del integrante. */
export interface StaffSchedule {
  id: number;
  staff_member_id: number;
  /** 1 = lunes … 7 = domingo. */
  day_of_week: number;
  /** `HH:MM` o `HH:MM:SS`. */
  starts_at: string;
  ends_at: string;
  /** `YYYY-MM-DD` */
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `WeeklyScheduleCreateRequest` */
export interface StaffScheduleCreateRequest {
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  valid_from: string;
  valid_until: string | null;
}

/** `WeeklyScheduleUpdateRequest`: parcial; solo se envían los campos modificados. */
export interface StaffScheduleUpdateRequest {
  day_of_week?: number;
  starts_at?: string;
  ends_at?: string;
  valid_from?: string;
  valid_until?: string | null;
}

/** Valores de un intervalo en un formulario (fechas y horas como texto). */
export interface ScheduleFormValues {
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  valid_from: string;
  /** Vacío = sin fecha final. */
  valid_until: string;
}

/** Intervalo nuevo aún no registrado. */
export interface ScheduleDraft {
  key: string;
  values: ScheduleFormValues;
}

export interface ScheduleOperation {
  kind: "create" | "update" | "activate" | "deactivate";
  /** Horario existente (update / activate / deactivate). */
  scheduleId?: number;
  /** Borrador de origen (create). */
  draftKey?: string;
  /** Valores a registrar (create). */
  values?: ScheduleFormValues;
  /** Campos a modificar (update). */
  payload?: StaffScheduleUpdateRequest;
  /** Para identificar el intervalo en los mensajes. */
  summary: { day_of_week: number; starts_at: string; ends_at: string };
}

/** Resultado de una operación; `error` está definido solo si falló. */
export interface ScheduleOperationResult {
  operation: ScheduleOperation;
  error?: unknown;
}
