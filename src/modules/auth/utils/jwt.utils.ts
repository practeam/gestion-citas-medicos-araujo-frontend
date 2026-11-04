interface JwtTimes {
  /** `exp` en milisegundos Unix (el claim son segundos). */
  expMs: number;
  /** `iat` en milisegundos Unix, si el token lo trae. */
  iatMs: number | null;
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Lee `exp` e `iat` del payload sin verificar la firma (solo la verifica el
 * backend). Devuelve `null` si el token no es un JWT legible con `exp`.
 */
export function readJwtTimes(token: string): JwtTimes | null {
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(token.split(".")[1]));
    if (typeof payload !== "object" || payload === null) return null;
    const { exp, iat } = payload as { exp?: unknown; iat?: unknown };
    if (typeof exp !== "number" || !Number.isFinite(exp)) return null;
    return {
      expMs: exp * 1000,
      iatMs:
        typeof iat === "number" && Number.isFinite(iat) ? iat * 1000 : null,
    };
  } catch {
    return null;
  }
}
