/** `PersonSummary` de OpenAPI: datos básicos de la persona que entrega la API de pacientes. */
export interface PatientPerson {
  id: number;
  first_name: string;
  last_name: string;
  maternal_last_name: string | null;
  document_type: string | null;
  document_number: string | null;
  is_active: boolean;
}

/** `PatientResponse` de OpenAPI. Los datos personales viven solo en `person`. */
export interface Patient {
  id: number;
  person_id: number;
  patient_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  person: PatientPerson;
}

/** `PatientCreateRequest`: solo `person_id` es obligatorio. */
export interface PatientCreateRequest {
  person_id: number;
  patient_number?: string | null;
  notes?: string | null;
}

/** `PatientUpdateRequest`: parcial; no incluye `person_id` ni datos personales. */
export interface PatientUpdateRequest {
  patient_number?: string | null;
  notes?: string | null;
}

export interface PatientStatusRequest {
  is_active: boolean;
}

export type PatientSortField =
  "id" | "created_at" | "patient_number" | "last_name";
export type SortOrder = "asc" | "desc";

/** Parámetros de `GET /patients`; `document_number` y `patient_number` son exactos. */
export interface PatientListParams {
  page: number;
  page_size: number;
  name?: string;
  document_number?: string;
  patient_number?: string;
  is_active?: boolean;
  sort_by: PatientSortField;
  order: SortOrder;
}

export type PatientStatusFilter = "all" | "active" | "inactive";
