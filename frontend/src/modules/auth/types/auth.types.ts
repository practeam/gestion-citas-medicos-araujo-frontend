/** Contratos de `/auth` (backend: auth_request.py / auth_response.py). */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface CurrentUser {
  person_id: number;
  staff_member_id: number;
  first_name: string;
  last_name: string;
  maternal_last_name: string | null;
  email: string | null;
  /** Nombres de los roles activos. */
  roles: string[];
  /** Permisos efectivos (unión de los roles activos), p. ej. `patient.read`. */
  permissions: string[];
}

export interface LoginResult {
  access_token: string;
  token_type: "bearer";
  /** Vigencia del token en segundos. */
  expires_in: number;
  user: CurrentUser;
}

export interface LogoutResult {
  logged_out: boolean;
}

export type SessionEndReason = "expired" | "unauthorized" | "logout";
