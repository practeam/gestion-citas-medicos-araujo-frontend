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
import type { Permission } from "../types/permission.types";
import { PermissionStatusBadge } from "./permission-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface PermissionsTableProps {
  permissions: Permission[];
  onToggleStatus: (permission: Permission) => void;
}

export function PermissionsTable({
  permissions,
  onToggleStatus,
}: PermissionsTableProps) {
  const t = useTranslations("permissions");

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
              {t("columns.actions")}
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
          {permissions.map((permission) => (
            <TableRow
              key={permission.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-mono font-medium text-gray-800 dark:text-white/90`}
              >
                {permission.name}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} max-w-md text-gray-500 dark:text-gray-400`}
              >
                <span className="line-clamp-2">
                  {permission.description ?? t("noDescription")}
                </span>
              </TableCell>
              <TableCell className={BODY_CELL}>
                <PermissionStatusBadge isActive={permission.is_active} />
              </TableCell>
              <TableCell className={BODY_CELL}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/permissions/${permission.id}`} />}
                  >
                    {t("actions.view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/permissions/${permission.id}/edit`} />}
                  >
                    {t("actions.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onToggleStatus(permission)}
                  >
                    {permission.is_active
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
