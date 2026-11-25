import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";
import type { AppointmentStatus } from "../types/appointment.types";

type BadgeColor = "warning" | "primary" | "success" | "gray";

const BADGE_COLORS: Record<AppointmentStatus, BadgeColor> = {
  pending: "warning",
  confirmed: "primary",
  completed: "success",
  cancelled: "gray",
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const t = useTranslations("appointments.status");

  return (
    <Badge size="sm" color={BADGE_COLORS[status] ?? "gray"}>
      {t(status)}
    </Badge>
  );
}
