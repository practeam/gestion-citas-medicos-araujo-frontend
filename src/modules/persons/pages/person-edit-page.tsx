import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PersonForm } from "../components/person-form";
import { PersonStatusBadge } from "../components/person-status-badge";
import { usePerson } from "../hooks/use-person";
import type { PersonFormValues } from "../schemas/person-schema";
import { personApi } from "../services/person-api";
import { getPersonErrorMessage } from "../utils/person-error.utils";
import {
  getPersonFullName,
  toFormValues,
  toUpdatePayload,
} from "../utils/person-payload.utils";

export default function PersonEditPage() {
  const t = useTranslations("persons");
  const tErrors = useTranslations("persons.errors");
  const navigate = useNavigate();
  const { personId } = useParams();
  const { person, error, isInvalidId, isLoading } = usePerson(Number(personId));
  const [noChanges, setNoChanges] = useState(false);

  const handleSubmit = async (values: PersonFormValues) => {
    if (!person) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, person);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    await personApi.update(person.id, payload);
    void navigate("/persons", { state: { notice: "updated" } });
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
      ) : isInvalidId || error || !person ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getPersonErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/persons" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={getPersonFullName(person)}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}:{" "}
            <PersonStatusBadge isActive={person.is_active} />
          </div>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <PersonForm
            key={person.id}
            defaultValues={toFormValues(person)}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
