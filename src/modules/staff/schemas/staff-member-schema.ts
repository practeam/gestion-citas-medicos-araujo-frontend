import { z } from "zod";

export const EMPLOYEE_NUMBER_MAX_LENGTH = 30;

/** Letras, números y `.` `_` `/` `-` (se normaliza a mayúsculas). */
const EMPLOYEE_NUMBER_PATTERN = /^[A-Za-z0-9._/-]+$/;

export function normalizeEmployeeNumber(value: string) {
  return value.trim().toUpperCase();
}

/**
 * Los mensajes son claves relativas a `staff.validation` (i18n). Número de
 * empleado y fecha de contratación son opcionales; la unicidad del número la
 * decide el backend, y no se asumen reglas adicionales sobre la fecha.
 */
export const staffMemberFormSchema = z.object({
  employee_number: z.string().refine((value) => {
    const number = value.trim();
    return (
      !number ||
      (number.length <= EMPLOYEE_NUMBER_MAX_LENGTH &&
        EMPLOYEE_NUMBER_PATTERN.test(number))
    );
  }, "employeeNumberInvalid"),
  hire_date: z.string().refine((value) => {
    if (!value) return true;
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
    );
  }, "hireDateInvalid"),
});

export type StaffMemberFormValues = z.infer<typeof staffMemberFormSchema>;

export const EMPTY_STAFF_MEMBER_FORM_VALUES: StaffMemberFormValues = {
  employee_number: "",
  hire_date: "",
};
