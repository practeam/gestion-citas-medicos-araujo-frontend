import { z } from "zod";
import { isValidDate, isValidTime } from "../utils/appointment-datetime.utils";

/**
 * Los mensajes son claves relativas a `appointments.validation` (i18n). Fecha
 * y horas son "hora de pared" en la zona de la aplicación; se convierten a
 * instantes con desplazamiento al enviar. El backend es la autoridad final.
 */
export const appointmentFormSchema = z
  .object({
    patientId: z.number().int().positive().nullable(),
    staffMemberId: z.number().int().positive().nullable(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    reason: z.string(),
  })
  .superRefine((values, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (values.patientId === null) issue("patientId", "patientRequired");
    if (values.staffMemberId === null) issue("staffMemberId", "staffRequired");

    if (!values.date) issue("date", "dateRequired");
    else if (!isValidDate(values.date)) issue("date", "dateInvalid");

    if (!values.startTime) issue("startTime", "startRequired");
    else if (!isValidTime(values.startTime)) issue("startTime", "timeInvalid");

    if (!values.endTime) issue("endTime", "endRequired");
    else if (!isValidTime(values.endTime)) issue("endTime", "timeInvalid");

    // Duración positiva (mismo día): HH:mm se compara como texto.
    if (
      isValidTime(values.startTime) &&
      isValidTime(values.endTime) &&
      values.endTime <= values.startTime
    ) {
      issue("endTime", "intervalOrder");
    }
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const EMPTY_APPOINTMENT_VALUES: AppointmentFormValues = {
  patientId: null,
  staffMemberId: null,
  date: "",
  startTime: "",
  endTime: "",
  reason: "",
};
