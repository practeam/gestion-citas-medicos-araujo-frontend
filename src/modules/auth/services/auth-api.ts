import { apiClient } from "@/services/api";
import type {
  CurrentUser,
  LoginRequest,
  LoginResult,
  LogoutResult,
} from "../types/auth.types";

interface Options {
  signal?: AbortSignal;
}

export const authApi = {
  /** Público: no adjunta token; un 401 aquí significa credenciales inválidas. */
  login: (body: LoginRequest) =>
    apiClient.post<LoginResult>("/auth/login", body, { skipAuth: true }),

  me: ({ signal }: Options = {}) =>
    apiClient.get<CurrentUser>("/auth/me", { signal }),

  /** El JWT es stateless: el backend solo registra el evento. */
  logout: () => apiClient.post<LogoutResult>("/auth/logout", {}),
};
