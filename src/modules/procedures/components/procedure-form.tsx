import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import { useProcedureLabels } from "../hooks/use-procedure-labels";
import {
  PROCEDURE_CODE_MAX_LENGTH,
  PROCEDURE_NAME_MAX_LENGTH,
  procedureFormSchema,
  type ProcedureFormValues,
} from "../schemas/procedure-schema";
import { getProcedureErrorMessage } from "../utils/procedure-error.utils";
import { ProcedureParentSelector } from "./procedure-parent-selector";

/** Campos de la API que se muestran junto a cada campo del formulario. */
const SERVER_FIELD_MAP: Record<string, keyof ProcedureFormValues> = {
  name: "name",
  code: "code",
  base_price: "basePrice",
  base_duration_minutes: "baseDurationMinutes",
  description: "description",
  parent_procedure_id: "parentProcedureId",
};

interface ProcedureFormProps {
  defaultValues: ProcedureFormValues;
  /** Id del procedimiento que se edita (no puede ser su propio padre). */
  procedureId?: number;
  submitLabel: string;
  /** Debe lanzar el error original de la API si la operación falla. */
  onSubmit: (values: ProcedureFormValues) => Promise<void>;
}

export function ProcedureForm({
  defaultValues,
  procedureId,
  submitLabel,
  onSubmit,
}: ProcedureFormProps) {
  const t = useTranslations("procedures.form");
  const tValidation = useTranslations("procedures.validation");
  const tErrors = useTranslations("procedures.errors");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedParentLabel, setSelectedParentLabel] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProcedureFormValues>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const parentId = useWatch({ control, name: "parentProcedureId" });
  // El nombre del padre inicial (edición) se consulta; el elegido en pantalla ya lo conocemos.
  const initialLabels = useProcedureLabels(
    defaultValues.parentProcedureId === null
      ? []
      : [defaultValues.parentProcedureId],
  );
  const parentLabel =
    parentId === null
      ? null
      : parentId === defaultValues.parentProcedureId && !selectedParentLabel
        ? (initialLabels[parentId] ?? `#${parentId}`)
        : (selectedParentLabel ?? `#${parentId}`);

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

  const submit = async (values: ProcedureFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getProcedureErrorMessage(error, tErrors);
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
      } else if (isApiError(error) && error.status === 409) {
        // Nombre/código duplicado o jerarquía inválida: el mensaje del backend indica cuál.
        setFormError(message);
      } else {
        setFormError(message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel className="mb-1.5 block">
            {t("nameLabel")} <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("name")}
            placeholder={t("namePlaceholder")}
            aria-invalid={errors.name ? "true" : undefined}
            maxLength={PROCEDURE_NAME_MAX_LENGTH + 20}
            autoComplete="off"
          />
          <FieldError errors={toFieldErrors(errors.name)} />
        </Field>

        <Field data-invalid={Boolean(errors.code)}>
          <FieldLabel className="mb-1.5 block">{t("codeLabel")}</FieldLabel>
          <Input
            {...register("code")}
            placeholder={t("codePlaceholder")}
            aria-invalid={errors.code ? "true" : undefined}
            maxLength={PROCEDURE_CODE_MAX_LENGTH + 10}
            autoComplete="off"
          />
          <FieldError errors={toFieldErrors(errors.code)} />
        </Field>

        <Field data-invalid={Boolean(errors.basePrice)}>
          <FieldLabel className="mb-1.5 block">
            {t("priceLabel")} <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("basePrice")}
            inputMode="decimal"
            placeholder={t("pricePlaceholder")}
            aria-invalid={errors.basePrice ? "true" : undefined}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("priceHint")}
          </p>
          <FieldError errors={toFieldErrors(errors.basePrice)} />
        </Field>

        <Field data-invalid={Boolean(errors.baseDurationMinutes)}>
          <FieldLabel className="mb-1.5 block">
            {t("durationLabel")} <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("baseDurationMinutes")}
            inputMode="numeric"
            placeholder={t("durationPlaceholder")}
            aria-invalid={errors.baseDurationMinutes ? "true" : undefined}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("durationHint")}
          </p>
          <FieldError errors={toFieldErrors(errors.baseDurationMinutes)} />
        </Field>
      </div>

      <Field data-invalid={Boolean(errors.description)}>
        <FieldLabel className="mb-1.5 block">
          {t("descriptionLabel")}
        </FieldLabel>
        <Textarea
          {...register("description")}
          rows={4}
          placeholder={t("descriptionPlaceholder")}
          aria-invalid={errors.description ? "true" : undefined}
        />
        <FieldError errors={toFieldErrors(errors.description)} />
      </Field>

      <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {t("parentSection")}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("parentHint")}
          </p>
        </div>
        <Field data-invalid={Boolean(errors.parentProcedureId)}>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("selectedParent")}:{" "}
            <strong>{parentLabel ?? t("noParent")}</strong>
          </p>
          <ProcedureParentSelector
            value={parentId}
            excludeId={procedureId}
            disabled={isSubmitting}
            onSelect={(procedure) => {
              setValue("parentProcedureId", procedure?.id ?? null, {
                shouldValidate: true,
              });
              setSelectedParentLabel(
                procedure
                  ? procedure.code
                    ? `${procedure.code} · ${procedure.name}`
                    : procedure.name
                  : null,
              );
            }}
          />
          <FieldError errors={toFieldErrors(errors.parentProcedureId)} />
        </Field>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link to="/procedures" />}
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
