import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import {
  ArrowLeftIcon,
  FloppyDiscIcon,
  PencilIcon,
  PlusIcon,
  RegenerateIcon,
  UserIcon,
  XIcon,
} from "@/icons";
import { useAuth } from "@/modules/auth";
import {
  GuardiansPicker,
  getGuardianErrorMessage,
  runGuardianAssociations,
  type GuardianAssociationResult,
  type StagedGuardian,
} from "@/modules/guardians";
import {
  EMPTY_PERSON_FORM_VALUES,
  PersonForm,
  PersonSelector,
  getPersonDocument,
  getPersonFullName,
  personApi,
  toCreatePayload as toCreatePersonPayload,
  type Person,
  type PersonFormValues,
} from "@/modules/persons";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { PatientConditionPicker } from "../components/patient-condition-picker";
import { PatientFields } from "../components/patient-fields";
import {
  EMPTY_PATIENT_FORM_VALUES,
  patientFormSchema,
  type PatientFormValues,
} from "../schemas/patient-schema";
import { patientApi } from "../services/patient-api";
import type { Patient } from "../types/patient.types";
import type {
  ConditionOperationResult,
  SelectedCondition,
} from "../types/patient-special-condition.types";
import {
  getConditionOperationErrorMessage,
  runConditionOperations,
  toAssignOperations,
} from "../utils/patient-condition-operations";
import { getPatientErrorMessage } from "../utils/patient-error.utils";
import { toCreatePayload } from "../utils/patient-payload.utils";

type PersonMode = "existing" | "new";

/** Resultado de las asociaciones tras crear el paciente. */
interface ConditionOutcome {
  assigned: SelectedCondition[];
  failed: ConditionOperationResult[];
}

/** Resultado de asociar apoderados tras crear el paciente. */
interface GuardianOutcome {
  associated: StagedGuardian[];
  failed: GuardianAssociationResult[];
}

export default function PatientCreatePage() {
  const t = useTranslations("patients");
  const tErrors = useTranslations("patients.errors");
  const tConditionErrors = useTranslations("patients.conditions.errors");
  const tGuardians = useTranslations("guardians");
  const tGuardianErrors = useTranslations("guardians.errors");
  const { can } = useAuth();
  const canAssociateGuardians = can("patient_guardian.create");
  const navigate = useNavigate();

  const [mode, setMode] = useState<PersonMode>("existing");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  // Persona ya registrada en este flujo cuyo paciente quedó pendiente (fallo parcial).
  const [pendingPerson, setPendingPerson] = useState<Person | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<
    SelectedCondition[]
  >([]);
  // Apoderados elegidos (personas ya registradas); se asocian tras crear el paciente.
  const [guardians, setGuardians] = useState<StagedGuardian[]>([]);
  const [guardianOutcome, setGuardianOutcome] =
    useState<GuardianOutcome | null>(null);
  // Paciente ya creado en este flujo: no debe volver a crearse.
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [conditionOutcome, setConditionOutcome] =
    useState<ConditionOutcome | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: EMPTY_PATIENT_FORM_VALUES,
    mode: "onTouched",
  });

  const finish = () =>
    void navigate("/patients", { state: { notice: "created" } });

  /**
   * Asocia las condiciones (un PUT por condición) y los apoderados (un POST por
   * apoderado), de forma secuencial y sin repetir lo ya resuelto. Si todo se
   * resuelve termina el flujo; si no, deja el detalle de lo asociado y lo
   * fallido para reintentar solo lo pendiente. El paciente nunca se vuelve a
   * crear y las personas ya registradas no se duplican.
   */
  const associate = async (
    patientId: number,
    conditions: SelectedCondition[],
    conditionsDone: SelectedCondition[],
    staged: StagedGuardian[],
    guardiansDone: StagedGuardian[],
  ) => {
    if (conditions.length === 0 && staged.length === 0) {
      finish();
      return;
    }
    const conditionResults =
      conditions.length > 0
        ? await runConditionOperations(
            patientId,
            toAssignOperations(conditions),
          )
        : [];
    const guardianResults =
      staged.length > 0 ? await runGuardianAssociations(patientId, staged) : [];

    const conditionsFailed = conditionResults.filter((result) => result.error);
    const guardiansFailed = guardianResults.filter((result) => result.error);
    if (conditionsFailed.length === 0 && guardiansFailed.length === 0) {
      finish();
      return;
    }
    const conditionsSucceeded = conditions.filter(({ condition }) =>
      conditionResults.some(
        (result) =>
          !result.error && result.operation.condition.id === condition.id,
      ),
    );
    setConditionOutcome({
      assigned: [...conditionsDone, ...conditionsSucceeded],
      failed: conditionsFailed,
    });
    setGuardianOutcome({
      associated: [
        ...guardiansDone,
        ...guardianResults
          .filter((result) => !result.error)
          .map((result) => result.guardian),
      ],
      failed: guardiansFailed,
    });
  };

  /**
   * Segunda operación del flujo: POST /patients con el `person_id` y, si tiene
   * éxito, las asociaciones de condiciones. Los errores se muestran aquí (nunca
   * se relanzan) para no confundirlos con los de la persona.
   */
  const createPatient = async (personId: number, values: PatientFormValues) => {
    if (isSaving) return;
    setIsSaving(true);
    setSubmitError(null);
    try {
      let created: Patient;
      try {
        created = await patientApi.create(toCreatePayload(personId, values));
      } catch (error) {
        const fieldErrors =
          isApiError(error) && error.status === 422
            ? getFieldErrors(error.details)
            : {};
        const mapped = (["patient_number", "notes"] as const).filter(
          (field) => fieldErrors[field],
        );
        if (mapped.length > 0) {
          for (const field of mapped) {
            setError(field, { type: "server", message: fieldErrors[field] });
          }
        } else {
          setSubmitError(getPatientErrorMessage(error, tErrors));
        }
        return;
      }
      setCreatedPatient(created);
      await associate(created.id, selectedConditions, [], guardians, []);
    } finally {
      setIsSaving(false);
    }
  };

  /** Reintenta únicamente las asociaciones fallidas del paciente ya creado. */
  const retryAssociations = async () => {
    if (!createdPatient || !conditionOutcome || isSaving) return;
    setIsSaving(true);
    try {
      await associate(
        createdPatient.id,
        conditionOutcome.failed.map(({ operation }) => ({
          condition: operation.condition,
          notes: operation.notes ?? "",
        })),
        conditionOutcome.assigned,
        (guardianOutcome?.failed ?? []).map(({ guardian }) => guardian),
        guardianOutcome?.associated ?? [],
      );
    } finally {
      setIsSaving(false);
    }
  };

  const submitExisting = handleSubmit((values) =>
    selectedPerson ? createPatient(selectedPerson.id, values) : undefined,
  );

  const retryPending = handleSubmit((values) =>
    pendingPerson ? createPatient(pendingPerson.id, values) : undefined,
  );

  /** Persona nueva: primero POST /persons y, solo si tiene éxito, el paciente. */
  const submitNewPerson = async (personValues: PersonFormValues) => {
    if (isSaving) return;
    // Se validan los campos del paciente antes de crear la persona para evitar fallos evitables.
    if (!(await trigger())) return;
    const patientValues = getValues();
    // Si falla, PersonForm muestra el error de la persona y no se crea el paciente.
    const person = await personApi.create(toCreatePersonPayload(personValues));
    setPendingPerson(person);
    await createPatient(person.id, patientValues);
  };

  const patientSection = (
    <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("create.patientSection")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("create.patientSectionHint")}
        </p>
      </div>
      <PatientFields register={register} errors={errors} />
    </section>
  );

  const conditionsSection = (
    <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("create.conditionsSection")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("create.conditionsSectionHint")}
        </p>
      </div>
      <PatientConditionPicker
        selected={selectedConditions}
        onChange={setSelectedConditions}
        disabled={isSaving}
      />
    </section>
  );

  const guardiansSection = !canAssociateGuardians ? (
    <section className="space-y-2 border-t border-gray-100 pt-6 dark:border-gray-800">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
        {tGuardians("create.section")}
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tGuardians("create.noPermission")}
      </p>
    </section>
  ) : (
    <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {tGuardians("create.section")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tGuardians("create.sectionHint")}
        </p>
      </div>
      <GuardiansPicker
        value={guardians}
        onChange={setGuardians}
        disabled={isSaving}
      />
    </section>
  );

  const errorAlert = submitError && (
    <Alert variant="destructive">
      <AlertDescription>{submitError}</AlertDescription>
    </Alert>
  );

  const cancelButton = (
    <Button
      variant="outline"
      size="sm"
      disabled={isSaving}
      nativeButton={false}
      render={<Link to="/patients" />}
    >
      <XIcon className="fill-current" />
      {t("form.cancel")}
    </Button>
  );

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/3">
        {createdPatient ? (
          <div className="space-y-6">
            {!conditionOutcome ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Spinner />
                {t("conditions.assigning")}
              </div>
            ) : (
              <>
                {conditionOutcome.failed.length > 0 && (
                  <Alert variant="warning">
                    <AlertTitle>
                      {t("create.conditionsPartialTitle")}
                    </AlertTitle>
                    <AlertDescription>
                      {t("create.conditionsPartialDescription", {
                        name: getPersonFullName(createdPatient.person),
                      })}
                    </AlertDescription>
                  </Alert>
                )}
                {guardianOutcome && guardianOutcome.failed.length > 0 && (
                  <Alert variant="warning">
                    <AlertTitle>{tGuardians("create.partialTitle")}</AlertTitle>
                    <AlertDescription>
                      {tGuardians("create.partialDescription", {
                        name: getPersonFullName(createdPatient.person),
                      })}
                    </AlertDescription>
                  </Alert>
                )}
                {conditionOutcome.assigned.length > 0 && (
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {t("create.conditionsAssigned")}
                    </h4>
                    <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                      {conditionOutcome.assigned.map(({ condition }) => (
                        <li key={condition.id}>{condition.name}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {guardianOutcome && guardianOutcome.associated.length > 0 && (
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {tGuardians("create.associated")}
                    </h4>
                    <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                      {guardianOutcome.associated.map(({ person }) => (
                        <li key={person.id}>{getPersonFullName(person)}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {guardianOutcome && guardianOutcome.failed.length > 0 && (
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {tGuardians("create.failed")}
                    </h4>
                    <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                      {guardianOutcome.failed.map((result) => (
                        <li key={result.guardian.person.id}>
                          <strong>
                            {getPersonFullName(result.guardian.person)}
                          </strong>
                          :{" "}
                          {getGuardianErrorMessage(
                            result.error,
                            tGuardianErrors,
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <section
                  className="space-y-2"
                  hidden={conditionOutcome.failed.length === 0}
                >
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {t("create.conditionsFailed")}
                  </h4>
                  <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                    {conditionOutcome.failed.map((result) => (
                      <li key={result.operation.condition.id}>
                        <strong>{result.operation.condition.name}</strong>:{" "}
                        {getConditionOperationErrorMessage(
                          result.error,
                          "assign",
                          tConditionErrors,
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    nativeButton={false}
                    render={<Link to="/patients" />}
                  >
                    <ArrowLeftIcon className="fill-current rtl:rotate-180" />
                    {t("create.goToList")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    nativeButton={false}
                    render={<Link to={`/patients/${createdPatient.id}/edit`} />}
                  >
                    <PencilIcon className="fill-current" />
                    {t("create.editPatient")}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isSaving}
                    onClick={() => void retryAssociations()}
                  >
                    {isSaving ? (
                      <Spinner />
                    ) : (
                      <RegenerateIcon className="fill-current" />
                    )}
                    {isSaving
                      ? t("form.saving")
                      : tGuardians("create.retryPending")}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : pendingPerson ? (
          <div className="space-y-6">
            <Alert variant="warning">
              <AlertTitle>{t("create.partialTitle")}</AlertTitle>
              <AlertDescription>
                {t("create.partialDescription", {
                  name: getPersonFullName(pendingPerson),
                })}
              </AlertDescription>
            </Alert>
            {errorAlert}
            {patientSection}
            {conditionsSection}
            {guardiansSection}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {cancelButton}
              <Button
                size="sm"
                disabled={isSaving}
                onClick={() => void retryPending()}
              >
                {isSaving ? (
                  <Spinner />
                ) : (
                  <RegenerateIcon className="fill-current" />
                )}
                {isSaving ? t("form.saving") : t("create.retry")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("create.personSection")}
              </h4>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "existing" ? "default" : "outline"}
                  aria-pressed={mode === "existing"}
                  disabled={isSaving}
                  onClick={() => setMode("existing")}
                >
                  <UserIcon className="fill-current" />
                  {t("create.modeExisting")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "new" ? "default" : "outline"}
                  aria-pressed={mode === "new"}
                  disabled={isSaving}
                  onClick={() => setMode("new")}
                >
                  <PlusIcon className="fill-current" />
                  {t("create.modeNew")}
                </Button>
              </div>
            </section>

            {errorAlert}

            {mode === "existing" ? (
              <div className="space-y-6">
                <PersonSelector
                  value={selectedPerson?.id ?? null}
                  onSelect={setSelectedPerson}
                  activeOnly
                />
                {selectedPerson ? (
                  <Alert variant="success">
                    <AlertTitle>{t("create.selectedPerson")}</AlertTitle>
                    <AlertDescription>
                      {getPersonFullName(selectedPerson)}
                      {" · "}
                      {getPersonDocument(selectedPerson) ?? t("noValue")}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("create.selectPersonFirst")}
                  </p>
                )}
                {patientSection}
                {conditionsSection}
                {guardiansSection}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {cancelButton}
                  <Button
                    size="sm"
                    disabled={!selectedPerson || isSaving}
                    onClick={() => void submitExisting()}
                  >
                    {isSaving ? (
                      <Spinner />
                    ) : (
                      <FloppyDiscIcon className="fill-current" />
                    )}
                    {isSaving ? t("form.saving") : t("create.save")}
                  </Button>
                </div>
              </div>
            ) : (
              <PersonForm
                defaultValues={EMPTY_PERSON_FORM_VALUES}
                submitLabel={t("create.saveNew")}
                onSubmit={submitNewPerson}
                onCancel={() => void navigate("/patients")}
              >
                {patientSection}
                {conditionsSection}
                {guardiansSection}
              </PersonForm>
            )}
          </>
        )}
      </div>
    </div>
  );
}
