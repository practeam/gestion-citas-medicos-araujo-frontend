import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { usePatientSpecialConditions } from "../hooks/use-patient-special-conditions";
import { PatientConditionStatusBadge } from "./patient-condition-status-badge";

/**
 * Condiciones especiales asociadas a un paciente (solo lectura), para el
 * detalle. Se presentan como información administrativa, no como diagnósticos.
 */
export function PatientConditionsList({ patientId }: { patientId: number }) {
  const t = useTranslations("patients.conditions");
  const { assignments, error, isLoading, reload } =
    usePatientSpecialConditions(patientId);

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>{t("assignedError")}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={reload}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (isLoading || !assignments) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loadingAssigned")}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("noAssigned")}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
      {assignments.map(({ special_condition: condition, notes }) => (
        <li key={condition.id} className="space-y-1 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {condition.name}
            </p>
            <PatientConditionStatusBadge isActive={condition.is_active} />
          </div>
          {condition.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {condition.description}
            </p>
          )}
          <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-500 dark:text-gray-400">
              {t("notesLabel")}:
            </span>{" "}
            {notes ?? t("noNotes")}
          </p>
        </li>
      ))}
    </ul>
  );
}
