import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
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
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
        {lines.map((line) => {
          const detail = line.saved!;
          return (
            <li key={line.key} className="space-y-1 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
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
              <p className="text-gray-600 dark:text-gray-300">
                {t("readOnlyLine", {
                  quantity: detail.quantity,
                  unitPrice: detail.unit_price,
                  duration: detail.duration_minutes,
                  amount: detail.line_amount,
                })}
              </p>
              {detail.notes && (
                <p className="text-xs whitespace-pre-line text-gray-500 dark:text-gray-400">
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
