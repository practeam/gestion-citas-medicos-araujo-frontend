import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useStaffRoles } from "../hooks/use-staff-roles";
import { StaffRoleStatusBadge } from "./staff-role-status-badge";

/** Roles asignados a un integrante (solo lectura), para el detalle. */
export function StaffRolesList({ staffMemberId }: { staffMemberId: number }) {
  const t = useTranslations("staff.roles");
  const { assignments, error, isLoading, reload } =
    useStaffRoles(staffMemberId);

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

  if (assignments.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("noAssigned")}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
      {assignments.map(({ role }) => (
        <li
          key={role.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
              {role.name}
            </p>
            {role.description && (
              <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {role.description}
              </p>
            )}
          </div>
          <StaffRoleStatusBadge isActive={role.is_active} />
        </li>
      ))}
    </ul>
  );
}
