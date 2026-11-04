import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  PATIENT_NUMBER_MAX_LENGTH,
  type PatientFormValues,
} from "../schemas/patient-schema";

interface PatientFieldsProps {
  register: UseFormRegister<PatientFormValues>;
  errors: FieldErrors<PatientFormValues>;
}

/** Campos propios del paciente (número y notas); sirve para alta y edición. */
export function PatientFields({ register, errors }: PatientFieldsProps) {
  const t = useTranslations("patients.form");
  const tValidation = useTranslations("patients.validation");

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

  return (
    <div className="space-y-5">
      <Field data-invalid={Boolean(errors.patient_number)}>
        <FieldLabel className="mb-1.5 block">
          {t("patientNumberLabel")}{" "}
          <span className="text-xs font-normal text-gray-400">
            ({t("optional")})
          </span>
        </FieldLabel>
        <Input
          {...register("patient_number")}
          placeholder={t("patientNumberPlaceholder")}
          maxLength={PATIENT_NUMBER_MAX_LENGTH + 10}
          aria-invalid={errors.patient_number ? "true" : undefined}
          autoComplete="off"
          className="uppercase"
        />
        <FieldError errors={toFieldErrors(errors.patient_number)} />
      </Field>

      <Field data-invalid={Boolean(errors.notes)}>
        <FieldLabel className="mb-1.5 block">
          {t("notesLabel")}{" "}
          <span className="text-xs font-normal text-gray-400">
            ({t("optional")})
          </span>
        </FieldLabel>
        <Textarea
          {...register("notes")}
          rows={4}
          placeholder={t("notesPlaceholder")}
          aria-invalid={errors.notes ? "true" : undefined}
        />
        <FieldError errors={toFieldErrors(errors.notes)} />
      </Field>
    </div>
  );
}
