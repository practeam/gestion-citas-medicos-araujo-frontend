/**
 * Persistencia de la sesión. El backend entrega el JWT en el cuerpo y solo
 * espera `Authorization: Bearer`, así que se guarda en `sessionStorage`:
 * dura lo que la pestaña, no se comparte entre pestañas ni sobrevive al cierre
 * del navegador. No es inmune a XSS (cualquier script de la página puede
 * leerlo); por eso la autorización real queda en el backend y el token es de
 * vida corta, sin refresh tokens.
 */
const STORAGE_KEY = "auth.session";

export interface StoredSession {
  token: string;
  /** Diferencia reloj servidor − reloj cliente (ms), medida al iniciar sesión. */
  clockSkewMs: number;
}

export function loadStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredSession>;
    if (typeof value.token !== "string" || !value.token) return null;
    return {
      token: value.token,
      clockSkewMs:
        typeof value.clockSkewMs === "number" ? value.clockSkewMs : 0,
    };
  } catch {
    return null;
  }
}

export function saveStoredSession(session: StoredSession) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Sin almacenamiento disponible: la sesión vive solo en memoria.
  }
}

export function clearStoredSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar.
  }
}
