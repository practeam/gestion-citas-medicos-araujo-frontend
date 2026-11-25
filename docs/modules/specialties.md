# Módulo `specialties`

Spec: `specs/03-specialty.md` (el encabezado del archivo dice "SPEC 04"). Código: `frontend/src/modules/specialties/`.

## Propósito y límites

Administrar el catálogo de especialidades profesionales: listar, crear, consultar, editar y activar/desactivar. No incluye asignación al personal (`staff_specialty`) ni crea especialidades de ejemplo.

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/specialties` | `SpecialtiesPage` | Sí (grupo Gestión clínica) |
| `/specialties/create` | `SpecialtyCreatePage` | No |
| `/specialties/:specialtyId` | `SpecialtyDetailPage` (solo lectura: id, nombre, descripción, estado, fechas; incluye inactivas) | No |
| `/specialties/:specialtyId/edit` | `SpecialtyEditPage` | No |

## Funcionamiento

- **Listado:** búsqueda por nombre (debounce), filtro de estado, **ordenamiento** (`sort_by`: `id` / `name` / `created_at`; `order`: `asc` / `desc`; por defecto `id` asc) y paginación de 20. Muestra fechas de creación y actualización formateadas con `Intl.DateTimeFormat` según el idioma activo.
- **Crear:** `name` obligatorio (no vacío, no solo espacios, máx. 120, se envía recortado); `description` opcional. Nombre duplicado (409) se muestra junto al campo.
- **Editar:** actualización parcial (solo `name` y/o `description` modificados; descripción vacía → `null`). No se envían `id`, `created_at` ni `updated_at`. Sin cambios no se llama al backend.
- **Estado:** diálogo de confirmación → `PATCH /specialties/{id}/status`.

## Organización interna

Misma estructura que [roles](roles.md), más `utils/specialty-date.utils.ts` y `pages/specialty-detail-page.tsx`. Duplicación entre módulos: ADR-005 en [architecture-decisions.md](../architecture/architecture-decisions.md). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Formato de `details` en 422 (igual que roles).
- Solo se ejecutaron `npm run build` y `npm run lint`; sin pruebas en navegador ni contra el backend.

## API pública para otros módulos

`modules/specialties/index.ts` exporta además de las páginas `specialtyApi` y el tipo `Specialty`, que `staff` usa para consultar el catálogo de especialidades activas al asociarlas. `specialties` no depende de `staff`; la relación se administra desde `staff` (spec 12).
