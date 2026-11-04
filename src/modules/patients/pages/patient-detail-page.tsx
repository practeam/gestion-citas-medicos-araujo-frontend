import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { AppointmentsSection } from "@/modules/appointments";
import { Link, useParams } from "react-router";
import { PatientConditionsList } from "../components/patient-conditions-list";
import { PatientStatusBadge } from "../components/patient-status-badge";
import { usePatient } from "../hooks/use-patient";
import { formatDateTime } from "../utils/patient-date.utils";
import { getPatientErrorMessage } from "../utils/patient-error.utils";

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

export default function PatientDetailPage() {
  const t = useTranslations("patients");
  const tErrors = useTranslations("patients.errors");
  const locale = useLocale();
  const { patientId } = useParams();
  const { patient, error, isInvalidId, isLoading } = usePatient(
    Number(patientId),
  );
  const empty = t("noValue");

  return (
    <div>
      <PageMeta title={t("detail.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("detail.title")} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || !patient ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getPatientErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/patients" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={getPersonFullName(patient.person)}>
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {t("detail.patientData")}
            </h4>
            <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
              <DetailRow label={t("columns.id")}>{patient.id}</DetailRow>
              <DetailRow label={t("columns.patientNumber")}>
                {patient.patient_number ?? empty}
              </DetailRow>
              <DetailRow label={t("columns.notes")}>
                {patient.notes ?? empty}
              </DetailRow>
              <DetailRow label={t("columns.status")}>
                <PatientStatusBadge isActive={patient.is_active} />
              </DetailRow>
              <DetailRow label={t("columns.createdAt")}>
                {formatDateTime(patient.created_at, locale)}
              </DetailRow>
              <DetailRow label={t("columns.updatedAt")}>
                {formatDateTime(patient.updated_at, locale)}
              </DetailRow>
            </dl>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("detail.personData")}
              </h4>
              <Link
                to={`/persons/${patient.person_id}`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("detail.viewPerson")}
              </Link>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
              <DetailRow label={t("detail.firstName")}>
                {patient.person.first_name}
              </DetailRow>
              <DetailRow label={t("detail.lastName")}>
                {[patient.person.last_name, patient.person.maternal_last_name]
                  .filter(Boolean)
                  .join(" ")}
              </DetailRow>
              <DetailRow label={t("columns.document")}>
                {getPersonDocument(patient.person) ?? empty}
              </DetailRow>
              <DetailRow label={t("detail.personStatus")}>
                <PatientStatusBadge isActive={patient.person.is_active} />
              </DetailRow>
            </dl>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("conditions.title")}
              </h4>
              <Link
                to={`/patients/${patient.id}/edit`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("conditions.manageInEdit")}
              </Link>
            </div>
            <PatientConditionsList patientId={patient.id} />
          </section>

          <AppointmentsSection owner={{ type: "patient", id: patient.id }} />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/patients" />}
            >
              {t("form.backToList")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to={`/patients/${patient.id}/edit`} />}
            >
              {t("actions.edit")}
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
