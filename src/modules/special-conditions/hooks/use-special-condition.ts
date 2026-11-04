import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { specialConditionApi } from "../services/special-condition-api";
import type { SpecialCondition } from "../types/special-condition.types";

interface SpecialConditionResult {
  specialConditionId: number;
  specialCondition?: SpecialCondition;
  error?: unknown;
}

/** Consulta un rol por id. `specialConditionId` inválido (NaN) se trata como no encontrado. */
export function useSpecialCondition(specialConditionId: number) {
  const [result, setResult] = useState<SpecialConditionResult | null>(null);
  const isValidId =
    Number.isInteger(specialConditionId) && specialConditionId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    specialConditionApi
      .getById(specialConditionId, { signal: controller.signal })
      .then((specialCondition) =>
        setResult({ specialConditionId, specialCondition }),
      )
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ specialConditionId, error });
      });

    return () => controller.abort();
  }, [specialConditionId, isValidId]);

  const current =
    result?.specialConditionId === specialConditionId ? result : null;

  return {
    specialCondition: current?.specialCondition,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
