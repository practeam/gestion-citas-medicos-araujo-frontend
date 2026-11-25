import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { PlusIcon } from "@/icons";
import type { ScheduleDraft } from "../types/staff-schedule.types";
import { newDraft } from "../utils/staff-schedule.utils";
import { StaffScheduleFields } from "./staff-schedule-fields";

interface StaffSchedulesDraftsProps {
  drafts: ScheduleDraft[];
  onChange: (drafts: ScheduleDraft[]) => void;
  /** Errores por clave de borrador (claves i18n de `staff.schedules.validation`). */
  errors?: Record<string, string>;
  disabled?: boolean;
}

/**
 * Intervalos nuevos de la creación de un integrante: se pueden agregar tantos
 * como se necesiten (también varios en un mismo día). Es opcional.
 */
export function StaffSchedulesDrafts({
  drafts,
  onChange,
  errors = {},
  disabled = false,
}: StaffSchedulesDraftsProps) {
  const t = useTranslations("staff.schedules");

  return (
    <div className="space-y-4">
      {drafts.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("noDrafts")}
        </p>
      ) : (
        <ul className="space-y-3">
          {drafts.map((draft) => (
            <li
              key={draft.key}
              className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <StaffScheduleFields
                values={draft.values}
                errorKey={errors[draft.key]}
                disabled={disabled}
                onChange={(values) =>
                  onChange(
                    drafts.map((item) =>
                      item.key === draft.key ? { ...item, values } : item,
                    ),
                  )
                }
              />
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={disabled}
                onClick={() =>
                  onChange(drafts.filter((item) => item.key !== draft.key))
                }
              >
                {t("removeInterval")}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...drafts, newDraft()])}
      >
        <PlusIcon className="fill-current" />
        {t("addInterval")}
      </Button>
    </div>
  );
}
