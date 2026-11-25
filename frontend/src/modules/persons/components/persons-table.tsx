import { Button } from "@/components/ui/button";
import { Can } from "@/modules/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/i18n";
import { Link } from "react-router";
import type { Person } from "../types/person.types";
import {
  getPersonDocument,
  getPersonFullName,
} from "../utils/person-payload.utils";
import { PersonStatusBadge } from "./person-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface PersonsTableProps {
  persons: Person[];
  onToggleStatus: (person: Person) => void;
}

/** Solo se listan los datos necesarios para identificar a la persona. */
export function PersonsTable({ persons, onToggleStatus }: PersonsTableProps) {
  const t = useTranslations("persons");

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
              {t("columns.status")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.actions")}
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
          {persons.map((person) => (
            <TableRow
              key={person.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                {getPersonFullName(person)}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {getPersonDocument(person) ?? t("noValue")}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <PersonStatusBadge isActive={person.is_active} />
              </TableCell>
              <TableCell className={BODY_CELL}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/persons/${person.id}`} />}
                  >
                    {t("actions.view")}
                  </Button>
                  <Can permission="person.update">
                    <Button
                      variant="outline"
                      size="xs"
                      nativeButton={false}
                      render={<Link to={`/persons/${person.id}/edit`} />}
                    >
                      {t("actions.edit")}
                    </Button>
                  </Can>
                  <Can permission="person.update">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onToggleStatus(person)}
                    >
                      {person.is_active
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
