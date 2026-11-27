import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Can } from "@/modules/auth";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { PlusIcon, RegenerateIcon } from "@/icons";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { PatientStatusDialog } from "../components/patient-status-dialog";
import { PatientsFilters } from "../components/patients-filters";
import { PatientsPagination } from "../components/patients-pagination";
import { PatientsTable } from "../components/patients-table";
import { PATIENTS_PAGE_SIZE, usePatients } from "../hooks/use-patients";
import { patientApi } from "../services/patient-api";
import type { Patient } from "../types/patient.types";
import { getPatientErrorMessage } from "../utils/patient-error.utils";

type Notice = "created" | "updated" | "activated" | "deactivated";

export default function PatientsPage() {
  const t = useTranslations("patients");
  const tErrors = useTranslations("patients.errors");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    filters,
    hasFilters,
    updateFilters,
    setPage,
    reload,
    data,
    error,
    isLoading,
  } = usePatients();

  const [notice, setNotice] = useState<Notice | null>(
    (location.state as { notice?: Notice } | null)?.notice ?? null,
  );
  const [statusTarget, setStatusTarget] = useState<Patient | null>(null);
  const [isStatusPending, setIsStatusPending] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // El aviso llega por location.state; se limpia para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state) void navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate]);

  const closeStatusDialog = () => {
    setStatusTarget(null);
    setStatusError(null);
  };

  const confirmStatusChange = async () => {
    if (!statusTarget || isStatusPending) return;
    setIsStatusPending(true);
    setStatusError(null);
    try {
      await patientApi.updateStatus(statusTarget.id, {
        is_active: !statusTarget.is_active,
      });
      setNotice(statusTarget.is_active ? "deactivated" : "activated");
      setStatusTarget(null);
      reload();
    } catch (error) {
      setStatusError(getPatientErrorMessage(error, tErrors));
    } finally {
      setIsStatusPending(false);
    }
  };

  const patients = data?.items ?? [];

  return (
    <div>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("title")} />

      <div className="space-y-4">
        {notice && (
          <Alert variant="success">
            <AlertDescription>{t(`notices.${notice}`)}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <PatientsFilters filters={filters} onChange={updateFilters} />
            <Can permission="patient.create">
              <Button
                size="sm"
                nativeButton={false}
                render={<Link to="/patients/create" />}
              >
                <PlusIcon className="fill-current" />
                {t("newPatient")}
              </Button>
            </Can>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5">
            {error ? (
              <div className="space-y-4 p-4 sm:p-6">
                <Alert variant="destructive">
                  <AlertDescription>
                    {getPatientErrorMessage(error, tErrors)}
                  </AlertDescription>
                </Alert>
                <Button variant="outline" size="sm" onClick={reload}>
                  <RegenerateIcon className="fill-current" />
                  {t("retry")}
                </Button>
              </div>
            ) : !data ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
                <Spinner />
                {t("loading")}
              </div>
            ) : (
              <div
                className={isLoading ? "opacity-60 transition-opacity" : ""}
                aria-busy={isLoading}
              >
                {patients.length === 0 ? (
                  <p className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {hasFilters ? t("noResults") : t("empty")}
                  </p>
                ) : (
                  <PatientsTable
                    patients={patients}
                    onToggleStatus={setStatusTarget}
                  />
                )}
                {data.total > 0 && (
                  <PatientsPagination
                    page={data.page}
                    pageSize={data.page_size || PATIENTS_PAGE_SIZE}
                    total={data.total}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PatientStatusDialog
        patient={statusTarget}
        isPending={isStatusPending}
        error={statusError}
        onConfirm={confirmStatusChange}
        onClose={closeStatusDialog}
      />
    </div>
  );
}
