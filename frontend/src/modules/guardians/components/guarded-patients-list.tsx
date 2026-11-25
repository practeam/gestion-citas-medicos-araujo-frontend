import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { Can } from "@/modules/auth";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { Link } from "react-router";
import {
  GUARDED_PATIENTS_PAGE_SIZE,
  useGuardedPatients,
} from "../hooks/use-guarded-patients";
import { getGuardianErrorMessage } from "../utils/guardian-error.utils";

/**
 * Pacientes de los que una persona es apoderada (`GET /persons/{id}/patients`),
 * con el parentesco de cada relación. El enlace al paciente solo se ofrece a
 * quien puede consultar pacientes.
 */
export function GuardedPatientsList({ personId }: { personId: number }) {
  const t = useTranslations("guardians.guardedPatients");
  const tRelationship = useTranslations("guardians.relationship");
  const tErrors = useTranslations("guardians.errors");
  const { data, error, isLoading, page, setPage, reload } =
    useGuardedPatients(personId);
  const totalPages = data
    ? Math.max(
        1,
        Math.ceil(data.total / (data.page_size || GUARDED_PATIENTS_PAGE_SIZE)),
      )
    : 1;

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>
            {getGuardianErrorMessage(error, tErrors)}
          </AlertDescription>
        </Alert>
        <Button type="button" variant="outline" size="sm" onClick={reload}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t("empty")}</p>
    );
  }

  return (
    <div
      className={`space-y-3 ${isLoading ? "opacity-60" : ""}`}
      aria-busy={isLoading}
    >
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
        {data.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                {getPersonFullName(item.patient.person)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {[
                  getPersonDocument(item.patient.person),
                  item.patient.patient_number,
                ]
                  .filter(Boolean)
                  .join(" · ") || t("noValue")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm" color="light">
                {tRelationship(item.relationship)}
              </Badge>
              <Badge
                size="sm"
                color={item.patient.is_active ? "success" : "gray"}
              >
                {item.patient.is_active ? t("active") : t("inactive")}
              </Badge>
              <Can permission="patient.read">
                <Button
                  size="xs"
                  variant="outline"
                  nativeButton={false}
                  render={<Link to={`/patients/${item.patient_id}`} />}
                >
                  {t("viewPatient")}
                </Button>
              </Can>
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>{t("page", { page, totalPages })}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {t("previous")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
