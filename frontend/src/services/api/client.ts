import { ApiError } from "./errors";
import type { ApiResponse } from "./types";

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  params?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  /** No adjunta el token (p. ej. el login, que es público). */
  skipAuth?: boolean;
}

/**
 * Enlace con la sesión. Lo registra el AuthProvider; el cliente no conoce
 * React ni el almacenamiento del token.
 */
interface AuthHandlers {
  getToken: () => string | null;
  /** 401 recibido con un token adjunto (se informa el token usado). */
  onUnauthorized: (token: string) => void;
}

let authHandlers: AuthHandlers | null = null;

export function configureApiAuth(handlers: AuthHandlers | null) {
  authHandlers = handlers;
}

function buildUrl(path: string, params?: Record<string, QueryValue>) {
  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function parseBody<T>(
  response: Response,
): Promise<ApiResponse<T> | undefined> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return undefined;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Una petición con token y manejo común de red y 401. Un `FormData` se envía
 * tal cual (el navegador fija el `Content-Type` multipart con su boundary);
 * cualquier otro cuerpo se serializa como JSON.
 */
async function send(
  method: Method,
  path: string,
  { params, body, signal, skipAuth }: RequestOptions,
  accept = "application/json",
): Promise<{ response: Response }> {
  const token = skipAuth ? null : (authHandlers?.getToken() ?? null);
  const isForm = body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      signal,
      headers: {
        Accept: accept,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(body !== undefined &&
          !isForm && { "Content-Type": "application/json" }),
      },
      body:
        body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError("network", 0, "No se pudo conectar con el servidor");
  }

  // 401 con token: sesión inválida o expirada. 403 no toca la sesión.
  if (response.status === 401 && token) authHandlers?.onUnauthorized(token);

  return { response };
}

/** Descarga un binario protegido (la cabecera `Authorization` no viaja en `<img src>`). */
async function requestBlob(
  path: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Blob> {
  const { response } = await send("GET", path, { signal }, "*/*");
  if (!response.ok) {
    const payload = await parseBody<unknown>(response);
    throw new ApiError(
      "http",
      response.status,
      payload?.message || response.statusText,
      payload?.data?.details ?? null,
    );
  }
  return response.blob();
}

/**
 * Cliente HTTP único del frontend. Devuelve `data.result` del envoltorio
 * `ApiResponse` y lanza `ApiError` ante cualquier fallo.
 */
async function request<T>(
  method: Method,
  path: string,
  { params, body, signal, skipAuth }: RequestOptions = {},
): Promise<T> {
  const { response } = await send(method, path, {
    params,
    body,
    signal,
    skipAuth,
  });
  const payload = await parseBody<T>(response);

  if (!response.ok || payload?.error) {
    throw new ApiError(
      "http",
      response.status,
      payload?.message || response.statusText,
      payload?.data?.details ?? null,
    );
  }

  if (!payload || payload.data?.result == null) {
    throw new ApiError(
      "invalid-response",
      response.status,
      "La respuesta del servidor no tiene el formato esperado",
    );
  }

  return payload.data.result;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("DELETE", path, options),
  blob: requestBlob,
};
