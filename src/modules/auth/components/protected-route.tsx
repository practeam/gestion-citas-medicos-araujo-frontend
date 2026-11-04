import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/auth-context";
import { SessionLoading } from "./session-loading";

/**
 * Protección centralizada: todo lo que cuelga de esta ruta exige sesión.
 * Mientras se comprueba la sesión no se muestra ni el login ni el contenido.
 */
export function ProtectedRoute() {
  const { status, sessionEndReason, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") return <SessionLoading />;
  if (status === "error") return <SessionLoading hasError onRetry={retry} />;
  if (status === "unauthenticated") {
    // Tras un cierre de sesión voluntario no se recuerda la ruta anterior.
    const from = sessionEndReason === "logout" ? undefined : location;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return <Outlet />;
}

/** El login solo es para quien no tiene sesión; con sesión vuelve a la app. */
export function PublicOnlyRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") return <SessionLoading />;
  if (status === "error") return <SessionLoading hasError onRetry={retry} />;
  if (status === "authenticated") {
    const from = (
      location.state as {
        from?: { pathname: string; search?: string; hash?: string };
      } | null
    )?.from;
    const target = from
      ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
      : "/";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
