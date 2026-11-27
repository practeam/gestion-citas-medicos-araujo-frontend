import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import {
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FloppyDiscIcon,
  TaskIcon,
  UsersIcon,
} from "@/icons";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAppointmentDetails } from "../hooks/use-appointment-details";
import {
  fallbackProcedureInfo,
  useProcedureInfo,
} from "../hooks/use-procedure-info";
import {
  appointmentFormSchema,
  EMPTY_APPOINTMENT_VALUES,
  type AppointmentFormValues,
} from "../schemas/appointment-schema";
import { appointmentApi } from "../services/appointment-api";
import type {
  Appointment,
  AppointmentUpdateRequest,
} from "../types/appointment.types";
import {
  APP_TIMEZONE,
  fromIso,
  getOffsetLabel,
  toZonedIso,
} from "../utils/appointment-datetime.utils";
import { getAppointmentErrorMessage } from "../utils/appointment-error.utils";
import {
  addMinutes,
  createLine,
  getLineOperation,
  getReservedMinutes,
  isPriceValid,
  parseQuantity,
  toCreateDetailPayload,
  toUpdateDetailPayload,
  type AppointmentLine,
} from "../utils/appointment-lines.utils";
import { AppointmentEntitySelector } from "./appointment-entity-selector";
import { AppointmentProceduresSection } from "./appointment-procedures-section";

/** Campos de la API que se muestran junto a cada campo del formulario. */
const SERVER_FIELD_MAP: Record<string, keyof AppointmentFormValues> = {
  patient_id: "patientId",
  staff_member_id: "staffMemberId",
  starts_at: "startTime",
  ends_at: "endTime",
  reason: "reason",
};

/** Datos con los que se abre el modal. */
export type AppointmentFormTarget =
  | {
      mode: "create";
      /** Fecha / horas sugeridas al elegir un hueco en el calendario. */
      initial?: Partial<AppointmentFormValues>;
    }
  | {
      mode: "edit";
      appointment: Appointment;
      patientLabel: string;
      staffLabel: string;
    };

interface AppointmentFormModalProps {
  /** `null` mantiene el modal cerrado. */
  target: AppointmentFormTarget | null;
  onClose: () => void;
  /** Se invoca solo tras la confirmación de la API de todas las operaciones. */
  onSaved: (appointment: Appointment, mode: "create" | "edit") => void;
  /**
   * La cita se creó o modificó en el backend aunque quede alguna operación
   * pendiente (fallo parcial): el calendario debe refrescarse.
   */
  onChanged: (appointment: Appointment) => void;
}

function getDefaultValues(
  target: AppointmentFormTarget,
): AppointmentFormValues {
  if (target.mode === "create") {
    return { ...EMPTY_APPOINTMENT_VALUES, ...target.initial };
  }
  const { appointment } = target;
  const start = fromIso(appointment.starts_at);
  const end = fromIso(appointment.ends_at);
  return {
    patientId: appointment.patient_id,
    staffMemberId: appointment.staff_member_id,
    date: start?.date ?? "",
    startTime: start?.time ?? "",
    endTime: end?.time ?? "",
    reason: appointment.reason ?? "",
  };
}

/**
 * Modal de creación y de edición/reprogramación de citas, con la sección de
 * procedimientos integrada (spec 17 + 18). La disponibilidad, los
 * solapamientos y las reglas de paciente y personal activos los valida el
 * backend; si rechaza la operación el modal se mantiene abierto con los datos
 * introducidos.
 */
export function AppointmentFormModal({
  target,
  onClose,
  onSaved,
  onChanged,
}: AppointmentFormModalProps) {
  const t = useTranslations("appointments.form");
  const isEdit = target?.mode === "edit";

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        {target?.mode === "create" && (
          <AppointmentForm
            key="create"
            target={target}
            initialLines={[]}
            onClose={onClose}
            onSaved={onSaved}
            onChanged={onChanged}
          />
        )}
        {target?.mode === "edit" && (
          <EditFormLoader
            key={target.appointment.id}
            target={target}
            onClose={onClose}
            onSaved={onSaved}
            onChanged={onChanged}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Recupera los detalles existentes (y sus procedimientos) antes de permitir editar. */
function EditFormLoader({
  target,
  onClose,
  onSaved,
  onChanged,
}: Omit<AppointmentFormModalProps, "target"> & {
  target: Extract<AppointmentFormTarget, { mode: "edit" }>;
}) {
  const t = useTranslations("appointments.procedures");
  const { details, error, isLoading, reload } = useAppointmentDetails(
    target.appointment.id,
  );
  const { procedures, isLoading: isLoadingProcedures } = useProcedureInfo(
    (details ?? []).map((detail) => detail.procedure_id),
  );

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{t("loadDetailsError")}</AlertDescription>
        </Alert>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
          <Button variant="outline" onClick={reload}>
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !details || isLoadingProcedures) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loadingDetails")}
      </div>
    );
  }

  return (
    <AppointmentForm
      target={target}
      initialLines={details.map((detail) =>
        createLine(
          procedures[detail.procedure_id] ??
            fallbackProcedureInfo(detail.procedure_id),
          detail,
        ),
      )}
      onClose={onClose}
      onSaved={onSaved}
      onChanged={onChanged}
    />
  );
}

interface AppointmentFormProps {
  target: AppointmentFormTarget;
  initialLines: AppointmentLine[];
  onClose: () => void;
  onSaved: AppointmentFormModalProps["onSaved"];
  onChanged: AppointmentFormModalProps["onChanged"];
}

type AppointmentFormStep = 0 | 1 | 2 | 3;

function AppointmentForm({
  target,
  initialLines,
  onClose,
  onSaved,
  onChanged,
}: AppointmentFormProps) {
  const t = useTranslations("appointments.form");
  const tProcedures = useTranslations("appointments.procedures");
  const tValidation = useTranslations("appointments.validation");
  const tErrors = useTranslations("appointments.errors");
  const isEdit = target.mode === "edit";
  const [step, setStep] = useState<AppointmentFormStep>(0);
  const [formError, setFormError] = useState<string | null>(null);
  // Cita confirmada por la API: la existente al editar; la creada al crear (aunque falle un detalle).
  const [current, setCurrent] = useState<Appointment | null>(
    target.mode === "edit" ? target.appointment : null,
  );
  const [lines, setLines] = useState<AppointmentLine[]>(initialLines);
  const [patientLabel, setPatientLabel] = useState<string | null>(
    isEdit ? target.patientLabel : null,
  );
  const [staffLabel, setStaffLabel] = useState<string | null>(
    isEdit ? target.staffLabel : null,
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: getDefaultValues(target),
    mode: "onTouched",
  });

  const patientId = useWatch({ control, name: "patientId" });
  const staffMemberId = useWatch({ control, name: "staffMemberId" });
  const date = useWatch({ control, name: "date" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const offset = getOffsetLabel(date, startTime);
  const reservedMinutes = getReservedMinutes(startTime, endTime);

  const patientLocked = isEdit || current !== null;
  const pendingOperations = lines.filter(
    (line) => getLineOperation(line) !== "none",
  );
  // Cita creada, pero con procedimientos sin registrar (no es una transacción única).
  const createdPartially =
    !isEdit && current !== null && pendingOperations.length > 0;

  // Errores de Zod: el mensaje es una clave i18n; los del servidor ya vienen listos.
  const toFieldErrors = (error?: { message?: string; type?: string }) =>
    error?.message
      ? [
          {
            message:
              error.type === "server"
                ? error.message
                : tValidation(error.message),
          },
        ]
      : undefined;

  const adjustEnd = (requiredMinutes: number) => {
    // Solo por acción del usuario: nunca se cambia el horario automáticamente.
    const next = addMinutes(startTime, requiredMinutes);
    if (next) setValue("endTime", next, { shouldValidate: true });
    else setFormError(tProcedures("summary.adjustImpossible"));
  };

  /** Ejecuta las operaciones de detalle pendientes: retiros, cambios y altas, de una en una. */
  const syncLines = async (appointment: Appointment) => {
    const order = { delete: 0, update: 1, create: 2, none: 3 } as const;
    const operations = lines
      .map((line) => ({ line, operation: getLineOperation(line) }))
      .filter(({ operation }) => operation !== "none")
      .sort((a, b) => order[a.operation] - order[b.operation]);

    let next = lines;
    let failures = 0;
    const apply = (key: string, patch: Partial<AppointmentLine> | null) => {
      next =
        patch === null
          ? next.filter((line) => line.key !== key)
          : next.map((line) =>
              line.key === key ? { ...line, ...patch } : line,
            );
    };

    for (const { line, operation } of operations) {
      try {
        if (operation === "delete") {
          await appointmentApi.deleteDetail(appointment.id, line.saved!.id);
          apply(line.key, null);
        } else {
          const saved =
            operation === "update"
              ? await appointmentApi.updateDetail(
                  appointment.id,
                  line.saved!.id,
                  toUpdateDetailPayload(line),
                )
              : await appointmentApi.createDetail(
                  appointment.id,
                  toCreateDetailPayload(line),
                );
          // El detalle confirmado por la API pasa a ser la referencia de la línea.
          apply(line.key, {
            saved,
            quantity: String(saved.quantity),
            unitPrice: saved.unit_price,
            notes: saved.notes ?? "",
            error: null,
          });
        }
      } catch (error) {
        failures += 1;
        apply(line.key, { error: getAppointmentErrorMessage(error, tErrors) });
      }
    }
    setLines(next);
    return failures;
  };

  const send = async (values: AppointmentFormValues) => {
    setFormError(null);

    const invalid = lines.filter(
      (line) =>
        !line.removed &&
        (parseQuantity(line.quantity) === null || !isPriceValid(line)),
    );
    if (invalid.length > 0) {
      setFormError(tProcedures("linesInvalid"));
      setStep(2);
      return;
    }

    const startsAt = toZonedIso(values.date, values.startTime);
    const endsAt = toZonedIso(values.date, values.endTime);
    const reason = values.reason.trim() || null;
    let appointment = current;

    try {
      if (!appointment) {
        appointment = await appointmentApi.create({
          patient_id: values.patientId!,
          staff_member_id: values.staffMemberId!,
          starts_at: startsAt,
          ends_at: endsAt,
          reason,
        });
        setCurrent(appointment);
        // La cita ya existe: no se vuelve a crear aunque falle algún detalle.
        onChanged(appointment);
      } else {
        // PATCH parcial solo con lo modificado; nunca estado ni paciente.
        const body: AppointmentUpdateRequest = {};
        if (values.staffMemberId !== appointment.staff_member_id) {
          body.staff_member_id = values.staffMemberId!;
        }
        const sameInterval =
          Date.parse(startsAt) === Date.parse(appointment.starts_at) &&
          Date.parse(endsAt) === Date.parse(appointment.ends_at);
        if (!sameInterval) {
          body.starts_at = startsAt;
          body.ends_at = endsAt;
        }
        if (reason !== appointment.reason) body.reason = reason;

        if (Object.keys(body).length > 0) {
          appointment = await appointmentApi.update(appointment.id, body);
          setCurrent(appointment);
          onChanged(appointment);
        } else if (pendingOperations.length === 0) {
          setFormError(t("noChanges"));
          return;
        }
      }
    } catch (error) {
      const message = getAppointmentErrorMessage(error, tErrors);
      const serverFieldErrors =
        isApiError(error) && (error.status === 422 || error.status === 409)
          ? getFieldErrors(error.details)
          : {};
      const mapped = Object.entries(serverFieldErrors).filter(
        ([field]) => field in SERVER_FIELD_MAP,
      );

      if (mapped.length > 0) {
        for (const [field, fieldMessage] of mapped) {
          setError(SERVER_FIELD_MAP[field], {
            type: "server",
            message: fieldMessage,
          });
        }
        setStep(
          mapped.some(
            ([field]) => field === "patient_id" || field === "staff_member_id",
          )
            ? 0
            : 1,
        );
      } else {
        setFormError(message);
      }
      return;
    }

    const failures = await syncLines(appointment);
    if (failures > 0) {
      // Los detalles guardados se conservan; se puede reintentar solo lo pendiente.
      onChanged(appointment);
      setStep(2);
      return;
    }
    onSaved(appointment, isEdit ? "edit" : "create");
  };

  const steps = [
    { label: t("steps.people"), icon: UsersIcon },
    { label: t("steps.schedule"), icon: CalendarIcon },
    { label: t("steps.procedures"), icon: TaskIcon },
    { label: t("steps.confirm"), icon: CheckIcon },
  ];

  const goNext = async () => {
    const valid =
      step === 0
        ? await trigger(["patientId", "staffMemberId"])
        : step === 1
          ? await trigger(["date", "startTime", "endTime", "reason"])
          : true;
    if (valid) setStep((current) => (current + 1) as AppointmentFormStep);
  };

  const submitForm = handleSubmit(send, (invalidErrors) =>
    setStep(invalidErrors.patientId || invalidErrors.staffMemberId ? 0 : 1),
  );

  const wizardProgress = (
    <ol
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      aria-label={t("steps.label")}
    >
      {steps.map(({ label, icon: StepIcon }, index) => {
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
                    ? "border-green-500 bg-green-500 text-white hover:bg-green-600 dark:border-green-500 dark:bg-green-500 dark:text-white"
                    : "border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400"
              }`}
              aria-current={isCurrent ? "step" : undefined}
              disabled={index > step || isSubmitting}
              onClick={() =>
                index < step && setStep(index as AppointmentFormStep)
              }
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                  isComplete ? "bg-white/20" : "bg-current/10"
                }`}
              >
                {isComplete ? (
                  <CheckIcon className="size-3 fill-current" />
                ) : (
                  <StepIcon className="size-4 fill-current" />
                )}
              </span>
              <span className="truncate">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  const confirmation = (
    <section className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("review.title")}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("review.description")}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
          <UsersIcon className="size-5 text-blue-500" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("steps.people")}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
            {patientLabel ?? `#${patientId}`} /{" "}
            {staffLabel ?? `#${staffMemberId}`}
          </p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
          <CalendarIcon className="size-5 text-purple-500" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("steps.schedule")}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
            {date} · {startTime}–{endTime}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
          <TaskIcon className="size-5 text-green-500" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("steps.procedures")}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
            {t("review.procedureCount", {
              count: lines.filter((line) => !line.removed).length,
            })}
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <form
      onSubmit={(event) => {
        const submitter = event.nativeEvent.submitter as HTMLElement | null;
        const isFinalConfirmation =
          submitter?.dataset.appointmentSubmit === "true";

        if (step < 3 || !isFinalConfirmation) {
          event.preventDefault();
          if (step < 3) void goNext();
          return;
        }
        void submitForm(event);
      }}
      className="space-y-6"
      noValidate
    >
      {wizardProgress}
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {createdPartially && current && (
        <Alert variant="warning">
          <AlertTitle>
            {tProcedures("partial.title", { id: current.id })}
          </AlertTitle>
          <AlertDescription>
            <p>
              {tProcedures("partial.description", {
                count: pendingOperations.length,
              })}
            </p>
            <ul className="mt-2 list-disc ps-5">
              {pendingOperations.map((line) => (
                <li key={line.key}>
                  {line.procedure.name}
                  {line.error ? ` — ${line.error}` : ""}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Alert variant="info" hidden={step !== 1}>
        <AlertDescription>{t("availabilityNote")}</AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2" hidden={step !== 0}>
        <section className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          {patientLocked ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>{patientLabel ?? `#${patientId}`}</strong>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("patientLocked")}
              </p>
            </div>
          ) : (
            <Field data-invalid={Boolean(errors.patientId)}>
              <AppointmentEntitySelector
                type="patient"
                value={patientId}
                disabled={isSubmitting}
                rowSelection
                onSelect={(option) => {
                  setValue("patientId", option.id, { shouldValidate: true });
                  setPatientLabel(option.label);
                }}
              />
              <FieldError errors={toFieldErrors(errors.patientId)} />
            </Field>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <Field data-invalid={Boolean(errors.staffMemberId)}>
            <AppointmentEntitySelector
              type="staff"
              value={staffMemberId}
              disabled={isSubmitting}
              rowSelection
              onSelect={(option) => {
                setValue("staffMemberId", option.id, { shouldValidate: true });
                setStaffLabel(option.label);
              }}
            />
            <FieldError errors={toFieldErrors(errors.staffMemberId)} />
          </Field>
        </section>
      </div>

      <section className="space-y-4" hidden={step !== 1}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={Boolean(errors.date)}>
            <FieldLabel className="mb-1.5 block">
              {t("dateLabel")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              {...register("date")}
              type="date"
              aria-invalid={errors.date ? "true" : undefined}
            />
            <FieldError errors={toFieldErrors(errors.date)} />
          </Field>
          <Field data-invalid={Boolean(errors.startTime)}>
            <FieldLabel className="mb-1.5 block">
              {t("startTimeLabel")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              {...register("startTime")}
              type="time"
              aria-invalid={errors.startTime ? "true" : undefined}
            />
            <FieldError errors={toFieldErrors(errors.startTime)} />
          </Field>
          <Field data-invalid={Boolean(errors.endTime)}>
            <FieldLabel className="mb-1.5 block">
              {t("endTimeLabel")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              {...register("endTime")}
              type="time"
              aria-invalid={errors.endTime ? "true" : undefined}
            />
            <FieldError errors={toFieldErrors(errors.endTime)} />
          </Field>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {offset
            ? t("timeZoneHint", { timeZone: APP_TIMEZONE, offset })
            : t("timeZoneHintGeneric")}
        </p>

        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel className="mb-1.5 block">
            {t("reasonLabel")}{" "}
            <span className="text-xs font-normal text-gray-400">
              ({t("optional")})
            </span>
          </FieldLabel>
          <Textarea
            {...register("reason")}
            rows={3}
            placeholder={t("reasonPlaceholder")}
            aria-invalid={errors.reason ? "true" : undefined}
          />
          <FieldError errors={toFieldErrors(errors.reason)} />
        </Field>
      </section>

      <section hidden={step !== 2}>
        <AppointmentProceduresSection
          lines={lines}
          onChange={setLines}
          reservedMinutes={reservedMinutes}
          onAdjustEnd={adjustEnd}
          disabled={isSubmitting}
        />
      </section>

      <div hidden={step !== 3}>{confirmation}</div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <div>
          {step === 0 ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              {current && !isEdit ? t("close") : t("cancel")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                setStep(
                  (currentStep) => (currentStep - 1) as AppointmentFormStep,
                )
              }
            >
              <ChevronLeftIcon className="fill-current rtl:rotate-180" />
              {t("previous")}
            </Button>
          )}
        </div>
        {step < 3 ? (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void goNext();
            }}
          >
            {t("next")}
            <ChevronRightIcon className="fill-current rtl:rotate-180" />
          </Button>
        ) : (
          <Button
            type="submit"
            data-appointment-submit="true"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner />
            ) : (
              <FloppyDiscIcon className="fill-current" />
            )}
            {isSubmitting
              ? isEdit
                ? t("savingEdit")
                : t("savingCreate")
              : createdPartially
                ? tProcedures("partial.retry")
                : isEdit
                  ? t("saveEdit")
                  : t("saveCreate")}
          </Button>
        )}
      </div>
    </form>
  );
}
