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
const staffMemberBaseShape = {
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
};

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Sin trim: los espacios forman parte de la contraseña (igual que el backend). */
const isValidPasswordLength = (value: string) =>
  value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;

/** Alta: correo de inicio de sesión y contraseña obligatorios. */
export const staffMemberCreateSchema = z.object({
  ...staffMemberBaseShape,
  email: z.string().trim().min(1, "emailRequired").email("emailInvalid"),
  password: z
    .string()
    .min(1, "passwordRequired")
    .refine(isValidPasswordLength, "passwordLength"),
});

/**
 * Edición: el correo no se edita aquí y la contraseña es opcional (vacía = no
 * se cambia); si se escribe, debe cumplir la longitud del backend.
 */
export const staffMemberEditSchema = z.object({
  ...staffMemberBaseShape,
  email: z.string(),
  password: z
    .string()
    .refine(
      (value) => !value || isValidPasswordLength(value),
      "passwordLength",
    ),
});

export type StaffMemberFormValues = z.infer<typeof staffMemberCreateSchema>;

export const EMPTY_STAFF_MEMBER_FORM_VALUES: StaffMemberFormValues = {
  employee_number: "",
  hire_date: "",
  email: "",
  password: "",
};
