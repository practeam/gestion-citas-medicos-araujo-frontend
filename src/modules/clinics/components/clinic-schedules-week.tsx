import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { useClinicSchedules } from "../hooks/use-clinic-schedules";
import { formatDate } from "../utils/clinic-date.utils";
import { WEEK_DAYS, normalizeTime } from "../utils/clinic-schedule.utils";
import { ClinicScheduleStatusBadge } from "./clinic-schedule-status-badge";

/**
 * Horarios semanales de una clínica organizados por día (solo lectura), con la
 * vigencia de cada intervalo y su estado. Son horas locales de la clínica.
 */
export function ClinicSchedulesWeek({ clinicId }: { clinicId: number }) {
  const t = useTranslations("clinics.schedules");
  const locale = useLocale();
  const { schedules, total, error, isLoading, reload } =
    useClinicSchedules(clinicId);

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>{t("loadError")}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={reload}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (isLoading || !schedules) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t("empty")}</p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
        {WEEK_DAYS.map((day) => {
          const intervals = schedules
            .filter((schedule) => schedule.day_of_week === day)
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
          return (
            <li
              key={day}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[9rem_1fr]"
            >
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {t(`days.${day}`)}
              </p>
              {intervals.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {t("noIntervals")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {intervals.map((schedule) => (
                    <li
                      key={schedule.id}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${schedule.is_active ? "" : "opacity-60"}`}
                    >
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {normalizeTime(schedule.starts_at)}–
                        {normalizeTime(schedule.ends_at)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {schedule.valid_until
                          ? t("validity", {
                              from: formatDate(schedule.valid_from, locale),
                              until: formatDate(schedule.valid_until, locale),
                            })
                          : t("validityOpen", {
                              from: formatDate(schedule.valid_from, locale),
                            })}
                      </span>
                      <ClinicScheduleStatusBadge
                        isActive={schedule.is_active}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      {total > schedules.length && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("partialList", { shown: schedules.length, total })}
        </p>
      )}
    </div>
  );
}
