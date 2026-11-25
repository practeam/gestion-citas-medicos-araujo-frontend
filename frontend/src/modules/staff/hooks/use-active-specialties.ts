import { specialtyApi, type Specialty } from "@/modules/specialties";
import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

export const SPECIALTIES_PICKER_PAGE_SIZE = 10;

interface Query {
  search: string;
  page: number;
}

interface ActiveSpecialtiesResult {
  key: string;
  data?: PageResult<Specialty>;
  error?: unknown;
}

/**
 * Catálogo de permisos **activos** (los únicos asignables), consultado con el
 * servicio del módulo `specialties` y respetando su paginación. Cambiar la
 * búsqueda vuelve a la primera página.
 */
export function useActiveSpecialties() {
  const [query, setQuery] = useState<Query>({ search: "", page: 1 });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ActiveSpecialtiesResult | null>(null);
  const { search, page } = query;
  const requestKey = `${search}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    specialtyApi
      .list(
        {
          page,
          page_size: SPECIALTIES_PICKER_PAGE_SIZE,
          is_active: true,
          sort_by: "name",
          order: "asc",
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
    specialties: data?.items ?? [],
    total: data?.total ?? 0,
    pageSize: data?.page_size || SPECIALTIES_PICKER_PAGE_SIZE,
    hasData: data !== undefined,
    error: current?.error,
    isLoading: current === null,
    setSearch,
    setPage,
    reload,
  };
}
