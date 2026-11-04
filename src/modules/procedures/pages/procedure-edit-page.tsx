import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ProcedureForm } from "../components/procedure-form";
import { ProcedureStatusBadge } from "../components/procedure-status-badge";
import { useProcedure } from "../hooks/use-procedure";
import type { ProcedureFormValues } from "../schemas/procedure-schema";
import { procedureApi } from "../services/procedure-api";
import { getProcedureErrorMessage } from "../utils/procedure-error.utils";
import { toUpdatePayload } from "../utils/procedure-payload.utils";

export default function ProcedureEditPage() {
  const t = useTranslations("procedures");
  const tErrors = useTranslations("procedures.errors");
  const navigate = useNavigate();
  const { procedureId } = useParams();
  const { procedure, error, isInvalidId, isLoading } = useProcedure(
    Number(procedureId),
  );
  const [noChanges, setNoChanges] = useState(false);

  const handleSubmit = async (values: ProcedureFormValues) => {
    if (!procedure) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, procedure);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    await procedureApi.update(procedure.id, payload);
    void navigate("/procedures", { state: { notice: "updated" } });
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
      ) : isInvalidId || error || !procedure ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getProcedureErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/procedures" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={procedure.name}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}:{" "}
            <ProcedureStatusBadge isActive={procedure.is_active} />
          </div>
          <Alert variant="info">
            <AlertDescription>{t("form.historyNote")}</AlertDescription>
          </Alert>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <ProcedureForm
            key={procedure.id}
            procedureId={procedure.id}
            defaultValues={{
              name: procedure.name,
              code: procedure.code ?? "",
              basePrice: procedure.base_price,
              baseDurationMinutes: String(procedure.base_duration_minutes),
              description: procedure.description ?? "",
              parentProcedureId: procedure.parent_procedure_id,
            }}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
