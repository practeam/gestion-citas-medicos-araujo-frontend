import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/i18n";
import { Link } from "react-router";
import { useProcedureLabels } from "../hooks/use-procedure-labels";
import type { Procedure } from "../types/procedure.types";
import { ProcedureStatusBadge } from "./procedure-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface ProceduresTableProps {
  procedures: Procedure[];
  onToggleStatus: (procedure: Procedure) => void;
}

export function ProceduresTable({
  procedures,
  onToggleStatus,
}: ProceduresTableProps) {
  const t = useTranslations("procedures");
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
        <TableHeader className="border-b border-gray-100 dark:border-white/5">
          <TableRow>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.code")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.name")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.parent")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.basePrice")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.duration")}
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
          {procedures.map((procedure) => (
            <TableRow
              key={procedure.id}
              className={`transition hover:bg-gray-50/50 dark:hover:bg-white/2 ${procedure.is_active ? "" : "opacity-70"}`}
            >
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
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/procedures/${procedure.id}`} />}
                  >
                    {t("actions.view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/procedures/${procedure.id}/edit`} />}
                  >
                    {t("actions.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onToggleStatus(procedure)}
                  >
                    {procedure.is_active
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
