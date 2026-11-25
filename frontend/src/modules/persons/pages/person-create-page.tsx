import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { useTranslations } from "@/i18n";
import { useNavigate } from "react-router";
import { PersonForm } from "../components/person-form";
import {
  EMPTY_PERSON_FORM_VALUES,
  type PersonFormValues,
} from "../schemas/person-schema";
import { personApi } from "../services/person-api";
import { toCreatePayload } from "../utils/person-payload.utils";

export default function PersonCreatePage() {
  const t = useTranslations("persons");
  const navigate = useNavigate();

  const handleSubmit = async (values: PersonFormValues) => {
    await personApi.create(toCreatePayload(values));
    void navigate("/persons", { state: { notice: "created" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        <PersonForm
          defaultValues={EMPTY_PERSON_FORM_VALUES}
          submitLabel={t("form.create")}
          onSubmit={handleSubmit}
        />
      </ComponentCard>
    </div>
  );
}
