import {
  normalizeDocumentNumber,
  normalizeDocumentType,
  type PersonFormValues,
} from "../schemas/person-schema";
import type {
  Person,
  PersonCreateRequest,
  PersonUpdateRequest,
} from "../types/person.types";

type OptionalField =
  | "maternal_last_name"
  | "document_type"
  | "document_number"
  | "birth_date"
  | "phone"
  | "email"
  | "address";

const OPTIONAL_FIELDS: OptionalField[] = [
  "maternal_last_name",
  "document_type",
  "document_number",
  "birth_date",
  "phone",
  "email",
  "address",
];

/** Valores normalizados (recortados; documento en mayúsculas y sin espacios). */
function normalize(values: PersonFormValues): PersonFormValues {
  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    maternal_last_name: values.maternal_last_name.trim(),
    document_type: normalizeDocumentType(values.document_type),
    document_number: normalizeDocumentNumber(values.document_number),
    birth_date: values.birth_date,
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
  };
}

/** Los opcionales vacíos no se envían al crear. */
export function toCreatePayload(values: PersonFormValues): PersonCreateRequest {
  const normalized = normalize(values);
  const payload: PersonCreateRequest = {
    first_name: normalized.first_name,
    last_name: normalized.last_name,
  };
  for (const field of OPTIONAL_FIELDS) {
    if (normalized[field]) payload[field] = normalized[field];
  }
  return payload;
}

/**
 * Solo incluye lo modificado; los opcionales vaciados van como `null`. Si
 * cambia uno de los campos de documento se envían ambos para mantenerlos
 * coherentes.
 */
export function toUpdatePayload(
  values: PersonFormValues,
  person: Person,
): PersonUpdateRequest {
  const normalized = normalize(values);
  const payload: PersonUpdateRequest = {};

  if (normalized.first_name !== person.first_name) {
    payload.first_name = normalized.first_name;
  }
  if (normalized.last_name !== person.last_name) {
    payload.last_name = normalized.last_name;
  }
  for (const field of OPTIONAL_FIELDS) {
    if (normalized[field] !== (person[field] ?? "")) {
      payload[field] = normalized[field] || null;
    }
  }
  if ("document_type" in payload || "document_number" in payload) {
    payload.document_type = normalized.document_type || null;
    payload.document_number = normalized.document_number || null;
  }
  return payload;
}

/** Valores iniciales del formulario a partir de una persona existente. */
export function toFormValues(person: Person): PersonFormValues {
  return {
    first_name: person.first_name,
    last_name: person.last_name,
    maternal_last_name: person.maternal_last_name ?? "",
    document_type: person.document_type ?? "",
    document_number: person.document_number ?? "",
    birth_date: person.birth_date ?? "",
    phone: person.phone ?? "",
    email: person.email ?? "",
    address: person.address ?? "",
  };
}

export function getPersonFullName(
  person: Pick<Person, "first_name" | "last_name" | "maternal_last_name">,
) {
  return [person.first_name, person.last_name, person.maternal_last_name]
    .filter(Boolean)
    .join(" ");
}

export function getPersonDocument(
  person: Pick<Person, "document_type" | "document_number">,
) {
  return person.document_type && person.document_number
    ? `${person.document_type} ${person.document_number}`
    : null;
}
