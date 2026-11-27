import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import {
  getLineDuration,
  type AppointmentLine,
  type LinesSummary,
} from "../utils/appointment-lines.utils";

interface AppointmentProcedureSummaryProps {
  summary: LinesSummary;
  /** LÃ­neas activas para mostrar un detalle compacto dentro del resumen. */
  lines?: AppointmentLine[];
  /** Minutos reservados por la cita; `null` si no se conoce. */
  reservedMinutes: number | null;
  /** Si se omite, no se ofrece ajustar la hora de fin (solo lectura). */
  onAdjustEnd?: (requiredMinutes: number) => void;
  disabled?: boolean;
}

/**
 * Resumen derivado: cantidad de procedimientos, duración requerida, importe
 * total estimado y comparación con la duración reservada. Estos valores no se
 * persisten ni se envían; el backend calcula los definitivos.
 */
export function AppointmentProcedureSummary({
  summary,
  lines,
  reservedMinutes,
  onAdjustEnd,
  disabled = false,
}: AppointmentProcedureSummaryProps) {
  const t = useTranslations("appointments.procedures.summary");
  const insufficient =
    reservedMinutes !== null && summary.totalDuration > reservedMinutes;

  return (
    <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-white/3">
      <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </h5>
      <dl className="grid overflow-hidden rounded-lg border border-gray-200 bg-white text-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800 dark:bg-white/3">
        <div className="border-b border-gray-200 px-4 py-3 sm:border-e lg:border-b-0 dark:border-gray-800">
          <dt className="text-xs text-gray-500 dark:text-gray-400">
            {t("count")}
          </dt>
          <dd className="text-gray-800 dark:text-white/90">{summary.count}</dd>
        </div>
        <div className="border-b border-gray-200 px-4 py-3 lg:border-e lg:border-b-0 dark:border-gray-800">
          <dt className="text-xs text-gray-500 dark:text-gray-400">
            {t("requiredDuration")}
          </dt>
          <dd className="text-gray-800 dark:text-white/90">
            {t("minutes", { count: Math.ceil(summary.totalDuration) })}
          </dd>
        </div>
        <div className="border-b border-gray-200 px-4 py-3 sm:border-e sm:border-b-0 dark:border-gray-800">
          <dt className="text-xs text-gray-500 dark:text-gray-400">
            {t("reservedDuration")}
          </dt>
          <dd className="text-gray-800 dark:text-white/90">
            {reservedMinutes === null
              ? t("unknown")
              : t("minutes", { count: reservedMinutes })}
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-gray-500 dark:text-gray-400">
            {t("totalAmount")}
          </dt>
          <dd className="text-lg font-bold text-gray-900 dark:text-white">
            {summary.totalAmount}
          </dd>
        </div>
      </dl>
      {lines && lines.length > 0 && (
        <div className="space-y-2">
          {lines.map((line) => {
            const duration = getLineDuration(line);
            return (
              <div
                key={line.key}
                className="grid gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-6 dark:border-gray-800 dark:bg-white/3"
              >
                <p className="min-w-0 truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {line.procedure.name}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("price")}: {line.unitPrice || t("unknown")}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("time")}:{" "}
                  {duration === null
                    ? t("unknown")
                    : t("minutes", { count: Math.ceil(duration) })}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {(summary.hasEstimates || summary.incomplete) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {summary.incomplete ? t("incomplete") : t("estimateNote")}
        </p>
      )}
      {insufficient && (
        <Alert variant="warning">
          <AlertDescription>
            <p>
              {t("insufficient", {
                required: Math.ceil(summary.totalDuration),
                reserved: reservedMinutes,
              })}
            </p>
            {onAdjustEnd && (
              <Button
                type="button"
                size="xs"
                variant="outline"
                className="mt-2"
                disabled={disabled}
                onClick={() => onAdjustEnd(summary.totalDuration)}
              >
                {t("adjustEnd")}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
