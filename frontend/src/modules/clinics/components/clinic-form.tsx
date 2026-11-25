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
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import {
  CLINIC_ADDRESS_MAX_LENGTH,
  CLINIC_NAME_MAX_LENGTH,
  CLINIC_PHONE_MAX_LENGTH,
  clinicFormSchema,
  type ClinicFormValues,
} from "../schemas/clinic-schema";
import { getClinicErrorMessage } from "../utils/clinic-error.utils";

interface ClinicFormProps {
  defaultValues: ClinicFormValues;
  submitLabel: string;
  /** Debe lanzar el error original de la API si la operación falla. */
  onSubmit: (values: ClinicFormValues) => Promise<void>;
  /** Contenido adicional del formulario (p. ej. horarios de atención), antes de las acciones. */
  children?: React.ReactNode;
}

export function ClinicForm({
  defaultValues,
  submitLabel,
  onSubmit,
  children,
}: ClinicFormProps) {
  const t = useTranslations("clinics.form");
  const tValidation = useTranslations("clinics.validation");
  const tErrors = useTranslations("clinics.errors");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
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

  const submit = async (values: ClinicFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getClinicErrorMessage(error, tErrors);
      const serverFieldErrors =
        isApiError(error) && error.status === 422
          ? getFieldErrors(error.details)
          : {};

      if (isApiError(error) && error.status === 409) {
        // Nombre duplicado: se muestra junto al campo.
        setError("name", { type: "server", message });
      } else if (Object.keys(serverFieldErrors).length > 0) {
        for (const field of [
          "name",
          "address",
          "description",
          "phone",
          "email",
        ] as const) {
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
          {t("nameLabel")} <span className="text-red-500">*</span>
        </FieldLabel>
        <Input
          {...register("name")}
          placeholder={t("namePlaceholder")}
          aria-invalid={errors.name ? "true" : undefined}
          maxLength={CLINIC_NAME_MAX_LENGTH + 20}
          autoComplete="off"
        />
        <FieldError errors={toFieldErrors(errors.name)} />
      </Field>

      <Field data-invalid={Boolean(errors.address)}>
        <FieldLabel className="mb-1.5 block">
          {t("addressLabel")} <span className="text-red-500">*</span>
        </FieldLabel>
        <Input
          {...register("address")}
          placeholder={t("addressPlaceholder")}
          aria-invalid={errors.address ? "true" : undefined}
          maxLength={CLINIC_ADDRESS_MAX_LENGTH + 20}
          autoComplete="off"
        />
        <FieldError errors={toFieldErrors(errors.address)} />
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

      <Field data-invalid={Boolean(errors.phone)}>
        <FieldLabel className="mb-1.5 block">{t("phoneLabel")}</FieldLabel>
        <Input
          {...register("phone")}
          placeholder={t("phonePlaceholder")}
          aria-invalid={errors.phone ? "true" : undefined}
          type="tel"
          maxLength={CLINIC_PHONE_MAX_LENGTH + 10}
          autoComplete="off"
        />
        <FieldError errors={toFieldErrors(errors.phone)} />
      </Field>

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel className="mb-1.5 block">{t("emailLabel")}</FieldLabel>
        <Input
          {...register("email")}
          placeholder={t("emailPlaceholder")}
          aria-invalid={errors.email ? "true" : undefined}
          type="email"
          autoComplete="off"
        />
        <FieldError errors={toFieldErrors(errors.email)} />
      </Field>

      {children}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link to="/clinics" />}
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
