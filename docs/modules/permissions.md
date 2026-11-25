# Módulo `permissions`

Spec: `specs/02-special-condition.md` (el archivo se llama así, pero su contenido describe el módulo `permissions`). Código: `frontend/src/modules/permissions/`.

## Propósito y límites

Administrar el catálogo de permisos: listar, crear, consultar, modificar la descripción y activar/desactivar. No incluye la relación rol–permiso, asignación a usuarios, guards ni autorización efectiva, ni crea el catálogo inicial recomendado.

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/permissions` | `PermissionsPage` | Sí (grupo Administración) |
| `/permissions/create` | `PermissionCreatePage` | No |
| `/permissions/:permissionId` | `PermissionDetailPage` (solo lectura, incluye inactivos) | No |
| `/permissions/:permissionId/edit` | `PermissionEditPage` | No |

## Funcionamiento

- **Listado:** igual que roles (búsqueda con debounce, filtro de estado, 20 por página). Acciones: Ver, Editar, Activar/Desactivar.
- **Crear:** `name` validado ya recortado: no vacío, máx. 120 y patrón `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$`. `description` opcional. Duplicado (409) se muestra en el campo nombre.
- **Editar:** el nombre se muestra deshabilitado; solo se envía `{ "description": <texto | null> }`. Sin cambios no se llama al backend.
- **Estado:** diálogo de confirmación → `PATCH /permissions/{id}/status` con `is_active`.

## Organización interna

Misma estructura que [roles](roles.md): `pages/`, `components/` (`permission-form` sirve para crear y editar con `mode`), `hooks/`, `services/permission-api.ts`, `schemas/`, `types/`, `utils/`. Duplicación respecto a roles: ver ADR-005 en [architecture-decisions.md](../architecture/architecture-decisions.md).

Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Formato de `details` en 422 (igual que roles).
- Solo se ejecutaron `npm run build` y `npm run lint`; sin pruebas en navegador ni contra el backend.

## API pública para otros módulos

`modules/permissions/index.ts` exporta además de las páginas `permissionApi` y el tipo `Permission`, que `roles` usa para consultar el catálogo de permisos activos al asignarlos a un rol. `permissions` no depende de `roles`; la relación `role_permission` se administra desde `roles` (spec 10).
