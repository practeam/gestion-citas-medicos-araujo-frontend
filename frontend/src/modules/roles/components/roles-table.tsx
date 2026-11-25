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
import type { Role } from "../types/role.types";
import { RoleStatusBadge } from "./role-status-badge";

const HEADER_CELL =
  "px-5 py-3 text-start text-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start text-sm sm:px-6";

interface RolesTableProps {
  roles: Role[];
  onToggleStatus: (role: Role) => void;
}

export function RolesTable({ roles, onToggleStatus }: RolesTableProps) {
  const t = useTranslations("roles");

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
          {roles.map((role) => (
            <TableRow
              key={role.id}
              className="transition hover:bg-gray-50/50 dark:hover:bg-white/2"
            >
              <TableCell
                className={`${BODY_CELL} font-medium text-gray-800 dark:text-white/90`}
              >
                {role.name}
              </TableCell>
              <TableCell
                className={`${BODY_CELL} max-w-md text-gray-500 dark:text-gray-400`}
              >
                <span className="line-clamp-2">
                  {role.description ?? t("noDescription")}
                </span>
              </TableCell>
              <TableCell className={BODY_CELL}>
                <RoleStatusBadge isActive={role.is_active} />
              </TableCell>
              <TableCell className={BODY_CELL}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link to={`/roles/${role.id}`} />}
                  >
                    {t("actions.view")}
                  </Button>
                  <Can permission="role.update">
                    <Button
                      variant="outline"
                      size="xs"
                      nativeButton={false}
                      render={<Link to={`/roles/${role.id}/edit`} />}
                    >
                      {t("actions.edit")}
                    </Button>
                  </Can>
                  <Can permission="role.update">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onToggleStatus(role)}
                    >
                      {role.is_active
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
