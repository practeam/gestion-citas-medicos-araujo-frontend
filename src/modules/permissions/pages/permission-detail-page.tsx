import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { Link, useParams } from "react-router";
import { PermissionStatusBadge } from "../components/permission-status-badge";
import { usePermission } from "../hooks/use-permission";
import { getPermissionErrorMessage } from "../utils/permission-error.utils";

export default function PermissionDetailPage() {
  const t = useTranslations("permissions");
  const tErrors = useTranslations("permissions.errors");
  const { permissionId } = useParams();
  const { permission, error, isInvalidId, isLoading } = usePermission(
    Number(permissionId),
  );

  return (
    <div>
      <PageMeta title={t("detail.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("detail.title")} />

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
          <dl className="grid gap-5 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.name")}
            </dt>
            <dd className="font-mono text-gray-800 dark:text-white/90">
              {permission.name}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.description")}
            </dt>
            <dd className="text-gray-800 dark:text-white/90">
              {permission.description ?? t("noDescription")}
            </dd>
            <dt className="font-medium text-gray-500 dark:text-gray-400">
              {t("columns.status")}
            </dt>
            <dd>
              <PermissionStatusBadge isActive={permission.is_active} />
            </dd>
          </dl>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/permissions" />}
            >
              {t("form.backToList")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to={`/permissions/${permission.id}/edit`} />}
            >
              {t("actions.edit")}
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
