import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale, useTranslations } from "@/i18n";
import { CalendarIcon, ClockIcon, UserIcon, UsersIcon } from "@/icons";
import type { ReactNode } from "react";
import type { DashboardCards } from "../types/dashboard.types";

interface DashboardCardsGridProps {
  /** `undefined` mientras carga o si hubo un error. */
  cards?: DashboardCards;
  isLoading: boolean;
}

function MetricCard({
  icon,
  title,
  description,
  value,
  isLoading,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  value?: string;
  isLoading: boolean;
}) {
  return (
    <Card>
      <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90 [&>svg]:size-6">
        {icon}
      </div>
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-24 bg-gray-200 dark:bg-gray-800" />
        ) : (
          <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
            {value ?? "—"}
          </h4>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Card>
  );
}

export function DashboardCardsGrid({
  cards,
  isLoading,
}: DashboardCardsGridProps) {
  const t = useTranslations("dashboard.cards");
  const locale = useLocale();
  const format = (value?: number) =>
    value === undefined
      ? undefined
      : new Intl.NumberFormat(locale).format(value);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      <MetricCard
        icon={<UsersIcon />}
        title={t("totalPatients.title")}
        description={t("totalPatients.description")}
        value={format(cards?.total_patients)}
        isLoading={isLoading}
      />
      <MetricCard
        icon={<UserIcon />}
        title={t("newPatients.title")}
        description={t("newPatients.description")}
        value={format(cards?.new_patients)}
        isLoading={isLoading}
      />
      <MetricCard
        icon={<CalendarIcon />}
        title={t("totalAppointments.title")}
        description={t("totalAppointments.description")}
        value={format(cards?.total_appointments)}
        isLoading={isLoading}
      />
      <MetricCard
        icon={<ClockIcon />}
        title={t("appointmentsToday.title")}
        description={t("appointmentsToday.description")}
        value={format(cards?.appointments_today)}
        isLoading={isLoading}
      />
    </div>
  );
}
