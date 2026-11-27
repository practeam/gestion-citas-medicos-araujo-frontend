// Páginas (registradas en App.tsx)
export { default as PersonCreatePage } from "./pages/person-create-page";
export { default as PersonDetailPage } from "./pages/person-detail-page";
export { default as PersonEditPage } from "./pages/person-edit-page";
export { default as PersonsPage } from "./pages/persons-page";

// API pública para módulos consumidores (patients, staff)
export { PersonForm, type PersonFormProps } from "./components/person-form";
export {
  PersonSelector,
  type PersonSelectorProps,
} from "./components/person-selector";
export {
  EMPTY_PERSON_FORM_VALUES,
  type PersonFormValues,
} from "./schemas/person-schema";
export { personApi } from "./services/person-api";
export { usePerson } from "./hooks/use-person";
export type { Person, PersonCreateRequest } from "./types/person.types";
export {
  getPersonDocument,
  getPersonFullName,
  toCreatePayload,
  toFormValues,
  toUpdatePayload,
} from "./utils/person-payload.utils";
export { getPersonErrorMessage } from "./utils/person-error.utils";
