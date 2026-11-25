import { useState } from "react";
import { appointmentApi } from "../services/appointment-api";
import type {
  Appointment,
  AppointmentStatus,
} from "../types/appointment.types";

/**
 * Cambio de estado mediante el endpoint específico `/status`. La interfaz solo
 * se actualiza (`onChanged`) tras la respuesta satisfactoria de la API; si el
 * backend rechaza la transición se muestra su error y el estado confirmado no
 * cambia.
 */
export function useAppointmentStatusChange(
  onChanged: (appointment: Appointment, status: AppointmentStatus) => void,
  getErrorMessage: (error: unknown) => string,
) {
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const change = async (appointmentId: number, status: AppointmentStatus) => {
    if (pendingStatus) return false;
    setPendingStatus(status);
    setError(null);
    try {
      const updated = await appointmentApi.updateStatus(appointmentId, status);
      onChanged(updated, status);
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught));
      return false;
    } finally {
      setPendingStatus(null);
    }
  };

  return {
    pendingStatus,
    isPending: pendingStatus !== null,
    error,
    clearError: () => setError(null),
    change,
  };
}
