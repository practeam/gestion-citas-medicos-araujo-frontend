import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale, useTranslations } from "@/i18n";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { Link } from "react-router";
import type { StaffMember } from "../types/staff-member.types";
import { formatDate, formatDateTime } from "../utils/staff-member-date.utils";
import { StaffMemberStatusBadge } from "./staff-member-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface StaffMembersTableProps {
  staffMembers: StaffMember[];
  onToggleStatus: (staffMember: StaffMember) => void;
}

/** Los datos personales salen del objeto `person` de la respuesta. */
export function StaffMembersTable({
  staffMembers,
  onToggleStatus,
}: StaffMembersTableProps) {
  const t = useTranslations("staff");
  const locale = useLocale();

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/5">
          <TableRow>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.fullName")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.document")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.employeeNumber")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.hireDate")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.status")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.createdAt")}
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
                {getPersonFullName(staffMember.person)}
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
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/staff/${staffMember.id}`} />}
                  >
                    {t("actions.view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/staff/${staffMember.id}/edit`} />}
                  >
                    {t("actions.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onToggleStatus(staffMember)}
                  >
                    {staffMember.is_active
                      ? t("actions.deactivate")
                      : t("actions.activate")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
