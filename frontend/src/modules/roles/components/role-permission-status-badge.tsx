import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function RolePermissionStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("roles.permissions.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "warning"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
