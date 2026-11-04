export { default as PatientCreatePage } from "./pages/patient-create-page";
export { default as PatientDetailPage } from "./pages/patient-detail-page";
export { default as PatientEditPage } from "./pages/patient-edit-page";
export { default as PatientsPage } from "./pages/patients-page";

// API pública para módulos consumidores (appointments): consulta de pacientes
export { patientApi } from "./services/patient-api";
export type { Patient } from "./types/patient.types";
