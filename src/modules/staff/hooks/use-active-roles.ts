import { roleApi, type Role } from "@/modules/roles";
import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

const ROLES_PAGE_SIZE = 100;

interface ActiveRolesResult {
  key: string;
  data?: PageResult<Role>;
  error?: unknown;
}

/**
 * Catálogo de roles **activos** (los únicos que pueden asignarse), consultado
 * con el servicio del módulo `roles`. `search` filtra por nombre en el servidor.
 */
export function useActiveRoles(search: string) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ActiveRolesResult | null>(null);
  const requestKey = `${search}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    roleApi
      .list(
        {
          page: 1,
          page_size: ROLES_PAGE_SIZE,
          is_active: true,
          ...(search && { name: search }),
        },
        { signal: controller.signal },
      )
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, search]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;

  return {
    roles: (current ?? result)?.data?.items ?? [],
    total: (current ?? result)?.data?.total ?? 0,
    hasData: (current ?? result)?.data !== undefined,
    error: current?.error,
    isLoading: current === null,
    reload,
  };
}
