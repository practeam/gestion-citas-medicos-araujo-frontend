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

/**
 * Cliente HTTP único del frontend. Devuelve `data.result` del envoltorio
 * `ApiResponse` y lanza `ApiError` ante cualquier fallo.
 */
async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  { params, body, signal }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError("network", 0, "No se pudo conectar con el servidor");
  }

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
};
