/**
 * `ProcedureResponse` de OpenAPI. `base_price` llega como cadena decimal y se
 * conserva así (no se convierte a `float`).
 */
export interface Procedure {
  id: number;
  parent_procedure_id: number | null;
  code: string | null;
  name: string;
  /** Decimal como cadena, p. ej. `"150.00"`. */
  base_price: string;
  base_duration_minutes: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `ProcedureCreateRequest`: no incluye `id`, `is_active` ni auditoría. */
export interface ProcedureCreateRequest {
  name: string;
  base_price: string;
  base_duration_minutes: number;
  parent_procedure_id?: number;
  code?: string;
  description?: string;
}

/** `ProcedureUpdateRequest`: parcial; los opcionales vaciados se envían como `null`. */
export interface ProcedureUpdateRequest {
  name?: string;
  base_price?: string;
  base_duration_minutes?: number;
  parent_procedure_id?: number | null;
  code?: string | null;
  description?: string | null;
}

export interface ProcedureStatusRequest {
  is_active: boolean;
}

export type ProcedureSortField =
  | "id"
  | "name"
  | "code"
  | "base_price"
  | "base_duration_minutes"
  | "created_at";
export type SortOrder = "asc" | "desc";

/** Parámetros de `GET /procedures`; `search` busca por nombre o código (contiene). */
export interface ProcedureListParams {
  page: number;
  page_size: number;
  search?: string;
  is_active?: boolean;
  parent_procedure_id?: number;
  min_price?: string;
  max_price?: string;
  sort_by?: ProcedureSortField;
  order?: SortOrder;
}

export type ProcedureStatusFilter = "all" | "active" | "inactive";
