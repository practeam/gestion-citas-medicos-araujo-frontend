import type { ReactNode } from "react";
import { useAuth } from "../context/auth-context";

interface CanProps {
  /** Un único permiso. */
  permission?: string;
  /** Basta con uno de estos. */
  anyOf?: readonly string[];
  /** Se requieren todos. */
  allOf?: readonly string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Muestra `children` solo si el usuario tiene los permisos efectivos pedidos.
 * Es una ayuda visual: la autorización real la hace el backend.
 */
export function Can({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: CanProps) {
  const { can, canAny, canAll } = useAuth();
  const allowed =
    (permission === undefined || can(permission)) &&
    (anyOf === undefined || canAny(anyOf)) &&
    (allOf === undefined || canAll(allOf));
  return <>{allowed ? children : fallback}</>;
}
