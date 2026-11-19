export { default as GuardiansPage } from "./pages/guardians-page";

// API pública para módulos consumidores (patients): apoderados de un paciente
export { GuardiansPicker } from "./components/guardians-picker";
export { GuardiansSection } from "./components/guardians-section";
export { GuardianRelationshipSelect } from "./components/guardian-relationship-select";
export { runGuardianAssociations } from "./utils/guardian-associations";
export type { GuardianAssociationResult } from "./utils/guardian-associations";
export { getGuardianErrorMessage } from "./utils/guardian-error.utils";
export { guardianApi } from "./services/guardian-api";
export type {
  Guardian,
  GuardianRelationship,
  StagedGuardian,
} from "./types/guardian.types";
