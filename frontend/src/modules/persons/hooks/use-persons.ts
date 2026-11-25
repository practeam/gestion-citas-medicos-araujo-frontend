import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { personApi } from "../services/person-api";
import type {
  Person,
  PersonListParams,
  PersonSortField,
  PersonStatusFilter,
  SortOrder,
} from "../types/person.types";

export const PERSONS_PAGE_SIZE = 20;

export interface PersonsFilters {
  name: string;
  documentType: string;
  documentNumber: string;
  status: PersonStatusFilter;
  sortBy: PersonSortField;
  order: SortOrder;
  page: number;
}

interface PersonsResult {
  key: string;
  data?: PageResult<Person>;
  error?: unknown;
}

const INITIAL_FILTERS: PersonsFilters = {
  name: "",
  documentType: "",
  documentNumber: "",
  status: "all",
  sortBy: "id",
  order: "asc",
  page: 1,
};

export function usePersons() {
  const [filters, setFilters] = useState<PersonsFilters>(INITIAL_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<PersonsResult | null>(null);

  const { name, documentType, documentNumber, status, sortBy, order, page } =
    filters;
  const requestKey = [
    name,
    documentType,
    documentNumber,
    status,
    sortBy,
    order,
    page,
    reloadToken,
  ].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const params: PersonListParams = {
      page,
      page_size: PERSONS_PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(name && { name }),
      ...(documentType && { document_type: documentType }),
      ...(documentNumber && { document_number: documentNumber }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    personApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [
    requestKey,
    name,
    documentType,
    documentNumber,
    status,
    sortBy,
    order,
    page,
  ]);

  /** Cambia filtros u ordenamiento y vuelve a la primera página. */
  const updateFilters = useCallback(
    (patch: Partial<Omit<PersonsFilters, "page">>) =>
      setFilters((prev) => {
        const changed = (Object.keys(patch) as (keyof typeof patch)[]).some(
          (key) => prev[key] !== patch[key],
        );
        return changed ? { ...prev, ...patch, page: 1 } : prev;
      }),
    [],
  );
  const setPage = useCallback(
    (value: number) => setFilters((prev) => ({ ...prev, page: value })),
    [],
  );
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const current = result?.key === requestKey ? result : null;
  const hasFilters =
    name !== "" ||
    documentType !== "" ||
    documentNumber !== "" ||
    status !== "all";

  return {
    filters,
    hasFilters,
    updateFilters,
    setPage,
    reload,
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
  };
}
