import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { useTranslations } from "@/i18n";
import { useNavigate } from "react-router";
import { ScheduleExceptionForm } from "../components/schedule-exception-form";
import {
  EMPTY_SCHEDULE_EXCEPTION_VALUES,
  type ScheduleExceptionFormValues,
} from "../schemas/schedule-exception-schema";
import { scheduleExceptionApi } from "../services/schedule-exception-api";
import { toCreatePayload } from "../utils/schedule-exception-payload.utils";

export default function ScheduleExceptionCreatePage() {
  const t = useTranslations("scheduleExceptions");
  const navigate = useNavigate();

  const handleSubmit = async (values: ScheduleExceptionFormValues) => {
    await scheduleExceptionApi.create(toCreatePayload(values));
    void navigate("/schedule-exceptions", { state: { notice: "created" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        <ScheduleExceptionForm
          defaultValues={EMPTY_SCHEDULE_EXCEPTION_VALUES}
          submitLabel={t("form.create")}
          onSubmit={handleSubmit}
        />
      </ComponentCard>
    </div>
  );
}
