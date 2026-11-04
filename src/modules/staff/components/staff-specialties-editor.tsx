import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import type { Specialty } from "@/modules/specialties";
import { useState } from "react";
import { useStaffSpecialties } from "../hooks/use-staff-specialties";
import type {
  SpecialtyOperation,
  SpecialtyOperationResult,
} from "../types/staff-specialty.types";
import {
  getSpecialtyOperationErrorMessage,
  runSpecialtyOperations,
} from "../utils/staff-specialty-operations";
import { StaffSpecialtyPicker } from "./staff-specialty-picker";
import { StaffSpecialtyStatusBadge } from "./staff-specialty-status-badge";

/**
 * Administra las asignaciones de specialties de un integrante dentro de su pantalla
 * de edición. Los cambios (agregar / retirar) quedan pendientes y se aplican al
 * pulsar "Guardar specialties", ejecutando solo las operaciones necesarias. Su estado
 * es independiente del formulario de datos propios del personal.
 */
export function StaffSpecialtiesEditor({
  staffMemberId,
}: {
  staffMemberId: number;
}) {
  const t = useTranslations("staff.specialties");
  const tErrors = useTranslations("staff.specialties.errors");
  const { assignments, error, isLoading, reload } =
    useStaffSpecialties(staffMemberId);

  const [toAdd, setToAdd] = useState<Specialty[]>([]);
  const [toRemove, setToRemove] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastResults, setLastResults] = useState<
    SpecialtyOperationResult[] | null
  >(null);

  const assignedIds = assignments?.map(({ specialty }) => specialty.id) ?? [];
  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  const toggleRemoval = (specialtyId: number) =>
    setToRemove((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((id) => id !== specialtyId)
        : [...prev, specialtyId],
    );

  const discard = () => {
    setToAdd([]);
    setToRemove([]);
    setLastResults(null);
  };

  const save = async () => {
    if (isSaving || !assignments || !hasChanges) return;
    setIsSaving(true);
    setLastResults(null);

    const operations: SpecialtyOperation[] = [
      ...toAdd.map((specialty): SpecialtyOperation => ({
        kind: "assign",
        specialty,
      })),
      ...assignments
        .filter(({ specialty }) => toRemove.includes(specialty.id))
        .map(({ specialty }): SpecialtyOperation => ({
          kind: "remove",
          specialty,
        })),
    ];
    const results = await runSpecialtyOperations(staffMemberId, operations);
    // Quedan pendientes solo las operaciones fallidas.
    const stillPending = results.filter((result) => result.error);
    setToAdd(
      stillPending
        .filter((result) => result.operation.kind === "assign")
        .map((result) => result.operation.specialty),
    );
    setToRemove(
      stillPending
        .filter((result) => result.operation.kind === "remove")
        .map((result) => result.operation.specialty.id),
    );
    setLastResults(results);
    reload();
    setIsSaving(false);
  };

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

  const failures = lastResults?.filter((result) => result.error) ?? [];

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
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
            {assignments.map(({ specialty }) => {
              const marked = toRemove.includes(specialty.id);
              return (
                <li
                  key={specialty.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className={`min-w-0 ${marked ? "opacity-60" : ""}`}>
                    <p
                      className={`truncate text-sm font-medium text-gray-800 dark:text-white/90 ${marked ? "line-through" : ""}`}
                    >
                      {specialty.name}
                    </p>
                    {specialty.description && (
                      <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {specialty.description}
                      </p>
                    )}
                    {!specialty.is_active && (
                      <p className="text-xs text-amber-600 dark:text-orange-400">
                        {t("inactiveAssigned")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StaffSpecialtyStatusBadge isActive={specialty.is_active} />
                    {marked && (
                      <Badge size="sm" color="error">
                        {t("willBeRemoved")}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => toggleRemoval(specialty.id)}
                    >
                      {marked ? t("undoRemove") : t("remove")}
                    </Button>
                  </div>
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
        <StaffSpecialtyPicker
          selected={toAdd}
          onChange={setToAdd}
          assignedIds={assignedIds}
          disabled={isSaving}
        />
      </div>

      {lastResults &&
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
                    key={`${result.operation.kind}-${result.operation.specialty.id}`}
                  >
                    <strong>{result.operation.specialty.name}</strong>:{" "}
                    {getSpecialtyOperationErrorMessage(
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
            {t("pendingSummary", {
              adds: toAdd.length,
              removes: toRemove.length,
            })}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={isSaving || (!hasChanges && !lastResults)}
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
