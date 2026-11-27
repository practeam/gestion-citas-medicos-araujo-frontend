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
import { getInitials } from "@/utils/get-initials";
import { Link } from "react-router";
import type { Person, PersonSortField, SortOrder } from "../types/person.types";
import { formatDateTime } from "../utils/person-date.utils";
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
  sortBy: PersonSortField;
  order: SortOrder;
  onSort: (field: PersonSortField) => void;
  onToggleStatus: (person: Person) => void;
}

/** Solo se listan los datos necesarios para identificar a la persona. */
export function PersonsTable({
  persons,
  sortBy,
  order,
  onSort,
  onToggleStatus,
}: PersonsTableProps) {
  const t = useTranslations("persons");
  const locale = useLocale();
  const sortIcon = (field: PersonSortField) => {
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
          {persons.map((person) => (
            <TableRow
              key={person.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                #{person.id}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                <div className="flex items-center gap-3">
                  {getInitials(getPersonFullName(person)) && (
                    <Avatar size="sm">
                      <AvatarFallback className="bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                        {getInitials(getPersonFullName(person))}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>{getPersonFullName(person)}</span>
                </div>
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {getPersonDocument(person) ?? t("noValue")}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <PersonStatusBadge isActive={person.is_active} />
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTime(person.created_at, locale)}
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
                    render={<Link to={`/persons/${person.id}`} />}
                  >
                    <EyeIcon className="fill-current" />
                  </Button>
                  <Can permission="person.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      aria-label={t("actions.edit")}
                      title={t("actions.edit")}
                      nativeButton={false}
                      render={<Link to={`/persons/${person.id}/edit`} />}
                    >
                      <PencilIcon className="fill-current" />
                    </Button>
                  </Can>
                  <Can permission="person.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className={
                        person.is_active
                          ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          : "border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                      }
                      aria-label={
                        person.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      title={
                        person.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      onClick={() => onToggleStatus(person)}
                    >
                      {person.is_active ? (
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
