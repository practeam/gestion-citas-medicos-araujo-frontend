import { z } from "zod";

export const CLINIC_NAME_MAX_LENGTH = 150;
export const CLINIC_ADDRESS_MAX_LENGTH = 255;
export const CLINIC_PHONE_MAX_LENGTH = 30;

/** Mismo patrón que el backend; además se exigen entre 6 y 15 dígitos. */
const PHONE_PATTERN = /^\+?\(?[0-9][0-9\s().-]*$/;
const PHONE_MIN_DIGITS = 6;
const PHONE_MAX_DIGITS = 15;

const emailSchema = z.string().email();

/**
 * Los mensajes son claves relativas a `clinics.validation` (i18n); el formulario
 * las traduce. Se valida el valor ya recortado; teléfono y correo son opcionales.
 */
export const clinicFormSchema = z.object({
  name: z
    .string()
    .refine((value) => value.trim().length > 0, "nameRequired")
    .refine(
      (value) => value.trim().length <= CLINIC_NAME_MAX_LENGTH,
      "nameTooLong",
    ),
  address: z
    .string()
    .refine((value) => value.trim().length > 0, "addressRequired")
    .refine(
      (value) => value.trim().length <= CLINIC_ADDRESS_MAX_LENGTH,
      "addressTooLong",
    ),
  description: z.string(),
  phone: z.string().refine((value) => {
    const phone = value.trim();
    if (!phone) return true;
    const digits = phone.replace(/\D/g, "").length;
    return (
      phone.length <= CLINIC_PHONE_MAX_LENGTH &&
      PHONE_PATTERN.test(phone) &&
      digits >= PHONE_MIN_DIGITS &&
      digits <= PHONE_MAX_DIGITS
    );
  }, "phoneInvalid"),
  email: z.string().refine((value) => {
    const email = value.trim();
    return !email || emailSchema.safeParse(email).success;
  }, "emailInvalid"),
});

export type ClinicFormValues = z.infer<typeof clinicFormSchema>;
