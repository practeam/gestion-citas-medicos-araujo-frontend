import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLocale, useTranslations } from "@/i18n";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import {
  scheduleOverrideFormSchema,
  type ScheduleOverrideFormValues,
} from "../schemas/schedule-override-schema";
import type {
  ScheduleOverride,
  TargetType,
} from "../types/schedule-override.types";
import {
  formatDateTimeWithZone,
  isValidLocalDateTime,
  toOffsetIso,
} from "../utils/schedule-override-datetime.utils";
import { getScheduleOverrideErrorMessage } from "../utils/schedule-override-error.utils";
import { ScheduleOverrideTargetSelector } from "./schedule-override-target-selector";

const TARGET_TYPES: TargetType[] = ["clinic", "staff"];

/** Campos de la API que se muestran junto a cada campo del formulario. */
const SERVER_FIELD_MAP: Record<string, keyof ScheduleOverrideFormValues> = {
  clinic_id: "targetId",
  staff_member_id: "targetId",
  starts_at: "startsAt",
  ends_at: "endsAt",
  reason: "reason",
  is_active: "isActive",
};

interface ScheduleOverrideFormProps {
  /** `create`: objetivo elegible y estado inicial. `edit`: el objetivo no se puede cambiar. */
  mode: "create" | "edit";
  defaultValues: ScheduleOverrideFormValues;
  /** Nombre del objetivo actual (edición). */
  targetLabel?: string;
  submitLabel: string;
  /**
   * Aviso preventivo: devuelve los overrides activos del mismo objetivo cuyo
   * intervalo se cruza con el indicado. No bloquea: el backend decide.
   */
  onCheckOverlaps: (
    values: ScheduleOverrideFormValues,
  ) => Promise<ScheduleOverride[]>;
  /** Debe lanzar el error original de la API si la operación falla. */
  onSubmit: (values: ScheduleOverrideFormValues) => Promise<void>;
}

/**
 * Alta y edición de un override: intervalo puntual con zona horaria y motivo
 * opcional. Habilita disponibilidad extraordinaria (no son ausencias ni
 * cierres: eso son excepciones) y no modifica los horarios semanales.
 */
export function ScheduleOverrideForm({
  mode,
  defaultValues,
  targetLabel: initialTargetLabel,
  submitLabel,
  onCheckOverlaps,
  onSubmit,
}: ScheduleOverrideFormProps) {
  const t = useTranslations("scheduleOverrides.form");
  const tTarget = useTranslations("scheduleOverrides.target");
  const tValidation = useTranslations("scheduleOverrides.validation");
  const tErrors = useTranslations("scheduleOverrides.errors");
  const locale = useLocale();
  const isEdit = mode === "edit";
  const [formError, setFormError] = useState<string | null>(null);
  const [overlaps, setOverlaps] = useState<ScheduleOverride[] | null>(null);
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
  } = useForm<ScheduleOverrideFormValues>({
    resolver: zodResolver(scheduleOverrideFormSchema),
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
    setOverlaps(null);
    clearErrors("targetId");
  };

  const send = async (values: ScheduleOverrideFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getScheduleOverrideErrorMessage(error, tErrors);
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

  const submit = async (values: ScheduleOverrideFormValues) => {
    setOverlaps(null);
    setFormError(null);
    // Aviso preventivo solo para overrides que quedarán activos; si no se puede
    // consultar, se deja decidir al backend.
    if (isEdit ? defaultValues.isActive : values.isActive) {
      try {
        const found = await onCheckOverlaps(values);
        if (found.length > 0) {
          setOverlaps(found);
          return;
        }
      } catch {
        // Sin información suficiente: el backend es la autoridad.
      }
    }
    await send(values);
  };

  const submitAnyway = handleSubmit(send);

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
        <AlertDescription>{t("overrideNote")}</AlertDescription>
      </Alert>

      {overlaps && (
        <Alert variant="warning">
          <AlertTitle>{t("overlap.title")}</AlertTitle>
          <AlertDescription>
            <p>{t("overlap.description", { count: overlaps.length })}</p>
            <ul className="mt-2 list-disc ps-5">
              {overlaps.map((override) => (
                <li key={override.id}>
                  #{override.id} ·{" "}
                  {formatDateTimeWithZone(override.starts_at, locale)} –{" "}
                  {formatDateTimeWithZone(override.ends_at, locale)}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setOverlaps(null)}
              >
                {t("overlap.review")}
              </Button>
              <Button
                type="button"
                size="xs"
                disabled={isSubmitting}
                onClick={() => void submitAnyway()}
              >
                {t("overlap.continue")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("targetSection")}
        </h4>
        {isEdit ? (
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {tTarget(targetType)}:{" "}
              <strong>{targetLabel ?? `#${targetId}`}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("targetLocked")}
            </p>
          </div>
        ) : (
          <>
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
              <ScheduleOverrideTargetSelector
                type={targetType}
                value={targetId}
                disabled={isSubmitting}
                onSelect={(option) => {
                  setValue("targetId", option.id, { shouldValidate: true });
                  setTargetLabel(option.label);
                  setOverlaps(null);
                }}
              />
              <FieldError errors={toFieldErrors(errors.targetId)} />
            </Field>
          </>
        )}
      </section>

      <section className="space-y-5 border-t border-gray-100 pt-6 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("detailsSection")}
        </h4>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.startsAt)}>
            <FieldLabel className="mb-1.5 block">
              {t("startsAtLabel")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              {...register("startsAt", { onChange: () => setOverlaps(null) })}
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
              {...register("endsAt", { onChange: () => setOverlaps(null) })}
              type="datetime-local"
              aria-invalid={errors.endsAt ? "true" : undefined}
            />
            <FieldError errors={toFieldErrors(errors.endsAt)} />
          </Field>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {offset ? t("timeZoneHint", { offset }) : t("timeZoneHintGeneric")}
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
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("reasonHint")}
          </p>
          <FieldError errors={toFieldErrors(errors.reason)} />
        </Field>

        {!isEdit && (
          <Field orientation="horizontal" className="items-center gap-3">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="override-is-active"
                  checked={field.value}
                  disabled={isSubmitting}
                  onCheckedChange={(checked) => {
                    field.onChange(Boolean(checked));
                    setOverlaps(null);
                  }}
                />
              )}
            />
            <FieldLabel htmlFor="override-is-active" className="font-normal">
              {t("isActiveLabel")}
            </FieldLabel>
          </Field>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link to="/schedule-overrides" />}
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
