import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import {
  DASHBOARD_PERIODS,
  type DashboardPeriodKey,
} from "../types/dashboard.types";
import { validateCustomRange } from "../utils/dashboard-period.utils";

interface DashboardPeriodSelectorProps {
  period: DashboardPeriodKey;
  startDate: string;
  endDate: string;
  onPeriodChange: (period: DashboardPeriodKey) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function DashboardPeriodSelector({
  period,
  startDate,
  endDate,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
}: DashboardPeriodSelectorProps) {
  const t = useTranslations("dashboard.period");
  const isCustom = period === "custom";
  const rangeError = isCustom ? validateCustomRange(startDate, endDate) : null;
  const invalid = rangeError === "order";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={period}
          onValueChange={(value) => onPeriodChange(value as DashboardPeriodKey)}
        >
          <SelectTrigger className="sm:w-56" aria-label={t("label")}>
            <SelectValue>
              {(value: string) => t(`options.${value}`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DASHBOARD_PERIODS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`options.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isCustom && (
          <>
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => onStartDateChange(event.target.value)}
              aria-label={t("startDate")}
              aria-invalid={invalid ? "true" : undefined}
              className="sm:w-44"
            />
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => onEndDateChange(event.target.value)}
              aria-label={t("endDate")}
              aria-invalid={invalid ? "true" : undefined}
              className="sm:w-44"
            />
          </>
        )}
      </div>
      {rangeError && (
        <p
          role={invalid ? "alert" : undefined}
          className={
            invalid
              ? "text-xs text-red-600 dark:text-red-400"
              : "text-xs text-gray-500 dark:text-gray-400"
          }
        >
          {t(`errors.${rangeError}`)}
        </p>
      )}
    </div>
  );
}
