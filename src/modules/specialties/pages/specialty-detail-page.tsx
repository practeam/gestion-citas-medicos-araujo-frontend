import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { Link, useParams } from "react-router";
import { SpecialtyStatusBadge } from "../components/specialty-status-badge";
import { useSpecialty } from "../hooks/use-specialty";
import { formatDateTime } from "../utils/specialty-date.utils";
import { getSpecialtyErrorMessage } from "../utils/specialty-error.utils";

export default function SpecialtyDetailPage() {
  const t = useTranslations("specialties");
  const tErrors = useTranslations("specialties.errors");
  const locale = useLocale();
  const { specialtyId } = useParams();
  const { specialty, error, isInvalidId, isLoading } = useSpecialty(
    Number(specialtyId),
  );

  return (
    <div>
      <PageMeta title={t("detail.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("detail.title")} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || !specialty ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getSpecialtyErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/specialties" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={specialty.name}>
          <dl className="grid gap-5 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.id")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">{specialty.id}</dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.name")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {specialty.name}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.description")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {specialty.description ?? t("noDescription")}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.status")}
            </dt>
            <dd>
              <SpecialtyStatusBadge isActive={specialty.is_active} />
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.createdAt")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {formatDateTime(specialty.created_at, locale)}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.updatedAt")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {formatDateTime(specialty.updated_at, locale)}
            </dd>
          </dl>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/specialties" />}
            >
              {t("form.backToList")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to={`/specialties/${specialty.id}/edit`} />}
            >
              {t("actions.edit")}
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
