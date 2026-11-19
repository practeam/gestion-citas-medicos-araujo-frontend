/** `PersonResponse` de OpenAPI. No incluye `password_hash`. */
export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  maternal_last_name: string | null;
  document_type: string | null;
  document_number: string | null;
  is_active: boolean;
  /** `YYYY-MM-DD` */
  birth_date: string | null;
  phone: string | null;
  phone_whatsapp: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

/** `PersonCreateRequest`: `first_name` y `last_name` obligatorios. */
export interface PersonCreateRequest {
  first_name: string;
  last_name: string;
  maternal_last_name?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  phone_whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
}

/** `PersonUpdateRequest`: parcial; `first_name` y `last_name` no admiten `null`. */
export interface PersonUpdateRequest {
  first_name?: string;
  last_name?: string;
  maternal_last_name?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  phone_whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface PersonStatusRequest {
  is_active: boolean;
}

export type PersonSortField = "id" | "last_name" | "first_name" | "created_at";
export type SortOrder = "asc" | "desc";

/** Parámetros de `GET /persons`. `document_number` es coincidencia exacta. */
export interface PersonListParams {
  page: number;
  page_size: number;
  name?: string;
  document_type?: string;
  document_number?: string;
  is_active?: boolean;
  sort_by: PersonSortField;
  order: SortOrder;
}

export type PersonStatusFilter = "all" | "active" | "inactive";
