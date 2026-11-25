import { useTranslations } from "@/i18n";
import { cn } from "@/utils";
import type { EventDisplayInfo } from "@fullcalendar/react";
import type { AppointmentStatus } from "../types/appointment.types";
import { EVENT_STYLES } from "../utils/appointment-status-styles";

export interface AppointmentEventProps {
  status: AppointmentStatus;
  patientLabel: string;
  staffLabel: string;
  /** Hora de inicio y fin ya formateadas (zona de la aplicación). */
  timeRange: string;
}

/**
 * Representación de una cita en el calendario: paciente, trabajador, horario y
 * etiqueta de estado (el color no es el único indicador).
 */
export function AppointmentCalendarEvent({
  eventInfo,
}: {
  eventInfo: EventDisplayInfo;
}) {
  const t = useTranslations("appointments.status");
  const { status, patientLabel, staffLabel, timeRange } = eventInfo.event
    .extendedProps as AppointmentEventProps;
  const styles = EVENT_STYLES[status] ?? EVENT_STYLES.pending;
  const isMonth = eventInfo.view.type.startsWith("dayGrid");

  return (
    <div
      className={cn(
        "flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-md px-1.5 py-1 text-start text-xs",
        styles.container,
      )}
      title={`${patientLabel} · ${staffLabel} · ${timeRange} · ${t(status)}`}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />
        <span className={cn("truncate font-semibold", styles.text)}>
          {patientLabel}
        </span>
      </div>
      <div className={cn("truncate", styles.text)}>
        {timeRange} · {t(status)}
      </div>
      {!isMonth && (
        <div className={cn("truncate opacity-80", styles.text)}>
          {staffLabel}
        </div>
      )}
    </div>
  );
}
