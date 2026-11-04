import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { PlusIcon } from "@/icons";
import { useState } from "react";
import { useClinicSchedules } from "../hooks/use-clinic-schedules";
import type {
  ClinicSchedule,
  ScheduleDraft,
  ScheduleFormValues,
  ScheduleOperation,
  ScheduleOperationResult,
} from "../types/clinic-schedule.types";
import { formatDate } from "../utils/clinic-date.utils";
import {
  findOverlappingKeys,
  getScheduleOperationErrorMessage,
  newDraft,
  normalizeTime,
  runScheduleOperations,
  toFormValues,
  toUpdateRequest,
  validateSchedule,
  type ScheduleEntry,
} from "../utils/clinic-schedule.utils";
import { ClinicScheduleFields } from "./clinic-schedule-fields";
import { ClinicScheduleStatusBadge } from "./clinic-schedule-status-badge";

const existingKey = (id: number) => `s-${id}`;
const draftKey = (key: string) => `d-${key}`;

/**
 * Administra los horarios de una clínica dentro de su pantalla de edición:
 * agregar intervalos, modificar los existentes y desactivarlos o reactivarlos
 * (nunca se eliminan). Los cambios quedan pendientes y se aplican con "Guardar
 * horarios", tras una validación preventiva (horas, vigencia y solapamientos de
 * intervalos activos). Su estado es independiente del de los datos de la clínica.
 */
export function ClinicSchedulesEditor({ clinicId }: { clinicId: number }) {
  const t = useTranslations("clinics.schedules");
  const tErrors = useTranslations("clinics.schedules.errors");
  const locale = useLocale();
  const { schedules, total, error, isLoading, reload } =
    useClinicSchedules(clinicId);

  // Valores en edición de horarios existentes, por id.
  const [edits, setEdits] = useState<Record<number, ScheduleFormValues>>({});
  // Estado deseado (activo/inactivo) cuando difiere del guardado, por id.
  const [statusTargets, setStatusTargets] = useState<Record<number, boolean>>(
    {},
  );
  const [drafts, setDrafts] = useState<ScheduleDraft[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<ScheduleOperationResult[] | null>(
    null,
  );

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>{t("loadError")}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={reload}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (isLoading || !schedules) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  const isActive = (schedule: ClinicSchedule) =>
    statusTargets[schedule.id] ?? schedule.is_active;

  /** Operaciones necesarias: desactivar, modificar, reactivar y crear (en ese orden). */
  const buildOperations = (): ScheduleOperation[] => {
    const summaryOf = (values: ScheduleFormValues) => ({
      day_of_week: values.day_of_week,
      starts_at: values.starts_at,
      ends_at: values.ends_at,
    });
    const operations: ScheduleOperation[] = [];
    for (const schedule of schedules) {
      if (statusTargets[schedule.id] === false && schedule.is_active) {
        operations.push({
          kind: "deactivate",
          scheduleId: schedule.id,
          summary: summaryOf(toFormValues(schedule)),
        });
      }
    }
    for (const schedule of schedules) {
      const values = edits[schedule.id];
      if (!values) continue;
      const payload = toUpdateRequest(values, schedule);
      if (Object.keys(payload).length > 0) {
        operations.push({
          kind: "update",
          scheduleId: schedule.id,
          payload,
          summary: summaryOf(toFormValues(schedule)),
        });
      }
    }
    for (const schedule of schedules) {
      if (statusTargets[schedule.id] === true && !schedule.is_active) {
        operations.push({
          kind: "activate",
          scheduleId: schedule.id,
          summary: summaryOf(edits[schedule.id] ?? toFormValues(schedule)),
        });
      }
    }
    for (const draft of drafts) {
      operations.push({
        kind: "create",
        draftKey: draft.key,
        values: draft.values,
        summary: summaryOf(draft.values),
      });
    }
    return operations;
  };

  const operations = buildOperations();
  const hasChanges = operations.length > 0;

  /** Validación preventiva; el backend decide definitivamente. */
  const validate = () => {
    const errors: Record<string, string> = {};
    const entries: ScheduleEntry[] = [];
    for (const schedule of schedules) {
      const values = edits[schedule.id] ?? toFormValues(schedule);
      if (edits[schedule.id]) {
        const key = validateSchedule(values);
        if (key) errors[existingKey(schedule.id)] = key;
      }
      entries.push({
        key: existingKey(schedule.id),
        values,
        isActive: isActive(schedule),
      });
    }
    for (const draft of drafts) {
      const key = validateSchedule(draft.values);
      if (key) errors[draftKey(draft.key)] = key;
      entries.push({
        key: draftKey(draft.key),
        values: draft.values,
        isActive: true,
      });
    }
    for (const key of findOverlappingKeys(entries)) {
      errors[key] ??= "overlap";
    }
    return errors;
  };

  const discard = () => {
    setEdits({});
    setStatusTargets({});
    setDrafts([]);
    setFieldErrors({});
    setResults(null);
  };

  const toggleEdit = (schedule: ClinicSchedule) =>
    setEdits((prev) => {
      if (prev[schedule.id]) {
        const { [schedule.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [schedule.id]: toFormValues(schedule) };
    });

  const toggleStatus = (schedule: ClinicSchedule) =>
    setStatusTargets((prev) => {
      const target = !(prev[schedule.id] ?? schedule.is_active);
      if (target === schedule.is_active) {
        const { [schedule.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [schedule.id]: target };
    });

  const save = async () => {
    if (isSaving || !hasChanges) return;
    const errors = validate();
    setFieldErrors(errors);
    setResults(null);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    const operationResults = await runScheduleOperations(clinicId, operations);
    const succeeded = operationResults.filter((result) => !result.error);
    const doneIds = (kinds: ScheduleOperation["kind"][]) =>
      new Set(
        succeeded
          .filter((result) => kinds.includes(result.operation.kind))
          .map((result) => result.operation.scheduleId),
      );
    const updated = doneIds(["update"]);
    const statusDone = doneIds(["activate", "deactivate"]);
    const created = new Set(
      succeeded
        .filter((result) => result.operation.kind === "create")
        .map((result) => result.operation.draftKey),
    );

    // Se conservan solo los cambios cuya operación falló.
    setEdits((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([id]) => !updated.has(Number(id))),
      ),
    );
    setStatusTargets((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([id]) => !statusDone.has(Number(id))),
      ),
    );
    setDrafts((prev) => prev.filter((draft) => !created.has(draft.key)));
    setResults(operationResults);
    reload();
    setIsSaving(false);
  };

  const failures = results?.filter((result) => result.error) ?? [];
  const sorted = [...schedules].sort(
    (a, b) =>
      a.day_of_week - b.day_of_week || a.starts_at.localeCompare(b.starts_at),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {t("currentTitle")}
        </h5>
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((schedule) => {
              const editing = edits[schedule.id];
              const active = isActive(schedule);
              const statusChanged = statusTargets[schedule.id] !== undefined;
              return (
                <li
                  key={schedule.id}
                  className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div
                      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${active ? "" : "opacity-60"}`}
                    >
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {t(`days.${schedule.day_of_week}`)}{" "}
                        {normalizeTime(schedule.starts_at)}–
                        {normalizeTime(schedule.ends_at)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {schedule.valid_until
                          ? t("validity", {
                              from: formatDate(schedule.valid_from, locale),
                              until: formatDate(schedule.valid_until, locale),
                            })
                          : t("validityOpen", {
                              from: formatDate(schedule.valid_from, locale),
                            })}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ClinicScheduleStatusBadge
                        isActive={schedule.is_active}
                      />
                      {statusChanged && (
                        <Badge size="sm" color="warning">
                          {active ? t("willActivate") : t("willDeactivate")}
                        </Badge>
                      )}
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => toggleEdit(schedule)}
                      >
                        {editing ? t("cancelEdit") : t("edit")}
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => toggleStatus(schedule)}
                      >
                        {statusChanged
                          ? t("undoStatus")
                          : schedule.is_active
                            ? t("deactivate")
                            : t("activate")}
                      </Button>
                    </div>
                  </div>
                  {editing && (
                    <ClinicScheduleFields
                      values={editing}
                      errorKey={fieldErrors[existingKey(schedule.id)]}
                      disabled={isSaving}
                      onChange={(values) =>
                        setEdits((prev) => ({ ...prev, [schedule.id]: values }))
                      }
                    />
                  )}
                  {!editing && fieldErrors[existingKey(schedule.id)] && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {t(`validation.${fieldErrors[existingKey(schedule.id)]}`)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {total > schedules.length && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("partialList", { shown: schedules.length, total })}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {t("addTitle")}
        </h5>
        {drafts.length > 0 && (
          <ul className="space-y-3">
            {drafts.map((draft) => (
              <li
                key={draft.key}
                className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5"
              >
                <ClinicScheduleFields
                  values={draft.values}
                  errorKey={fieldErrors[draftKey(draft.key)]}
                  disabled={isSaving}
                  onChange={(values) =>
                    setDrafts((prev) =>
                      prev.map((item) =>
                        item.key === draft.key ? { ...item, values } : item,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() =>
                    setDrafts((prev) =>
                      prev.filter((item) => item.key !== draft.key),
                    )
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
          disabled={isSaving}
          onClick={() => setDrafts((prev) => [...prev, newDraft()])}
        >
          <PlusIcon className="fill-current" />
          {t("addInterval")}
        </Button>
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
                {failures.map((result, index) => (
                  <li key={index}>
                    <strong>
                      {t(`days.${result.operation.summary.day_of_week}`)}{" "}
                      {normalizeTime(result.operation.summary.starts_at)}–
                      {normalizeTime(result.operation.summary.ends_at)}
                    </strong>{" "}
                    ({t(`operations.${result.operation.kind}`)}):{" "}
                    {getScheduleOperationErrorMessage(
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

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {hasChanges && (
          <p className="text-sm text-gray-500 sm:me-auto dark:text-gray-400">
            {t("pendingSummary", { count: operations.length })}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={isSaving || (!hasChanges && !results)}
          onClick={discard}
        >
          {t("discard")}
        </Button>
        <Button
          type="button"
          disabled={isSaving || !hasChanges}
          onClick={() => void save()}
        >
          {isSaving && <Spinner />}
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
