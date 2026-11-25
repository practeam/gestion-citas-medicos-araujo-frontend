import { z } from "zod";

export const SPECIAL_CONDITION_NAME_MAX_LENGTH = 120;

/**
 * Los mensajes son claves relativas a `specialConditions.validation` (i18n); el formulario
 * las traduce. El recorte de espacios se aplica al construir el payload.
 */
export const specialConditionFormSchema = z.object({
  name: z
    .string()
    .refine((value) => value.trim().length > 0, "nameRequired")
    .refine(
      (value) => value.trim().length <= SPECIAL_CONDITION_NAME_MAX_LENGTH,
      "nameTooLong",
    ),
  description: z.string(),
});

export type SpecialConditionFormValues = z.infer<
  typeof specialConditionFormSchema
>;
