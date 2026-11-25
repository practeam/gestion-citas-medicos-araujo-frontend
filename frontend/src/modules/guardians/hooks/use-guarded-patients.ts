import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { guardianApi } from "../services/guardian-api";
import type { GuardedPatient } from "../types/guardian.types";

export const GUARDED_PATIENTS_PAGE_SIZE = 10;

interface GuardedResult {
  key: string;
  data?: PageResult<GuardedPatient>;
  error?: unknown;
}

/** Pacientes de los que una persona es apoderada (`GET /persons/{id}/patients`). */
export function useGuardedPatients(personId: number) {
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<GuardedResult | null>(null);
  const requestKey = `${personId}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    guardianApi
      .listGuardedPatients(
        personId,
        {
          page,
          page_size: GUARDED_PATIENTS_PAGE_SIZE,
          sort_by: "last_name",
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
  }, [personId, page, requestKey]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  const sameOwner = result?.key.startsWith(`${personId}|`) ?? false;

  return {
    data: sameOwner ? (current ?? result)?.data : undefined,
    error: current?.error,
    isLoading: current === null,
    page,
    setPage,
    reload,
  };
}
