import { ComponentCard } from "@/components/shared/component-card";
import { Can } from "@/modules/auth";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { Link, useParams } from "react-router";
import { ClinicSchedulesWeek } from "../components/clinic-schedules-week";
import { ClinicStatusBadge } from "../components/clinic-status-badge";
import { useClinic } from "../hooks/use-clinic";
import { formatDateTime } from "../utils/clinic-date.utils";
import { getClinicErrorMessage } from "../utils/clinic-error.utils";

export default function ClinicDetailPage() {
  const t = useTranslations("clinics");
  const tErrors = useTranslations("clinics.errors");
  const locale = useLocale();
  const { clinicId } = useParams();
  const { clinic, error, isInvalidId, isLoading } = useClinic(Number(clinicId));

  return (
    <div>
      <PageMeta title={t("detail.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("detail.title")} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || !clinic ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getClinicErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/clinics" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={clinic.name}>
          <dl className="grid gap-5 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.id")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">{clinic.id}</dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.name")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">{clinic.name}</dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.address")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {clinic.address}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.phone")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {clinic.phone ?? t("noValue")}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.email")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {clinic.email ?? t("noValue")}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.description")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {clinic.description ?? t("noDescription")}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.status")}
            </dt>
            <dd>
              <ClinicStatusBadge isActive={clinic.is_active} />
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.createdAt")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {formatDateTime(clinic.created_at, locale)}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.updatedAt")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {formatDateTime(clinic.updated_at, locale)}
            </dd>
          </dl>
          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("schedules.title")}
              </h4>
              <Link
                to={`/clinics/${clinic.id}/edit`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("schedules.manageInEdit")}
              </Link>
            </div>
            <ClinicSchedulesWeek clinicId={clinic.id} />
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/clinics" />}
            >
              {t("form.backToList")}
            </Button>
            <Can permission="clinic.update">
              <Button
                nativeButton={false}
                render={<Link to={`/clinics/${clinic.id}/edit`} />}
              >
                {t("actions.edit")}
              </Button>
            </Can>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
