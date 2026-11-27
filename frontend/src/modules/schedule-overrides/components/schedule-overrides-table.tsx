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
import { CheckCircleIcon, EyeIcon, PencilIcon, XIcon } from "@/icons";
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
        <TableHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/4">
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
                #{override.id}
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
                    size="icon-xs"
                    className="border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                    aria-label={t("actions.view")}
                    title={t("actions.view")}
                    nativeButton={false}
                    render={<Link to={`/schedule-overrides/${override.id}`} />}
                  >
                    <EyeIcon className="fill-current" />
                  </Button>
                  <Can permission="schedule_override.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      aria-label={t("actions.edit")}
                      title={t("actions.edit")}
                      nativeButton={false}
                      render={
                        <Link to={`/schedule-overrides/${override.id}/edit`} />
                      }
                    >
                      <PencilIcon className="fill-current" />
                    </Button>
                  </Can>
                  <Can permission="schedule_override.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className={
                        override.is_active
                          ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          : "border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                      }
                      aria-label={
                        override.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      title={
                        override.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      onClick={() => onToggleStatus(override)}
                    >
                      {override.is_active ? (
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
