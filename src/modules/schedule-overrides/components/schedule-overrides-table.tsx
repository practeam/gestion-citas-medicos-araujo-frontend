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
import { Link } from "react-router";
import { targetKey, useTargetLabels } from "../hooks/use-target-labels";
import type { ScheduleOverride } from "../types/schedule-override.types";
import { formatDateTimeWithZone } from "../utils/schedule-override-datetime.utils";
import {
  ScheduleOverrideStatusBadge,
  ScheduleOverrideTarget,
} from "./schedule-override-badges";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface ScheduleOverridesTableProps {
  overrides: ScheduleOverride[];
  onToggleStatus: (override: ScheduleOverride) => void;
}

/**
 * Cada fila es una modificación puntual (no un horario semanal). Los inactivos
 * se atenúan: no participan en la disponibilidad. No hay acción de eliminar:
 * el backend no expone `DELETE`.
 */
export function ScheduleOverridesTable({
  overrides,
  onToggleStatus,
}: ScheduleOverridesTableProps) {
  const t = useTranslations("scheduleOverrides");
  const locale = useLocale();
  const labels = useTargetLabels(overrides);

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
              {t("columns.startsAt")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.endsAt")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.reason")}
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
          {overrides.map((override) => (
            <TableRow
              key={override.id}
              className={`transition hover:bg-gray-50/50 dark:hover:bg-white/2 ${override.is_active ? "" : "opacity-70"}`}
            >
              <TableCell
                className={`${BODY_CELL} text-gray-500 dark:text-gray-400`}
              >
                {override.id}
              </TableCell>
              <TableCell className={BODY_CELL}>
                <ScheduleOverrideTarget
                  override={override}
                  label={labels[targetKey(override)]}
                />
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTimeWithZone(override.starts_at, locale)}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTimeWithZone(override.ends_at, locale)}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} max-w-xs text-gray-500 dark:text-gray-400`}
              >
                <span className="line-clamp-2">
                  {override.reason ?? t("noValue")}
                </span>
              </TableCell>
              <TableCell className={BODY_CELL}>
                <ScheduleOverrideStatusBadge isActive={override.is_active} />
              </TableCell>
              <TableCell className={BODY_CELL}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/schedule-overrides/${override.id}`} />}
                  >
                    {t("actions.view")}
                  </Button>
                  <Can permission="schedule_override.update">
                    <Button
                      variant="outline"
                      size="xs"
                      nativeButton={false}
                      render={
                        <Link to={`/schedule-overrides/${override.id}/edit`} />
                      }
                    >
                      {t("actions.edit")}
                    </Button>
                  </Can>
                  <Can permission="schedule_override.update">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onToggleStatus(override)}
                    >
                      {override.is_active
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
