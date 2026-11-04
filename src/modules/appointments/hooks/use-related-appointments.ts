import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { appointmentApi } from "../services/appointment-api";
import type { Appointment } from "../types/appointment.types";

export const RELATED_APPOINTMENTS_PAGE_SIZE = 10;

export type RelatedOwner =
  { type: "patient"; id: number } | { type: "staff"; id: number };

interface RelatedResult {
  key: string;
  data?: PageResult<Appointment>;
  error?: unknown;
}

/**
 * Citas de un paciente (`/patients/{id}/appointments`) o de un miembro del
 * personal (`/staff-members/{id}/appointments`), de la más reciente a la más
 * antigua. Complementa la agenda: no administra citas.
 */
export function useRelatedAppointments(owner: RelatedOwner) {
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<RelatedResult | null>(null);
  const { type, id } = owner;
  const requestKey = `${type}|${id}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const params = {
      page,
      page_size: RELATED_APPOINTMENTS_PAGE_SIZE,
      sort_by: "starts_at" as const,
      order: "desc" as const,
    };
    const request =
      type === "patient"
        ? appointmentApi.listByPatient(id, params, {
            signal: controller.signal,
          })
        : appointmentApi.listByStaffMember(id, params, {
            signal: controller.signal,
          });

    request
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, type, id, page]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;

  return {
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
    page,
    setPage,
    reload,
  };
}
