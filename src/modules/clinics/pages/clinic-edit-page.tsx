import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ClinicForm } from "../components/clinic-form";
import { ClinicSchedulesEditor } from "../components/clinic-schedules-editor";
import { ClinicStatusBadge } from "../components/clinic-status-badge";
import { useClinic } from "../hooks/use-clinic";
import type { ClinicFormValues } from "../schemas/clinic-schema";
import { clinicApi } from "../services/clinic-api";
import { getClinicErrorMessage } from "../utils/clinic-error.utils";
import { toUpdatePayload } from "../utils/clinic-payload.utils";

export default function ClinicEditPage() {
  const t = useTranslations("clinics");
  const tErrors = useTranslations("clinics.errors");
  const navigate = useNavigate();
  const { clinicId } = useParams();
  const { clinic, error, isInvalidId, isLoading } = useClinic(Number(clinicId));
  const [noChanges, setNoChanges] = useState(false);

  const handleSubmit = async (values: ClinicFormValues) => {
    if (!clinic) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, clinic);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    await clinicApi.update(clinic.id, payload);
    void navigate("/clinics", { state: { notice: "updated" } });
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
      ) : isInvalidId || error || !clinic ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getClinicErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/clinics" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={clinic.name}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}:{" "}
            <ClinicStatusBadge isActive={clinic.is_active} />
          </div>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <ClinicForm
            key={clinic.id}
            defaultValues={{
              name: clinic.name,
              address: clinic.address,
              description: clinic.description ?? "",
              phone: clinic.phone ?? "",
              email: clinic.email ?? "",
            }}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          />
          <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("schedules.title")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("schedules.editHint")}
              </p>
            </div>
            <ClinicSchedulesEditor clinicId={clinic.id} />
          </section>
        </ComponentCard>
      )}
    </div>
  );
}
