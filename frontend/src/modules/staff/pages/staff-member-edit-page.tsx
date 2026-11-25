import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { getPersonFullName } from "@/modules/persons";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { StaffMemberEditForm } from "../components/staff-member-edit-form";
import { StaffMemberStatusBadge } from "../components/staff-member-status-badge";
import { StaffRolesEditor } from "../components/staff-roles-editor";
import { StaffSchedulesEditor } from "../components/staff-schedules-editor";
import { StaffSpecialtiesEditor } from "../components/staff-specialties-editor";
import { useStaffMember } from "../hooks/use-staff-member";
import type { StaffMemberFormValues } from "../schemas/staff-member-schema";
import { staffMemberApi } from "../services/staff-member-api";
import { getStaffMemberErrorMessage } from "../utils/staff-member-error.utils";
import {
  toFormValues,
  toUpdatePayload,
} from "../utils/staff-member-payload.utils";

export default function StaffMemberEditPage() {
  const t = useTranslations("staff");
  const tErrors = useTranslations("staff.errors");
  const navigate = useNavigate();
  const { staffId } = useParams();
  const { staffMember, error, isInvalidId, isLoading } = useStaffMember(
    Number(staffId),
  );
  const [noChanges, setNoChanges] = useState(false);

  const handleSubmit = async (values: StaffMemberFormValues) => {
    if (!staffMember) return;
    setNoChanges(false);
    const payload = toUpdatePayload(values, staffMember);
    if (Object.keys(payload).length === 0) {
      setNoChanges(true);
      return;
    }
    await staffMemberApi.update(staffMember.id, payload);
    void navigate("/staff", { state: { notice: "updated" } });
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
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              {t("columns.status")}:{" "}
              <StaffMemberStatusBadge isActive={staffMember.is_active} />
            </span>
            <Link
              to={`/persons/${staffMember.person_id}/edit`}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              {t("form.editPersonLink")}
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("form.personDataHint")}
          </p>
          {noChanges && (
            <Alert variant="info">
              <AlertDescription>{t("form.noChanges")}</AlertDescription>
            </Alert>
          )}
          <StaffMemberEditForm
            key={staffMember.id}
            defaultValues={toFormValues(staffMember)}
            onSubmit={handleSubmit}
          />
          <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("roles.title")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("roles.hint")}
              </p>
            </div>
            <StaffRolesEditor staffMemberId={staffMember.id} />
          </section>
          <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("specialties.title")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("specialties.hint")}
              </p>
            </div>
            <StaffSpecialtiesEditor staffMemberId={staffMember.id} />
          </section>
          <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("schedules.title")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("schedules.editHint")}
              </p>
            </div>
            <StaffSchedulesEditor staffMemberId={staffMember.id} />
          </section>
        </ComponentCard>
      )}
    </div>
  );
}
