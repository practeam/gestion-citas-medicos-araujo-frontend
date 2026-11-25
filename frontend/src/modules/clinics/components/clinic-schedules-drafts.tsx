import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { PlusIcon } from "@/icons";
import type { ScheduleDraft } from "../types/clinic-schedule.types";
import { newDraft } from "../utils/clinic-schedule.utils";
import { ClinicScheduleFields } from "./clinic-schedule-fields";

interface ClinicSchedulesDraftsProps {
  drafts: ScheduleDraft[];
  onChange: (drafts: ScheduleDraft[]) => void;
  /** Errores por clave de borrador (claves i18n de `clinics.schedules.validation`). */
  errors?: Record<string, string>;
  disabled?: boolean;
}

/**
 * Intervalos nuevos de la creación de una clínica: se pueden agregar tantos
 * como se necesiten (también varios en un mismo día). Es opcional.
 */
export function ClinicSchedulesDrafts({
  drafts,
  onChange,
  errors = {},
  disabled = false,
}: ClinicSchedulesDraftsProps) {
  const t = useTranslations("clinics.schedules");

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
              <ClinicScheduleFields
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
