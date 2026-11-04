import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale, useTranslations } from "@/i18n";
import { Link } from "react-router";
import { useTargetLabels, targetKey } from "../hooks/use-target-labels";
import type { ScheduleException } from "../types/schedule-exception.types";
import { formatDateTimeWithZone } from "../utils/schedule-exception-datetime.utils";
import {
  ExceptionTypeBadge,
  ScheduleExceptionTarget,
} from "./schedule-exception-badges";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

/**
 * Cada fila es un bloqueo extraordinario. No hay acción de eliminar: el backend
 * no expone `DELETE` para las excepciones.
 */
export function ScheduleExceptionsTable({
  exceptions,
}: {
  exceptions: ScheduleException[];
}) {
  const t = useTranslations("scheduleExceptions");
  const locale = useLocale();
  const labels = useTargetLabels(exceptions);

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/5">
          <TableRow>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.id")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.target")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.type")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.reason")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.startsAt")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.endsAt")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.actions")}
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
          {exceptions.map((exception) => (
            <TableRow
              key={exception.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} text-gray-500 dark:text-gray-400`}
              >
                {exception.id}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <ScheduleExceptionTarget
                  exception={exception}
                  label={labels[targetKey(exception)]}
                />
              </TableCell>
              <TableCell className={BODY_CELL}>
                <ExceptionTypeBadge type={exception.exception_type} />
              </TableCell>
              <TableCell
                className={`${BODY_CELL} max-w-xs text-gray-500 dark:text-gray-400`}
              >
                <span className="line-clamp-2">
                  {exception.reason ?? t("noValue")}
                </span>
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTimeWithZone(exception.starts_at, locale)}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTimeWithZone(exception.ends_at, locale)}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={
                      <Link to={`/schedule-exceptions/${exception.id}`} />
                    }
                  >
                    {t("actions.view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={
                      <Link to={`/schedule-exceptions/${exception.id}/edit`} />
                    }
                  >
                    {t("actions.edit")}
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
