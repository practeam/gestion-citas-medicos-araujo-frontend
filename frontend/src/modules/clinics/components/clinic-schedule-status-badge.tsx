import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function ClinicScheduleStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("clinics.schedules.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "gray"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
