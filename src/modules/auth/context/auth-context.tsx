import { configureApiAuth, isAbortError, isApiError } from "@/services/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../services/auth-api";
import type { CurrentUser, SessionEndReason } from "../types/auth.types";
import { readJwtTimes } from "../utils/jwt.utils";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "../utils/permission.utils";
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
} from "../utils/session-storage.utils";

/** Aviso de expiración: faltan 60 s para `exp`. */
const WARNING_BEFORE_MS = 60_000;
/** `setTimeout` desborda por encima de 2^31 − 1 ms. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface Session {
  token: string;
  user: CurrentUser;
  /** Instante de expiración en hora del cliente (ya corregido por el desfase). */
  expiresAt: number;
}

interface AuthContextValue {
  status: SessionStatus;
  user: CurrentUser | null;
  /** Por qué terminó la sesión anterior (para el mensaje del login). */
  sessionEndReason: SessionEndReason | null;
  /** Hay que avisar que la sesión expira en un minuto. */
  isExpiryWarningVisible: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  dismissExpiryWarning: () => void;
  /** Reintenta la comprobación inicial tras un error de conexión. */
  retry: () => void;
  can: (permission: string) => boolean;
  canAny: (permissions: readonly string[]) => boolean;
  canAll: (permissions: readonly string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Expiración efectiva en hora del cliente: `exp` − (reloj servidor − reloj cliente). */
function toClientExpiry(token: string, clockSkewMs: number): number | null {
  const times = readJwtTimes(token);
  return times ? times.expMs - clockSkewMs : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [sessionEndReason, setSessionEndReason] =
    useState<SessionEndReason | null>(null);
  const [warning, setWarning] = useState<{
    token: string;
    dismissed: boolean;
  } | null>(null);
  const [initAttempt, setInitAttempt] = useState(0);

  // Fuente síncrona del token para el cliente HTTP (el estado llega tarde).
  const tokenRef = useRef<string | null>(null);
  const warnedTokenRef = useRef<string | null>(null);

  const endSession = useCallback((reason: SessionEndReason) => {
    tokenRef.current = null;
    warnedTokenRef.current = null;
    clearStoredSession();
    setSession(null);
    setWarning(null);
    setSessionEndReason(reason);
    setStatus("unauthenticated");
  }, []);

  // Cliente HTTP: adjunta el token y centraliza el 401. Se ignora un 401 de un
  // token que ya no es el vigente (varias peticiones fallando a la vez, o un
  // 401 tardío tras volver a iniciar sesión) para no cerrar la sesión nueva.
  useEffect(() => {
    configureApiAuth({
      getToken: () => tokenRef.current,
      onUnauthorized: (usedToken) => {
        if (tokenRef.current === usedToken) endSession("unauthorized");
      },
    });
    return () => configureApiAuth(null);
  }, [endSession]);

  // Inicialización: validar expiración y recuperar usuario, roles y permisos.
  useEffect(() => {
    const stored = loadStoredSession();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    const expiresAt = toClientExpiry(stored.token, stored.clockSkewMs);
    if (expiresAt === null) {
      clearStoredSession();
      setStatus("unauthenticated");
      return;
    }
    if (expiresAt <= Date.now()) {
      clearStoredSession();
      setSessionEndReason("expired");
      setStatus("unauthenticated");
      return;
    }

    const controller = new AbortController();
    tokenRef.current = stored.token;
    setStatus("loading");
    authApi
      .me({ signal: controller.signal })
      .then((user) => {
        setSession({ token: stored.token, user, expiresAt });
        setStatus("authenticated");
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        // 401 ya cerró la sesión vía onUnauthorized. Un fallo de conexión o
        // de servidor no invalida un token que puede seguir siendo válido.
        if (isApiError(error) && error.status === 401) return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [initAttempt]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    const times = readJwtTimes(result.access_token);
    const now = Date.now();
    // `iat` marca la hora del servidor al emitir el token (precisión de 1 s).
    const clockSkewMs = times?.iatMs != null ? times.iatMs - now : 0;
    const expiresAt =
      times != null
        ? times.expMs - clockSkewMs
        : now + result.expires_in * 1000;

    saveStoredSession({ token: result.access_token, clockSkewMs });
    tokenRef.current = result.access_token;
    warnedTokenRef.current = null;
    setSessionEndReason(null);
    setWarning(null);
    setSession({ token: result.access_token, user: result.user, expiresAt });
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // El token se descarta igualmente; el backend solo registra el evento.
    }
    endSession("logout");
  }, [endSession]);

  // Control de expiración a partir de `exp`: un único temporizador por token,
  // recalculado al volver a la pestaña (suspensión, timers retrasados).
  const token = session?.token ?? null;
  const expiresAt = session?.expiresAt ?? null;
  useEffect(() => {
    if (token === null || expiresAt === null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const evaluate = () => {
      clearTimeout(timer);
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        endSession("expired");
        return;
      }
      if (remaining <= WARNING_BEFORE_MS && warnedTokenRef.current !== token) {
        warnedTokenRef.current = token;
        setWarning({ token, dismissed: false });
      }
      const untilNextEvent =
        remaining > WARNING_BEFORE_MS
          ? remaining - WARNING_BEFORE_MS
          : remaining;
      timer = setTimeout(evaluate, Math.min(untilNextEvent, MAX_TIMEOUT_MS));
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") evaluate();
    };

    evaluate();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", evaluate);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", evaluate);
    };
  }, [token, expiresAt, endSession]);

  const dismissExpiryWarning = useCallback(
    () => setWarning((current) => current && { ...current, dismissed: true }),
    [],
  );
  const retry = useCallback(() => setInitAttempt((attempt) => attempt + 1), []);

  const granted = useMemo<ReadonlySet<string>>(
    () => new Set(session?.user.permissions ?? []),
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      sessionEndReason,
      isExpiryWarningVisible:
        warning !== null && warning.token === token && !warning.dismissed,
      login,
      logout,
      dismissExpiryWarning,
      retry,
      can: (permission) => hasPermission(granted, permission),
      canAny: (permissions) => hasAnyPermission(granted, permissions),
      canAll: (permissions) => hasAllPermissions(granted, permissions),
    }),
    [
      status,
      session,
      sessionEndReason,
      warning,
      token,
      login,
      logout,
      dismissExpiryWarning,
      retry,
      granted,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
