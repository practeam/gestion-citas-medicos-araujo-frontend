import { useTheme } from "@/contexts";
import { useLocale } from "@/i18n";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type {
  DashboardGranularity,
  TimeSeriesPoint,
} from "../types/dashboard.types";
import { toChartSeries } from "../utils/dashboard-chart.utils";

interface DashboardSeriesChartProps {
  type: "line" | "bar";
  points: TimeSeriesPoint[];
  granularity: DashboardGranularity;
  /** Nombre de la serie (leyenda y tooltip). */
  seriesName: string;
  color: string;
}

/** Serie temporal del backend como líneas (evolución) o barras (por mes). */
export function DashboardSeriesChart({
  type,
  points,
  granularity,
  seriesName,
  color,
}: DashboardSeriesChartProps) {
  const { theme } = useTheme();
  const locale = useLocale();
  const { categories, values } = toChartSeries(points, granularity, locale);
  const textColor = theme === "dark" ? "#94A3B8" : "#364153";

  const options: ApexOptions = {
    colors: [color],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type,
      height: 288,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: type === "line" ? { curve: "straight", width: 2 } : { show: false },
    markers: type === "line" ? { size: points.length > 40 ? 0 : 3 } : undefined,
    plotOptions: { bar: { columnWidth: "45%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      labels: { colors: textColor },
    },
    xaxis: {
      categories,
      tickAmount: Math.min(categories.length, 12),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -45,
        hideOverlappingLabels: true,
        style: { colors: textColor },
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: textColor },
        // Son conteos: solo enteros en el eje.
        formatter: (value: number) => String(Math.round(value)),
      },
    },
    grid: { borderColor: theme === "dark" ? "#1E2640" : "#F3F4F6" },
    tooltip: { y: { formatter: (value: number) => String(value) } },
  };

  return (
    <ReactApexChart
      options={options}
      series={[{ name: seriesName, data: values }]}
      type={type}
      height={288}
    />
  );
}
