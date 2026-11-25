import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { useTranslations } from "@/i18n";
import { useNavigate } from "react-router";
import { PermissionForm } from "../components/permission-form";
import type { PermissionFormValues } from "../schemas/permission-schema";
import { permissionApi } from "../services/permission-api";
import { toCreatePayload } from "../utils/permission-payload.utils";

const EMPTY_VALUES: PermissionFormValues = { name: "", description: "" };

export default function PermissionCreatePage() {
  const t = useTranslations("permissions");
  const navigate = useNavigate();

  const handleSubmit = async (values: PermissionFormValues) => {
    await permissionApi.create(toCreatePayload(values));
    void navigate("/permissions", { state: { notice: "created" } });
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        <PermissionForm
          mode="create"
          defaultValues={EMPTY_VALUES}
          submitLabel={t("form.create")}
          onSubmit={handleSubmit}
        />
      </ComponentCard>
    </div>
  );
}
