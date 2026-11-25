import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { SpecialtyForm } from "../components/specialty-form";
import { SpecialtyStatusBadge } from "../components/specialty-status-badge";
import { useSpecialty } from "../hooks/use-specialty";
import type { SpecialtyFormValues } from "../schemas/specialty-schema";
import { specialtyApi } from "../services/specialty-api";
import { getSpecialtyErrorMessage } from "../utils/specialty-error.utils";
import { toUpdatePayload } from "../utils/specialty-payload.utils";

export default function SpecialtyEditPage() {
  const t = useTranslations("specialties");
  const tErrors = useTranslations("specialties.errors");
  const navigate = useNavigate();
  const { specialtyId } = useParams();
  const { specialty, error, isInvalidId, isLoading } = useSpecialty(
    Number(specialtyId),
  );
  const [noChanges, setNoChanges] = useState(false);

  const handleSubmit = async (values: SpecialtyFormValues) => {
    if (!specialty) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, specialty);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    await specialtyApi.update(specialty.id, payload);
    void navigate("/specialties", { state: { notice: "updated" } });
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
      ) : isInvalidId || error || !specialty ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getSpecialtyErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/specialties" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={specialty.name}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}:{" "}
            <SpecialtyStatusBadge isActive={specialty.is_active} />
          </div>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <SpecialtyForm
            key={specialty.id}
            defaultValues={{
              name: specialty.name,
              description: specialty.description ?? "",
            }}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
