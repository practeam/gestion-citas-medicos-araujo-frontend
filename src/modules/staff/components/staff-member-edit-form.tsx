import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { getFieldErrors, isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import {
  staffMemberEditSchema,
  type StaffMemberFormValues,
} from "../schemas/staff-member-schema";
import { getStaffMemberErrorMessage } from "../utils/staff-member-error.utils";
import { StaffMemberFields } from "./staff-member-fields";

interface StaffMemberEditFormProps {
  defaultValues: StaffMemberFormValues;
  /** Debe lanzar el error original de la API si la operación falla. */
  onSubmit: (values: StaffMemberFormValues) => Promise<void>;
}

/** Edición de los campos propios del personal (número de empleado y fecha de contratación). */
export function StaffMemberEditForm({
  defaultValues,
  onSubmit,
}: StaffMemberEditFormProps) {
  const t = useTranslations("staff.form");
  const tErrors = useTranslations("staff.errors");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffMemberFormValues>({
    resolver: zodResolver(staffMemberEditSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = async (values: StaffMemberFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getStaffMemberErrorMessage(error, tErrors);
      const serverFieldErrors =
        isApiError(error) && error.status === 422
          ? getFieldErrors(error.details)
          : {};

      if (isApiError(error) && error.status === 409) {
        // En edición el único conflicto posible es el número de empleado duplicado.
        setError("employee_number", { type: "server", message });
      } else if (Object.keys(serverFieldErrors).length > 0) {
        for (const field of [
          "employee_number",
          "hire_date",
          "password",
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
      <StaffMemberFields mode="edit" register={register} errors={errors} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link to="/staff" />}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
