import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { scheduleOverrideApi } from "../services/schedule-override-api";
import type { ScheduleOverride } from "../types/schedule-override.types";

interface OverrideResult {
  overrideId: number;
  override?: ScheduleOverride;
  error?: unknown;
}

/** Consulta una modificación por id. `overrideId` inválido (NaN) se trata como no encontrado. */
export function useScheduleOverride(overrideId: number) {
  const [result, setResult] = useState<OverrideResult | null>(null);
  const isValidId = Number.isInteger(overrideId) && overrideId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    scheduleOverrideApi
      .getById(overrideId, { signal: controller.signal })
      .then((override) => setResult({ overrideId, override }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ overrideId, error });
      });

    return () => controller.abort();
  }, [overrideId, isValidId]);

  const current = result?.overrideId === overrideId ? result : null;

  return {
    override: current?.override,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
