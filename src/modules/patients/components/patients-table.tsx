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
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { Link } from "react-router";
import type { Patient } from "../types/patient.types";
import { formatDateTime } from "../utils/patient-date.utils";
import { PatientStatusBadge } from "./patient-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface PatientsTableProps {
  patients: Patient[];
  onToggleStatus: (patient: Patient) => void;
}

/** Los datos personales salen del objeto `person` de la respuesta. */
export function PatientsTable({
  patients,
  onToggleStatus,
}: PatientsTableProps) {
  const t = useTranslations("patients");
  const tGuardians = useTranslations("guardians");
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
              {t("columns.patientNumber")}
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
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                {getPersonFullName(patient.person)}
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
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/patients/${patient.id}`} />}
                  >
                    {t("actions.view")}
                  </Button>
                  <Can permission="patient_guardian.read">
                    <Button
                      variant="outline"
                      size="xs"
                      nativeButton={false}
                      render={<Link to={`/patients/${patient.id}#guardians`} />}
                    >
                      {tGuardians("section.title")}
                    </Button>
                  </Can>
                  <Can permission="patient.update">
                    <Button
                      variant="outline"
                      size="xs"
                      nativeButton={false}
                      render={<Link to={`/patients/${patient.id}/edit`} />}
                    >
                      {t("actions.edit")}
                    </Button>
                  </Can>
                  <Can permission="patient.update">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onToggleStatus(patient)}
                    >
                      {patient.is_active
                        ? t("actions.deactivate")
                        : t("actions.activate")}
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
