import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { procedureApi } from "../services/procedure-api";
import type { Procedure } from "../types/procedure.types";

interface OptionsResult {
  key: string;
  options?: Procedure[];
  total?: number;
  error?: unknown;
}

/**
 * Procedimientos **activos** que pueden ser padre, con búsqueda por nombre o
 * código. `excludeId` (el procedimiento que se edita) se omite de la lista; la
 * detección de ciclos con sus descendientes la hace el backend.
 */
export function useParentOptions(excludeId?: number, pageSize = 10) {
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
  const options = (result?.options ?? []).filter(
    (procedure) => procedure.id !== excludeId,
  );

  return {
    options,
    total: result?.total ?? 0,
    hasData: result?.options !== undefined,
    error: current?.error,
    isLoading: current === null,
    setSearch,
    reload,
  };
}
