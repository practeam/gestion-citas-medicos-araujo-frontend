import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { scheduleExceptionApi } from "../services/schedule-exception-api";
import type {
  ExceptionType,
  ScheduleException,
  ScheduleExceptionListParams,
} from "../types/schedule-exception.types";
import {
  isValidLocalDateTime,
  toOffsetIso,
} from "../utils/schedule-exception-datetime.utils";

export const SCHEDULE_EXCEPTIONS_PAGE_SIZE = 20;

export interface ScheduleExceptionFilters {
  clinicId: number | null;
  staffMemberId: number | null;
  exceptionType: ExceptionType | "";
  /** `datetime-local` (sin zona); se convierte al enviar. */
  rangeStart: string;
  rangeEnd: string;
  page: number;
}

interface ExceptionsResult {
  key: string;
  data?: PageResult<ScheduleException>;
  error?: unknown;
}

const INITIAL_FILTERS: ScheduleExceptionFilters = {
  clinicId: null,
  staffMemberId: null,
  exceptionType: "",
  rangeStart: "",
  rangeEnd: "",
  page: 1,
};

export function useScheduleExceptions() {
  const [filters, setFilters] =
    useState<ScheduleExceptionFilters>(INITIAL_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ExceptionsResult | null>(null);

  const { clinicId, staffMemberId, exceptionType, rangeStart, rangeEnd, page } =
    filters;
  const requestKey = [
    clinicId,
    staffMemberId,
    exceptionType,
    rangeStart,
    rangeEnd,
    page,
    reloadToken,
  ].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const params: ScheduleExceptionListParams = {
      page,
      page_size: SCHEDULE_EXCEPTIONS_PAGE_SIZE,
      ...(clinicId !== null && { clinic_id: clinicId }),
      ...(staffMemberId !== null && { staff_member_id: staffMemberId }),
      ...(exceptionType && { exception_type: exceptionType }),
      // Los extremos del rango se envían como instantes con zona horaria.
      ...(isValidLocalDateTime(rangeStart) && {
        range_start: toOffsetIso(rangeStart),
      }),
      ...(isValidLocalDateTime(rangeEnd) && {
        range_end: toOffsetIso(rangeEnd),
      }),
    };

    scheduleExceptionApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [
    requestKey,
    clinicId,
    staffMemberId,
    exceptionType,
    rangeStart,
    rangeEnd,
    page,
  ]);

  /** Cambia filtros y vuelve a la primera página. */
  const updateFilters = useCallback(
    (patch: Partial<Omit<ScheduleExceptionFilters, "page">>) =>
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
    exceptionType !== "" ||
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
