import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function PatientConditionStatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  const t = useTranslations("patients.conditions.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "warning"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
