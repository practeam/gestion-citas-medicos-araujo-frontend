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
  patientFormSchema,
  type PatientFormValues,
} from "../schemas/patient-schema";
import { getPatientErrorMessage } from "../utils/patient-error.utils";
import { PatientFields } from "./patient-fields";

interface PatientEditFormProps {
  defaultValues: PatientFormValues;
  /** Debe lanzar el error original de la API si la operación falla. */
  onSubmit: (values: PatientFormValues) => Promise<void>;
  /** Contenido adicional del formulario (p. ej. condiciones especiales), antes de las acciones. */
  children?: React.ReactNode;
}

/** Edición de los campos propios del paciente (número y notas). */
export function PatientEditForm({
  defaultValues,
  onSubmit,
  children,
}: PatientEditFormProps) {
  const t = useTranslations("patients.form");
  const tErrors = useTranslations("patients.errors");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = async (values: PatientFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = getPatientErrorMessage(error, tErrors);
      const serverFieldErrors =
        isApiError(error) && error.status === 422
          ? getFieldErrors(error.details)
          : {};

      if (isApiError(error) && error.status === 409) {
        // En edición el único conflicto posible es el número de paciente duplicado.
        setError("patient_number", { type: "server", message });
      } else if (Object.keys(serverFieldErrors).length > 0) {
        for (const field of ["patient_number", "notes"] as const) {
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
      <PatientFields register={register} errors={errors} />
      {children}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link to="/patients" />}
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
