import type { AppointmentStatus } from "../types/appointment.types";

/**
 * Matriz de transiciones del backend (spec 17 §11.1). La interfaz solo ofrece
 * estas acciones; el backend sigue siendo la autoridad.
 */
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function getAllowedTransitions(
  status: AppointmentStatus,
): AppointmentStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}

/** Las citas completadas y canceladas no se pueden editar ni reprogramar. */
export function isTerminalStatus(status: AppointmentStatus): boolean {
  return getAllowedTransitions(status).length === 0;
}

/** Transiciones que piden confirmación explícita. */
export function requiresConfirmation(status: AppointmentStatus): boolean {
  return status === "cancelled" || status === "completed";
}
