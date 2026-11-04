import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { useMemo } from "react";
import { Link, useParams } from "react-router";
import {
  ExceptionTypeBadge,
  ScheduleExceptionTarget,
} from "../components/schedule-exception-badges";
import { useScheduleException } from "../hooks/use-schedule-exception";
import { targetKey, useTargetLabels } from "../hooks/use-target-labels";
import { formatDateTimeWithZone } from "../utils/schedule-exception-datetime.utils";
import { getScheduleExceptionErrorMessage } from "../utils/schedule-exception-error.utils";
import { getTargetType } from "../utils/schedule-exception-payload.utils";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="break-words whitespace-pre-line text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </>
  );
}

export default function ScheduleExceptionDetailPage() {
  const t = useTranslations("scheduleExceptions");
  const tErrors = useTranslations("scheduleExceptions.errors");
  const locale = useLocale();
  const { exceptionId } = useParams();
  const { exception, error, isInvalidId, isLoading } = useScheduleException(
    Number(exceptionId),
  );
  const items = useMemo(
    () => (exception ? [exception] : undefined),
    [exception],
  );
  const labels = useTargetLabels(items);

  return (
    <div>
      <PageMeta title={t("detail.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("detail.title")} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || !exception ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getScheduleExceptionErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/schedule-exceptions" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={`${t("detail.title")} #${exception.id}`}>
          <Alert variant="info">
            <AlertDescription>
              {t(`detail.effect.${getTargetType(exception)}`)}
            </AlertDescription>
          </Alert>
          <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
            <DetailRow label={t("columns.id")}>{exception.id}</DetailRow>
            <DetailRow label={t("columns.target")}>
              <ScheduleExceptionTarget
                exception={exception}
                label={labels[targetKey(exception)]}
              />
            </DetailRow>
            <DetailRow label={t("columns.type")}>
              <ExceptionTypeBadge type={exception.exception_type} />
            </DetailRow>
            <DetailRow label={t("columns.reason")}>
              {exception.reason ?? t("noValue")}
            </DetailRow>
            <DetailRow label={t("columns.startsAt")}>
              {formatDateTimeWithZone(exception.starts_at, locale)}
            </DetailRow>
            <DetailRow label={t("columns.endsAt")}>
              {formatDateTimeWithZone(exception.ends_at, locale)}
            </DetailRow>
            <DetailRow label={t("columns.createdAt")}>
              {formatDateTimeWithZone(exception.created_at, locale)}
            </DetailRow>
            <DetailRow label={t("columns.updatedAt")}>
              {formatDateTimeWithZone(exception.updated_at, locale)}
            </DetailRow>
          </dl>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("detail.notRecurring")}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/schedule-exceptions" />}
            >
              {t("form.backToList")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to={`/schedule-exceptions/${exception.id}/edit`} />}
            >
              {t("actions.edit")}
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
