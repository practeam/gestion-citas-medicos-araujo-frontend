import { z } from "zod";

export const PATIENT_NUMBER_MAX_LENGTH = 30;
export const PATIENT_NOTES_MAX_LENGTH = 1000;

/** Letras, números y `.` `_` `/` `-` (se normaliza a mayúsculas). */
const PATIENT_NUMBER_PATTERN = /^[A-Za-z0-9._/-]+$/;

export function normalizePatientNumber(value: string) {
  return value.trim().toUpperCase();
}

/**
 * Los mensajes son claves relativas a `patients.validation` (i18n). El número
 * de paciente y las notas son opcionales; la unicidad la decide el backend.
 */
export const patientFormSchema = z.object({
  patient_number: z.string().refine((value) => {
    const number = value.trim();
    return (
      !number ||
      (number.length <= PATIENT_NUMBER_MAX_LENGTH &&
        PATIENT_NUMBER_PATTERN.test(number))
    );
  }, "patientNumberInvalid"),
  notes: z
    .string()
    .refine(
      (value) => value.length <= PATIENT_NOTES_MAX_LENGTH,
      "notesTooLong",
    ),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const EMPTY_PATIENT_FORM_VALUES: PatientFormValues = {
  patient_number: "",
  notes: "",
};
