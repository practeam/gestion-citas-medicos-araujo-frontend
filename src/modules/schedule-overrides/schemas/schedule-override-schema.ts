import { z } from "zod";
import { isValidLocalDateTime } from "../utils/schedule-override-datetime.utils";

/**
 * Los mensajes son claves relativas a `scheduleOverrides.validation` (i18n).
 * El objetivo es excluyente: `targetType` indica cuál de los dos identificadores
 * se envía y `targetId` debe estar informado (en edición el objetivo no cambia).
 * El backend es la autoridad final.
 */
export const scheduleOverrideFormSchema = z
  .object({
    targetType: z.enum(["clinic", "staff"]),
    /** Id del objetivo elegido (`null` hasta que se elige). */
    targetId: z.number().int().positive().nullable(),
    reason: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    /** Estado inicial al crear; en edición se gestiona con la acción de estado. */
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.targetId === null) {
      ctx.addIssue({
        code: "custom",
        path: ["targetId"],
        message: "targetRequired",
      });
    }
    if (!values.startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "startsRequired",
      });
    } else if (!isValidLocalDateTime(values.startsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "dateTimeInvalid",
      });
    }
    if (!values.endsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "endsRequired",
      });
    } else if (!isValidLocalDateTime(values.endsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "dateTimeInvalid",
      });
    }
    // Sin duración cero ni intervalos invertidos.
    if (
      isValidLocalDateTime(values.startsAt) &&
      isValidLocalDateTime(values.endsAt) &&
      new Date(values.endsAt).getTime() <= new Date(values.startsAt).getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "intervalOrder",
      });
    }
  });

export type ScheduleOverrideFormValues = z.infer<
  typeof scheduleOverrideFormSchema
>;

export const EMPTY_SCHEDULE_OVERRIDE_VALUES: ScheduleOverrideFormValues = {
  targetType: "clinic",
  targetId: null,
  reason: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};
