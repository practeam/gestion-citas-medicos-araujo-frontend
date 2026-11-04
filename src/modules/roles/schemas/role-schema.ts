import { z } from "zod";

export const ROLE_NAME_MAX_LENGTH = 80;

/**
 * Los mensajes son claves relativas a `roles.validation` (i18n); el formulario
 * las traduce. El recorte de espacios se aplica al construir el payload.
 */
export const roleFormSchema = z.object({
  name: z
    .string()
    .refine((value) => value.trim().length > 0, "nameRequired")
    .refine(
      (value) => value.trim().length <= ROLE_NAME_MAX_LENGTH,
      "nameTooLong",
    ),
  description: z.string(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
