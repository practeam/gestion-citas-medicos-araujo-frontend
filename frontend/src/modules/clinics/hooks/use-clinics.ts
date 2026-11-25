import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { clinicApi } from "../services/clinic-api";
import type {
  Clinic,
  SortOrder,
  ClinicListParams,
  ClinicSortField,
  ClinicStatusFilter,
} from "../types/clinic.types";

export const CLINICS_PAGE_SIZE = 20;

interface ClinicsFilters {
  name: string;
  status: ClinicStatusFilter;
  sortBy: ClinicSortField;
  order: SortOrder;
  page: number;
}

interface ClinicsResult {
  key: string;
  data?: PageResult<Clinic>;
  error?: unknown;
}

export function useClinics() {
  const [filters, setFilters] = useState<ClinicsFilters>({
    name: "",
    status: "all",
    sortBy: "id",
    order: "asc",
    page: 1,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ClinicsResult | null>(null);

  const { name, status, sortBy, order, page } = filters;
  const requestKey = `${name}|${status}|${sortBy}|${order}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const params: ClinicListParams = {
      page,
      page_size: CLINICS_PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(name && { name }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    clinicApi
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
    (value: ClinicStatusFilter) =>
      setFilters((prev) =>
        prev.status === value ? prev : { ...prev, status: value, page: 1 },
      ),
    [],
  );
  const setSortBy = useCallback(
    (value: ClinicSortField) =>
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
