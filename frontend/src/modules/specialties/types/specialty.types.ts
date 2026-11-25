/** `SpecialtyResponse` de OpenAPI. */
export interface Specialty {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `SpecialtyCreateRequest`: `name` obligatorio (1–120), `description` opcional. */
export interface SpecialtyCreateRequest {
  name: string;
  description?: string | null;
}

/** `SpecialtyUpdateRequest`: actualización parcial, solo se envían los campos modificados. */
export interface SpecialtyUpdateRequest {
  name?: string;
  description?: string | null;
}

export interface SpecialtyStatusRequest {
  is_active: boolean;
}

/** Parámetros de `GET /specialties`. */
export interface SpecialtyListParams {
  page: number;
  page_size: number;
  name?: string;
  is_active?: boolean;
  sort_by: SpecialtySortField;
  order: SortOrder;
}

export type SpecialtySortField = "id" | "name" | "created_at";
export type SortOrder = "asc" | "desc";

export type SpecialtyStatusFilter = "all" | "active" | "inactive";
