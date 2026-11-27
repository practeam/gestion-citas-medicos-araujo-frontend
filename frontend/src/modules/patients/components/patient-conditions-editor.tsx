import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import { RegenerateIcon, TrashBinIcon } from "@/icons";
import type {
  ConditionOperationResult,
  PatientSpecialCondition,
  SelectedCondition,
} from "../types/patient-special-condition.types";
import {
  CONDITION_NOTES_MAX_LENGTH,
  buildConditionOperations,
  getConditionOperationErrorMessage,
} from "../utils/patient-condition-operations";
import { PatientConditionPicker } from "./patient-condition-picker";
import { PatientConditionStatusBadge } from "./patient-condition-status-badge";

interface PatientConditionsEditorProps {
  assignments: PatientSpecialCondition[] | undefined;
  error: unknown;
  isLoading: boolean;
  onReload: () => void;
  /** Condiciones nuevas elegidas (con notas), pendientes de asociar al guardar. */
  toAdd: SelectedCondition[];
  onToAddChange: (selected: SelectedCondition[]) => void;
  /** Ids de condiciones asociadas que se retirarán al guardar. */
  toRemove: number[];
  onToRemoveChange: (ids: number[]) => void;
  /** Notas editadas de condiciones ya asociadas, por id de condición. */
  notesDraft: Record<number, string>;
  onNotesDraftChange: (draft: Record<number, string>) => void;
  /** Resultado de la última ejecución de operaciones, si hubo. */
  results: ConditionOperationResult[] | null;
  disabled: boolean;
}

/**
 * Sección "Condiciones especiales" del formulario de edición del paciente.
 * Componente controlado: muestra las asociaciones actuales (editables en notas
 * y retirables) y permite elegir condiciones activas nuevas; el guardado lo
 * coordina el formulario. Las notas pertenecen a la relación, no al paciente.
 */
export function PatientConditionsEditor({
  assignments,
  error,
  isLoading,
  onReload,
  toAdd,
  onToAddChange,
  toRemove,
  onToRemoveChange,
  notesDraft,
  onNotesDraftChange,
  results,
  disabled,
}: PatientConditionsEditorProps) {
  const t = useTranslations("patients.conditions");
  const tErrors = useTranslations("patients.conditions.errors");

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>{t("assignedError")}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={onReload}>
          <RegenerateIcon className="fill-current" />
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

  const toggleRemoval = (conditionId: number) =>
    onToRemoveChange(
      toRemove.includes(conditionId)
        ? toRemove.filter((id) => id !== conditionId)
        : [...toRemove, conditionId],
    );

  const pendingCount = buildConditionOperations({
    assignments,
    toAdd,
    toRemove,
    notesDraft,
  }).length;
  const failures = results?.filter((result) => result.error) ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {t("currentTitle")}
        </h5>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("noAssigned")}
          </p>
        ) : (
          <ul className="space-y-3">
            {assignments.map(({ special_condition: condition, notes }) => {
              const marked = toRemove.includes(condition.id);
              return (
                <li
                  key={condition.id}
                  className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className={`min-w-0 ${marked ? "opacity-60" : ""}`}>
                      <p
                        className={`text-sm font-medium text-gray-800 dark:text-white/90 ${marked ? "line-through" : ""}`}
                      >
                        {condition.name}
                      </p>
                      {condition.description && (
                        <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                          {condition.description}
                        </p>
                      )}
                      {!condition.is_active && (
                        <p className="text-xs text-amber-600 dark:text-orange-400">
                          {t("inactiveAssigned")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <PatientConditionStatusBadge
                        isActive={condition.is_active}
                      />
                      {marked && (
                        <Badge size="sm" color="error">
                          {t("willBeRemoved")}
                        </Badge>
                      )}
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        disabled={disabled}
                        onClick={() => toggleRemoval(condition.id)}
                      >
                        {marked ? (
                          <RegenerateIcon className="fill-current" />
                        ) : (
                          <TrashBinIcon className="fill-current" />
                        )}
                        {marked ? t("undoRemove") : t("remove")}
                      </Button>
                    </div>
                  </div>
                  {!marked && (
                    <Field>
                      <FieldLabel className="text-xs">
                        {t("notesLabel")}
                      </FieldLabel>
                      <Textarea
                        value={notesDraft[condition.id] ?? notes ?? ""}
                        rows={2}
                        maxLength={CONDITION_NOTES_MAX_LENGTH}
                        disabled={disabled}
                        placeholder={t("notesPlaceholder")}
                        onChange={(event) =>
                          onNotesDraftChange({
                            ...notesDraft,
                            [condition.id]: event.target.value,
                          })
                        }
                      />
                    </Field>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {t("addTitle")}
        </h5>
        <PatientConditionPicker
          selected={toAdd}
          onChange={onToAddChange}
          assignedIds={assignments.map(
            ({ special_condition: condition }) => condition.id,
          )}
          disabled={disabled}
        />
      </div>

      {results &&
        (failures.length === 0 ? (
          <Alert variant="success">
            <AlertDescription>{t("saved")}</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>{t("someFailed")}</AlertTitle>
            <AlertDescription>
              <ul className="list-disc ps-5">
                {failures.map((result) => (
                  <li
                    key={`${result.operation.kind}-${result.operation.condition.id}`}
                  >
                    <strong>{result.operation.condition.name}</strong>
                    {" ("}
                    {t(`operations.${result.operation.kind}`)}
                    {"): "}
                    {getConditionOperationErrorMessage(
                      result.error,
                      result.operation.kind,
                      tErrors,
                    )}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ))}

      {pendingCount > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("pendingSummary", { count: pendingCount })}
        </p>
      )}
    </div>
  );
}
