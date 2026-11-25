import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { specialConditionApi } from "../services/special-condition-api";
import type {
  SpecialCondition,
  SortOrder,
  SpecialConditionListParams,
  SpecialConditionSortField,
  SpecialConditionStatusFilter,
} from "../types/special-condition.types";

export const SPECIAL_CONDITIONS_PAGE_SIZE = 20;

interface SpecialConditionsFilters {
  name: string;
  status: SpecialConditionStatusFilter;
  sortBy: SpecialConditionSortField;
  order: SortOrder;
  page: number;
}

interface SpecialConditionsResult {
  key: string;
  data?: PageResult<SpecialCondition>;
  error?: unknown;
}

export function useSpecialConditions() {
  const [filters, setFilters] = useState<SpecialConditionsFilters>({
    name: "",
    status: "all",
    sortBy: "id",
    order: "asc",
    page: 1,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<SpecialConditionsResult | null>(null);

  const { name, status, sortBy, order, page } = filters;
  const requestKey = `${name}|${status}|${sortBy}|${order}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const params: SpecialConditionListParams = {
      page,
      page_size: SPECIAL_CONDITIONS_PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(name && { name }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    specialConditionApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, name, status, sortBy, order, page]);

  const setName = useCallback(
    (value: string) =>
      setFilters((prev) =>
        prev.name === value ? prev : { ...prev, name: value, page: 1 },
      ),
    [],
  );
  const setStatus = useCallback(
    (value: SpecialConditionStatusFilter) =>
      setFilters((prev) =>
        prev.status === value ? prev : { ...prev, status: value, page: 1 },
      ),
    [],
  );
  const setSortBy = useCallback(
    (value: SpecialConditionSortField) =>
      setFilters((prev) =>
        prev.sortBy === value ? prev : { ...prev, sortBy: value, page: 1 },
      ),
    [],
  );
  const setOrder = useCallback(
    (value: SortOrder) =>
      setFilters((prev) =>
        prev.order === value ? prev : { ...prev, order: value, page: 1 },
      ),
    [],
  );
  const setPage = useCallback(
    (value: number) => setFilters((prev) => ({ ...prev, page: value })),
    [],
  );
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const current = result?.key === requestKey ? result : null;
  const hasFilters = name !== "" || status !== "all";

  return {
    filters,
    hasFilters,
    setName,
    setStatus,
    setSortBy,
    setOrder,
    setPage,
    reload,
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
  };
}
