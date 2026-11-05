/** `PersonSummary` de OpenAPI: datos básicos de la persona que entrega la API de personal. */
export interface StaffMemberPerson {
  id: number;
  first_name: string;
  last_name: string;
  maternal_last_name: string | null;
  document_type: string | null;
  document_number: string | null;
  is_active: boolean;
}

/** `StaffMemberResponse` de OpenAPI. Los datos personales viven solo en `person`. */
export interface StaffMember {
  id: number;
  person_id: number;
  employee_number: string | null;
  /** `YYYY-MM-DD` */
  hire_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  person: StaffMemberPerson;
}

/** `StaffMemberCreateRequest`: `person_id`, `email` y `password` son obligatorios. */
export interface StaffMemberCreateRequest {
  person_id: number;
  /** Correo de inicio de sesión; el backend lo guarda en la persona. */
  email: string;
  /** 8 a 128 caracteres; nunca se devuelve ni se muestra. */
  password: string;
  employee_number?: string | null;
  hire_date?: string | null;
}

/** `StaffMemberUpdateRequest`: parcial; no incluye `person_id`, correo ni datos personales. */
export interface StaffMemberUpdateRequest {
  employee_number?: string | null;
  hire_date?: string | null;
  /** Nueva contraseña, opcional; no puede ser `null`. */
  password?: string;
}

export interface StaffMemberStatusRequest {
  is_active: boolean;
}

export type StaffMemberSortField =
  "id" | "created_at" | "employee_number" | "last_name";
export type SortOrder = "asc" | "desc";

/** Parámetros de `GET /staff`; `document_number` y `employee_number` son exactos. */
export interface StaffMemberListParams {
  page: number;
  page_size: number;
  name?: string;
  document_number?: string;
  employee_number?: string;
  is_active?: boolean;
  sort_by: StaffMemberSortField;
  order: SortOrder;
}

export type StaffMemberStatusFilter = "all" | "active" | "inactive";
