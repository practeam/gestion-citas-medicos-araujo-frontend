import { z } from "zod";

export const PERSON_NAME_MAX_LENGTH = 100;
export const PERSON_DOCUMENT_MAX_LENGTH = 30;
export const PERSON_PHONE_MAX_LENGTH = 30;
export const PERSON_ADDRESS_MAX_LENGTH = 255;

const DOCUMENT_TYPE_PATTERN = /^[A-Za-z0-9_]+$/;
/** Mismo patrón que el backend; además se exigen entre 6 y 15 dígitos. */
const PHONE_PATTERN = /^\+?\(?[0-9][0-9\s().-]*$/;
const PHONE_MIN_DIGITS = 6;
const PHONE_MAX_DIGITS = 15;
const emailSchema = z.string().email();

export function normalizeDocumentType(value: string) {
  return value.trim().toUpperCase();
}

/** Sin espacios y en mayúsculas, como normaliza el backend. */
export function normalizeDocumentNumber(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** Fecha local de hoy como `YYYY-MM-DD` (para `max` y comparación). */
export function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const optionalText = (max: number, tooLong: string) =>
  z.string().refine((value) => value.trim().length <= max, tooLong);

const requiredName = (required: string, tooLong: string) =>
  z
    .string()
    .refine((value) => value.trim().length > 0, required)
    .refine((value) => value.trim().length <= PERSON_NAME_MAX_LENGTH, tooLong);

/**
 * Los mensajes son claves relativas a `persons.validation` (i18n). Se valida el
 * valor recortado; la unicidad del documento la decide el backend.
 */
export const personFormSchema = z
  .object({
    first_name: requiredName("firstNameRequired", "nameTooLong"),
    last_name: requiredName("lastNameRequired", "nameTooLong"),
    maternal_last_name: optionalText(PERSON_NAME_MAX_LENGTH, "nameTooLong"),
    document_type: z.string().refine((value) => {
      const type = value.trim();
      return (
        !type ||
        (type.length <= PERSON_DOCUMENT_MAX_LENGTH &&
          DOCUMENT_TYPE_PATTERN.test(type))
      );
    }, "documentTypeInvalid"),
    document_number: z
      .string()
      .refine(
        (value) =>
          normalizeDocumentNumber(value).length <= PERSON_DOCUMENT_MAX_LENGTH,
        "documentNumberTooLong",
      ),
    birth_date: z.string().refine((value) => {
      if (!value) return true;
      const isDate =
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
      return isDate && value <= todayIsoDate();
    }, "birthDateInvalid"),
    phone: z.string().refine((value) => {
      const phone = value.trim();
      if (!phone) return true;
      const digits = phone.replace(/\D/g, "").length;
      return (
        phone.length <= PERSON_PHONE_MAX_LENGTH &&
        PHONE_PATTERN.test(phone) &&
        digits >= PHONE_MIN_DIGITS &&
        digits <= PHONE_MAX_DIGITS
      );
    }, "phoneInvalid"),
    email: z.string().refine((value) => {
      const email = value.trim();
      return !email || emailSchema.safeParse(email).success;
    }, "emailInvalid"),
    address: optionalText(PERSON_ADDRESS_MAX_LENGTH, "addressTooLong"),
  })
  .superRefine((values, ctx) => {
    // Tipo y número de documento: ambos o ninguno.
    const hasType = values.document_type.trim() !== "";
    const hasNumber = normalizeDocumentNumber(values.document_number) !== "";
    if (hasType && !hasNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["document_number"],
        message: "documentNumberRequired",
      });
    } else if (hasNumber && !hasType) {
      ctx.addIssue({
        code: "custom",
        path: ["document_type"],
        message: "documentTypeRequired",
      });
    }
  });

export type PersonFormValues = z.infer<typeof personFormSchema>;

export const EMPTY_PERSON_FORM_VALUES: PersonFormValues = {
  first_name: "",
  last_name: "",
  maternal_last_name: "",
  document_type: "",
  document_number: "",
  birth_date: "",
  phone: "",
  email: "",
  address: "",
};
