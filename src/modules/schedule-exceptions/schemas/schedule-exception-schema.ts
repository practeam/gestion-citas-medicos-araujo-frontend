import { z } from "zod";
import {
  EXCEPTION_TYPES,
  type TargetType,
} from "../types/schedule-exception.types";
import { isValidLocalDateTime } from "../utils/schedule-exception-datetime.utils";

/**
 * Los mensajes son claves relativas a `scheduleExceptions.validation` (i18n).
 * El objetivo es excluyente: `targetType` indica cuál de los dos identificadores
 * se envía y `targetId` debe estar informado. El backend es la autoridad final.
 */
export const scheduleExceptionFormSchema = z
  .object({
    targetType: z.enum(["clinic", "staff"]),
    /** Id del objetivo elegido (`null` hasta que se elige). */
    targetId: z.number().int().positive().nullable(),
    exceptionType: z.enum(EXCEPTION_TYPES, {
      message: "typeInvalid",
    }),
    reason: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
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

export type ScheduleExceptionFormValues = z.infer<
  typeof scheduleExceptionFormSchema
>;

export const EMPTY_SCHEDULE_EXCEPTION_VALUES: ScheduleExceptionFormValues = {
  targetType: "clinic" satisfies TargetType,
  targetId: null,
  exceptionType: "closure",
  reason: "",
  startsAt: "",
  endsAt: "",
};
