import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  EMPLOYEE_NUMBER_MAX_LENGTH,
  type StaffMemberFormValues,
} from "../schemas/staff-member-schema";

interface StaffMemberFieldsProps {
  register: UseFormRegister<StaffMemberFormValues>;
  errors: FieldErrors<StaffMemberFormValues>;
}

/** Campos propios del personal (número de empleado y fecha de contratación); sirve para alta y edición. */
export function StaffMemberFields({
  register,
  errors,
}: StaffMemberFieldsProps) {
  const t = useTranslations("staff.form");
  const tValidation = useTranslations("staff.validation");

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
      <Field data-invalid={Boolean(errors.employee_number)}>
        <FieldLabel className="mb-1.5 block">
          {t("employeeNumberLabel")}{" "}
          <span className="text-xs font-normal text-gray-400">
            ({t("optional")})
          </span>
        </FieldLabel>
        <Input
          {...register("employee_number")}
          placeholder={t("employeeNumberPlaceholder")}
          maxLength={EMPLOYEE_NUMBER_MAX_LENGTH + 10}
          aria-invalid={errors.employee_number ? "true" : undefined}
          autoComplete="off"
          className="uppercase"
        />
        <FieldError errors={toFieldErrors(errors.employee_number)} />
      </Field>

      <Field data-invalid={Boolean(errors.hire_date)}>
        <FieldLabel className="mb-1.5 block">
          {t("hireDateLabel")}{" "}
          <span className="text-xs font-normal text-gray-400">
            ({t("optional")})
          </span>
        </FieldLabel>
        <Input
          {...register("hire_date")}
          type="date"
          aria-invalid={errors.hire_date ? "true" : undefined}
          autoComplete="off"
        />
        <FieldError errors={toFieldErrors(errors.hire_date)} />
      </Field>
    </div>
  );
}
