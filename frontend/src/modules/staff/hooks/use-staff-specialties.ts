import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { staffSpecialtyApi } from "../services/staff-specialty-api";
import type { StaffSpecialty } from "../types/staff-specialty.types";

interface StaffSpecialtiesResult {
  key: string;
  data?: StaffSpecialty[];
  error?: unknown;
}

/** Especialidades asociadas a un integrante (incluye las que quedaron inactivas). */
export function useStaffSpecialties(staffMemberId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<StaffSpecialtiesResult | null>(null);
  const isValidId = Number.isInteger(staffMemberId) && staffMemberId > 0;
  const requestKey = `${staffMemberId}|${reloadToken}`;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    staffSpecialtyApi
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

  return {
    assignments: (current ?? result)?.data,
    error: current?.error,
    isLoading: isValidId && current === null,
    reload,
  };
}
