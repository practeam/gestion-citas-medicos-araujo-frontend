import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  UsersIcon,
  XIcon,
} from "@/icons";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { getInitials } from "@/utils/get-initials";
import { Link } from "react-router";
import type {
  Patient,
  PatientSortField,
  SortOrder,
} from "../types/patient.types";
import { formatDateTime } from "../utils/patient-date.utils";
import { PatientStatusBadge } from "./patient-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface PatientsTableProps {
  patients: Patient[];
  sortBy: PatientSortField;
  order: SortOrder;
  onSort: (field: PatientSortField) => void;
  onToggleStatus: (patient: Patient) => void;
}

/** Los datos personales salen del objeto `person` de la respuesta. */
export function PatientsTable({
  patients,
  sortBy,
  order,
  onSort,
  onToggleStatus,
}: PatientsTableProps) {
  const t = useTranslations("patients");
  const tGuardians = useTranslations("guardians");
  const locale = useLocale();
  const sortIcon = (field: PatientSortField) => {
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
                sortBy === "patient_number"
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
                onClick={() => onSort("patient_number")}
              >
                {t("columns.patientNumber")}
                {sortIcon("patient_number")}
              </Button>
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
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                <div className="flex items-center gap-3">
                  {getInitials(getPersonFullName(patient.person)) && (
                    <Avatar size="sm">
                      <AvatarFallback className="bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                        {getInitials(getPersonFullName(patient.person))}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>{getPersonFullName(patient.person)}</span>
                </div>
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {getPersonDocument(patient.person) ?? t("noValue")}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {patient.patient_number ?? t("noValue")}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <PatientStatusBadge isActive={patient.is_active} />
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTime(patient.created_at, locale)}
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
                    render={<Link to={`/patients/${patient.id}`} />}
                  >
                    <EyeIcon className="fill-current" />
                  </Button>
                  <Can permission="patient_guardian.read">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="border-purple-200 text-purple-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-500/30 dark:text-purple-400 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
                      aria-label={tGuardians("section.title")}
                      title={tGuardians("section.title")}
                      nativeButton={false}
                      render={<Link to={`/patients/${patient.id}#guardians`} />}
                    >
                      <UsersIcon className="fill-current" />
                    </Button>
                  </Can>
                  <Can permission="patient.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      aria-label={t("actions.edit")}
                      title={t("actions.edit")}
                      nativeButton={false}
                      render={<Link to={`/patients/${patient.id}/edit`} />}
                    >
                      <PencilIcon className="fill-current" />
                    </Button>
                  </Can>
                  <Can permission="patient.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className={
                        patient.is_active
                          ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          : "border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                      }
                      aria-label={
                        patient.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      title={
                        patient.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      onClick={() => onToggleStatus(patient)}
                    >
                      {patient.is_active ? (
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
