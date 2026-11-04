import type { ReactNode } from "react";
import { useAuth } from "../context/auth-context";
import ForbiddenPage from "../pages/forbidden-page";

interface RequirePermissionProps {
  permission?: string;
  anyOf?: readonly string[];
  allOf?: readonly string[];
  children: ReactNode;
}

/** Protege una ruta por permisos efectivos; sin permiso muestra "acceso denegado". */
export function RequirePermission({
  permission,
  anyOf,
  allOf,
  children,
}: RequirePermissionProps) {
  const { can, canAny, canAll } = useAuth();
  const allowed =
    (permission === undefined || can(permission)) &&
    (anyOf === undefined || canAny(anyOf)) &&
    (allOf === undefined || canAll(allOf));
  return allowed ? <>{children}</> : <ForbiddenPage />;
}
