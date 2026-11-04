import { permissionApi, type Permission } from "@/modules/permissions";
import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

export const PERMISSIONS_PICKER_PAGE_SIZE = 10;

interface Query {
  search: string;
  page: number;
}

interface ActivePermissionsResult {
  key: string;
  data?: PageResult<Permission>;
  error?: unknown;
}

/**
 * Catálogo de permisos **activos** (los únicos asignables), consultado con el
 * servicio del módulo `permissions` y respetando su paginación. Cambiar la
 * búsqueda vuelve a la primera página.
 */
export function useActivePermissions() {
  const [query, setQuery] = useState<Query>({ search: "", page: 1 });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ActivePermissionsResult | null>(null);
  const { search, page } = query;
  const requestKey = `${search}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    permissionApi
      .list(
        {
          page,
          page_size: PERMISSIONS_PICKER_PAGE_SIZE,
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
  }, [requestKey, search, page]);

  const setSearch = useCallback(
    (value: string) =>
      setQuery((prev) =>
        prev.search === value ? prev : { search: value, page: 1 },
      ),
    [],
  );
  const setPage = useCallback(
    (value: number) => setQuery((prev) => ({ ...prev, page: value })),
    [],
  );
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const current = result?.key === requestKey ? result : null;
  const data = (current ?? result)?.data;

  return {
    search,
    page,
    permissions: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: data?.page_size || PERMISSIONS_PICKER_PAGE_SIZE,
    hasData: data !== undefined,
    error: current?.error,
    isLoading: current === null,
    setSearch,
    setPage,
    reload,
  };
}
