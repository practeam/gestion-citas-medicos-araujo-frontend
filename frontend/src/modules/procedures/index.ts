export { default as ProceduresPage } from "./pages/procedures-page";
export { default as ProcedureCreatePage } from "./pages/procedure-create-page";
export { default as ProcedureDetailPage } from "./pages/procedure-detail-page";
export { default as ProcedureEditPage } from "./pages/procedure-edit-page";

// API pública para módulos consumidores (appointments): catálogo de procedimientos
export { procedureApi } from "./services/procedure-api";
export type { Procedure } from "./types/procedure.types";
export {
  centsToPrice,
  isValidPrice,
  multiplyPrice,
  priceToCents,
} from "./utils/procedure-price.utils";
