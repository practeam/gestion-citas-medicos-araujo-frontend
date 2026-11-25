import { useTheme } from "@/contexts";
import { useTranslations } from "@/i18n";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { StatusSlice } from "../types/dashboard.types";
import { statusColor } from "../utils/dashboard-chart.utils";

const KNOWN_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

/** Distribución de citas por estado (los cuatro estados que devuelve el backend). */
export function DashboardStatusChart({ slices }: { slices: StatusSlice[] }) {
  const { theme } = useTheme();
  const t = useTranslations("dashboard.status");
  // Etiqueta traducida; un estado desconocido conserva la del backend.
  const labels = slices.map((slice) =>
    KNOWN_STATUSES.includes(slice.status) ? t(slice.status) : slice.label,
  );
  const textColor = theme === "dark" ? "#94A3B8" : "#364153";

  const options: ApexOptions = {
    labels,
    colors: slices.map((slice) => statusColor(slice.status)),
    chart: { fontFamily: "Outfit, sans-serif", type: "donut", height: 288 },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "65%" } } },
    legend: {
      position: "bottom",
      labels: { colors: textColor },
      // Cantidad y porcentaje calculados por el backend.
      formatter: (name: string, opts?: { seriesIndex: number }) => {
        const slice = slices[opts?.seriesIndex ?? -1];
        return slice
          ? `${name}: ${slice.count} (${slice.percentage.toFixed(1)}%)`
          : name;
      },
    },
    tooltip: {
      y: {
        formatter: (value: number | null, opts?: { seriesIndex: number }) => {
          const slice = slices[opts?.seriesIndex ?? -1];
          return slice
            ? `${value} (${slice.percentage.toFixed(1)}%)`
            : String(value);
        },
      },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={slices.map((slice) => slice.count)}
      type="donut"
      height={288}
    />
  );
}
