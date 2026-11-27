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
import type { SpecialCondition } from "../types/special-condition.types";
import { formatDateTime } from "../utils/special-condition-date.utils";
import { SpecialConditionStatusBadge } from "./special-condition-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface SpecialConditionsTableProps {
  specialConditions: SpecialCondition[];
  onToggleStatus: (specialCondition: SpecialCondition) => void;
}

export function SpecialConditionsTable({
  specialConditions,
  onToggleStatus,
}: SpecialConditionsTableProps) {
  const t = useTranslations("specialConditions");
  const locale = useLocale();

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/4">
          <TableRow>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.name")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.description")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.status")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.createdAt")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.updatedAt")}
            </TableCell>
            <TableCell isHeader className={HEADER_CELL}>
              {t("columns.actions")}
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
          {specialConditions.map((specialCondition) => (
            <TableRow
              key={specialCondition.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                {specialCondition.name}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} max-w-md text-gray-500 dark:text-gray-400`}
              >
                <span className="line-clamp-2">
                  {specialCondition.description ?? t("noDescription")}
                </span>
              </TableCell>
              <TableCell className={BODY_CELL}>
                <SpecialConditionStatusBadge
                  isActive={specialCondition.is_active}
                />
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTime(specialCondition.created_at, locale)}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} whitespace-nowrap text-gray-500 dark:text-gray-400`}
              >
                {formatDateTime(specialCondition.updated_at, locale)}
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
                    render={
                      <Link to={`/special-conditions/${specialCondition.id}`} />
                    }
                  >
                    <EyeIcon className="fill-current" />
                  </Button>
                  <Can permission="special_condition.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      aria-label={t("actions.edit")}
                      title={t("actions.edit")}
                      nativeButton={false}
                      render={
                        <Link
                          to={`/special-conditions/${specialCondition.id}/edit`}
                        />
                      }
                    >
                      <PencilIcon className="fill-current" />
                    </Button>
                  </Can>
                  <Can permission="special_condition.update">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className={
                        specialCondition.is_active
                          ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          : "border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                      }
                      aria-label={
                        specialCondition.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      title={
                        specialCondition.is_active
                          ? t("actions.deactivate")
                          : t("actions.activate")
                      }
                      onClick={() => onToggleStatus(specialCondition)}
                    >
                      {specialCondition.is_active ? (
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
