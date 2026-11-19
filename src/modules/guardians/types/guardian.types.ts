import type { Person } from "@/modules/persons";

/** Valores de `GuardianRelationship` del backend (`other` no implica un parentesco concreto). */
export const GUARDIAN_RELATIONSHIPS = [
  "mother",
  "father",
  "brother",
  "sister",
  "grandfather",
  "grandmother",
  "uncle",
  "aunt",
  "husband",
  "wife",
  "son",
  "daughter",
  "legal_guardian",
  "other",
] as const;

export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIPS)[number];

/** `PersonSummary`: datos básicos de la persona; el contacto se consulta con `persons`. */
export type GuardianPerson = Pick<
  Person,
  | "id"
  | "first_name"
  | "last_name"
  | "maternal_last_name"
  | "document_type"
  | "document_number"
  | "is_active"
>;

/**
 * `GuardianResponse`: un apoderado de un paciente. `id` es el de la
 * **asociación** (`guardian_id` en las rutas), no el de la persona. Los datos
 * personales viven solo en `person` y no se duplican.
 */
export interface Guardian {
  id: number;
  patient_id: number;
  person_id: number;
  relationship: GuardianRelationship;
  created_at: string;
  updated_at: string;
  person: GuardianPerson;
}

/** `GuardedPatientResponse`: paciente del que una persona es apoderada (sin `notes`). */
export interface GuardedPatient {
  id: number;
  patient_id: number;
  person_id: number;
  relationship: GuardianRelationship;
  created_at: string;
  updated_at: string;
  patient: {
    id: number;
    person_id: number;
    patient_number: string | null;
    is_active: boolean;
    person: GuardianPerson;
  };
}

/** `GuardianCreateRequest`: el paciente va en la ruta; la persona debe existir y estar activa. */
export interface GuardianCreateRequest {
  person_id: number;
  relationship: GuardianRelationship;
}

/** `GuardianUpdateRequest`: solo el parentesco es editable. */
export interface GuardianUpdateRequest {
  relationship: GuardianRelationship;
}

export type GuardianSortField =
  "id" | "created_at" | "relationship" | "last_name";
export type SortOrder = "asc" | "desc";

/** Parámetros de `GET /patients/{id}/guardians`. */
export interface GuardianListParams {
  page: number;
  page_size: number;
  name?: string;
  document_number?: string;
  is_active?: boolean;
  sort_by?: GuardianSortField;
  order?: SortOrder;
}

/** Parámetros de `GET /persons/{id}/patients`. */
export interface GuardedPatientListParams {
  page: number;
  page_size: number;
  is_active?: boolean;
  sort_by?: "id" | "created_at" | "last_name";
  order?: SortOrder;
}

/** Apoderado elegido en el formulario de alta de un paciente, aún sin asociar. */
export interface StagedGuardian {
  person: Person;
  relationship: GuardianRelationship;
}
