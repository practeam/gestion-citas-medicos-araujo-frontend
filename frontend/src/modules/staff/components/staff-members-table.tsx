import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Can } from "@/modules/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale, useTranslations } from "@/i18n";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ChevronUpDownIcon,
  EyeIcon,
  PencilIcon,
  XIcon,
} from "@/icons";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { getInitials } from "@/utils/get-initials";
import { Link } from "react-router";
import type {
  SortOrder,
  StaffMember,
  StaffMemberSortField,
} from "../types/staff-member.types";
import { formatDate, formatDateTime } from "../utils/staff-member-date.utils";
import { StaffMemberStatusBadge } from "./staff-member-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface StaffMembersTableProps {
  staffMembers: StaffMember[];
  sortBy: StaffMemberSortField;
  order: SortOrder;
  onSort: (field: StaffMemberSortField) => void;
  onToggleStatus: (staffMember: StaffMember) => void;
}

/** Los datos personales salen del objeto `person` de la respuesta. */
export function StaffMembersTable({
  staffMembers,
  sortBy,
  order,
  onSort,
  onToggleStatus,
}: StaffMembersTableProps) {
  const t = useTranslations("staff");
  const locale = useLocale();
  const sortIcon = (field: StaffMemberSortField) => {
    if (sortBy !== field) {
      return <ChevronUpDownIcon className="size-3.5 text-gray-400" />;
    }
    return order === "asc" ? (
      <ArrowUpIcon className="size-3.5 text-green-500" />
    ) : (
      <ArrowDownIcon className="size-3.5 text-red-500" />
    );
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/4">
          <TableRow>
            <TableCell
              isHeader
              className={HEADER_CELL}
              aria-sort={
                sortBy === "id"
                  ? order === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <Button
                variant="ghost"
                size="xs"
                className="-ms-3 text-xs font-medium text-gray-500 dark:text-gray-400"
                onClick={() => onSort("id")}
              >
                {t("columns.id")}
                {sortIcon("id")}
              </Button>
            </TableCell>
            <TableCell
              isHeader
              className={HEADER_CELL}
              aria-sort={
                sortBy === "last_name"
                  ? order === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <Button
                variant="ghost"
                size="xs"
                className="-ms-3 text-xs font-medium text-gray-500 dark:text-gray-400"
                onClick={() => onSort("last_name")}
              >
                {t("columns.fullName")}
                {sortIcon("last_name")}
              </Button>
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.document")}
            </TableCell>
            <TableCell
              isHeader
              className={HEADER_CELL}
              aria-sort={
                sortBy === "employee_number"
                  ? order === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <Button
                variant="ghost"
                size="xs"
                className="-ms-3 text-xs font-medium text-gray-500 dark:text-gray-400"
                onClick={() => onSort("employee_number")}
              >
                {t("columns.employeeNumber")}
                {sortIcon("employee_number")}
              </Button>
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.hireDate")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.status")}
            </TableCell>
            <TableCell
              isHeader
              className={HEADER_CELL}
              aria-sort={
                sortBy === "created_at"
                  ? order === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <Button
                variant="ghost"
                size="xs"
                className="-ms-3 text-xs font-medium text-gray-500 dark:text-gray-400"
                onClick={() => onSort("created_at")}
              >
                {t("columns.createdAt")}
                {sortIcon("created_at")}
              </Button>
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.actions")}
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
          {staffMembers.map((staffMember) => (
            <TableRow
              key={staffMember.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                #{staffMember.id}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                <div className="flex items-center gap-3">
                  {getInitials(getPersonFullName(staffMember.person)) && (
                    <Avatar size="sm">
                      <AvatarFallback className="bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                        {getInitials(getPersonFullName(staffMember.person))}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>{getPersonFullName(staffMember.person)}</span>
                </div>
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {getPersonDocument(staffMember.person) ?? t("noValue")}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {staffMember.employee_number ?? t("noValue")}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {staffMember.hire_date
                  ? formatDate(staffMember.hire_date, locale)
                  : t("noValue")}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <StaffMemberStatusBadge isActive={staffMember.is_active} />
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTime(staffMember.created_at, locale)}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                    aria-label={t("actions.view")}
                    title={t("actions.view")}
                    nativeButton={false}
                    render={<Link to={`/staff/${staffMember.id}`} />}
                  >
                    <EyeIcon className="fill-current" />
                  </Button>
                  <Can permission="staff_member.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      aria-label={t("actions.edit")}
                      title={t("actions.edit")}
                      nativeButton={false}
                      render={<Link to={`/staff/${staffMember.id}/edit`} />}
                    >
                      <PencilIcon className="fill-current" />
                    </Button>
                  </Can>
                  <Can permission="staff_member.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className={
                        staffMember.is_active
                          ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          : "border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                      }
                      aria-label={
                        staffMember.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      title={
                        staffMember.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      onClick={() => onToggleStatus(staffMember)}
                    >
                      {staffMember.is_active ? (
                        <XIcon className="fill-current" />
                      ) : (
                        <CheckCircleIcon className="fill-current" />
                      )}
                    </Button>
                  </Can>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
