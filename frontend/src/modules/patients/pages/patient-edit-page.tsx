import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FloppyDiscIcon,
  XIcon,
} from "@/icons";
import { GuardiansSection } from "@/modules/guardians";
import {
  PersonForm,
  getPersonErrorMessage,
  getPersonFullName,
  personApi,
  toFormValues as toPersonFormValues,
  toUpdatePayload as toPersonUpdatePayload,
  usePerson,
  type Person,
  type PersonFormValues,
} from "@/modules/persons";
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

type EditStep = 0 | 1 | 2 | 3 | 4;

export default function PatientEditPage() {
  const t = useTranslations("patients");
  const tErrors = useTranslations("patients.errors");
  const tPersonErrors = useTranslations("persons.errors");
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { patient, error, isInvalidId, isLoading } = usePatient(
    Number(patientId),
  );
  const {
    person,
    error: personError,
    isLoading: personLoading,
  } = usePerson(patient?.person_id ?? Number.NaN);
  const {
    assignments,
    error: conditionsError,
    isLoading: conditionsLoading,
    reload,
  } = usePatientSpecialConditions(Number(patientId));

  const [noChanges, setNoChanges] = useState(false);
  const [step, setStep] = useState<EditStep>(0);
  const [savedPerson, setSavedPerson] = useState<Person | null>(null);
  const [guardiansChanged, setGuardiansChanged] = useState(false);
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
      if (savedPerson || guardiansChanged) {
        void navigate("/patients", { state: { notice: "updated" } });
        return;
      }
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

  const handlePersonSubmit = async (values: PersonFormValues) => {
    if (!person) return;
    const currentPerson = savedPerson ?? person;
    const payload = toPersonUpdatePayload(values, currentPerson);
    if (Object.keys(payload).length > 0) {
      setSavedPerson(await personApi.update(currentPerson.id, payload));
    }
    setStep(1);
  };

  const steps = [
    t("create.steps.basic"),
    t("create.steps.patient"),
    t("create.steps.conditions"),
    t("create.steps.guardians"),
    t("create.steps.confirm"),
  ];
  const currentPerson = savedPerson ?? person;

  return (
    <div>
      <PageMeta
        title={t("form.editTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.editTitle")} />

      {isLoading || (patient !== undefined && personLoading) ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || personError || !patient || !person ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : personError
                  ? getPersonErrorMessage(personError, tPersonErrors)
                  : getPatientErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/patients" />}
          >
            <ArrowLeftIcon className="fill-current rtl:rotate-180" />
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white/90">
                {getPersonFullName(savedPerson ?? person)}
              </p>
              <span className="mt-1 flex items-center gap-2">
                {t("columns.status")}:{" "}
                <PatientStatusBadge isActive={patient.is_active} />
              </span>
            </div>
          </div>
          <ol
            className="grid grid-cols-2 gap-2 sm:grid-cols-5"
            aria-label={t("create.steps.label")}
          >
            {steps.map((label, index) => {
              const isCurrent = index === step;
              const isComplete = index < step;
              return (
                <li key={label}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                      isCurrent
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-300"
                        : isComplete
                          ? "border-green-500 bg-green-500 text-white hover:bg-green-600 dark:border-green-500 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
                          : "border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400"
                    }`}
                    aria-current={isCurrent ? "step" : undefined}
                    onClick={() => index < step && setStep(index as EditStep)}
                    disabled={index > step}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                        isComplete ? "bg-white/20 text-white" : "bg-current/10"
                      }`}
                    >
                      {isComplete ? (
                        <CheckIcon className="size-3 fill-current" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
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
          {step === 0 && currentPerson ? (
            <PersonForm
              key={currentPerson.id}
              defaultValues={toPersonFormValues(currentPerson)}
              submitLabel={t("create.next")}
              onSubmit={handlePersonSubmit}
              onInvalid={() => setStep(0)}
              actions={(isSubmitting) => (
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    nativeButton={false}
                    render={<Link to="/patients" />}
                  >
                    <XIcon className="fill-current" />
                    {t("form.cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : null}
                    {t("create.next")}
                    {!isSubmitting && (
                      <ChevronRightIcon className="fill-current rtl:rotate-180" />
                    )}
                  </Button>
                </div>
              )}
            />
          ) : (
            <PatientEditForm
              key={patient.id}
              defaultValues={toFormValues(patient)}
              onSubmit={handleSubmit}
              fieldsHidden={step !== 1}
              onInvalid={() => setStep(1)}
              submitEnabled={step === 4}
              actions={(isSubmitting) => (
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() =>
                        setStep((current) => (current - 1) as EditStep)
                      }
                    >
                      <ChevronLeftIcon className="fill-current rtl:rotate-180" />
                      {t("create.previous")}
                    </Button>
                  </div>
                  {step < 4 ? (
                    <Button
                      key={`next-${step}`}
                      type="button"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={(event) => {
                        event.preventDefault();
                        setStep((current) => (current + 1) as EditStep);
                      }}
                    >
                      {t("create.next")}
                      <ChevronRightIcon className="fill-current rtl:rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      key="save"
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Spinner />
                      ) : (
                        <FloppyDiscIcon className="fill-current" />
                      )}
                      {isSubmitting ? t("form.saving") : t("form.save")}
                    </Button>
                  )}
                </div>
              )}
            >
              <section hidden={step !== 2}>
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
                  showHeadings={false}
                />
              </section>
              <div hidden={step !== 3}>
                <GuardiansSection
                  patientId={patient.id}
                  manage
                  showHeading={false}
                  showEmptyMessage={false}
                  onChanged={() => setGuardiansChanged(true)}
                />
              </div>
              <section className="space-y-4" hidden={step !== 4}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("create.steps.basic")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      {getPersonFullName(savedPerson ?? person)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("create.steps.conditions")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      {t("create.selectedCount", {
                        count:
                          toAdd.length +
                          toRemove.length +
                          Object.keys(notesDraft).length,
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("create.steps.guardians")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      {t("create.steps.confirm")}
                    </p>
                  </div>
                </div>
              </section>
            </PatientEditForm>
          )}
        </div>
      )}
    </div>
  );
}
