import { z } from "zod";
import { isValidPrice } from "../utils/procedure-price.utils";

export const PROCEDURE_NAME_MAX_LENGTH = 150;
export const PROCEDURE_CODE_MAX_LENGTH = 50;
const MAX_INT = 2147483647;

/**
 * Los mensajes son claves relativas a `procedures.validation` (i18n). Se valida
 * el valor ya recortado. El precio y la duración se editan como texto y se
 * convierten al enviar. La unicidad de nombre/código y la jerarquía las valida
 * el backend.
 */
export const procedureFormSchema = z
  .object({
    name: z.string(),
    code: z.string(),
    basePrice: z.string(),
    baseDurationMinutes: z.string(),
    description: z.string(),
    parentProcedureId: z.number().int().positive().nullable(),
  })
  .superRefine((values, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    const name = values.name.trim();
    if (!name) issue("name", "nameRequired");
    else if (name.length > PROCEDURE_NAME_MAX_LENGTH)
      issue("name", "nameTooLong");

    // Código opcional: vacío = sin código, pero no solo espacios.
    if (values.code !== "" && values.code.trim() === "")
      issue("code", "codeBlank");
    else if (values.code.trim().length > PROCEDURE_CODE_MAX_LENGTH)
      issue("code", "codeTooLong");

    const price = values.basePrice.trim();
    if (!price) issue("basePrice", "priceRequired");
    else if (!isValidPrice(price)) issue("basePrice", "priceInvalid");

    const duration = values.baseDurationMinutes.trim();
    if (!duration) issue("baseDurationMinutes", "durationRequired");
    else if (!/^\d+$/.test(duration) || Number(duration) <= 0)
      issue("baseDurationMinutes", "durationInvalid");
    else if (Number(duration) > MAX_INT)
      issue("baseDurationMinutes", "durationTooLarge");
  });

export type ProcedureFormValues = z.infer<typeof procedureFormSchema>;

export const EMPTY_PROCEDURE_VALUES: ProcedureFormValues = {
  name: "",
  code: "",
  basePrice: "",
  baseDurationMinutes: "",
  description: "",
  parentProcedureId: null,
};
