import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import type { Permission } from "@/modules/permissions";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { RoleForm } from "../components/role-form";
import { RolePermissionPicker } from "../components/role-permission-picker";
import type { RoleFormValues } from "../schemas/role-schema";
import { roleApi } from "../services/role-api";
import type { PermissionOperationResult } from "../types/role-permission.types";
import type { Role } from "../types/role.types";
import { toCreatePayload } from "../utils/role-payload.utils";
import {
  getPermissionOperationErrorMessage,
  isDuplicateAssignment,
  runPermissionOperations,
} from "../utils/role-permission-operations";

const EMPTY_VALUES: RoleFormValues = { name: "", description: "" };

/** Resultado de las asignaciones tras crear el rol. */
interface PermissionOutcome {
  assigned: Permission[];
  failed: PermissionOperationResult[];
}

export default function RoleCreatePage() {
  const t = useTranslations("roles");
  const tErrors = useTranslations("roles.permissions.errors");
  const navigate = useNavigate();

  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    [],
  );
  // Rol ya creado en este flujo: no debe volver a crearse.
  const [createdRole, setCreatedRole] = useState<Role | null>(null);
  const [outcome, setOutcome] = useState<PermissionOutcome | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const finish = () =>
    void navigate("/roles", { state: { notice: "created" } });

  /**
   * Asigna los permisos indicados, una solicitud por permiso y sin repetir las
   * ya resueltas. Si todo se resuelve termina el flujo; si no, deja el detalle
   * de lo asignado y lo fallido para reintentar solo lo pendiente.
   */
  const assignPermissions = async (
    roleId: number,
    permissions: Permission[],
    alreadyAssigned: Permission[],
  ) => {
    if (permissions.length === 0) {
      finish();
      return;
    }
    const results = await runPermissionOperations(
      roleId,
      permissions.map((permission) => ({ kind: "assign", permission })),
    );
    // Un 409 indica que el permiso ya está asignado: queda resuelto.
    const resolved = results
      .filter((result) => !result.error || isDuplicateAssignment(result))
      .map((result) => result.operation.permission);
    const failed = results.filter(
      (result) => result.error && !isDuplicateAssignment(result),
    );
    if (failed.length === 0) {
      finish();
      return;
    }
    setOutcome({ assigned: [...alreadyAssigned, ...resolved], failed });
  };

  /** Primero POST /roles; solo si tiene éxito se asignan los permisos. */
  const handleSubmit = async (values: RoleFormValues) => {
    // Si falla, RoleForm muestra el error del rol y no se asigna nada.
    const role = await roleApi.create(toCreatePayload(values));
    setCreatedRole(role);
    await assignPermissions(role.id, selectedPermissions, []);
  };

  /** Reintenta únicamente las asignaciones fallidas del rol ya creado. */
  const retry = async () => {
    if (!createdRole || !outcome || isRetrying) return;
    setIsRetrying(true);
    try {
      await assignPermissions(
        createdRole.id,
        outcome.failed.map((result) => result.operation.permission),
        outcome.assigned,
      );
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        {createdRole ? (
          !outcome ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Spinner />
              {t("permissions.assigning")}
            </div>
          ) : (
            <div className="space-y-6">
              <Alert variant="warning">
                <AlertTitle>{t("permissions.partial.title")}</AlertTitle>
                <AlertDescription>
                  {t("permissions.partial.description", {
                    name: createdRole.name,
                  })}
                </AlertDescription>
              </Alert>
              {outcome.assigned.length > 0 && (
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {t("permissions.partial.assigned")}
                  </h4>
                  <ul className="font-mono list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                    {outcome.assigned.map((permission) => (
                      <li key={permission.id}>{permission.name}</li>
                    ))}
                  </ul>
                </section>
              )}
              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("permissions.partial.failed")}
                </h4>
                <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                  {outcome.failed.map((result) => (
                    <li key={result.operation.permission.id}>
                      <strong className="font-mono">
                        {result.operation.permission.name}
                      </strong>
                      :{" "}
                      {getPermissionOperationErrorMessage(
                        result.error,
                        "assign",
                        tErrors,
                      )}
                    </li>
                  ))}
                </ul>
              </section>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  disabled={isRetrying}
                  nativeButton={false}
                  render={<Link to="/roles" />}
                >
                  {t("permissions.partial.goToList")}
                </Button>
                <Button
                  variant="outline"
                  disabled={isRetrying}
                  nativeButton={false}
                  render={<Link to={`/roles/${createdRole.id}/edit`} />}
                >
                  {t("permissions.partial.editRole")}
                </Button>
                <Button disabled={isRetrying} onClick={() => void retry()}>
                  {isRetrying && <Spinner />}
                  {isRetrying
                    ? t("form.saving")
                    : t("permissions.partial.retry")}
                </Button>
              </div>
            </div>
          )
        ) : (
          <RoleForm
            defaultValues={EMPTY_VALUES}
            submitLabel={t("form.create")}
            onSubmit={handleSubmit}
          >
            <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("permissions.title")}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("permissions.createHint")}
                </p>
              </div>
              <RolePermissionPicker
                selected={selectedPermissions}
                onChange={setSelectedPermissions}
              />
            </section>
          </RoleForm>
        )}
      </ComponentCard>
    </div>
  );
}
