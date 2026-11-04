import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { Link, useParams } from "react-router";
import { RolePermissionsList } from "../components/role-permissions-list";
import { RoleStatusBadge } from "../components/role-status-badge";
import { useRole } from "../hooks/use-role";
import { getRoleErrorMessage } from "../utils/role-error.utils";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="break-words whitespace-pre-line text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </>
  );
}

export default function RoleDetailPage() {
  const t = useTranslations("roles");
  const tErrors = useTranslations("roles.errors");
  const { roleId } = useParams();
  const { role, error, isInvalidId, isLoading } = useRole(Number(roleId));

  return (
    <div>
      <PageMeta title={t("detail.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("detail.title")} />

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
        <ComponentCard title={role.name}>
          <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
            <DetailRow label={t("columns.name")}>{role.name}</DetailRow>
            <DetailRow label={t("columns.description")}>
              {role.description ?? t("noDescription")}
            </DetailRow>
            <DetailRow label={t("columns.status")}>
              <RoleStatusBadge isActive={role.is_active} />
            </DetailRow>
          </dl>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("permissions.title")}
              </h4>
              <Link
                to={`/roles/${role.id}/edit`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("permissions.manageInEdit")}
              </Link>
            </div>
            <RolePermissionsList roleId={role.id} />
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/roles" />}
            >
              {t("form.backToList")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to={`/roles/${role.id}/edit`} />}
            >
              {t("actions.edit")}
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
