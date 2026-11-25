/** `PermissionResponse` de OpenAPI. */
export interface Permission {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

/** `PermissionCreateRequest`: `name` con formato `recurso.accion` (máx. 120). */
export interface PermissionCreateRequest {
  name: string;
  description?: string | null;
}

/** `PermissionUpdateRequest`: solo `description` (obligatoria, texto o `null`). */
export interface PermissionUpdateRequest {
  description: string | null;
}

export interface PermissionStatusRequest {
  is_active: boolean;
}

/** Parámetros de `GET /permissions`. */
export interface PermissionListParams {
  page: number;
  page_size: number;
  name?: string;
  is_active?: boolean;
}

export type PermissionStatusFilter = "all" | "active" | "inactive";
