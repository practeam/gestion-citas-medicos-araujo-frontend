import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Can } from "@/modules/auth";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { PlusIcon } from "@/icons";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { PermissionStatusDialog } from "../components/permission-status-dialog";
import { PermissionsFilters } from "../components/permissions-filters";
import { PermissionsPagination } from "../components/permissions-pagination";
import { PermissionsTable } from "../components/permissions-table";
import {
  PERMISSIONS_PAGE_SIZE,
  usePermissions,
} from "../hooks/use-permissions";
import { permissionApi } from "../services/permission-api";
import type { Permission } from "../types/permission.types";
import { getPermissionErrorMessage } from "../utils/permission-error.utils";

type Notice = "created" | "updated" | "activated" | "deactivated";

export default function PermissionsPage() {
  const t = useTranslations("permissions");
  const tErrors = useTranslations("permissions.errors");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    filters,
    hasFilters,
    setName,
    setStatus,
    setPage,
    reload,
    data,
    error,
    isLoading,
  } = usePermissions();

  const [notice, setNotice] = useState<Notice | null>(
    (location.state as { notice?: Notice } | null)?.notice ?? null,
  );
  const [statusTarget, setStatusTarget] = useState<Permission | null>(null);
  const [isStatusPending, setIsStatusPending] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // El aviso llega por location.state; se limpia para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state) void navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate]);

  const closeStatusDialog = () => {
    setStatusTarget(null);
    setStatusError(null);
  };

  const confirmStatusChange = async () => {
    if (!statusTarget || isStatusPending) return;
    setIsStatusPending(true);
    setStatusError(null);
    try {
      await permissionApi.updateStatus(statusTarget.id, {
        is_active: !statusTarget.is_active,
      });
      setNotice(statusTarget.is_active ? "deactivated" : "activated");
      setStatusTarget(null);
      reload();
    } catch (error) {
      setStatusError(getPermissionErrorMessage(error, tErrors));
    } finally {
      setIsStatusPending(false);
    }
  };

  const permissions = data?.items ?? [];

  return (
    <div>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("title")} />

      <div className="space-y-4">
        {notice && (
          <Alert variant="success">
            <AlertDescription>{t(`notices.${notice}`)}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <PermissionsFilters
              status={filters.status}
              onNameChange={setName}
              onStatusChange={setStatus}
            />
            <Can permission="permission.create">
              <Button
                nativeButton={false}
                render={<Link to="/permissions/create" />}
              >
                <PlusIcon className="fill-current" />
                {t("create")}
              </Button>
            </Can>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5">
            {error ? (
              <div className="space-y-4 p-4 sm:p-6">
                <Alert variant="destructive">
                  <AlertDescription>
                    {getPermissionErrorMessage(error, tErrors)}
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={reload}>
                  {t("retry")}
                </Button>
              </div>
            ) : !data ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
                <Spinner />
                {t("loading")}
              </div>
            ) : (
              <div
                className={isLoading ? "opacity-60 transition-opacity" : ""}
                aria-busy={isLoading}
              >
                {permissions.length === 0 ? (
                  <p className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {hasFilters ? t("noResults") : t("empty")}
                  </p>
                ) : (
                  <PermissionsTable
                    permissions={permissions}
                    onToggleStatus={setStatusTarget}
                  />
                )}
                {data.total > 0 && (
                  <PermissionsPagination
                    page={data.page}
                    pageSize={data.page_size || PERMISSIONS_PAGE_SIZE}
                    total={data.total}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PermissionStatusDialog
        permission={statusTarget}
        isPending={isStatusPending}
        error={statusError}
        onConfirm={confirmStatusChange}
        onClose={closeStatusDialog}
      />
    </div>
  );
}
