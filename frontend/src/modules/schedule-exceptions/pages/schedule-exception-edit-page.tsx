import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ScheduleExceptionForm } from "../components/schedule-exception-form";
import { useScheduleException } from "../hooks/use-schedule-exception";
import { targetKey, useTargetLabels } from "../hooks/use-target-labels";
import type { ScheduleExceptionFormValues } from "../schemas/schedule-exception-schema";
import { scheduleExceptionApi } from "../services/schedule-exception-api";
import { getScheduleExceptionErrorMessage } from "../utils/schedule-exception-error.utils";
import {
  toFormValues,
  toUpdatePayload,
} from "../utils/schedule-exception-payload.utils";

export default function ScheduleExceptionEditPage() {
  const t = useTranslations("scheduleExceptions");
  const tErrors = useTranslations("scheduleExceptions.errors");
  const navigate = useNavigate();
  const { exceptionId } = useParams();
  const { exception, error, isInvalidId, isLoading } = useScheduleException(
    Number(exceptionId),
  );
  const [noChanges, setNoChanges] = useState(false);

  const items = useMemo(
    () => (exception ? [exception] : undefined),
    [exception],
  );
  const labels = useTargetLabels(items);

  const handleSubmit = async (values: ScheduleExceptionFormValues) => {
    if (!exception) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, exception);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    // Si el backend rechaza el cambio, el formulario conserva lo introducido.
    await scheduleExceptionApi.update(exception.id, payload);
    void navigate("/schedule-exceptions", { state: { notice: "updated" } });
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
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <ScheduleExceptionForm
            key={`${exception.id}-${labels[targetKey(exception)] ?? ""}`}
            defaultValues={toFormValues(exception)}
            initialTargetLabel={labels[targetKey(exception)]}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
