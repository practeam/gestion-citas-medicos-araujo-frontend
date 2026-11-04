import { procedureApi, type Procedure } from "@/modules/procedures";
import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

interface OptionsResult {
  key: string;
  options?: Procedure[];
  total?: number;
  /** El catálogo no tiene procedimientos activos (sin búsqueda aplicada). */
  catalogEmpty?: boolean;
  error?: unknown;
}

/**
 * Procedimientos **activos** del catálogo (`GET /procedures?is_active=true`),
 * con búsqueda por nombre o código. Los inactivos nunca se ofrecen para nuevas
 * asociaciones.
 */
export function useProcedureOptions(pageSize = 10) {
  const [search, setSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<OptionsResult | null>(null);
  const requestKey = `${search}|${pageSize}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    procedureApi
      .list(
        {
          page: 1,
          page_size: pageSize,
          is_active: true,
          sort_by: "name",
          order: "asc",
          ...(search && { search }),
        },
        { signal: controller.signal },
      )
      .then((page) =>
        setResult({
          key: requestKey,
          options: page.items,
          total: page.total,
          catalogEmpty: !search && page.total === 0,
        }),
      )
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, search, pageSize]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;

  return {
    options: result?.options ?? [],
    total: result?.total ?? 0,
    hasData: result?.options !== undefined,
    catalogEmpty: current?.catalogEmpty ?? false,
    error: current?.error,
    isLoading: current === null,
    setSearch,
    reload,
  };
}
