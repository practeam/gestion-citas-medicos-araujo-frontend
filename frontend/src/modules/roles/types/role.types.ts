/** `RoleResponse` de OpenAPI. */
export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

/** `RoleCreateRequest`: `name` obligatorio (1–80), `description` opcional. */
export interface RoleCreateRequest {
  name: string;
  description?: string | null;
}

/** `RoleUpdateRequest`: actualización parcial, solo se envían los campos modificados. */
export interface RoleUpdateRequest {
  name?: string;
  description?: string | null;
}

export interface RoleStatusRequest {
  is_active: boolean;
}

/** Parámetros de `GET /roles`. */
export interface RoleListParams {
  page: number;
  page_size: number;
  name?: string;
  is_active?: boolean;
}

export type RoleStatusFilter = "all" | "active" | "inactive";
