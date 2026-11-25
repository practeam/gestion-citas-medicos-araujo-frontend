import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { rolePermissionApi } from "../services/role-permission-api";
import type { RolePermission } from "../types/role-permission.types";

interface RolePermissionsResult {
  key: string;
  data?: RolePermission[];
  error?: unknown;
}

/** Permisos asignados a un rol (incluye los inactivos que siguen asociados). */
export function useRolePermissions(roleId: number) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<RolePermissionsResult | null>(null);
  const isValidId = Number.isInteger(roleId) && roleId > 0;
  const requestKey = `${roleId}|${reloadToken}`;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    rolePermissionApi
      .list(roleId, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, roleId, isValidId]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;

  return {
    assignments: (current ?? result)?.data,
    error: current?.error,
    isLoading: isValidId && current === null,
    reload,
  };
}
