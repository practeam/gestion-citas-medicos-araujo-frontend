import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { permissionApi } from "../services/permission-api";
import type {
  Permission,
  PermissionListParams,
  PermissionStatusFilter,
} from "../types/permission.types";

export const PERMISSIONS_PAGE_SIZE = 20;

interface PermissionsFilters {
  name: string;
  status: PermissionStatusFilter;
  page: number;
}

interface PermissionsResult {
  key: string;
  data?: PageResult<Permission>;
  error?: unknown;
}

export function usePermissions() {
  const [filters, setFilters] = useState<PermissionsFilters>({
    name: "",
    status: "all",
    page: 1,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<PermissionsResult | null>(null);

  const { name, status, page } = filters;
  const requestKey = `${name}|${status}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const params: PermissionListParams = {
      page,
      page_size: PERMISSIONS_PAGE_SIZE,
      ...(name && { name }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    permissionApi
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
    (value: PermissionStatusFilter) =>
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
