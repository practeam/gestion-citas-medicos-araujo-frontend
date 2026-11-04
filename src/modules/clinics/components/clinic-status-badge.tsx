import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function ClinicStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("clinics.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "gray"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
