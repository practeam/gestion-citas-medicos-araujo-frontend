import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ScheduleOverrideStatusBadge,
  ScheduleOverrideTarget,
} from "../components/schedule-override-badges";
import { ScheduleOverrideStatusDialog } from "../components/schedule-override-status-dialog";
import { useOverrideStatusChange } from "../hooks/use-override-status-change";
import { useScheduleOverride } from "../hooks/use-schedule-override";
import { targetKey, useTargetLabels } from "../hooks/use-target-labels";
import type { ScheduleOverride } from "../types/schedule-override.types";
import { formatDateTimeWithZone } from "../utils/schedule-override-datetime.utils";
import { getScheduleOverrideErrorMessage } from "../utils/schedule-override-error.utils";
import { getTargetType } from "../utils/schedule-override-payload.utils";

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

export default function ScheduleOverrideDetailPage() {
  const t = useTranslations("scheduleOverrides");
  const tErrors = useTranslations("scheduleOverrides.errors");
  const locale = useLocale();
  const { overrideId } = useParams();
  const { override, error, isInvalidId, isLoading } = useScheduleOverride(
    Number(overrideId),
  );
  // Registro actualizado tras un cambio de estado confirmado por la API.
  const [updated, setUpdated] = useState<ScheduleOverride | null>(null);
  const current = updated?.id === override?.id ? updated : override;

  const items = useMemo(() => (current ? [current] : undefined), [current]);
  const labels = useTargetLabels(items);
  const statusChange = useOverrideStatusChange(setUpdated, (caught) =>
    getScheduleOverrideErrorMessage(caught, tErrors),
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
      ) : isInvalidId || error || !current ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getScheduleOverrideErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/schedule-overrides" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={`${t("detail.title")} #${current.id}`}>
          <Alert variant={current.is_active ? "info" : "warning"}>
            <AlertDescription>
              {t(`detail.effect.${getTargetType(current)}`)}{" "}
              {current.is_active
                ? t("detail.activeNote")
                : t("detail.inactiveNote")}
            </AlertDescription>
          </Alert>
          <dl
            className={`grid gap-4 text-sm sm:grid-cols-[12rem_1fr] ${current.is_active ? "" : "opacity-80"}`}
          >
            <DetailRow label={t("columns.id")}>{current.id}</DetailRow>
            <DetailRow label={t("columns.target")}>
              <ScheduleOverrideTarget
                override={current}
                label={labels[targetKey(current)]}
              />
            </DetailRow>
            <DetailRow label={t("columns.startsAt")}>
              {formatDateTimeWithZone(current.starts_at, locale)}
            </DetailRow>
            <DetailRow label={t("columns.endsAt")}>
              {formatDateTimeWithZone(current.ends_at, locale)}
            </DetailRow>
            <DetailRow label={t("columns.reason")}>
              {current.reason ?? t("noValue")}
            </DetailRow>
            <DetailRow label={t("columns.status")}>
              <ScheduleOverrideStatusBadge isActive={current.is_active} />
            </DetailRow>
            <DetailRow label={t("columns.createdAt")}>
              {formatDateTimeWithZone(current.created_at, locale)}
            </DetailRow>
            <DetailRow label={t("columns.updatedAt")}>
              {formatDateTimeWithZone(current.updated_at, locale)}
            </DetailRow>
          </dl>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("detail.notRecurring")}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/schedule-overrides" />}
            >
              {t("form.backToList")}
            </Button>
            <Button
              variant="outline"
              onClick={() => statusChange.request(current)}
            >
              {current.is_active
                ? t("actions.deactivate")
                : t("actions.activate")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to={`/schedule-overrides/${current.id}/edit`} />}
            >
              {t("actions.edit")}
            </Button>
          </div>
        </ComponentCard>
      )}

      <ScheduleOverrideStatusDialog
        override={statusChange.target}
        isPending={statusChange.isPending}
        error={statusChange.error}
        onConfirm={() => void statusChange.confirm()}
        onClose={statusChange.cancel}
      />
    </div>
  );
}
