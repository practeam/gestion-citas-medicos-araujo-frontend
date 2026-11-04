import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { staffMemberApi } from "../services/staff-member-api";
import type { StaffMember } from "../types/staff-member.types";

interface StaffMemberResult {
  staffId: number;
  staffMember?: StaffMember;
  error?: unknown;
}

/** Consulta un rol por id. `staffId` inválido (NaN) se trata como no encontrado. */
export function useStaffMember(staffId: number) {
  const [result, setResult] = useState<StaffMemberResult | null>(null);
  const isValidId = Number.isInteger(staffId) && staffId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    staffMemberApi
      .getById(staffId, { signal: controller.signal })
      .then((staffMember) => setResult({ staffId, staffMember }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ staffId, error });
      });

    return () => controller.abort();
  }, [staffId, isValidId]);

  const current = result?.staffId === staffId ? result : null;

  return {
    staffMember: current?.staffMember,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
