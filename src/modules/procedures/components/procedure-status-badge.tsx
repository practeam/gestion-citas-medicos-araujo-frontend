import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";

export function ProcedureStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("procedures.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "gray"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
