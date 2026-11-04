import { z } from "zod";

export const SPECIALTY_NAME_MAX_LENGTH = 120;

/**
 * Los mensajes son claves relativas a `specialties.validation` (i18n); el formulario
 * las traduce. El recorte de espacios se aplica al construir el payload.
 */
export const specialtyFormSchema = z.object({
  name: z
    .string()
    .refine((value) => value.trim().length > 0, "nameRequired")
    .refine(
      (value) => value.trim().length <= SPECIALTY_NAME_MAX_LENGTH,
      "nameTooLong",
    ),
  description: z.string(),
});

export type SpecialtyFormValues = z.infer<typeof specialtyFormSchema>;
