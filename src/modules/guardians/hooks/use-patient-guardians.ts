import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { guardianApi } from "../services/guardian-api";
import type { Guardian } from "../types/guardian.types";

/** Máximo que admite el backend por página; un paciente tiene pocos apoderados. */
const GUARDIANS_PAGE_SIZE = 100;

interface GuardiansResult {
  key: string;
  data?: PageResult<Guardian>;
  error?: unknown;
}

/** Apoderados de un paciente (`GET /patients/{id}/guardians`), con recarga a petición. */
export function usePatientGuardians(patientId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<GuardiansResult | null>(null);
  const requestKey = `${patientId}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    guardianApi
      .listByPatient(
        patientId,
        {
          page: 1,
          page_size: GUARDIANS_PAGE_SIZE,
          sort_by: "id",
          order: "asc",
        },
        { signal: controller.signal },
      )
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [patientId, requestKey]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;

  return {
    guardians: (current ?? result)?.data?.items,
    total: (current ?? result)?.data?.total ?? 0,
    error: current?.error,
    isLoading: current === null && !result?.data,
    reload,
  };
}
