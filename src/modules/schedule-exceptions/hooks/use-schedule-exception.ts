import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { scheduleExceptionApi } from "../services/schedule-exception-api";
import type { ScheduleException } from "../types/schedule-exception.types";

interface ExceptionResult {
  exceptionId: number;
  exception?: ScheduleException;
  error?: unknown;
}

/** Consulta una excepción por id. `exceptionId` inválido (NaN) se trata como no encontrado. */
export function useScheduleException(exceptionId: number) {
  const [result, setResult] = useState<ExceptionResult | null>(null);
  const isValidId = Number.isInteger(exceptionId) && exceptionId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    scheduleExceptionApi
      .getById(exceptionId, { signal: controller.signal })
      .then((exception) => setResult({ exceptionId, exception }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ exceptionId, error });
      });

    return () => controller.abort();
  }, [exceptionId, isValidId]);

  const current = result?.exceptionId === exceptionId ? result : null;

  return {
    exception: current?.exception,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
