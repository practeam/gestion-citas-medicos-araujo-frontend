import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { staffScheduleApi } from "../services/staff-schedule-api";
import type { StaffSchedule } from "../types/staff-schedule.types";

interface SchedulesResult {
  key: string;
  data?: PageResult<StaffSchedule>;
  error?: unknown;
}

/** Horarios de un integrante, activos e inactivos. */
export function useStaffSchedules(staffMemberId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<SchedulesResult | null>(null);
  const isValidId = Number.isInteger(staffMemberId) && staffMemberId > 0;
  const requestKey = `${staffMemberId}|${reloadToken}`;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    staffScheduleApi
      .list(staffMemberId, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, staffMemberId, isValidId]);

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
