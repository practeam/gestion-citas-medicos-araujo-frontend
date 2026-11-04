import type { AppointmentStatus } from "../types/appointment.types";

/** Clases del evento del calendario por estado (se acompañan de texto, no solo color). */
export const EVENT_STYLES: Record<
  AppointmentStatus,
  { container: string; dot: string; text: string }
> = {
  pending: {
    container:
      "border border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/15",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
  },
  confirmed: {
    container:
      "border border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/15",
    dot: "bg-brand-500",
    text: "text-brand-700 dark:text-brand-400",
  },
  completed: {
    container:
      "border border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/15",
    dot: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
  },
  cancelled: {
    container:
      "border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
    dot: "bg-gray-400",
    text: "text-gray-500 line-through dark:text-gray-400",
  },
};
