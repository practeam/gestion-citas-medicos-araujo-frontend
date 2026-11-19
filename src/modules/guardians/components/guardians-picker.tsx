import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { useState } from "react";
import type { StagedGuardian } from "../types/guardian.types";
import { GuardianAddDialog } from "./guardian-add-dialog";

interface GuardiansPickerProps {
  value: StagedGuardian[];
  onChange: (value: StagedGuardian[]) => void;
  disabled?: boolean;
}

/**
 * Apoderados elegidos en el alta de un paciente. Solo mantiene la lista en
 * pantalla: la asociación con el paciente se hace después de crearlo. Impide
 * agregar dos veces a la misma persona y permite retirar una selección antes
 * de guardar. Las personas nuevas se registran con `PersonForm` (en el diálogo).
 */
export function GuardiansPicker({
  value,
  onChange,
  disabled = false,
}: GuardiansPickerProps) {
  const t = useTranslations("guardians.picker");
  const tRelationship = useTranslations("guardians.relationship");
  const tCommon = useTranslations("guardians");
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
          {value.map(({ person, relationship }) => (
            <li
              key={person.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {getPersonFullName(person)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getPersonDocument(person) ?? tCommon("noValue")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge size="sm" color="light">
                  {tRelationship(relationship)}
                </Badge>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={disabled}
                  onClick={() =>
                    onChange(
                      value.filter((item) => item.person.id !== person.id),
                    )
                  }
                >
                  {t("remove")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {t("add")}
      </Button>

      <GuardianAddDialog
        open={open}
        onClose={() => setOpen(false)}
        excludePersonIds={value.map((item) => item.person.id)}
        getErrorMessage={() => t("unexpected")}
        onConfirm={async (person, relationship) => {
          if (value.some((item) => item.person.id === person.id)) return;
          onChange([...value, { person, relationship }]);
        }}
      />
    </div>
  );
}
