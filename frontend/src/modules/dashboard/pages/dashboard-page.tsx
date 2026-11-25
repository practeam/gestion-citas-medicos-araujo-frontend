import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { isApiError } from "@/services/api";
import { useMemo, useState } from "react";
import { DashboardCardsGrid } from "../components/dashboard-cards";
import { DashboardChartCard } from "../components/dashboard-chart-card";
import { DashboardPeriodSelector } from "../components/dashboard-period-selector";
import { DashboardSeriesChart } from "../components/dashboard-series-chart";
import { DashboardStatusChart } from "../components/dashboard-status-chart";
import { useDashboard } from "../hooks/use-dashboard";
import type { DashboardPeriodKey } from "../types/dashboard.types";
import { hasData, hasStatusData } from "../utils/dashboard-chart.utils";
import { buildDashboardParams } from "../utils/dashboard-period.utils";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCharts = useTranslations("dashboard.charts");
  const tStates = useTranslations("dashboard.states");

  const [period, setPeriod] = useState<DashboardPeriodKey>("current_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const params = useMemo(
    () => buildDashboardParams(period, startDate, endDate),
    [period, startDate, endDate],
  );
  const { data, error, isLoading, reload } = useDashboard(params);

  // Rango personalizado incompleto o inválido: no hay datos de ese periodo.
  const loading = isLoading || params === null;
  const hasError = error !== undefined;
  const granularity = data?.period.granularity ?? "day";
  const ready = !loading && !hasError && data !== undefined;

  const errorMessage = !isApiError(error)
    ? tStates("error")
    : error.status === 403
      ? tStates("forbidden")
      : error.kind === "network"
        ? tStates("network")
        : tStates("error");

  const frame = { isLoading: loading, hasError, onRetry: reload };

  return (
    <div>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-title-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>
        <DashboardPeriodSelector
          period={period}
          startDate={startDate}
          endDate={endDate}
          onPeriodChange={setPeriod}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {hasError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {errorMessage}
            <Button variant="outline" size="xs" onClick={reload}>
              {tStates("retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 md:space-y-6">
        <DashboardCardsGrid cards={data?.cards} isLoading={loading} />

        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
          <DashboardChartCard
            title={tCharts("appointmentsEvolution.title")}
            description={tCharts("appointmentsEvolution.description")}
            isEmpty={ready && !hasData(data.appointments_evolution)}
            {...frame}
          >
            {data && (
              <DashboardSeriesChart
                type="line"
                points={data.appointments_evolution}
                granularity={granularity}
                seriesName={tCharts("appointmentsEvolution.series")}
                color="#465FFF"
              />
            )}
          </DashboardChartCard>

          <DashboardChartCard
            title={tCharts("patientsEvolution.title")}
            description={tCharts("patientsEvolution.description")}
            isEmpty={ready && !hasData(data.patients_evolution)}
            {...frame}
          >
            {data && (
              <DashboardSeriesChart
                type="line"
                points={data.patients_evolution}
                granularity={granularity}
                seriesName={tCharts("patientsEvolution.series")}
                color="#12B76A"
              />
            )}
          </DashboardChartCard>

          <DashboardChartCard
            title={tCharts("appointmentsByStatus.title")}
            description={tCharts("appointmentsByStatus.description")}
            isEmpty={ready && !hasStatusData(data.appointments_by_status)}
            {...frame}
          >
            {data && (
              <DashboardStatusChart slices={data.appointments_by_status} />
            )}
          </DashboardChartCard>

          <DashboardChartCard
            title={tCharts("patientsByMonth.title")}
            description={tCharts("patientsByMonth.description")}
            isEmpty={ready && !hasData(data.patients_by_month)}
            {...frame}
          >
            {data && (
              <DashboardSeriesChart
                type="bar"
                points={data.patients_by_month}
                granularity="month"
                seriesName={tCharts("patientsByMonth.series")}
                color="#12B76A"
              />
            )}
          </DashboardChartCard>

          <div className="xl:col-span-2">
            <DashboardChartCard
              title={tCharts("appointmentsByMonth.title")}
              description={tCharts("appointmentsByMonth.description")}
              isEmpty={ready && !hasData(data.appointments_by_month)}
              {...frame}
            >
              {data && (
                <DashboardSeriesChart
                  type="bar"
                  points={data.appointments_by_month}
                  granularity="month"
                  seriesName={tCharts("appointmentsByMonth.series")}
                  color="#465FFF"
                />
              )}
            </DashboardChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}
