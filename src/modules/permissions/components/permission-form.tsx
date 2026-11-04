import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import {
  PERMISSION_NAME_MAX_LENGTH,
  permissionCreateSchema,
  permissionEditSchema,
  type PermissionFormValues,
} from "../schemas/permission-schema";
import { getPermissionErrorMessage } from "../utils/permission-error.utils";

interface PermissionFormProps {
  /** En `edit` el nombre se muestra como solo lectura. */
  mode: "create" | "edit";
  defaultValues: PermissionFormValues;
  submitLabel: string;
  /** Debe lanzar el error original de la API si la operación falla. */
  onSubmit: (values: PermissionFormValues) => Promise<void>;
}

export function PermissionForm({
  mode,
  defaultValues,
  submitLabel,
  onSubmit,
}: PermissionFormProps) {
  const t = useTranslations("permissions.form");
  const tValidation = useTranslations("permissions.validation");
  const tErrors = useTranslations("permissions.errors");
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(
      isEdit ? permissionEditSchema : permissionCreateSchema,
    ),
    defaultValues,
    mode: "onTouched",
  });

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

  const submit = async (values: PermissionFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getPermissionErrorMessage(error, tErrors);
      const serverFieldErrors =
        isApiError(error) && error.status === 422
          ? getFieldErrors(error.details)
          : {};

      if (isApiError(error) && error.status === 409) {
        // Nombre duplicado: se muestra junto al campo.
        setError("name", { type: "server", message });
      } else if (Object.keys(serverFieldErrors).length > 0) {
        for (const field of ["name", "description"] as const) {
          const fieldMessage = serverFieldErrors[field];
          if (fieldMessage) {
            setError(field, { type: "server", message: fieldMessage });
          }
        }
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

      <Field data-invalid={Boolean(errors.name)}>
        <FieldLabel className="mb-1.5 block">
          {t("nameLabel")} {!isEdit && <span className="text-red-500">*</span>}
        </FieldLabel>
        <Input
          {...register("name")}
          placeholder={t("namePlaceholder")}
          aria-invalid={errors.name ? "true" : undefined}
          maxLength={PERMISSION_NAME_MAX_LENGTH + 20}
          autoComplete="off"
          readOnly={isEdit}
          disabled={isEdit}
          className="font-mono"
        />
        <FieldDescription>
          {isEdit ? t("nameReadOnlyHint") : t("nameHint")}
        </FieldDescription>
        <FieldError errors={toFieldErrors(errors.name)} />
      </Field>

      <Field data-invalid={Boolean(errors.description)}>
        <FieldLabel className="mb-1.5 block">
          {t("descriptionLabel")}
        </FieldLabel>
        <Textarea
          {...register("description")}
          rows={5}
          placeholder={t("descriptionPlaceholder")}
          aria-invalid={errors.description ? "true" : undefined}
        />
        <FieldError errors={toFieldErrors(errors.description)} />
      </Field>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link to="/permissions" />}
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
