import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useStaffSpecialties } from "../hooks/use-staff-specialties";
import { StaffSpecialtyStatusBadge } from "./staff-specialty-status-badge";

/**
 * Especialidades asociadas a un integrante (solo lectura), para el detalle. Son
 * relaciones declaradas: no constituyen certificación ni autorización.
 */
export function StaffSpecialtiesList({
  staffMemberId,
}: {
  staffMemberId: number;
}) {
  const t = useTranslations("staff.specialties");
  const { assignments, error, isLoading, reload } =
    useStaffSpecialties(staffMemberId);

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
      {assignments.map(({ specialty }) => (
        <li
          key={specialty.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
              {specialty.name}
            </p>
            {specialty.description && (
              <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {specialty.description}
              </p>
            )}
          </div>
          <StaffSpecialtyStatusBadge isActive={specialty.is_active} />
        </li>
      ))}
    </ul>
  );
}
