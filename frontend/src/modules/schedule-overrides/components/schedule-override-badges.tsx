import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";
import type { ScheduleOverride } from "../types/schedule-override.types";
import { getTargetType } from "../utils/schedule-override-payload.utils";

/** Un override activo puede participar en la disponibilidad; uno inactivo no. */
export function ScheduleOverrideStatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  const t = useTranslations("scheduleOverrides.status");

  return (
    <Badge size="sm" color={isActive ? "success" : "gray"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}

/** Indica si la modificación afecta a una clínica o a un trabajador, y a cuál. */
export function ScheduleOverrideTarget({
  override,
  label,
}: {
  override: ScheduleOverride;
  label?: string;
}) {
  const t = useTranslations("scheduleOverrides.target");
  const type = getTargetType(override);
  const id = override.clinic_id ?? override.staff_member_id;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm" color={type === "clinic" ? "primary" : "light"}>
        {t(type)}
      </Badge>
      <span className="text-sm text-gray-800 dark:text-white/90">
        {label ?? `#${id}`}
      </span>
    </div>
  );
}
