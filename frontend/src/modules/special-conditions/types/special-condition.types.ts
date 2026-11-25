/** `SpecialConditionResponse` de OpenAPI. */
export interface SpecialCondition {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `SpecialConditionCreateRequest`: `name` obligatorio (1–120), `description` opcional. */
export interface SpecialConditionCreateRequest {
  name: string;
  description?: string | null;
}

/** `SpecialConditionUpdateRequest`: actualización parcial, solo se envían los campos modificados. */
export interface SpecialConditionUpdateRequest {
  name?: string;
  description?: string | null;
}

export interface SpecialConditionStatusRequest {
  is_active: boolean;
}

/** Parámetros de `GET /special-conditions`. */
export interface SpecialConditionListParams {
  page: number;
  page_size: number;
  name?: string;
  is_active?: boolean;
  sort_by: SpecialConditionSortField;
  order: SortOrder;
}

export type SpecialConditionSortField = "id" | "name" | "created_at";
export type SortOrder = "asc" | "desc";

export type SpecialConditionStatusFilter = "all" | "active" | "inactive";
