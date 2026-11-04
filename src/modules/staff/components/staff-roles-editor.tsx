import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import type { Role } from "@/modules/roles";
import { useState } from "react";
import { useStaffRoles } from "../hooks/use-staff-roles";
import type {
  RoleOperation,
  RoleOperationResult,
} from "../types/staff-role.types";
import {
  getRoleOperationErrorMessage,
  isDuplicateAssignment,
  runRoleOperations,
} from "../utils/staff-role-operations";
import { StaffRolePicker } from "./staff-role-picker";
import { StaffRoleStatusBadge } from "./staff-role-status-badge";

/**
 * Administra las asignaciones de roles de un integrante dentro de su pantalla
 * de edición. Los cambios (agregar / retirar) quedan pendientes y se aplican al
 * pulsar "Guardar roles", ejecutando solo las operaciones necesarias. Su estado
 * es independiente del formulario de datos propios del personal.
 */
export function StaffRolesEditor({ staffMemberId }: { staffMemberId: number }) {
  const t = useTranslations("staff.roles");
  const tErrors = useTranslations("staff.roles.errors");
  const { assignments, error, isLoading, reload } =
    useStaffRoles(staffMemberId);

  const [toAdd, setToAdd] = useState<Role[]>([]);
  const [toRemove, setToRemove] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastResults, setLastResults] = useState<RoleOperationResult[] | null>(
    null,
  );

  const assignedIds = assignments?.map(({ role }) => role.id) ?? [];
  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  const toggleRemoval = (roleId: number) =>
    setToRemove((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
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

    const operations: RoleOperation[] = [
      ...toAdd.map((role): RoleOperation => ({ kind: "assign", role })),
      ...assignments
        .filter(({ role }) => toRemove.includes(role.id))
        .map(({ role }): RoleOperation => ({ kind: "remove", role })),
    ];
    const results = await runRoleOperations(staffMemberId, operations);

    // Quedan pendientes solo las operaciones fallidas; una asignación duplicada
    // ya está resuelta en el servidor (se informa y se refresca el estado).
    const stillPending = results.filter(
      (result) => result.error && !isDuplicateAssignment(result),
    );
    setToAdd(
      stillPending
        .filter((result) => result.operation.kind === "assign")
        .map((result) => result.operation.role),
    );
    setToRemove(
      stillPending
        .filter((result) => result.operation.kind === "remove")
        .map((result) => result.operation.role.id),
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
            {assignments.map(({ role }) => {
              const marked = toRemove.includes(role.id);
              return (
                <li
                  key={role.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className={`min-w-0 ${marked ? "opacity-60" : ""}`}>
                    <p
                      className={`truncate text-sm font-medium text-gray-800 dark:text-white/90 ${marked ? "line-through" : ""}`}
                    >
                      {role.name}
                    </p>
                    {role.description && (
                      <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {role.description}
                      </p>
                    )}
                    {!role.is_active && (
                      <p className="text-xs text-amber-600 dark:text-orange-400">
                        {t("inactiveAssigned")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StaffRoleStatusBadge isActive={role.is_active} />
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
                      onClick={() => toggleRemoval(role.id)}
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
        <StaffRolePicker
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
                    key={`${result.operation.kind}-${result.operation.role.id}`}
                  >
                    <strong>{result.operation.role.name}</strong>:{" "}
                    {getRoleOperationErrorMessage(
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
