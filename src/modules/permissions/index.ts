export { default as PermissionCreatePage } from "./pages/permission-create-page";
export { default as PermissionDetailPage } from "./pages/permission-detail-page";
export { default as PermissionEditPage } from "./pages/permission-edit-page";
export { default as PermissionsPage } from "./pages/permissions-page";

// API pública para módulos consumidores (roles): catálogo de permisos
export { permissionApi } from "./services/permission-api";
export type { Permission } from "./types/permission.types";
