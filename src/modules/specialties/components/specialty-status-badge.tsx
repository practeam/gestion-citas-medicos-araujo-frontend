import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function SpecialtyStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("specialties.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "gray"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
