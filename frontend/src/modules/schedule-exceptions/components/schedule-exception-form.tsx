import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import {
  scheduleExceptionFormSchema,
  type ScheduleExceptionFormValues,
} from "../schemas/schedule-exception-schema";
import {
  EXCEPTION_TYPES,
  type ExceptionType,
  type TargetType,
} from "../types/schedule-exception.types";
import {
  isValidLocalDateTime,
  toOffsetIso,
} from "../utils/schedule-exception-datetime.utils";
import { getScheduleExceptionErrorMessage } from "../utils/schedule-exception-error.utils";
import { ScheduleExceptionTargetSelector } from "./schedule-exception-target-selector";

const TARGET_TYPES: TargetType[] = ["clinic", "staff"];

/** Campos de la API que se muestran junto a cada campo del formulario. */
const SERVER_FIELD_MAP: Record<string, keyof ScheduleExceptionFormValues> = {
  clinic_id: "targetId",
  staff_member_id: "targetId",
  exception_type: "exceptionType",
  reason: "reason",
  starts_at: "startsAt",
  ends_at: "endsAt",
};

interface ScheduleExceptionFormProps {
  defaultValues: ScheduleExceptionFormValues;
  /** Nombre del objetivo actual (edición), para mostrarlo antes de elegir otro. */
  initialTargetLabel?: string;
  submitLabel: string;
  /** Debe lanzar el error original de la API si la operación falla. */
  onSubmit: (values: ScheduleExceptionFormValues) => Promise<void>;
}

/**
 * Alta y edición de una excepción: objetivo excluyente (clínica **o** personal),
 * tipo de la lista cerrada del backend, motivo opcional e intervalo con zona
 * horaria. Una excepción siempre bloquea disponibilidad; nunca la amplía.
 */
export function ScheduleExceptionForm({
  defaultValues,
  initialTargetLabel,
  submitLabel,
  onSubmit,
}: ScheduleExceptionFormProps) {
  const t = useTranslations("scheduleExceptions.form");
  const tTypes = useTranslations("scheduleExceptions.types");
  const tTarget = useTranslations("scheduleExceptions.target");
  const tValidation = useTranslations("scheduleExceptions.validation");
  const tErrors = useTranslations("scheduleExceptions.errors");
  const [formError, setFormError] = useState<string | null>(null);
  const [targetLabel, setTargetLabel] = useState<string | null>(
    initialTargetLabel ?? null,
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleExceptionFormValues>({
    resolver: zodResolver(scheduleExceptionFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const targetType = useWatch({ control, name: "targetType" });
  const targetId = useWatch({ control, name: "targetId" });
  const startsAt = useWatch({ control, name: "startsAt" });

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

  const changeTargetType = (type: TargetType) => {
    if (type === targetType) return;
    // La selección es excluyente: al cambiar de tipo se descarta el objetivo elegido.
    setValue("targetType", type);
    setValue("targetId", null);
    setTargetLabel(null);
    clearErrors("targetId");
  };

  const submit = async (values: ScheduleExceptionFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getScheduleExceptionErrorMessage(error, tErrors);
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
      } else {
        setFormError(message);
      }
    }
  };

  // Desplazamiento que se enviará (el del navegador para esa fecha).
  const offset = isValidLocalDateTime(startsAt)
    ? toOffsetIso(startsAt).slice(-6)
    : null;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Alert variant="info">
        <AlertDescription>{t("blockNote")}</AlertDescription>
      </Alert>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("targetSection")}
        </h4>
        <div className="flex flex-col gap-2 sm:flex-row">
          {TARGET_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={targetType === type ? "default" : "outline"}
              aria-pressed={targetType === type}
              disabled={isSubmitting}
              onClick={() => changeTargetType(type)}
            >
              {tTarget(type)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t(`targetHint.${targetType}`)}
        </p>
        <Field data-invalid={Boolean(errors.targetId)}>
          {targetId !== null && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("selectedTarget")}:{" "}
              <strong>{targetLabel ?? `#${targetId}`}</strong>
            </p>
          )}
          <ScheduleExceptionTargetSelector
            type={targetType}
            value={targetId}
            disabled={isSubmitting}
            onSelect={(option) => {
              setValue("targetId", option.id, { shouldValidate: true });
              setTargetLabel(option.label);
            }}
          />
          <FieldError errors={toFieldErrors(errors.targetId)} />
        </Field>
      </section>

      <section className="space-y-5 border-t border-gray-100 pt-6 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("detailsSection")}
        </h4>
        <Field data-invalid={Boolean(errors.exceptionType)}>
          <FieldLabel className="mb-1.5 block">
            {t("typeLabel")} <span className="text-red-500">*</span>
          </FieldLabel>
          <Controller
            control={control}
            name="exceptionType"
            render={({ field }) => (
              <Select
                value={field.value}
                disabled={isSubmitting}
                // Se envía el valor de API (`closure`, …), no la etiqueta traducida.
                onValueChange={(value) =>
                  field.onChange(value as ExceptionType)
                }
              >
                <SelectTrigger
                  aria-invalid={errors.exceptionType ? "true" : undefined}
                >
                  <SelectValue>{(value: string) => tTypes(value)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EXCEPTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {tTypes(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={toFieldErrors(errors.exceptionType)} />
        </Field>

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

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.startsAt)}>
            <FieldLabel className="mb-1.5 block">
              {t("startsAtLabel")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              {...register("startsAt")}
              type="datetime-local"
              aria-invalid={errors.startsAt ? "true" : undefined}
            />
            <FieldError errors={toFieldErrors(errors.startsAt)} />
          </Field>
          <Field data-invalid={Boolean(errors.endsAt)}>
            <FieldLabel className="mb-1.5 block">
              {t("endsAtLabel")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              {...register("endsAt")}
              type="datetime-local"
              aria-invalid={errors.endsAt ? "true" : undefined}
            />
            <FieldError errors={toFieldErrors(errors.endsAt)} />
          </Field>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {offset ? t("timeZoneHint", { offset }) : t("timeZoneHintGeneric")}
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link to="/schedule-exceptions" />}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? t("saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
