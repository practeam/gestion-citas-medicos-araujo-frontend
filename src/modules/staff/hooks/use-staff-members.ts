import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { staffMemberApi } from "../services/staff-member-api";
import type {
  StaffMember,
  StaffMemberListParams,
  StaffMemberSortField,
  StaffMemberStatusFilter,
  SortOrder,
} from "../types/staff-member.types";

export const STAFF_MEMBERS_PAGE_SIZE = 20;

export interface StaffMembersFilters {
  name: string;
  documentNumber: string;
  employeeNumber: string;
  status: StaffMemberStatusFilter;
  sortBy: StaffMemberSortField;
  order: SortOrder;
  page: number;
}

interface StaffMembersResult {
  key: string;
  data?: PageResult<StaffMember>;
  error?: unknown;
}

const INITIAL_FILTERS: StaffMembersFilters = {
  name: "",
  documentNumber: "",
  employeeNumber: "",
  status: "all",
  sortBy: "id",
  order: "asc",
  page: 1,
};

export function useStaffMembers() {
  const [filters, setFilters] = useState<StaffMembersFilters>(INITIAL_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<StaffMembersResult | null>(null);

  const { name, documentNumber, employeeNumber, status, sortBy, order, page } =
    filters;
  const requestKey = [
    name,
    documentNumber,
    employeeNumber,
    status,
    sortBy,
    order,
    page,
    reloadToken,
  ].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const params: StaffMemberListParams = {
      page,
      page_size: STAFF_MEMBERS_PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(name && { name }),
      ...(documentNumber && { document_number: documentNumber }),
      ...(employeeNumber && { employee_number: employeeNumber }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    staffMemberApi
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
    documentNumber,
    employeeNumber,
    status,
    sortBy,
    order,
    page,
  ]);

  /** Cambia filtros u ordenamiento y vuelve a la primera página. */
  const updateFilters = useCallback(
    (patch: Partial<Omit<StaffMembersFilters, "page">>) =>
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
    documentNumber !== "" ||
    employeeNumber !== "" ||
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
