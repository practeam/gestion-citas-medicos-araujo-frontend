import { z } from "zod";

export const PERMISSION_NAME_MAX_LENGTH = 120;
export const PERMISSION_NAME_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

/**
 * Los mensajes son claves relativas a `permissions.validation` (i18n). El
 * nombre se valida ya recortado; la unicidad la valida el backend.
 */
export const permissionCreateSchema = z.object({
  name: z
    .string()
    .refine((value) => value.trim().length > 0, "nameRequired")
    .refine(
      (value) => value.trim().length <= PERMISSION_NAME_MAX_LENGTH,
      "nameTooLong",
    )
    .refine(
      (value) => PERMISSION_NAME_PATTERN.test(value.trim()),
      "nameInvalid",
    ),
  description: z.string(),
});

/** En edición el nombre es de solo lectura y no se valida. */
export const permissionEditSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type PermissionFormValues = z.infer<typeof permissionCreateSchema>;
