import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { roleApi } from "../services/role-api";
import type {
  Role,
  RoleListParams,
  RoleStatusFilter,
} from "../types/role.types";

export const ROLES_PAGE_SIZE = 20;

interface RolesFilters {
  name: string;
  status: RoleStatusFilter;
  page: number;
}

interface RolesResult {
  key: string;
  data?: PageResult<Role>;
  error?: unknown;
}

export function useRoles() {
  const [filters, setFilters] = useState<RolesFilters>({
    name: "",
    status: "all",
    page: 1,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<RolesResult | null>(null);

  const { name, status, page } = filters;
  const requestKey = `${name}|${status}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const params: RoleListParams = {
      page,
      page_size: ROLES_PAGE_SIZE,
      ...(name && { name }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    roleApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, name, status, page]);

  const setName = useCallback(
    (value: string) =>
      setFilters((prev) =>
        prev.name === value ? prev : { ...prev, name: value, page: 1 },
      ),
    [],
  );
  const setStatus = useCallback(
    (value: RoleStatusFilter) =>
      setFilters((prev) =>
        prev.status === value ? prev : { ...prev, status: value, page: 1 },
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
    setPage,
    reload,
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
  };
}
