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

const metricStyles = {
  blue: {
    card: "hover:border-blue-300 dark:hover:border-blue-500/40",
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    accent: "bg-blue-500",
  },
  green: {
    card: "hover:border-green-300 dark:hover:border-green-500/40",
    icon: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    accent: "bg-green-500",
  },
  purple: {
    card: "hover:border-purple-300 dark:hover:border-purple-500/40",
    icon: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    accent: "bg-purple-500",
  },
  amber: {
    card: "hover:border-amber-300 dark:hover:border-amber-500/40",
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    accent: "bg-amber-500",
  },
} as const;

type MetricTone = keyof typeof metricStyles;

function MetricCard({
  icon,
  title,
  description,
  value,
  isLoading,
  tone,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  value?: string;
  isLoading: boolean;
  tone: MetricTone;
}) {
  const styles = metricStyles[tone];
  return (
    <Card
      className={`relative overflow-hidden transition-colors ${styles.card}`}
    >
      <span
        className={`absolute inset-y-0 start-0 w-1 ${styles.accent}`}
        aria-hidden="true"
      />
      <div className="flex items-center justify-between gap-4">
        <div
          className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${styles.icon} [&>svg]:size-8`}
        >
          {icon}
        </div>
        <div className="min-w-0 text-end">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="ms-auto mt-2 h-10 w-24 bg-gray-200 dark:bg-gray-800" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {value ?? "—"}
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
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
        tone="blue"
      />
      <MetricCard
        icon={<UserIcon />}
        title={t("newPatients.title")}
        description={t("newPatients.description")}
        value={format(cards?.new_patients)}
        isLoading={isLoading}
        tone="green"
      />
      <MetricCard
        icon={<CalendarIcon />}
        title={t("totalAppointments.title")}
        description={t("totalAppointments.description")}
        value={format(cards?.total_appointments)}
        isLoading={isLoading}
        tone="purple"
      />
      <MetricCard
        icon={<ClockIcon />}
        title={t("appointmentsToday.title")}
        description={t("appointmentsToday.description")}
        value={format(cards?.appointments_today)}
        isLoading={isLoading}
        tone="amber"
      />
    </div>
  );
}
