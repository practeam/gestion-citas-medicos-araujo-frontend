export type ApiErrorKind = "network" | "http" | "invalid-response";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** Código HTTP; 0 cuando no hubo respuesta. */
  readonly status: number;
  /** `data.details` del envoltorio de error, si el backend lo envió. */
  readonly details: Record<string, unknown> | null;

  constructor(
    kind: ApiErrorKind,
    status: number,
    message: string,
    details: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Extrae errores por campo de `details`. El formato exacto de `details` en
 * los 422 no está definido en OpenAPI (`object | null`); se acepta una lista
 * estilo FastAPI (`loc` + `msg`) directa o bajo `errors` / `detail`.
 */
export function getFieldErrors(
  details: Record<string, unknown> | null,
): Record<string, string> {
  if (!details) return {};
  const list = [details.errors, details.detail, details.fields].find(
    Array.isArray,
  ) as unknown[] | undefined;
  const result: Record<string, string> = {};
  for (const entry of list ?? []) {
    if (typeof entry !== "object" || entry === null) continue;
    const { loc, msg } = entry as { loc?: unknown; msg?: unknown };
    if (!Array.isArray(loc) || typeof msg !== "string") continue;
    const field = String(loc[loc.length - 1]);
    result[field] ??= msg;
  }
  return result;
}
