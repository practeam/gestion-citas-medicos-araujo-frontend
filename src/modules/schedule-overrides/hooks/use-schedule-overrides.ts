import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { scheduleOverrideApi } from "../services/schedule-override-api";
import type {
  OverrideStatusFilter,
  ScheduleOverride,
  ScheduleOverrideListParams,
} from "../types/schedule-override.types";
import {
  isValidLocalDateTime,
  toOffsetIso,
} from "../utils/schedule-override-datetime.utils";

export const SCHEDULE_OVERRIDES_PAGE_SIZE = 20;

export interface ScheduleOverrideFilters {
  clinicId: number | null;
  staffMemberId: number | null;
  status: OverrideStatusFilter;
  /** `datetime-local` (sin zona); se convierte al enviar. */
  rangeStart: string;
  rangeEnd: string;
  page: number;
}

interface OverridesResult {
  key: string;
  data?: PageResult<ScheduleOverride>;
  error?: unknown;
}

const INITIAL_FILTERS: ScheduleOverrideFilters = {
  clinicId: null,
  staffMemberId: null,
  status: "all",
  rangeStart: "",
  rangeEnd: "",
  page: 1,
};

export function useScheduleOverrides() {
  const [filters, setFilters] =
    useState<ScheduleOverrideFilters>(INITIAL_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<OverridesResult | null>(null);

  const { clinicId, staffMemberId, status, rangeStart, rangeEnd, page } =
    filters;
  const requestKey = [
    clinicId,
    staffMemberId,
    status,
    rangeStart,
    rangeEnd,
    page,
    reloadToken,
  ].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const params: ScheduleOverrideListParams = {
      page,
      page_size: SCHEDULE_OVERRIDES_PAGE_SIZE,
      ...(clinicId !== null && { clinic_id: clinicId }),
      ...(staffMemberId !== null && { staff_member_id: staffMemberId }),
      ...(status !== "all" && { is_active: status === "active" }),
      // Los extremos del rango se envían como instantes con zona horaria.
      ...(isValidLocalDateTime(rangeStart) && {
        range_start: toOffsetIso(rangeStart),
      }),
      ...(isValidLocalDateTime(rangeEnd) && {
        range_end: toOffsetIso(rangeEnd),
      }),
    };

    scheduleOverrideApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, clinicId, staffMemberId, status, rangeStart, rangeEnd, page]);

  /** Cambia filtros y vuelve a la primera página. */
  const updateFilters = useCallback(
    (patch: Partial<Omit<ScheduleOverrideFilters, "page">>) =>
      setFilters((prev) => {
        const changed = (Object.keys(patch) as (keyof typeof patch)[]).some(
          (key) => prev[key] !== patch[key],
        );
        return changed ? { ...prev, ...patch, page: 1 } : prev;
      }),
    [],
  );
  const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);
  const setPage = useCallback(
    (value: number) => setFilters((prev) => ({ ...prev, page: value })),
    [],
  );
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const current = result?.key === requestKey ? result : null;
  const hasFilters =
    clinicId !== null ||
    staffMemberId !== null ||
    status !== "all" ||
    rangeStart !== "" ||
    rangeEnd !== "";

  return {
    filters,
    hasFilters,
    updateFilters,
    clearFilters,
    setPage,
    reload,
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
  };
}
