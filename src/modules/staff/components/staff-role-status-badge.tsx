import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function StaffRoleStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("staff.roles.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "warning"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
