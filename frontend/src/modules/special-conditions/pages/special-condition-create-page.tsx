import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { useTranslations } from "@/i18n";
import { useNavigate } from "react-router";
import { SpecialConditionForm } from "../components/special-condition-form";
import type { SpecialConditionFormValues } from "../schemas/special-condition-schema";
import { specialConditionApi } from "../services/special-condition-api";
import { toCreatePayload } from "../utils/special-condition-payload.utils";

const EMPTY_VALUES: SpecialConditionFormValues = { name: "", description: "" };

export default function SpecialConditionCreatePage() {
  const t = useTranslations("specialConditions");
  const navigate = useNavigate();

  const handleSubmit = async (values: SpecialConditionFormValues) => {
    await specialConditionApi.create(toCreatePayload(values));
    void navigate("/special-conditions", { state: { notice: "created" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        <SpecialConditionForm
          defaultValues={EMPTY_VALUES}
          submitLabel={t("form.create")}
          onSubmit={handleSubmit}
        />
      </ComponentCard>
    </div>
  );
}
