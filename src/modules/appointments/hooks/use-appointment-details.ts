import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { appointmentApi } from "../services/appointment-api";
import type { AppointmentDetail } from "../types/appointment.types";

interface DetailsResult {
  key: string;
  details?: AppointmentDetail[];
  error?: unknown;
}

/** Detalles (procedimientos) de una cita: `GET /appointments/{id}/details`. */
export function useAppointmentDetails(appointmentId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<DetailsResult | null>(null);
  const requestKey = `${appointmentId}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    appointmentApi
      .listDetails(appointmentId, { signal: controller.signal })
      .then((details) => setResult({ key: requestKey, details }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [appointmentId, requestKey]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;

  return {
    details: current?.details,
    error: current?.error,
    isLoading: current === null,
    reload,
  };
}
