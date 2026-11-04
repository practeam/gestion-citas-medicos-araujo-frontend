import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import type { Permission } from "@/modules/permissions";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { RoleForm } from "../components/role-form";
import { RolePermissionsEditor } from "../components/role-permissions-editor";
import { RoleStatusBadge } from "../components/role-status-badge";
import { useRole } from "../hooks/use-role";
import { useRolePermissions } from "../hooks/use-role-permissions";
import type { RoleFormValues } from "../schemas/role-schema";
import { roleApi } from "../services/role-api";
import type {
  PermissionOperation,
  PermissionOperationResult,
} from "../types/role-permission.types";
import type { Role } from "../types/role.types";
import { getRoleErrorMessage } from "../utils/role-error.utils";
import { toUpdatePayload } from "../utils/role-payload.utils";
import {
  isDuplicateAssignment,
  runPermissionOperations,
} from "../utils/role-permission-operations";

export default function RoleEditPage() {
  const t = useTranslations("roles");
  const tErrors = useTranslations("roles.errors");
  const navigate = useNavigate();
  const { roleId } = useParams();
  const { role, error, isInvalidId, isLoading } = useRole(Number(roleId));
  const {
    assignments,
    error: permissionsError,
    isLoading: permissionsLoading,
    reload,
  } = useRolePermissions(Number(roleId));

  const [noChanges, setNoChanges] = useState(false);
  // Rol tal como lo confirmó el backend tras un PATCH: evita repetirlo en un reintento.
  const [savedRole, setSavedRole] = useState<Role | null>(null);
  const [toAdd, setToAdd] = useState<Permission[]>([]);
  const [toRemove, setToRemove] = useState<number[]>([]);
  const [results, setResults] = useState<PermissionOperationResult[] | null>(
    null,
  );

  /**
   * Guarda el rol (PATCH) y después sus permisos (un POST/DELETE por cada
   * cambio, de forma secuencial). Si algo falla se conserva lo confirmado y
   * solo quedan pendientes las operaciones fallidas.
   */
  const handleSubmit = async (values: RoleFormValues) => {
    if (!role || !assignments) return;
    setNoChanges(false);
    setResults(null);

    const payload = toUpdatePayload(values, savedRole ?? role);
    const operations: PermissionOperation[] = [
      ...toAdd.map((permission): PermissionOperation => ({
        kind: "assign",
        permission,
      })),
      ...assignments
        .filter(({ permission }) => toRemove.includes(permission.id))
        .map(({ permission }): PermissionOperation => ({
          kind: "remove",
          permission,
        })),
    ];

    if (Object.keys(payload).length === 0 && operations.length === 0) {
      setNoChanges(true);
      return;
    }

    if (Object.keys(payload).length > 0) {
      // Si falla, RoleForm muestra el error y no se ejecuta ninguna operación de permisos.
      setSavedRole(await roleApi.update(role.id, payload));
    }

    const operationResults = await runPermissionOperations(role.id, operations);
    if (operationResults.every((result) => !result.error)) {
      void navigate("/roles", { state: { notice: "updated" } });
      return;
    }

    // Quedan pendientes solo las operaciones fallidas; una asignación duplicada
    // ya está resuelta en el servidor (se informa y se refresca el estado).
    const pending = operationResults.filter(
      (result) => result.error && !isDuplicateAssignment(result),
    );
    setToAdd(
      pending
        .filter((result) => result.operation.kind === "assign")
        .map((result) => result.operation.permission),
    );
    setToRemove(
      pending
        .filter((result) => result.operation.kind === "remove")
        .map((result) => result.operation.permission.id),
    );
    setResults(operationResults);
    reload();
  };

  const roleDataSaved =
    savedRole !== null && results?.some((result) => result.error);

  return (
    <div>
      <PageMeta
        title={t("form.editTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.editTitle")} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || !role ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getRoleErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/roles" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={(savedRole ?? role).name}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}: <RoleStatusBadge isActive={role.is_active} />
          </div>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          {roleDataSaved && (
            <Alert variant="success">
              <AlertDescription>
                {t("permissions.roleDataSaved")}
              </AlertDescription>
            </Alert>
          )}
          <RoleForm
            key={role.id}
            defaultValues={{
              name: role.name,
              description: role.description ?? "",
            }}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          >
            <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("permissions.title")}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("permissions.editHint")}
                </p>
              </div>
              <RolePermissionsEditor
                roleIsActive={role.is_active}
                assignments={assignments}
                error={permissionsError}
                isLoading={permissionsLoading}
                onReload={reload}
                toAdd={toAdd}
                onToAddChange={setToAdd}
                toRemove={toRemove}
                onToRemoveChange={setToRemove}
                results={results}
                disabled={false}
              />
            </section>
          </RoleForm>
        </ComponentCard>
      )}
    </div>
  );
}
