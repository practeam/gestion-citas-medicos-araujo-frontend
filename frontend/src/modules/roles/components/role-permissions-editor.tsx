import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import type { Permission } from "@/modules/permissions";
import type {
  PermissionOperationResult,
  RolePermission,
} from "../types/role-permission.types";
import { getPermissionOperationErrorMessage } from "../utils/role-permission-operations";
import { RolePermissionPicker } from "./role-permission-picker";
import { RolePermissionStatusBadge } from "./role-permission-status-badge";

interface RolePermissionsEditorProps {
  roleIsActive: boolean;
  assignments: RolePermission[] | undefined;
  error: unknown;
  isLoading: boolean;
  onReload: () => void;
  /** Permisos nuevos elegidos, pendientes de asignar al guardar. */
  toAdd: Permission[];
  onToAddChange: (permissions: Permission[]) => void;
  /** Ids de permisos asignados que se retirarán al guardar. */
  toRemove: number[];
  onToRemoveChange: (ids: number[]) => void;
  /** Resultado de la última ejecución de operaciones, si hubo. */
  results: PermissionOperationResult[] | null;
  disabled: boolean;
}

/**
 * Sección "Permisos del rol" del formulario de edición. Es un componente
 * controlado: muestra las asignaciones actuales, permite marcar retiros y
 * elegir nuevos permisos activos; el guardado lo coordina el formulario.
 */
export function RolePermissionsEditor({
  roleIsActive,
  assignments,
  error,
  isLoading,
  onReload,
  toAdd,
  onToAddChange,
  toRemove,
  onToRemoveChange,
  results,
  disabled,
}: RolePermissionsEditorProps) {
  const t = useTranslations("roles.permissions");
  const tErrors = useTranslations("roles.permissions.errors");

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>{t("assignedError")}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={onReload}>
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

  const toggleRemoval = (permissionId: number) =>
    onToRemoveChange(
      toRemove.includes(permissionId)
        ? toRemove.filter((id) => id !== permissionId)
        : [...toRemove, permissionId],
    );

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
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
            {assignments.map(({ permission }) => {
              const marked = toRemove.includes(permission.id);
              return (
                <li
                  key={permission.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className={`min-w-0 ${marked ? "opacity-60" : ""}`}>
                    <p
                      className={`font-mono truncate text-sm font-medium text-gray-800 dark:text-white/90 ${marked ? "line-through" : ""}`}
                    >
                      {permission.name}
                    </p>
                    {permission.description && (
                      <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </p>
                    )}
                    {!permission.is_active && (
                      <p className="text-xs text-amber-600 dark:text-orange-400">
                        {t("inactiveAssigned")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <RolePermissionStatusBadge
                      isActive={permission.is_active}
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
                      onClick={() => toggleRemoval(permission.id)}
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
        {roleIsActive ? (
          <RolePermissionPicker
            selected={toAdd}
            onChange={onToAddChange}
            assignedIds={assignments.map(({ permission }) => permission.id)}
            disabled={disabled}
          />
        ) : (
          <Alert variant="warning">
            <AlertDescription>{t("roleInactive")}</AlertDescription>
          </Alert>
        )}
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
                    key={`${result.operation.kind}-${result.operation.permission.id}`}
                  >
                    <strong className="font-mono">
                      {result.operation.permission.name}
                    </strong>
                    :{" "}
                    {getPermissionOperationErrorMessage(
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

      {(toAdd.length > 0 || toRemove.length > 0) && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("pendingSummary", {
            adds: toAdd.length,
            removes: toRemove.length,
          })}
        </p>
      )}
    </div>
  );
}
