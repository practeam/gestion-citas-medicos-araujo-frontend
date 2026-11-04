import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { isRtl } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";
import type {
  DatesSetInfo,
  DateSelectInfo,
  EventClickInfo,
  EventDisplayInfo,
} from "@fullcalendar/react";
import FullCalendar, { type CalendarRef } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/classic";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { useMemo, useRef, useState } from "react";
import type { VisibleRange } from "../hooks/use-appointments";
import type { Appointment } from "../types/appointment.types";
import {
  calendarDateToString,
  calendarDateToTime,
  formatTimeOnly,
  toCalendarDate,
  todayInAppZone,
} from "../utils/appointment-datetime.utils";
import {
  CALENDAR_VIEWS,
  type CalendarView,
} from "../utils/appointment-calendar-views";
import {
  AppointmentCalendarEvent,
  type AppointmentEventProps,
} from "./appointment-calendar-event";

const VIEW_LABEL_KEYS: Record<CalendarView, "day" | "week" | "month"> = {
  timeGridDay: "day",
  timeGridWeek: "week",
  dayGridMonth: "month",
};

/** Fecha y hora (de pared) que el usuario eligió en el calendario para crear una cita. */
export interface CalendarSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface AppointmentsCalendarProps {
  appointments: Appointment[] | undefined;
  patientLabels: Record<number, string>;
  staffLabels: Record<number, string>;
  isLoading: boolean;
  onRangeChange: (range: VisibleRange) => void;
  onSelectAppointment: (appointmentId: number) => void;
  onSelectSlot: (slot: CalendarSlot) => void;
}

/**
 * Calendario de la agenda (FullCalendar, ya incluido en el proyecto). Se
 * configura con `timeZone="UTC"` y las citas se entregan como hora de pared de
 * `APP_TIMEZONE`, de modo que no hay conversiones dobles con la zona del
 * navegador. Los controles de navegación y vista son propios (traducidos).
 */
export function AppointmentsCalendar({
  appointments,
  patientLabels,
  staffLabels,
  isLoading,
  onRangeChange,
  onSelectAppointment,
  onSelectSlot,
}: AppointmentsCalendarProps) {
  const t = useTranslations("appointments.calendar");
  const locale = useLocale();
  const rtl = isRtl(locale as Locale);
  const calendarRef = useRef<CalendarRef>(null);
  const [view, setView] = useState<CalendarView>("timeGridWeek");
  const [title, setTitle] = useState("");
  const [currentDate, setCurrentDate] = useState(todayInAppZone());

  const events = useMemo(
    () =>
      (appointments ?? []).flatMap((appointment) => {
        const start = toCalendarDate(appointment.starts_at);
        const end = toCalendarDate(appointment.ends_at);
        if (!start || !end) return [];
        const extendedProps: AppointmentEventProps = {
          status: appointment.status,
          patientLabel:
            patientLabels[appointment.patient_id] ??
            `#${appointment.patient_id}`,
          staffLabel:
            staffLabels[appointment.staff_member_id] ??
            `#${appointment.staff_member_id}`,
          timeRange: `${formatTimeOnly(appointment.starts_at, locale)} – ${formatTimeOnly(appointment.ends_at, locale)}`,
        };
        return [
          {
            id: String(appointment.id),
            start,
            end,
            // Evita que FullCalendar arrastre o redimensione: la
            // reprogramación se hace con el modal de edición.
            editable: false,
            extendedProps,
          },
        ];
      }),
    [appointments, patientLabels, staffLabels, locale],
  );

  const api = () => calendarRef.current?.getApi();

  const handleDatesSet = (info: DatesSetInfo) => {
    setTitle(info.view.title);
    setCurrentDate(calendarDateToString(info.view.currentStart));
    onRangeChange({
      startDate: calendarDateToString(info.start),
      endDate: calendarDateToString(info.end),
    });
  };

  const handleSelect = (info: DateSelectInfo) => {
    api()?.unselect();
    onSelectSlot({
      date: calendarDateToString(info.start),
      // En la vista mensual se elige un día completo: sin horas predefinidas.
      startTime: info.allDay ? "" : calendarDateToTime(info.start),
      endTime: info.allDay ? "" : calendarDateToTime(info.end),
    });
  };

  const handleEventClick = (info: EventClickInfo) => {
    info.jsEvent?.preventDefault();
    onSelectAppointment(Number(info.event.id));
  };

  const changeView = (next: CalendarView) => {
    setView(next);
    api()?.changeView(next);
  };

  const goToDate = (value: string) => {
    if (value) api()?.gotoDate(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={t("previous")}
            onClick={() => api()?.prev()}
          >
            <span aria-hidden className="rtl:rotate-180">
              ‹
            </span>
            <span className="sr-only">{t("previous")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={t("next")}
            onClick={() => api()?.next()}
          >
            <span aria-hidden className="rtl:rotate-180">
              ›
            </span>
            <span className="sr-only">{t("next")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => api()?.gotoDate(todayInAppZone())}
          >
            {t("today")}
          </Button>
          <Input
            type="date"
            value={currentDate}
            aria-label={t("goToDate")}
            className="h-9 w-40"
            onChange={(event) => goToDate(event.target.value)}
          />
        </div>

        <h3 className="order-first w-full text-base font-semibold text-gray-800 sm:order-none sm:w-auto sm:text-lg dark:text-white/90">
          {title}
        </h3>

        <div
          className="flex items-center gap-2"
          role="group"
          aria-label={t("viewLabel")}
        >
          {CALENDAR_VIEWS.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={view === option ? "default" : "outline"}
              aria-pressed={view === option}
              onClick={() => changeView(option)}
            >
              {t(`views.${VIEW_LABEL_KEYS[option]}`)}
            </Button>
          ))}
        </div>
      </div>

      <div
        className="relative"
        aria-busy={isLoading}
        data-loading={isLoading || undefined}
      >
        {isLoading && (
          <div className="absolute inset-s-0 top-0 z-10 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs text-gray-500 shadow-theme-sm dark:bg-gray-900/90 dark:text-gray-400">
            <Spinner />
            {t("loading")}
          </div>
        )}
        <FullCalendar
          key={rtl ? "rtl" : "ltr"}
          ref={calendarRef}
          plugins={[
            themePlugin,
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}
          initialView={view}
          initialDate={currentDate}
          locale={locale}
          direction={rtl ? "rtl" : "ltr"}
          timeZone="UTC"
          headerToolbar={false}
          height={view === "dayGridMonth" ? "auto" : 680}
          allDaySlot={false}
          nowIndicator={false}
          slotDuration="00:30:00"
          scrollTime="07:00:00"
          dayMaxEvents={3}
          selectable={true}
          selectMirror={true}
          events={events}
          datesSet={handleDatesSet}
          select={handleSelect}
          eventClick={handleEventClick}
          eventClass="focus:shadow-none"
          columnEventClass="bg-transparent! border-0! p-0.5! shadow-none! hover:shadow-none! focus:outline-none"
          columnEventInnerClass="p-0! border-0! bg-transparent! h-full"
          rowEventClass="bg-transparent! border-0! px-0.5! py-0.5! shadow-none! hover:shadow-none! focus:outline-none"
          rowEventInnerClass="p-0! border-0! bg-transparent!"
          eventContent={(eventInfo: EventDisplayInfo) => (
            <AppointmentCalendarEvent eventInfo={eventInfo} />
          )}
        />
      </div>
    </div>
  );
}
