export { default as SpecialConditionsPage } from "./pages/special-conditions-page";
export { default as SpecialConditionCreatePage } from "./pages/special-condition-create-page";
export { default as SpecialConditionDetailPage } from "./pages/special-condition-detail-page";
export { default as SpecialConditionEditPage } from "./pages/special-condition-edit-page";

// API pública para módulos consumidores (patients): catálogo de condiciones especiales
export { specialConditionApi } from "./services/special-condition-api";
export type { SpecialCondition } from "./types/special-condition.types";
