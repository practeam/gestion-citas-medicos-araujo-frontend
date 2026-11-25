import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { procedureApi } from "../services/procedure-api";
import type {
  Procedure,
  ProcedureListParams,
  ProcedureSortField,
  ProcedureStatusFilter,
  SortOrder,
} from "../types/procedure.types";
import { normalizePrice } from "../utils/procedure-price.utils";

export const PROCEDURES_PAGE_SIZE = 20;

export interface ProcedureFilters {
  search: string;
  status: ProcedureStatusFilter;
  parentId: number | null;
  /** Texto del campo; solo se envía si es un precio válido. */
  minPrice: string;
  maxPrice: string;
  sortBy: ProcedureSortField;
  order: SortOrder;
  page: number;
}

interface ProceduresResult {
  key: string;
  data?: PageResult<Procedure>;
  error?: unknown;
}

const INITIAL_FILTERS: ProcedureFilters = {
  search: "",
  status: "all",
  parentId: null,
  minPrice: "",
  maxPrice: "",
  sortBy: "id",
  order: "asc",
  page: 1,
};

export function useProcedures() {
  const [filters, setFilters] = useState<ProcedureFilters>(INITIAL_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ProceduresResult | null>(null);

  const { search, status, parentId, minPrice, maxPrice, sortBy, order, page } =
    filters;
  const requestKey = [
    search,
    status,
    parentId,
    minPrice,
    maxPrice,
    sortBy,
    order,
    page,
    reloadToken,
  ].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const min = normalizePrice(minPrice);
    const max = normalizePrice(maxPrice);
    const params: ProcedureListParams = {
      page,
      page_size: PROCEDURES_PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(search && { search }),
      ...(status !== "all" && { is_active: status === "active" }),
      ...(parentId !== null && { parent_procedure_id: parentId }),
      ...(min !== null && { min_price: min }),
      ...(max !== null && { max_price: max }),
    };

    procedureApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [
    requestKey,
    search,
    status,
    parentId,
    minPrice,
    maxPrice,
    sortBy,
    order,
    page,
  ]);

  /** Cambia filtros u orden y vuelve a la primera página. */
  const updateFilters = useCallback(
    (patch: Partial<Omit<ProcedureFilters, "page">>) =>
      setFilters((prev) => {
        const changed = (Object.keys(patch) as (keyof typeof patch)[]).some(
          (key) => prev[key] !== patch[key],
        );
        return changed ? { ...prev, ...patch, page: 1 } : prev;
      }),
    [],
  );
  const clearFilters = useCallback(
    () =>
      setFilters((prev) => ({
        ...INITIAL_FILTERS,
        sortBy: prev.sortBy,
        order: prev.order,
      })),
    [],
  );
  const setPage = useCallback(
    (value: number) => setFilters((prev) => ({ ...prev, page: value })),
    [],
  );
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const current = result?.key === requestKey ? result : null;
  const hasFilters =
    search !== "" ||
    status !== "all" ||
    parentId !== null ||
    minPrice !== "" ||
    maxPrice !== "";

  return {
    filters,
    hasFilters,
    updateFilters,
    clearFilters,
    setPage,
    reload,
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
  };
}
