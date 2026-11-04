import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { useTranslations } from "@/i18n";
import { useNavigate } from "react-router";
import { SpecialtyForm } from "../components/specialty-form";
import type { SpecialtyFormValues } from "../schemas/specialty-schema";
import { specialtyApi } from "../services/specialty-api";
import { toCreatePayload } from "../utils/specialty-payload.utils";

const EMPTY_VALUES: SpecialtyFormValues = { name: "", description: "" };

export default function SpecialtyCreatePage() {
  const t = useTranslations("specialties");
  const navigate = useNavigate();

  const handleSubmit = async (values: SpecialtyFormValues) => {
    await specialtyApi.create(toCreatePayload(values));
    void navigate("/specialties", { state: { notice: "created" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        <SpecialtyForm
          defaultValues={EMPTY_VALUES}
          submitLabel={t("form.create")}
          onSubmit={handleSubmit}
        />
      </ComponentCard>
    </div>
  );
}
