import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { permissionApi } from "../services/permission-api";
import type { Permission } from "../types/permission.types";

interface PermissionResult {
  permissionId: number;
  permission?: Permission;
  error?: unknown;
}

/** Consulta un permiso por id. `permissionId` inválido (NaN) se trata como no encontrado. */
export function usePermission(permissionId: number) {
  const [result, setResult] = useState<PermissionResult | null>(null);
  const isValidId = Number.isInteger(permissionId) && permissionId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    permissionApi
      .getById(permissionId, { signal: controller.signal })
      .then((permission) => setResult({ permissionId, permission }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ permissionId, error });
      });

    return () => controller.abort();
  }, [permissionId, isValidId]);

  const current = result?.permissionId === permissionId ? result : null;

  return {
    permission: current?.permission,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
