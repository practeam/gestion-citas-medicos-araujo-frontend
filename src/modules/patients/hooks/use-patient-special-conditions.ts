import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { patientSpecialConditionApi } from "../services/patient-special-condition-api";
import type { PatientSpecialCondition } from "../types/patient-special-condition.types";

interface ConditionsResult {
  key: string;
  data?: PatientSpecialCondition[];
  error?: unknown;
}

/** Condiciones especiales asociadas a un paciente (con su estado y notas de la relación). */
export function usePatientSpecialConditions(patientId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ConditionsResult | null>(null);
  const isValidId = Number.isInteger(patientId) && patientId > 0;
  const requestKey = `${patientId}|${reloadToken}`;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    patientSpecialConditionApi
      .list(patientId, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, patientId, isValidId]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;

  return {
    assignments: (current ?? result)?.data,
    error: current?.error,
    isLoading: isValidId && current === null,
    reload,
  };
}
