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
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ChevronUpDownIcon,
  EyeIcon,
  PencilIcon,
  XIcon,
} from "@/icons";
import { Link } from "react-router";
import { useProcedureLabels } from "../hooks/use-procedure-labels";
import type {
  Procedure,
  ProcedureSortField,
  SortOrder,
} from "../types/procedure.types";
import { ProcedureStatusBadge } from "./procedure-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface ProceduresTableProps {
  procedures: Procedure[];
  sortBy: ProcedureSortField;
  order: SortOrder;
  onSort: (field: ProcedureSortField) => void;
  onToggleStatus: (procedure: Procedure) => void;
}

export function ProceduresTable({
  procedures,
  sortBy,
  order,
  onSort,
  onToggleStatus,
}: ProceduresTableProps) {
  const t = useTranslations("procedures");
  const sortIcon = (field: ProcedureSortField) => {
    if (sortBy !== field) {
      return <ChevronUpDownIcon className="size-3.5 text-gray-400" />;
    }
    return order === "asc" ? (
      <ArrowUpIcon className="size-3.5 text-green-500" />
    ) : (
      <ArrowDownIcon className="size-3.5 text-red-500" />
    );
  };
  // Nombre del padre: el listado solo trae su id.
  const parentLabels = useProcedureLabels(
    procedures.flatMap((procedure) =>
      procedure.parent_procedure_id === null
        ? []
        : [procedure.parent_procedure_id],
    ),
  );

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/4">
          <TableRow>
            {(
              [
                ["id", "id"],
                ["code", "code"],
                ["name", "name"],
              ] as const
            ).map(([field, label]) => (
              <TableCell
                key={field}
                isHeader
                className={HEADER_CELL}
                aria-sort={
                  sortBy === field
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
                  onClick={() => onSort(field)}
                >
                  {t(`columns.${label}`)}
                  {sortIcon(field)}
                </Button>
              </TableCell>
            ))}
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.parent")}
            </TableCell>
            {(
              [
                ["base_price", "basePrice"],
                ["base_duration_minutes", "duration"],
              ] as const
            ).map(([field, label]) => (
              <TableCell
                key={field}
                isHeader
                className={HEADER_CELL}
                aria-sort={
                  sortBy === field
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
                  onClick={() => onSort(field)}
                >
                  {t(`columns.${label}`)}
                  {sortIcon(field)}
                </Button>
              </TableCell>
            ))}
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.status")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.actions")}
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
          {procedures.map((procedure) => (
            <TableRow
              key={procedure.id}
              className={`transition hover:bg-gray-50/50 dark:hover:bg-white/2 ${procedure.is_active ? "" : "opacity-70"}`}
            >
              <TableCell
                className={`${BODY_CELL} font-medium whitespace-nowrap text-gray-800 dark:text-white/90`}
              >
                #{procedure.id}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {procedure.code ?? t("noValue")}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                {procedure.name}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} text-gray-500 dark:text-gray-400`}
              >
                {procedure.parent_procedure_id === null ? (
                  t("noValue")
                ) : (
                  <Link
                    to={`/procedures/${procedure.parent_procedure_id}`}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {parentLabels[procedure.parent_procedure_id] ??
                      `#${procedure.parent_procedure_id}`}
                  </Link>
                )}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-700 dark:text-gray-300`}
              >
                {procedure.base_price}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {t("minutes", { count: procedure.base_duration_minutes })}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <ProcedureStatusBadge isActive={procedure.is_active} />
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
                    render={<Link to={`/procedures/${procedure.id}`} />}
                  >
                    <EyeIcon className="fill-current" />
                  </Button>
                  <Can permission="procedure.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      aria-label={t("actions.edit")}
                      title={t("actions.edit")}
                      nativeButton={false}
                      render={<Link to={`/procedures/${procedure.id}/edit`} />}
                    >
                      <PencilIcon className="fill-current" />
                    </Button>
                  </Can>
                  <Can permission="procedure.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className={
                        procedure.is_active
                          ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          : "border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                      }
                      aria-label={
                        procedure.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      title={
                        procedure.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      onClick={() => onToggleStatus(procedure)}
                    >
                      {procedure.is_active ? (
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
