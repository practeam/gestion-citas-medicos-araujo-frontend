import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { appointmentApi } from "../services/appointment-api";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentListParams,
} from "../types/appointment.types";
import { toRangeParams } from "../utils/appointment-datetime.utils";

/** Máximo permitido por el backend por página. */
const PAGE_SIZE = 100;
/** Límite de páginas por periodo para no encadenar consultas sin fin. */
const MAX_PAGES = 10;

export interface VisibleRange {
  /** `YYYY-MM-DD` de pared, incluido. */
  startDate: string;
  /** `YYYY-MM-DD` de pared, excluido. */
  endDate: string;
}

interface AppointmentsData {
  items: Appointment[];
  total: number;
}

interface AppointmentsResult {
  key: string;
  data?: AppointmentsData;
  error?: unknown;
}

/**
 * Citas del periodo visible del calendario con los filtros vigentes. Consulta
 * `GET /appointments` con `starts_from` / `starts_to` y recorre las páginas
 * necesarias (hasta `MAX_PAGES`). Mientras llega una nueva consulta se
 * conservan las citas anteriores para no vaciar el calendario.
 */
export function useAppointments(
  range: VisibleRange | null,
  filters: AppointmentFilters,
) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<AppointmentsResult | null>(null);

  const { patientId, staffMemberId, status } = filters;
  const startDate = range?.startDate;
  const endDate = range?.endDate;
  const requestKey = [
    startDate,
    endDate,
    patientId,
    staffMemberId,
    status,
    reloadToken,
  ].join("|");

  useEffect(() => {
    if (!startDate || !endDate) return;
    const controller = new AbortController();
    const base: Omit<AppointmentListParams, "page"> = {
      page_size: PAGE_SIZE,
      sort_by: "starts_at",
      order: "asc",
      ...toRangeParams(startDate, endDate),
      ...(patientId !== null && { patient_id: patientId }),
      ...(staffMemberId !== null && { staff_member_id: staffMemberId }),
      ...(status !== "all" && { status }),
    };

    async function load(): Promise<AppointmentsData> {
      const items: Appointment[] = [];
      let total = 0;
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const data = await appointmentApi.list(
          { ...base, page },
          { signal: controller.signal },
        );
        items.push(...data.items);
        total = data.total;
        if (items.length >= total || data.items.length === 0) break;
      }
      return { items, total };
    }

    load()
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, startDate, endDate, patientId, staffMemberId, status]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  const data = (current ?? result)?.data;

  return {
    appointments: data?.items,
    /** Hay más citas que las cargadas (se superó `MAX_PAGES`). */
    isTruncated: data !== undefined && data.total > data.items.length,
    error: current?.error,
    isLoading: range !== null && current === null,
    reload,
  };
}
