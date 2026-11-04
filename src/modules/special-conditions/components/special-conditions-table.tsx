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
        <TableHeader className="border-b border-gray-100 dark:border-white/5">
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
                    size="xs"
                    nativeButton={false}
                    render={
                      <Link to={`/special-conditions/${specialCondition.id}`} />
                    }
                  >
                    {t("actions.view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={
                      <Link
                        to={`/special-conditions/${specialCondition.id}/edit`}
                      />
                    }
                  >
                    {t("actions.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onToggleStatus(specialCondition)}
                  >
                    {specialCondition.is_active
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
