import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { clinicScheduleApi } from "../services/clinic-schedule-api";
import type { ClinicSchedule } from "../types/clinic-schedule.types";

interface SchedulesResult {
  key: string;
  data?: PageResult<ClinicSchedule>;
  error?: unknown;
}

/** Horarios de una clínica, activos e inactivos. */
export function useClinicSchedules(clinicId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<SchedulesResult | null>(null);
  const isValidId = Number.isInteger(clinicId) && clinicId > 0;
  const requestKey = `${clinicId}|${reloadToken}`;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    clinicScheduleApi
      .list(clinicId, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, clinicId, isValidId]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  const data = (current ?? result)?.data;

  return {
    schedules: data?.items,
    total: data?.total ?? 0,
    error: current?.error,
    isLoading: isValidId && current === null,
    reload,
  };
}
