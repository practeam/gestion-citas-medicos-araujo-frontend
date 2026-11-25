# Módulo `roles`

Spec: `specs/01-role.md`. Código: `frontend/src/modules/roles/`.

## Propósito y límites

Administrar los roles del sistema: listar, crear, consultar/editar y activar/desactivar. No incluye autenticación, autorización efectiva ni asignación de roles al personal (ver [staff](staff.md)). La asignación de permisos a roles se integra en los formularios (spec 10, ver abajo). No crea roles iniciales.

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/roles` | `RolesPage` | Sí (opción independiente `roles`) |
| `/roles/create` | `RoleCreatePage` | No |
| `/roles/:roleId` | `RoleDetailPage` (datos del rol y permisos asignados; añadida por la spec 10) | No |
| `/roles/:roleId/edit` | `RoleEditPage` | No |

## Funcionamiento

- **Listado:** búsqueda por nombre (debounce 400 ms), filtro de estado (`all` / `active` / `inactive`), paginación de 20 en 20. Los filtros se envían al backend (`name`, `is_active`, `page`, `page_size`). Cambiar un filtro vuelve a la página 1.
- **Crear:** `name` obligatorio (se rechaza vacío o solo espacios, máx. 80), `description` opcional. Se envían los valores recortados; la descripción vacía no se envía.
- **Editar:** carga el rol con `GET /roles/{id}` y envía solo lo modificado. Descripción vaciada → `description: null`. Sin cambios no se llama al backend.
- **Estado:** diálogo de confirmación → `PATCH /roles/{id}/status` con solo `is_active`; recarga el listado al terminar.
- **Errores:** 409 se muestra junto al campo `name`; 422 intenta asignarse a campos (ver límites abajo); el resto en un `Alert`. Los botones se deshabilitan mientras hay una petición en curso.
- **Avisos de éxito:** ver ADR-004 en [architecture-decisions.md](../architecture/architecture-decisions.md).

## Permisos del rol (spec 10)

Integrados en las pantallas existentes de `roles`; **no hay páginas, rutas ni entradas de sidebar para `role_permission`**. La única ruta nueva es el detalle `/roles/:roleId`, que la spec 10 da por existente y que no estaba creada. Asignar permisos no implementa autorización efectiva.

- **Contrato:** `GET|POST /roles/{id}/permissions` y `DELETE /roles/{id}/permissions/{permission_id}`; una solicitud por permiso, nunca dentro de `POST`/`PATCH /roles`. `GET` devuelve también permisos que siguen asociados aunque estén inactivos (con `is_active`).
- **Catálogo:** `permissionApi` y el tipo `Permission`, exportados por `modules/permissions/index.ts`; solo se ofrecen permisos activos (`is_active=true`) con búsqueda por nombre y paginación del servidor (10 por página); la selección se conserva al buscar o paginar.
- **Creación:** sección "Permisos del rol" dentro de `RoleForm` (que acepta `children`). Secuencia: `POST /roles` → un `POST` por permiso, uno tras otro. Si alguna asignación falla se informa que el rol quedó creado, se listan permisos asignados y pendientes (con su error) y solo se reintentan los pendientes, sin volver a crear el rol ni repetir lo asignado.
- **Edición:** `RolePermissionsEditor` muestra los permisos actuales (los inactivos se distinguen y pueden retirarse), permite marcar retiros ("Deshacer") y elegir permisos nuevos. Un único "Guardar" coordina: `PATCH /roles/{id}` solo con lo modificado, luego los `POST`/`DELETE` necesarios (solo la diferencia). Si el `PATCH` falla no se ejecuta ninguna operación de permisos. Si fallan operaciones: se conserva lo confirmado (el rol queda guardado y no se repite el `PATCH`), se informa qué se guardó y qué no, y permanecen pendientes solo las operaciones fallidas para reintentar con "Guardar". Un 409 al asignar se informa y se refresca el estado.
- **Rol inactivo:** no se ofrecen nuevas asignaciones y se indica que debe activarse primero; los retiros siguen permitidos. Los errores del backend prevalecen sobre estas validaciones preventivas.
- **Detalle:** lista informativa (`RolePermissionsList`) con nombre, descripción y estado de cada permiso, y enlace a la edición.
- **Errores:** 409 al asignar → "ya asignado"; 404 → rol o permiso no disponible; red/5xx → mensaje genérico; otros 4xx → `message` del backend. El contrato no distingue "permiso inactivo" de otros 4xx.
- **Limitación:** la lista de pendientes tras un fallo parcial vive en memoria; recargar la página la pierde (los datos confirmados persisten en el backend).

## Organización interna

| Carpeta | Contenido |
|---|---|
| `pages/` | `roles-page`, `role-create-page`, `role-edit-page` |
| `components/` | `roles-table`, `roles-filters`, `roles-pagination`, `role-form`, `role-status-dialog`, `role-status-badge`, `role-permission-picker`, `role-permissions-editor`, `role-permissions-list`, `role-permission-status-badge` |
| `hooks/` | `use-roles` (listado y filtros), `use-role` (detalle), `use-role-permissions` (asignaciones), `use-active-permissions` (catálogo asignable) |
| `services/` | `role-api.ts`, `role-permission-api.ts` (únicas capas que llaman a `apiClient`) |
| `schemas/` | `role-schema.ts` (Zod; mensajes = claves `roles.validation.*`) |
| `types/` | `role.types.ts` (contrato de OpenAPI) |
| `utils/` | construcción de payloads, mensajes de error y ejecución de operaciones de permisos (`role-permission-operations`) |

Contrato y convenciones HTTP: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- El formato de `data.details` en respuestas 422 no está especificado en OpenAPI; `getFieldErrors` acepta listas estilo FastAPI (`loc` + `msg`). Si el backend usa otro formato, el error se muestra como mensaje general.
- No se han ejecutado pruebas contra el backend real ni en navegador; solo `npm run build` y `npm run lint`. No hay suite de pruebas en el proyecto.

## API pública para otros módulos

`modules/roles/index.ts` exporta además de las páginas `roleApi` y el tipo `Role`, que `staff` usa para consultar el catálogo de roles activos al asignarlos. `roles` no depende de `staff`.
