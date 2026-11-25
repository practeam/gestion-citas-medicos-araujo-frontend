import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { useTranslations } from "@/i18n";
import { useNavigate } from "react-router";
import { ProcedureForm } from "../components/procedure-form";
import {
  EMPTY_PROCEDURE_VALUES,
  type ProcedureFormValues,
} from "../schemas/procedure-schema";
import { procedureApi } from "../services/procedure-api";
import { toCreatePayload } from "../utils/procedure-payload.utils";

export default function ProcedureCreatePage() {
  const t = useTranslations("procedures");
  const navigate = useNavigate();

  const handleSubmit = async (values: ProcedureFormValues) => {
    await procedureApi.create(toCreatePayload(values));
    void navigate("/procedures", { state: { notice: "created" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard
        title={t("form.createTitle")}
        description={t("form.createDescription")}
      >
        <ProcedureForm
          defaultValues={EMPTY_PROCEDURE_VALUES}
          submitLabel={t("form.create")}
          onSubmit={handleSubmit}
        />
      </ComponentCard>
    </div>
  );
}
