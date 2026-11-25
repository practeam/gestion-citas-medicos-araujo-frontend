import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { useTranslations } from "@/i18n";
import { useNavigate } from "react-router";
import { ScheduleOverrideForm } from "../components/schedule-override-form";
import {
  EMPTY_SCHEDULE_OVERRIDE_VALUES,
  type ScheduleOverrideFormValues,
} from "../schemas/schedule-override-schema";
import { scheduleOverrideApi } from "../services/schedule-override-api";
import { findOverlappingOverrides } from "../utils/schedule-override-overlap.utils";
import { toCreatePayload } from "../utils/schedule-override-payload.utils";

export default function ScheduleOverrideCreatePage() {
  const t = useTranslations("scheduleOverrides");
  const navigate = useNavigate();

  const handleSubmit = async (values: ScheduleOverrideFormValues) => {
    await scheduleOverrideApi.create(toCreatePayload(values));
    void navigate("/schedule-overrides", { state: { notice: "created" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        <ScheduleOverrideForm
          mode="create"
          defaultValues={EMPTY_SCHEDULE_OVERRIDE_VALUES}
          submitLabel={t("form.create")}
          onCheckOverlaps={(values) => findOverlappingOverrides(values)}
          onSubmit={handleSubmit}
        />
      </ComponentCard>
    </div>
  );
}
