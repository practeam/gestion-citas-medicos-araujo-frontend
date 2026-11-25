import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { specialtyApi } from "../services/specialty-api";
import type {
  Specialty,
  SortOrder,
  SpecialtyListParams,
  SpecialtySortField,
  SpecialtyStatusFilter,
} from "../types/specialty.types";

export const SPECIALTIES_PAGE_SIZE = 20;

interface SpecialtiesFilters {
  name: string;
  status: SpecialtyStatusFilter;
  sortBy: SpecialtySortField;
  order: SortOrder;
  page: number;
}

interface SpecialtiesResult {
  key: string;
  data?: PageResult<Specialty>;
  error?: unknown;
}

export function useSpecialties() {
  const [filters, setFilters] = useState<SpecialtiesFilters>({
    name: "",
    status: "all",
    sortBy: "id",
    order: "asc",
    page: 1,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<SpecialtiesResult | null>(null);

  const { name, status, sortBy, order, page } = filters;
  const requestKey = `${name}|${status}|${sortBy}|${order}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const params: SpecialtyListParams = {
      page,
      page_size: SPECIALTIES_PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(name && { name }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    specialtyApi
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
    (value: SpecialtyStatusFilter) =>
      setFilters((prev) =>
        prev.status === value ? prev : { ...prev, status: value, page: 1 },
      ),
    [],
  );
  const setSortBy = useCallback(
    (value: SpecialtySortField) =>
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
