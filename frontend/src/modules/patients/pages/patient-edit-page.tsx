import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { GuardiansSection } from "@/modules/guardians";
import { getPersonFullName } from "@/modules/persons";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PatientConditionsEditor } from "../components/patient-conditions-editor";
import { PatientEditForm } from "../components/patient-edit-form";
import { PatientStatusBadge } from "../components/patient-status-badge";
import { usePatient } from "../hooks/use-patient";
import { usePatientSpecialConditions } from "../hooks/use-patient-special-conditions";
import type { PatientFormValues } from "../schemas/patient-schema";
import { patientApi } from "../services/patient-api";
import type { Patient } from "../types/patient.types";
import type {
  ConditionOperationResult,
  SelectedCondition,
} from "../types/patient-special-condition.types";
import {
  buildConditionOperations,
  runConditionOperations,
} from "../utils/patient-condition-operations";
import { getPatientErrorMessage } from "../utils/patient-error.utils";
import { toFormValues, toUpdatePayload } from "../utils/patient-payload.utils";

export default function PatientEditPage() {
  const t = useTranslations("patients");
  const tErrors = useTranslations("patients.errors");
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { patient, error, isInvalidId, isLoading } = usePatient(
    Number(patientId),
  );
  const {
    assignments,
    error: conditionsError,
    isLoading: conditionsLoading,
    reload,
  } = usePatientSpecialConditions(Number(patientId));

  const [noChanges, setNoChanges] = useState(false);
  // Paciente tal como lo confirmó el backend tras un PATCH: evita repetirlo en un reintento.
  const [savedPatient, setSavedPatient] = useState<Patient | null>(null);
  const [toAdd, setToAdd] = useState<SelectedCondition[]>([]);
  const [toRemove, setToRemove] = useState<number[]>([]);
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});
  const [results, setResults] = useState<ConditionOperationResult[] | null>(
    null,
  );

  /**
   * Guarda los datos propios del paciente (PATCH) y después sus condiciones
   * (PUT / PATCH de notas / DELETE, uno por cambio y de forma secuencial). Si
   * algo falla se conserva lo confirmado y solo quedan pendientes las
   * operaciones fallidas.
   */
  const handleSubmit = async (values: PatientFormValues) => {
    if (!patient || !assignments) return;
    setNoChanges(false);
    setResults(null);

    const payload = toUpdatePayload(values, savedPatient ?? patient);
    const operations = buildConditionOperations({
      assignments,
      toAdd,
      toRemove,
      notesDraft,
    });

    if (Object.keys(payload).length === 0 && operations.length === 0) {
      setNoChanges(true);
      return;
    }

    if (Object.keys(payload).length > 0) {
      // Si falla, PatientEditForm muestra el error y no se ejecuta ninguna operación de condiciones.
      setSavedPatient(await patientApi.update(patient.id, payload));
    }

    const operationResults = await runConditionOperations(
      patient.id,
      operations,
    );
    if (operationResults.every((result) => !result.error)) {
      void navigate("/patients", { state: { notice: "updated" } });
      return;
    }

    // Quedan pendientes solo las operaciones fallidas, con las notas escritas.
    const pending = operationResults.filter((result) => result.error);
    setToAdd(
      pending
        .filter((result) => result.operation.kind === "assign")
        .map(({ operation }) => ({
          condition: operation.condition,
          notes: operation.notes ?? "",
        })),
    );
    setToRemove(
      pending
        .filter((result) => result.operation.kind === "remove")
        .map(({ operation }) => operation.condition.id),
    );
    setNotesDraft(
      Object.fromEntries(
        pending
          .filter((result) => result.operation.kind === "updateNotes")
          .map(({ operation }) => [
            operation.condition.id,
            operation.notes ?? "",
          ]),
      ),
    );
    setResults(operationResults);
    reload();
  };

  const patientDataSaved =
    savedPatient !== null && results?.some((result) => result.error);

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
      ) : isInvalidId || error || !patient ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getPatientErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/patients" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={getPersonFullName(patient.person)}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              {t("columns.status")}:{" "}
              <PatientStatusBadge isActive={patient.is_active} />
            </span>
            <Link
              to={`/persons/${patient.person_id}/edit`}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              {t("form.editPersonLink")}
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("form.personDataHint")}
          </p>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          {patientDataSaved && (
            <Alert variant="success">
              <AlertDescription>
                {t("conditions.patientDataSaved")}
              </AlertDescription>
            </Alert>
          )}
          <PatientEditForm
            key={patient.id}
            defaultValues={toFormValues(patient)}
            onSubmit={handleSubmit}
          >
            <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("conditions.title")}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("conditions.editHint")}
                </p>
              </div>
              <PatientConditionsEditor
                assignments={assignments}
                error={conditionsError}
                isLoading={conditionsLoading}
                onReload={reload}
                toAdd={toAdd}
                onToAddChange={setToAdd}
                toRemove={toRemove}
                onToRemoveChange={setToRemove}
                notesDraft={notesDraft}
                onNotesDraftChange={setNotesDraft}
                results={results}
                disabled={false}
              />
            </section>
          </PatientEditForm>
          <GuardiansSection patientId={patient.id} manage />
        </ComponentCard>
      )}
    </div>
  );
}
