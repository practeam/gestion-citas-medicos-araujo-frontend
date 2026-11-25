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
import { ScheduleExceptionsFilters } from "../components/schedule-exceptions-filters";
import { ScheduleExceptionsPagination } from "../components/schedule-exceptions-pagination";
import { ScheduleExceptionsTable } from "../components/schedule-exceptions-table";
import {
  SCHEDULE_EXCEPTIONS_PAGE_SIZE,
  useScheduleExceptions,
} from "../hooks/use-schedule-exceptions";
import { getScheduleExceptionErrorMessage } from "../utils/schedule-exception-error.utils";

type Notice = "created" | "updated";

export default function ScheduleExceptionsPage() {
  const t = useTranslations("scheduleExceptions");
  const tErrors = useTranslations("scheduleExceptions.errors");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    filters,
    hasFilters,
    updateFilters,
    clearFilters,
    setPage,
    reload,
    data,
    error,
    isLoading,
  } = useScheduleExceptions();

  const [notice] = useState<Notice | null>(
    (location.state as { notice?: Notice } | null)?.notice ?? null,
  );

  // El aviso llega por location.state; se limpia para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state) void navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate]);

  const exceptions = data?.items ?? [];

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

        <Alert variant="info">
          <AlertDescription>{t("blockNote")}</AlertDescription>
        </Alert>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <ScheduleExceptionsFilters
                filters={filters}
                hasFilters={hasFilters}
                onChange={updateFilters}
                onClear={clearFilters}
              />
            </div>
            <Can permission="schedule_exception.create">
              <Button
                nativeButton={false}
                render={<Link to="/schedule-exceptions/create" />}
              >
                <PlusIcon className="fill-current" />
                {t("newException")}
              </Button>
            </Can>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5">
            {error ? (
              <div className="space-y-4 p-4 sm:p-6">
                <Alert variant="destructive">
                  <AlertDescription>
                    {getScheduleExceptionErrorMessage(error, tErrors)}
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
                {exceptions.length === 0 ? (
                  <p className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {hasFilters ? t("noResults") : t("empty")}
                  </p>
                ) : (
                  <ScheduleExceptionsTable exceptions={exceptions} />
                )}
                {data.total > 0 && (
                  <ScheduleExceptionsPagination
                    page={data.page}
                    pageSize={data.page_size || SCHEDULE_EXCEPTIONS_PAGE_SIZE}
                    total={data.total}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
