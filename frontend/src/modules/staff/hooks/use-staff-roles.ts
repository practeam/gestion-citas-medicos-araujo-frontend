import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { staffRoleApi } from "../services/staff-role-api";
import type { StaffRole } from "../types/staff-role.types";

interface StaffRolesResult {
  key: string;
  data?: StaffRole[];
  error?: unknown;
}

/** Roles asignados a un integrante, incluidos los que luego quedaron inactivos. */
export function useStaffRoles(staffMemberId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<StaffRolesResult | null>(null);
  const isValidId = Number.isInteger(staffMemberId) && staffMemberId > 0;
  const requestKey = `${staffMemberId}|${reloadToken}`;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    staffRoleApi
      .list(staffMemberId, { includeInactive: true, signal: controller.signal })
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
