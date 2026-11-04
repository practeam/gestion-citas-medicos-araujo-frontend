/** `ClinicResponse` de OpenAPI (sin `time_zone`, que no forma parte del contrato). */
export interface Clinic {
  id: number;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `ClinicCreateRequest`: `name` y `address` obligatorios; no admite `is_active`. */
export interface ClinicCreateRequest {
  name: string;
  address: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
}

/** `ClinicUpdateRequest`: parcial; `name` y `address` no admiten `null`. */
export interface ClinicUpdateRequest {
  name?: string;
  address?: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface ClinicStatusRequest {
  is_active: boolean;
}

/** Parámetros de `GET /clinics`. */
export interface ClinicListParams {
  page: number;
  page_size: number;
  name?: string;
  is_active?: boolean;
  sort_by: ClinicSortField;
  order: SortOrder;
}

export type ClinicSortField = "id" | "name" | "created_at";
export type SortOrder = "asc" | "desc";

export type ClinicStatusFilter = "all" | "active" | "inactive";
