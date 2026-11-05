import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
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
import type { Role } from "@/modules/roles";
import type { Specialty } from "@/modules/specialties";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { StaffMemberFields } from "../components/staff-member-fields";
import { StaffRolePicker } from "../components/staff-role-picker";
import { StaffSchedulesDrafts } from "../components/staff-schedules-drafts";
import { StaffSpecialtyPicker } from "../components/staff-specialty-picker";
import {
  EMPTY_STAFF_MEMBER_FORM_VALUES,
  staffMemberCreateSchema,
  type StaffMemberFormValues,
} from "../schemas/staff-member-schema";
import { staffMemberApi } from "../services/staff-member-api";
import type { StaffMember } from "../types/staff-member.types";
import type { RoleOperationResult } from "../types/staff-role.types";
import type {
  ScheduleDraft,
  ScheduleOperationResult,
} from "../types/staff-schedule.types";
import type { SpecialtyOperationResult } from "../types/staff-specialty.types";
import { getStaffMemberErrorMessage } from "../utils/staff-member-error.utils";
import { toCreatePayload } from "../utils/staff-member-payload.utils";
import {
  getRoleOperationErrorMessage,
  isDuplicateAssignment,
  runRoleOperations,
} from "../utils/staff-role-operations";
import {
  findOverlappingKeys,
  getScheduleOperationErrorMessage,
  normalizeTime,
  runScheduleOperations,
  validateSchedule,
} from "../utils/staff-schedule.utils";
import {
  getSpecialtyOperationErrorMessage,
  runSpecialtyOperations,
} from "../utils/staff-specialty-operations";

type PersonMode = "existing" | "new";

/**
 * Resultado de las relaciones tras crear el personal. Roles y especialidades se
 * identifican por separado.
 */
interface RelationsOutcome {
  roles: { assigned: Role[]; failed: RoleOperationResult[] };
  specialties: { assigned: Specialty[]; failed: SpecialtyOperationResult[] };
  schedules: {
    created: ScheduleDraft[];
    failed: { draft: ScheduleDraft; result: ScheduleOperationResult }[];
  };
}

const EMPTY_OUTCOME: RelationsOutcome = {
  roles: { assigned: [], failed: [] },
  specialties: { assigned: [], failed: [] },
  schedules: { created: [], failed: [] },
};

export default function StaffMemberCreatePage() {
  const t = useTranslations("staff");
  const tErrors = useTranslations("staff.errors");
  const tRoleErrors = useTranslations("staff.roles.errors");
  const tSpecialtyErrors = useTranslations("staff.specialties.errors");
  const tScheduleErrors = useTranslations("staff.schedules.errors");
  const navigate = useNavigate();

  const [mode, setMode] = useState<PersonMode>("existing");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>(
    [],
  );
  const [scheduleDrafts, setScheduleDrafts] = useState<ScheduleDraft[]>([]);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  // Persona ya registrada en este flujo cuyo registro de personal quedó pendiente (fallo parcial).
  const [pendingPerson, setPendingPerson] = useState<Person | null>(null);
  // Registro de personal ya creado en este flujo: no debe volver a crearse.
  const [createdStaff, setCreatedStaff] = useState<StaffMember | null>(null);
  const [outcome, setOutcome] = useState<RelationsOutcome | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<StaffMemberFormValues>({
    resolver: zodResolver(staffMemberCreateSchema),
    defaultValues: EMPTY_STAFF_MEMBER_FORM_VALUES,
    mode: "onTouched",
  });

  const finish = () =>
    void navigate("/staff", { state: { notice: "created" } });

  /** Validación preventiva de los intervalos; el backend decide definitivamente. */
  const validateDrafts = () => {
    const errors: Record<string, string> = {};
    for (const draft of scheduleDrafts) {
      const key = validateSchedule(draft.values);
      if (key) errors[draft.key] = key;
    }
    const overlapping = findOverlappingKeys(
      scheduleDrafts.map((draft) => ({
        key: draft.key,
        values: draft.values,
        isActive: true,
      })),
    );
    for (const key of overlapping) errors[key] ??= "overlap";
    setDraftErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Asigna roles y especialidades y registra los horarios indicados (una
   * solicitud por cada uno, de forma secuencial) sin repetir los ya resueltos.
   * Si no hay nada que asignar o todo se resuelve, termina el flujo; si no,
   * deja el detalle de lo hecho y lo fallido, por separado, para reintentar
   * solo lo pendiente.
   */
  const assignRelations = async (
    staffMemberId: number,
    pending: {
      roles: Role[];
      specialties: Specialty[];
      schedules: ScheduleDraft[];
    },
    alreadyDone: RelationsOutcome,
  ) => {
    if (
      pending.roles.length === 0 &&
      pending.specialties.length === 0 &&
      pending.schedules.length === 0
    ) {
      finish();
      return;
    }
    const roleResults = await runRoleOperations(
      staffMemberId,
      pending.roles.map((role) => ({ kind: "assign", role })),
    );
    const specialtyResults = await runSpecialtyOperations(
      staffMemberId,
      pending.specialties.map((specialty) => ({ kind: "assign", specialty })),
    );
    const scheduleResults = await runScheduleOperations(
      staffMemberId,
      pending.schedules.map((draft) => ({
        kind: "create",
        draftKey: draft.key,
        values: draft.values,
        summary: {
          day_of_week: draft.values.day_of_week,
          starts_at: draft.values.starts_at,
          ends_at: draft.values.ends_at,
        },
      })),
    );

    // Un 409 al asignar un rol indica que ya está asignado: queda resuelto.
    const roleOk = roleResults
      .filter((result) => !result.error || isDuplicateAssignment(result))
      .map((result) => result.operation.role);
    const roleFailed = roleResults.filter(
      (result) => result.error && !isDuplicateAssignment(result),
    );
    const specialtyOk = specialtyResults
      .filter((result) => !result.error)
      .map((result) => result.operation.specialty);
    const specialtyFailed = specialtyResults.filter((result) => result.error);
    const scheduleFailed = scheduleResults
      .filter((result) => result.error)
      .map((result) => ({
        draft: pending.schedules.find(
          (draft) => draft.key === result.operation.draftKey,
        )!,
        result,
      }));
    const failedKeys = new Set(scheduleFailed.map(({ draft }) => draft.key));

    if (
      roleFailed.length === 0 &&
      specialtyFailed.length === 0 &&
      scheduleFailed.length === 0
    ) {
      finish();
      return;
    }
    setOutcome({
      roles: {
        assigned: [...alreadyDone.roles.assigned, ...roleOk],
        failed: roleFailed,
      },
      specialties: {
        assigned: [...alreadyDone.specialties.assigned, ...specialtyOk],
        failed: specialtyFailed,
      },
      schedules: {
        created: [
          ...alreadyDone.schedules.created,
          ...pending.schedules.filter((draft) => !failedKeys.has(draft.key)),
        ],
        failed: scheduleFailed,
      },
    });
  };

  /**
   * Segunda operación del flujo: POST /staff con el `person_id` y, si tiene
   * éxito, las asignaciones de roles y especialidades. Los errores se muestran
   * aquí (nunca se relanzan) para no confundirlos con los de la persona.
   */
  const createStaffMember = async (
    personId: number,
    values: StaffMemberFormValues,
  ) => {
    if (isSaving) return;
    if (!validateDrafts()) return;
    setIsSaving(true);
    setSubmitError(null);
    try {
      let created: StaffMember;
      try {
        created = await staffMemberApi.create(
          toCreatePayload(personId, values),
        );
      } catch (error) {
        const fieldErrors =
          isApiError(error) && error.status === 422
            ? getFieldErrors(error.details)
            : {};
        const mapped = (
          ["employee_number", "hire_date", "email", "password"] as const
        ).filter((field) => fieldErrors[field]);
        if (mapped.length > 0) {
          for (const field of mapped) {
            setError(field, { type: "server", message: fieldErrors[field] });
          }
        } else {
          setSubmitError(getStaffMemberErrorMessage(error, tErrors));
        }
        return;
      }
      setCreatedStaff(created);
      await assignRelations(
        created.id,
        {
          roles: selectedRoles,
          specialties: selectedSpecialties,
          schedules: scheduleDrafts,
        },
        EMPTY_OUTCOME,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const submitExisting = handleSubmit((values) =>
    selectedPerson ? createStaffMember(selectedPerson.id, values) : undefined,
  );

  const retryPending = handleSubmit((values) =>
    pendingPerson ? createStaffMember(pendingPerson.id, values) : undefined,
  );

  /** Reintenta únicamente lo fallido de cada relación del personal ya creado. */
  const retryRelations = async () => {
    if (!createdStaff || !outcome || isSaving) return;
    setIsSaving(true);
    try {
      await assignRelations(
        createdStaff.id,
        {
          roles: outcome.roles.failed.map((result) => result.operation.role),
          specialties: outcome.specialties.failed.map(
            (result) => result.operation.specialty,
          ),
          schedules: outcome.schedules.failed.map(({ draft }) => draft),
        },
        {
          roles: { assigned: outcome.roles.assigned, failed: [] },
          specialties: { assigned: outcome.specialties.assigned, failed: [] },
          schedules: { created: outcome.schedules.created, failed: [] },
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  /** Persona nueva: primero POST /persons y, solo si tiene éxito, el registro de personal. */
  const submitNewPerson = async (personValues: PersonFormValues) => {
    if (isSaving) return;
    // Se validan los campos propios del personal antes de crear la persona para evitar fallos evitables.
    if (!(await trigger())) return;
    if (!validateDrafts()) return;
    const staffMemberValues = getValues();
    // Si falla, PersonForm muestra el error de la persona y no se crea el registro de personal.
    const person = await personApi.create(toCreatePersonPayload(personValues));
    setPendingPerson(person);
    await createStaffMember(person.id, staffMemberValues);
  };

  const staffMemberSection = (
    <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("create.staffMemberSection")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("create.staffMemberSectionHint")}
        </p>
      </div>
      <StaffMemberFields mode="create" register={register} errors={errors} />
    </section>
  );

  const rolesSection = (
    <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("create.rolesSection")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("create.rolesSectionHint")}
        </p>
      </div>
      <StaffRolePicker
        selected={selectedRoles}
        onChange={setSelectedRoles}
        disabled={isSaving}
      />
    </section>
  );

  const specialtiesSection = (
    <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("create.specialtiesSection")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("create.specialtiesSectionHint")}
        </p>
      </div>
      <StaffSpecialtyPicker
        selected={selectedSpecialties}
        onChange={setSelectedSpecialties}
        disabled={isSaving}
      />
    </section>
  );

  const schedulesSection = (
    <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("create.schedulesSection")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("create.schedulesSectionHint")}
        </p>
      </div>
      <StaffSchedulesDrafts
        drafts={scheduleDrafts}
        onChange={setScheduleDrafts}
        errors={draftErrors}
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
      disabled={isSaving}
      nativeButton={false}
      render={<Link to="/staff" />}
    >
      {t("form.cancel")}
    </Button>
  );

  const scheduleSummary = (draft: ScheduleDraft) =>
    `${t(`schedules.days.${draft.values.day_of_week}`)} ${normalizeTime(draft.values.starts_at)}–${normalizeTime(draft.values.ends_at)}`;

  /** Lista de nombres asignados o pendientes de una relación. */
  const names = (items: { id: number; name: string }[]) => (
    <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/3">
        {createdStaff ? (
          <div className="space-y-6">
            {!outcome ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Spinner />
                {t("create.assigningRelations")}
              </div>
            ) : (
              <>
                <Alert variant="warning">
                  <AlertTitle>{t("create.relationsPartialTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("create.relationsPartialDescription", {
                      name: getPersonFullName(createdStaff.person),
                    })}
                  </AlertDescription>
                </Alert>

                {(outcome.roles.assigned.length > 0 ||
                  outcome.roles.failed.length > 0) && (
                  <section className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {t("create.rolesResultTitle")}
                    </h4>
                    {outcome.roles.assigned.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("create.assignedLabel")}
                        </p>
                        {names(outcome.roles.assigned)}
                      </div>
                    )}
                    {outcome.roles.failed.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("create.pendingLabel")}
                        </p>
                        <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                          {outcome.roles.failed.map((result) => (
                            <li key={result.operation.role.id}>
                              <strong>{result.operation.role.name}</strong>:{" "}
                              {getRoleOperationErrorMessage(
                                result.error,
                                "assign",
                                tRoleErrors,
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {(outcome.specialties.assigned.length > 0 ||
                  outcome.specialties.failed.length > 0) && (
                  <section className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {t("create.specialtiesResultTitle")}
                    </h4>
                    {outcome.specialties.assigned.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("create.assignedLabel")}
                        </p>
                        {names(outcome.specialties.assigned)}
                      </div>
                    )}
                    {outcome.specialties.failed.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("create.pendingLabel")}
                        </p>
                        <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                          {outcome.specialties.failed.map((result) => (
                            <li key={result.operation.specialty.id}>
                              <strong>{result.operation.specialty.name}</strong>
                              :{" "}
                              {getSpecialtyOperationErrorMessage(
                                result.error,
                                "assign",
                                tSpecialtyErrors,
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {(outcome.schedules.created.length > 0 ||
                  outcome.schedules.failed.length > 0) && (
                  <section className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {t("create.schedulesResultTitle")}
                    </h4>
                    {outcome.schedules.created.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("create.registeredLabel")}
                        </p>
                        <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                          {outcome.schedules.created.map((draft) => (
                            <li key={draft.key}>{scheduleSummary(draft)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {outcome.schedules.failed.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("create.pendingLabel")}
                        </p>
                        <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                          {outcome.schedules.failed.map(({ draft, result }) => (
                            <li key={draft.key}>
                              <strong>{scheduleSummary(draft)}</strong>:{" "}
                              {getScheduleOperationErrorMessage(
                                result.error,
                                "create",
                                tScheduleErrors,
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    nativeButton={false}
                    render={<Link to="/staff" />}
                  >
                    {t("create.goToList")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    nativeButton={false}
                    render={<Link to={`/staff/${createdStaff.id}/edit`} />}
                  >
                    {t("create.editStaffMember")}
                  </Button>
                  <Button
                    disabled={isSaving}
                    onClick={() => void retryRelations()}
                  >
                    {isSaving && <Spinner />}
                    {isSaving ? t("form.saving") : t("create.relationsRetry")}
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
            {staffMemberSection}
            {rolesSection}
            {specialtiesSection}
            {schedulesSection}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {cancelButton}
              <Button disabled={isSaving} onClick={() => void retryPending()}>
                {isSaving && <Spinner />}
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
                  variant={mode === "existing" ? "default" : "outline"}
                  aria-pressed={mode === "existing"}
                  disabled={isSaving}
                  onClick={() => setMode("existing")}
                >
                  {t("create.modeExisting")}
                </Button>
                <Button
                  type="button"
                  variant={mode === "new" ? "default" : "outline"}
                  aria-pressed={mode === "new"}
                  disabled={isSaving}
                  onClick={() => setMode("new")}
                >
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
                {staffMemberSection}
                {rolesSection}
                {specialtiesSection}
                {schedulesSection}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {cancelButton}
                  <Button
                    disabled={!selectedPerson || isSaving}
                    onClick={() => void submitExisting()}
                  >
                    {isSaving && <Spinner />}
                    {isSaving ? t("form.saving") : t("create.save")}
                  </Button>
                </div>
              </div>
            ) : (
              <PersonForm
                defaultValues={EMPTY_PERSON_FORM_VALUES}
                submitLabel={t("create.saveNew")}
                onSubmit={submitNewPerson}
                onCancel={() => void navigate("/staff")}
              >
                {staffMemberSection}
                {rolesSection}
                {specialtiesSection}
                {schedulesSection}
              </PersonForm>
            )}
          </>
        )}
      </div>
    </div>
  );
}
