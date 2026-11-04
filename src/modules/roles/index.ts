export { default as RoleCreatePage } from "./pages/role-create-page";
export { default as RoleDetailPage } from "./pages/role-detail-page";
export { default as RoleEditPage } from "./pages/role-edit-page";
export { default as RolesPage } from "./pages/roles-page";

// API pública para módulos consumidores (staff): catálogo de roles
export { roleApi } from "./services/role-api";
export type { Role } from "./types/role.types";
