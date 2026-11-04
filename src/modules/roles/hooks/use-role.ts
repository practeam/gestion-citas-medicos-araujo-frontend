import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { roleApi } from "../services/role-api";
import type { Role } from "../types/role.types";

interface RoleResult {
  roleId: number;
  role?: Role;
  error?: unknown;
}

/** Consulta un rol por id. `roleId` inválido (NaN) se trata como no encontrado. */
export function useRole(roleId: number) {
  const [result, setResult] = useState<RoleResult | null>(null);
  const isValidId = Number.isInteger(roleId) && roleId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    roleApi
      .getById(roleId, { signal: controller.signal })
      .then((role) => setResult({ roleId, role }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ roleId, error });
      });

    return () => controller.abort();
  }, [roleId, isValidId]);

  const current = result?.roleId === roleId ? result : null;

  return {
    role: current?.role,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
