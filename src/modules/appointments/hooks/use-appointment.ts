import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { appointmentApi } from "../services/appointment-api";
import type { Appointment } from "../types/appointment.types";

interface AppointmentResult {
  key: string;
  appointment?: Appointment;
  error?: unknown;
}

/**
 * Detalle de una cita (`GET /appointments/{id}`). `overrides` permite mostrar
 * de inmediato la respuesta confirmada de una operación (estado o edición) sin
 * esperar otra consulta.
 */
export function useAppointment(appointmentId: number | null) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<AppointmentResult | null>(null);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const requestKey = `${appointmentId}|${reloadToken}`;

  useEffect(() => {
    if (appointmentId === null) return;
    const controller = new AbortController();

    appointmentApi
      .getById(appointmentId, { signal: controller.signal })
      .then((appointment) => setResult({ key: requestKey, appointment }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [appointmentId, requestKey]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  const fetched = current?.appointment;
  // Una respuesta confirmada de la API tiene prioridad sobre la consulta previa.
  const appointment =
    confirmed && confirmed.id === appointmentId ? confirmed : fetched;

  return {
    appointment,
    error: current?.error,
    isLoading: appointmentId !== null && !appointment && current === null,
    confirm: setConfirmed,
    reload,
  };
}
