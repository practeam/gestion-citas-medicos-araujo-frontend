import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";
import {
  EXCEPTION_TYPES,
  type ScheduleException,
} from "../types/schedule-exception.types";
import { getTargetType } from "../utils/schedule-exception-payload.utils";

const TYPE_COLORS = {
  closure: "error",
  absence: "warning",
  maintenance: "info",
  other: "gray",
} as const;

/** Etiqueta comprensible del tipo; el valor de API (`closure`, …) nunca se muestra como texto traducido. */
export function ExceptionTypeBadge({ type }: { type: string }) {
  const t = useTranslations("scheduleExceptions.types");
  const known = (EXCEPTION_TYPES as readonly string[]).includes(type);

  return (
    <Badge
      size="sm"
      color={known ? TYPE_COLORS[type as keyof typeof TYPE_COLORS] : "gray"}
    >
      {known ? t(type) : type}
    </Badge>
  );
}

/** Indica si el bloqueo afecta a una clínica completa o a un trabajador, y a cuál. */
export function ScheduleExceptionTarget({
  exception,
  label,
}: {
  exception: ScheduleException;
  label?: string;
}) {
  const t = useTranslations("scheduleExceptions.target");
  const type = getTargetType(exception);
  const id = exception.clinic_id ?? exception.staff_member_id;

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
