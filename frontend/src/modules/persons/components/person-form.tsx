import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import {
  PERSON_ADDRESS_MAX_LENGTH,
  PERSON_DOCUMENT_MAX_LENGTH,
  PERSON_NAME_MAX_LENGTH,
  PERSON_PHONE_MAX_DIGITS,
  personFormSchema,
  sanitizePhoneInput,
  todayIsoDate,
  type PersonFormValues,
} from "../schemas/person-schema";
import { getPersonErrorMessage } from "../utils/person-error.utils";
import { DocumentTypeSelect } from "./document-type-select";

type FieldName = keyof PersonFormValues;

const FIELD_NAMES: FieldName[] = [
  "first_name",
  "last_name",
  "maternal_last_name",
  "document_type",
  "document_number",
  "birth_date",
  "phone",
  "phone_whatsapp",
  "email",
  "address",
];

export interface PersonFormProps {
  defaultValues: PersonFormValues;
  submitLabel: string;
  /**
   * Recibe los valores del formulario (sin normalizar; usar `toCreatePayload` /
   * `toUpdatePayload`). Debe lanzar el error original de la API si falla.
   */
  onSubmit: (values: PersonFormValues) => Promise<void>;
  /** Si se omite, "Cancelar" vuelve al listado de personas. */
  onCancel?: () => void;
  /**
   * Contenido adicional del módulo consumidor, dentro del formulario y antes de
   * las acciones (por ejemplo, los campos propios del paciente).
   */
  children?: React.ReactNode;
  /** Permite integrar el formulario en un flujo por pasos sin desmontar sus campos. */
  fieldsHidden?: boolean;
  /** Reemplaza las acciones predeterminadas cuando el consumidor controla la navegaciÃ³n. */
  actions?: React.ReactNode;
  /** Se ejecuta cuando el envÃ­o encuentra errores en los datos personales. */
  onInvalid?: () => void;
}

/**
 * Formulario reutilizable de datos personales (alta y edición). No registra
 * pacientes ni personal: solo comunica los valores mediante `onSubmit`.
 */
export function PersonForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  children,
  fieldsHidden = false,
  actions,
  onInvalid,
}: PersonFormProps) {
  const t = useTranslations("persons.form");
  const tValidation = useTranslations("persons.validation");
  const tErrors = useTranslations("persons.errors");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
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

  const submit = async (values: PersonFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getPersonErrorMessage(error, tErrors);
      const serverFieldErrors =
        isApiError(error) && error.status === 422
          ? getFieldErrors(error.details)
          : {};

      if (isApiError(error) && error.status === 409) {
        // Documento duplicado: se muestra junto al campo.
        setError("document_number", { type: "server", message });
      } else if (Object.keys(serverFieldErrors).length > 0) {
        for (const field of FIELD_NAMES) {
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

  const renderField = (
    name: FieldName,
    options: {
      required?: boolean;
      type?: string;
      maxLength?: number;
      max?: string;
      uppercase?: boolean;
    } = {},
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel className="mb-1.5 block">
        {t(`${name}Label`)}{" "}
        {options.required ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="text-xs font-normal text-gray-400">
            ({t("optional")})
          </span>
        )}
      </FieldLabel>
      <Input
        {...register(name)}
        type={options.type}
        max={options.max}
        maxLength={options.maxLength}
        placeholder={t(`${name}Placeholder`)}
        aria-invalid={errors[name] ? "true" : undefined}
        autoComplete="off"
        className={options.uppercase ? "uppercase" : undefined}
      />
      <FieldError errors={toFieldErrors(errors[name])} />
    </Field>
  );

  /**
   * Teléfono: campo de tipo teléfono que solo admite dígitos y se escribe sin
   * código de país (sin "+51"). Se usa para el teléfono de contacto y para el
   * número de WhatsApp.
   */
  const renderPhoneField = (name: "phone" | "phone_whatsapp") => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel className="mb-1.5 block">
        {t(`${name}Label`)}{" "}
        <span className="text-xs font-normal text-gray-400">
          ({t("optional")})
        </span>
      </FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            ref={field.ref}
            name={field.name}
            onBlur={field.onBlur}
            value={field.value}
            onChange={(event) =>
              field.onChange(sanitizePhoneInput(event.target.value))
            }
            type="tel"
            inputMode="tel"
            autoComplete="off"
            maxLength={PERSON_PHONE_MAX_DIGITS}
            placeholder={t(`${name}Placeholder`)}
            aria-invalid={errors[name] ? "true" : undefined}
          />
        )}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t(`${name}Hint`)}
      </p>
      <FieldError errors={toFieldErrors(errors[name])} />
    </Field>
  );

  return (
    <form
      onSubmit={handleSubmit(submit, onInvalid)}
      className="space-y-6"
      noValidate
    >
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-5" hidden={fieldsHidden}>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {renderField("first_name", {
            required: true,
            maxLength: PERSON_NAME_MAX_LENGTH + 20,
          })}
          {renderField("last_name", {
            required: true,
            maxLength: PERSON_NAME_MAX_LENGTH + 20,
          })}
          {renderField("maternal_last_name", {
            maxLength: PERSON_NAME_MAX_LENGTH + 20,
          })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <Field data-invalid={Boolean(errors.document_type)}>
            <FieldLabel className="mb-1.5 block">
              {t("document_typeLabel")}{" "}
              <span className="text-xs font-normal text-gray-400">
                ({t("optional")})
              </span>
            </FieldLabel>
            <Controller
              control={control}
              name="document_type"
              render={({ field }) => (
                <DocumentTypeSelect
                  value={field.value}
                  onChange={field.onChange}
                  emptyLabel={t("document_typePlaceholder")}
                  ariaLabel={t("document_typeLabel")}
                  invalid={Boolean(errors.document_type)}
                  className="w-full"
                />
              )}
            />
            <FieldError errors={toFieldErrors(errors.document_type)} />
          </Field>
          {renderField("document_number", {
            maxLength: PERSON_DOCUMENT_MAX_LENGTH + 10,
            uppercase: true,
          })}
          {renderField("birth_date", { type: "date", max: todayIsoDate() })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {renderPhoneField("phone")}
          {renderPhoneField("phone_whatsapp")}
          {renderField("email", { type: "email" })}
        </div>

        {renderField("address", {
          maxLength: PERSON_ADDRESS_MAX_LENGTH + 20,
        })}
      </div>

      {children}

      {actions ?? (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              {t("cancel")}
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={isSubmitting}
              nativeButton={false}
              render={<Link to="/persons" />}
            >
              {t("cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            {isSubmitting ? t("saving") : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
