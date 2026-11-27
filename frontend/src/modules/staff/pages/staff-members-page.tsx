import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Can } from "@/modules/auth";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { PlusIcon } from "@/icons";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { StaffMemberStatusDialog } from "../components/staff-member-status-dialog";
import { StaffMembersFilters } from "../components/staff-members-filters";
import { StaffMembersPagination } from "../components/staff-members-pagination";
import { StaffMembersTable } from "../components/staff-members-table";
import {
  STAFF_MEMBERS_PAGE_SIZE,
  useStaffMembers,
} from "../hooks/use-staff-members";
import { staffMemberApi } from "../services/staff-member-api";
import type {
  StaffMember,
  StaffMemberSortField,
} from "../types/staff-member.types";
import { getStaffMemberErrorMessage } from "../utils/staff-member-error.utils";

type Notice = "created" | "updated" | "activated" | "deactivated";

export default function StaffMembersPage() {
  const t = useTranslations("staff");
  const tErrors = useTranslations("staff.errors");
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
  } = useStaffMembers();

  const [notice, setNotice] = useState<Notice | null>(
    (location.state as { notice?: Notice } | null)?.notice ?? null,
  );
  const [statusTarget, setStatusTarget] = useState<StaffMember | null>(null);
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
      await staffMemberApi.updateStatus(statusTarget.id, {
        is_active: !statusTarget.is_active,
      });
      setNotice(statusTarget.is_active ? "deactivated" : "activated");
      setStatusTarget(null);
      reload();
    } catch (error) {
      setStatusError(getStaffMemberErrorMessage(error, tErrors));
    } finally {
      setIsStatusPending(false);
    }
  };

  const staffMembers = data?.items ?? [];
  const sortStaffMembers = (field: StaffMemberSortField) => {
    updateFilters({
      sortBy: field,
      order:
        filters.sortBy === field && filters.order === "asc" ? "desc" : "asc",
    });
  };

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
            <StaffMembersFilters filters={filters} onChange={updateFilters} />
            <Can permission="staff_member.create">
              <Button nativeButton={false} render={<Link to="/staff/create" />}>
                <PlusIcon className="fill-current" />
                {t("newStaffMember")}
              </Button>
            </Can>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5">
            {error ? (
              <div className="space-y-4 p-4 sm:p-6">
                <Alert variant="destructive">
                  <AlertDescription>
                    {getStaffMemberErrorMessage(error, tErrors)}
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={reload}>
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
                {staffMembers.length === 0 ? (
                  <p className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    {hasFilters ? t("noResults") : t("empty")}
                  </p>
                ) : (
                  <StaffMembersTable
                    staffMembers={staffMembers}
                    sortBy={filters.sortBy}
                    order={filters.order}
                    onSort={sortStaffMembers}
                    onToggleStatus={setStatusTarget}
                  />
                )}
                {data.total > 0 && (
                  <StaffMembersPagination
                    page={data.page}
                    pageSize={data.page_size || STAFF_MEMBERS_PAGE_SIZE}
                    total={data.total}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <StaffMemberStatusDialog
        staffMember={statusTarget}
        isPending={isStatusPending}
        error={statusError}
        onConfirm={confirmStatusChange}
        onClose={closeStatusDialog}
      />
    </div>
  );
}
