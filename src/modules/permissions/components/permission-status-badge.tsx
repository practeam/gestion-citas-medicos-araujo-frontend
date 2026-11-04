import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function PermissionStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("permissions.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "gray"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
