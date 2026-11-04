import { ComponentCard } from "@/components/shared/component-card";
import { Can } from "@/modules/auth";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { AppointmentsSection } from "@/modules/appointments";
import { Link, useParams } from "react-router";
import { StaffMemberStatusBadge } from "../components/staff-member-status-badge";
import { StaffRolesList } from "../components/staff-roles-list";
import { StaffSchedulesWeek } from "../components/staff-schedules-week";
import { StaffSpecialtiesList } from "../components/staff-specialties-list";
import { useStaffMember } from "../hooks/use-staff-member";
import { formatDate, formatDateTime } from "../utils/staff-member-date.utils";
import { getStaffMemberErrorMessage } from "../utils/staff-member-error.utils";

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

export default function StaffMemberDetailPage() {
  const t = useTranslations("staff");
  const tErrors = useTranslations("staff.errors");
  const locale = useLocale();
  const { staffId } = useParams();
  const { staffMember, error, isInvalidId, isLoading } = useStaffMember(
    Number(staffId),
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
      ) : isInvalidId || error || !staffMember ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getStaffMemberErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/staff" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={getPersonFullName(staffMember.person)}>
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {t("detail.staffMemberData")}
            </h4>
            <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
              <DetailRow label={t("columns.id")}>{staffMember.id}</DetailRow>
              <DetailRow label={t("columns.employeeNumber")}>
                {staffMember.employee_number ?? empty}
              </DetailRow>
              <DetailRow label={t("columns.hireDate")}>
                {staffMember.hire_date
                  ? formatDate(staffMember.hire_date, locale)
                  : empty}
              </DetailRow>
              <DetailRow label={t("columns.status")}>
                <StaffMemberStatusBadge isActive={staffMember.is_active} />
              </DetailRow>
              <DetailRow label={t("columns.createdAt")}>
                {formatDateTime(staffMember.created_at, locale)}
              </DetailRow>
              <DetailRow label={t("columns.updatedAt")}>
                {formatDateTime(staffMember.updated_at, locale)}
              </DetailRow>
            </dl>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("detail.personData")}
              </h4>
              <Link
                to={`/persons/${staffMember.person_id}`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("detail.viewPerson")}
              </Link>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
              <DetailRow label={t("detail.firstName")}>
                {staffMember.person.first_name}
              </DetailRow>
              <DetailRow label={t("detail.lastName")}>
                {[
                  staffMember.person.last_name,
                  staffMember.person.maternal_last_name,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </DetailRow>
              <DetailRow label={t("columns.document")}>
                {getPersonDocument(staffMember.person) ?? empty}
              </DetailRow>
              <DetailRow label={t("detail.personStatus")}>
                <StaffMemberStatusBadge
                  isActive={staffMember.person.is_active}
                />
              </DetailRow>
            </dl>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("roles.title")}
              </h4>
              <Link
                to={`/staff/${staffMember.id}/edit`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("roles.manageInEdit")}
              </Link>
            </div>
            <StaffRolesList staffMemberId={staffMember.id} />
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("specialties.title")}
              </h4>
              <Link
                to={`/staff/${staffMember.id}/edit`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("specialties.manageInEdit")}
              </Link>
            </div>
            <StaffSpecialtiesList staffMemberId={staffMember.id} />
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("schedules.title")}
              </h4>
              <Link
                to={`/staff/${staffMember.id}/edit`}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t("schedules.manageInEdit")}
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("schedules.declaredNote")}
            </p>
            <StaffSchedulesWeek staffMemberId={staffMember.id} />
          </section>

          <AppointmentsSection owner={{ type: "staff", id: staffMember.id }} />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/staff" />}
            >
              {t("form.backToList")}
            </Button>
            <Can permission="staff_member.update">
              <Button
                nativeButton={false}
                render={<Link to={`/staff/${staffMember.id}/edit`} />}
              >
                {t("actions.edit")}
              </Button>
            </Can>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
