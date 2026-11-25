export { default as SpecialtiesPage } from "./pages/specialties-page";
export { default as SpecialtyCreatePage } from "./pages/specialty-create-page";
export { default as SpecialtyDetailPage } from "./pages/specialty-detail-page";
export { default as SpecialtyEditPage } from "./pages/specialty-edit-page";

// API pública para módulos consumidores (staff): catálogo de especialidades
export { specialtyApi } from "./services/specialty-api";
export type { Specialty } from "./types/specialty.types";
