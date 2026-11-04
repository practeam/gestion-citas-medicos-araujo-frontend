import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PermissionForm } from "../components/permission-form";
import { PermissionStatusBadge } from "../components/permission-status-badge";
import { usePermission } from "../hooks/use-permission";
import type { PermissionFormValues } from "../schemas/permission-schema";
import { permissionApi } from "../services/permission-api";
import { getPermissionErrorMessage } from "../utils/permission-error.utils";
import { toUpdatePayload } from "../utils/permission-payload.utils";

export default function PermissionEditPage() {
  const t = useTranslations("permissions");
  const tErrors = useTranslations("permissions.errors");
  const navigate = useNavigate();
  const { permissionId } = useParams();
  const { permission, error, isInvalidId, isLoading } = usePermission(
    Number(permissionId),
  );
  const [noChanges, setNoChanges] = useState(false);

  const handleSubmit = async (values: PermissionFormValues) => {
    if (!permission) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, permission);
    if (!payload) {
      setNoChanges(true);
      return;
    }
    await permissionApi.updateDescription(permission.id, payload);
    void navigate("/permissions", { state: { notice: "updated" } });
  };

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
      ) : isInvalidId || error || !permission ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getPermissionErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/permissions" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={permission.name}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {t("columns.status")}:{" "}
            <PermissionStatusBadge isActive={permission.is_active} />
          </div>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <PermissionForm
            key={permission.id}
            mode="edit"
            defaultValues={{
              name: permission.name,
              description: permission.description ?? "",
            }}
            submitLabel={t("form.save")}
            onSubmit={handleSubmit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
