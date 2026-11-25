import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { SpecialConditionForm } from "../components/special-condition-form";
import { SpecialConditionStatusBadge } from "../components/special-condition-status-badge";
import { useSpecialCondition } from "../hooks/use-special-condition";
import type { SpecialConditionFormValues } from "../schemas/special-condition-schema";
import { specialConditionApi } from "../services/special-condition-api";
import { getSpecialConditionErrorMessage } from "../utils/special-condition-error.utils";
import { toUpdatePayload } from "../utils/special-condition-payload.utils";

export default function SpecialConditionEditPage() {
  const t = useTranslations("specialConditions");
  const tErrors = useTranslations("specialConditions.errors");
  const navigate = useNavigate();
  const { specialConditionId } = useParams();
  const { specialCondition, error, isInvalidId, isLoading } =
    useSpecialCondition(Number(specialConditionId));
  const [noChanges, setNoChanges] = useState(false);

  const handleSubmit = async (values: SpecialConditionFormValues) => {
    if (!specialCondition) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, specialCondition);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    await specialConditionApi.update(specialCondition.id, payload);
    void navigate("/special-conditions", { state: { notice: "updated" } });
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
      ) : isInvalidId || error || !specialCondition ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getSpecialConditionErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/special-conditions" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={specialCondition.name}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}:{" "}
            <SpecialConditionStatusBadge
              isActive={specialCondition.is_active}
            />
          </div>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <SpecialConditionForm
            key={specialCondition.id}
            defaultValues={{
              name: specialCondition.name,
              description: specialCondition.description ?? "",
            }}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
