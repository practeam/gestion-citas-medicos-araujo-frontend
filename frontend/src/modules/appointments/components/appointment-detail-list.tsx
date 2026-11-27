import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { ClockIcon, DollarIcon, TaskIcon } from "@/icons";
import { useAppointmentDetails } from "../hooks/use-appointment-details";
import {
  fallbackProcedureInfo,
  useProcedureInfo,
} from "../hooks/use-procedure-info";
import type { Appointment } from "../types/appointment.types";
import {
  createLine,
  getReservedMinutes,
  summarizeLines,
} from "../utils/appointment-lines.utils";
import { fromIso } from "../utils/appointment-datetime.utils";
import { AppointmentProcedureSummary } from "./appointment-procedure-summary";

/**
 * Procedimientos asociados a una cita, en solo lectura, con los precios y
 * duraciones **históricos** guardados por el backend (no se recalculan con el
 * catálogo actual). Los procedimientos inactivos siguen visibles.
 */
export function AppointmentDetailList({
  appointment,
}: {
  appointment: Appointment;
}) {
  const t = useTranslations("appointments.procedures");
  const { details, error, isLoading, reload } = useAppointmentDetails(
    appointment.id,
  );
  const { procedures, isLoading: isLoadingProcedures } = useProcedureInfo(
    (details ?? []).map((detail) => detail.procedure_id),
  );

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>{t("loadDetailsError")}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={reload}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (isLoading || !details || isLoadingProcedures) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loadingDetails")}
      </div>
    );
  }

  if (details.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("noDetails")}
      </p>
    );
  }

  const lines = details.map((detail) =>
    createLine(
      procedures[detail.procedure_id] ??
        fallbackProcedureInfo(detail.procedure_id),
      detail,
    ),
  );
  const start = fromIso(appointment.starts_at);
  const end = fromIso(appointment.ends_at);
  const reserved =
    start && end && start.date === end.date
      ? getReservedMinutes(start.time, end.time)
      : null;

  return (
    <div className="space-y-4">
      <ul className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto pe-1">
        {lines.map((line) => {
          const detail = line.saved!;
          return (
            <li
              key={line.key}
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-white/3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {line.procedure.code ? `${line.procedure.code} · ` : ""}
                  {line.procedure.name}
                </span>
                {!line.procedure.isActive && (
                  <Badge size="sm" color="gray">
                    {t("inactive")}
                  </Badge>
                )}
              </div>
              <div className="mt-3 grid overflow-hidden rounded-lg border border-gray-100 sm:grid-cols-4 dark:border-gray-800">
                <div className="border-b border-gray-100 p-3 sm:border-e sm:border-b-0 dark:border-gray-800">
                  <TaskIcon className="size-4 fill-current text-blue-500" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("quantity")}
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-white/90">
                    {detail.quantity}
                  </p>
                </div>
                <div className="border-b border-gray-100 p-3 sm:border-e sm:border-b-0 dark:border-gray-800">
                  <DollarIcon className="size-4 fill-current text-green-500" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("unitPrice")}
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-white/90">
                    {detail.unit_price}
                  </p>
                </div>
                <div className="border-b border-gray-100 p-3 sm:border-e sm:border-b-0 dark:border-gray-800">
                  <ClockIcon className="size-4 fill-current text-purple-500" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("duration")}
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-white/90">
                    {t("minutes", { count: detail.duration_minutes })}
                  </p>
                </div>
                <div className="p-3">
                  <DollarIcon className="size-4 fill-current text-amber-500" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("amount")}
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-white/90">
                    {detail.line_amount}
                  </p>
                </div>
              </div>
              {detail.notes && (
                <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs whitespace-pre-line text-gray-500 dark:bg-white/3 dark:text-gray-400">
                  {t("notes")}: {detail.notes}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <AppointmentProcedureSummary
        summary={summarizeLines(lines)}
        reservedMinutes={reserved}
      />
    </div>
  );
}
