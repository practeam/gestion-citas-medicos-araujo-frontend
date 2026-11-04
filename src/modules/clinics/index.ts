export { default as ClinicsPage } from "./pages/clinics-page";
export { default as ClinicCreatePage } from "./pages/clinic-create-page";
export { default as ClinicDetailPage } from "./pages/clinic-detail-page";
export { default as ClinicEditPage } from "./pages/clinic-edit-page";

// API pública para módulos consumidores (schedule-exceptions): consulta de clínicas
export { clinicApi } from "./services/clinic-api";
export type { Clinic } from "./types/clinic.types";
