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
import { SpecialConditionStatusDialog } from "../components/special-condition-status-dialog";
import { SpecialConditionsFilters } from "../components/special-conditions-filters";
import { SpecialConditionsPagination } from "../components/special-conditions-pagination";
import { SpecialConditionsTable } from "../components/special-conditions-table";
import {
  SPECIAL_CONDITIONS_PAGE_SIZE,
  useSpecialConditions,
} from "../hooks/use-special-conditions";
import { specialConditionApi } from "../services/special-condition-api";
import type { SpecialCondition } from "../types/special-condition.types";
import { getSpecialConditionErrorMessage } from "../utils/special-condition-error.utils";

type Notice = "created" | "updated" | "activated" | "deactivated";

export default function SpecialConditionsPage() {
  const t = useTranslations("specialConditions");
  const tErrors = useTranslations("specialConditions.errors");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    filters,
    hasFilters,
    setName,
    setStatus,
    setSortBy,
    setOrder,
    setPage,
    reload,
    data,
    error,
    isLoading,
  } = useSpecialConditions();

  const [notice, setNotice] = useState<Notice | null>(
    (location.state as { notice?: Notice } | null)?.notice ?? null,
  );
  const [statusTarget, setStatusTarget] = useState<SpecialCondition | null>(
    null,
  );
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
      await specialConditionApi.updateStatus(statusTarget.id, {
        is_active: !statusTarget.is_active,
      });
      setNotice(statusTarget.is_active ? "deactivated" : "activated");
      setStatusTarget(null);
      reload();
    } catch (error) {
      setStatusError(getSpecialConditionErrorMessage(error, tErrors));
    } finally {
      setIsStatusPending(false);
    }
  };

  const specialConditions = data?.items ?? [];

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
            <SpecialConditionsFilters
              status={filters.status}
              sortBy={filters.sortBy}
              order={filters.order}
              onNameChange={setName}
              onStatusChange={setStatus}
              onSortByChange={setSortBy}
              onOrderChange={setOrder}
            />
            <Can permission="special_condition.create">
              <Button
                nativeButton={false}
                render={<Link to="/special-conditions/create" />}
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
                    {getSpecialConditionErrorMessage(error, tErrors)}
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
                {specialConditions.length === 0 ? (
                  <p className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {hasFilters ? t("noResults") : t("empty")}
                  </p>
                ) : (
                  <SpecialConditionsTable
                    specialConditions={specialConditions}
                    onToggleStatus={setStatusTarget}
                  />
                )}
                {data.total > 0 && (
                  <SpecialConditionsPagination
                    page={data.page}
                    pageSize={data.page_size || SPECIAL_CONDITIONS_PAGE_SIZE}
                    total={data.total}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SpecialConditionStatusDialog
        specialCondition={statusTarget}
        isPending={isStatusPending}
        error={statusError}
        onConfirm={confirmStatusChange}
        onClose={closeStatusDialog}
      />
    </div>
  );
}
