export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/**
 * `AppointmentResponse` de OpenAPI. `status` llega como `string`; se
 * restringe a los estados que admite el backend. Los instantes son `date-time`
 * con zona horaria. No incluye datos de paciente ni de personal: se resuelven
 * con sus módulos.
 */
export interface Appointment {
  id: number;
  patient_id: number;
  staff_member_id: number;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

/** `AppointmentCreateRequest`: no incluye estado, clínica ni campos calculados. */
export interface AppointmentCreateRequest {
  patient_id: number;
  staff_member_id: number;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

/**
 * `AppointmentUpdateRequest`: parcial. No admite paciente ni estado (el estado
 * se cambia solo con `PATCH …/status`).
 */
export interface AppointmentUpdateRequest {
  staff_member_id?: number;
  starts_at?: string;
  ends_at?: string;
  reason?: string | null;
}

/** Parámetros de `GET /appointments`. `starts_*` son instantes `date-time` con zona. */
export interface AppointmentListParams {
  page: number;
  page_size: number;
  patient_id?: number;
  staff_member_id?: number;
  status?: AppointmentStatus;
  /** Citas que empiezan desde este instante (incluido). */
  starts_from?: string;
  /** Citas que empiezan antes de este instante. */
  starts_to?: string;
  sort_by?: "id" | "starts_at" | "created_at";
  order?: "asc" | "desc";
}

/** Parámetros de las consultas por paciente / personal (sin esos ids). */
export type RelatedAppointmentListParams = Omit<
  AppointmentListParams,
  "patient_id" | "staff_member_id"
>;

export type AppointmentStatusFilter = "all" | AppointmentStatus;

export interface AppointmentFilters {
  patientId: number | null;
  staffMemberId: number | null;
  status: AppointmentStatusFilter;
}

/** Opción de paciente o personal para selectores y filtros. */
export interface AppointmentEntityOption {
  id: number;
  label: string;
  description: string | null;
}

export type AppointmentEntityType = "patient" | "staff";

/**
 * `AppointmentDetailResponse` de OpenAPI: procedimiento asociado a una cita con
 * el precio y la duración **históricos** que calculó el backend. `unit_price` y
 * `line_amount` son cadenas decimales (no se convierten a `float`).
 */
export interface AppointmentDetail {
  id: number;
  appointment_id: number;
  procedure_id: number;
  quantity: number;
  unit_price: string;
  /** Duración total de la línea (`base_duration_minutes × quantity`), calculada por el backend. */
  duration_minutes: number;
  notes: string | null;
  line_amount: string;
}

/**
 * `AppointmentDetailCreateRequest`. No se envían `duration_minutes` (lo calcula
 * el backend) ni `unit_price` (el precio sale del catálogo; no hay precios
 * personalizados en esta fase).
 */
export interface AppointmentDetailCreateRequest {
  procedure_id: number;
  quantity: number;
  notes?: string;
}

/** `AppointmentDetailUpdateRequest`: solo cantidad y notas. */
export interface AppointmentDetailUpdateRequest {
  quantity?: number;
  notes?: string | null;
}
