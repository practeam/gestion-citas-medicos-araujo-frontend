import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ScheduleOverrideStatusBadge } from "../components/schedule-override-badges";
import { ScheduleOverrideForm } from "../components/schedule-override-form";
import { useScheduleOverride } from "../hooks/use-schedule-override";
import { targetKey, useTargetLabels } from "../hooks/use-target-labels";
import type { ScheduleOverrideFormValues } from "../schemas/schedule-override-schema";
import { scheduleOverrideApi } from "../services/schedule-override-api";
import { getScheduleOverrideErrorMessage } from "../utils/schedule-override-error.utils";
import { findOverlappingOverrides } from "../utils/schedule-override-overlap.utils";
import {
  toFormValues,
  toUpdatePayload,
} from "../utils/schedule-override-payload.utils";

export default function ScheduleOverrideEditPage() {
  const t = useTranslations("scheduleOverrides");
  const tErrors = useTranslations("scheduleOverrides.errors");
  const navigate = useNavigate();
  const { overrideId } = useParams();
  const { override, error, isInvalidId, isLoading } = useScheduleOverride(
    Number(overrideId),
  );
  const [noChanges, setNoChanges] = useState(false);

  const items = useMemo(() => (override ? [override] : undefined), [override]);
  const labels = useTargetLabels(items);

  const handleSubmit = async (values: ScheduleOverrideFormValues) => {
    if (!override) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, override);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    // Si el backend rechaza el cambio, el formulario conserva lo introducido.
    await scheduleOverrideApi.update(override.id, payload);
    void navigate("/schedule-overrides", { state: { notice: "updated" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.editTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.editTitle")} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || !override ? (
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
        <ComponentCard title={`${t("detail.title")} #${override.id}`}>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}:{" "}
            <ScheduleOverrideStatusBadge isActive={override.is_active} />
            <span className="text-xs">{t("form.statusHint")}</span>
          </div>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <ScheduleOverrideForm
            key={`${override.id}-${labels[targetKey(override)] ?? ""}`}
            mode="edit"
            defaultValues={toFormValues(override)}
            targetLabel={labels[targetKey(override)]}
            submitLabel={t("form.save")}
            onCheckOverlaps={(values) =>
              findOverlappingOverrides(values, override.id)
            }
            onSubmit={handleSubmit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
