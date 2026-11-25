# Módulo `special-conditions`

Spec: `specs/04-special-condition.md` (el encabezado dice "SPEC 03" y la spec pide la carpeta `special_conditions/`). Código: `frontend/src/modules/special-conditions/`.

> La carpeta usa kebab-case (`special-conditions`) porque `frontend/AGENTS.md` exige carpetas en kebab-case, la skill de arquitectura lista `special-conditions` y coincide con las rutas. Se aparta del nombre literal de la spec.

## Propósito y límites

Administrar el catálogo de condiciones especiales: listar, crear, consultar, editar y activar/desactivar. No incluye asociación con personas o pacientes, ni funciones clínicas, ni crea condiciones de ejemplo.

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/special-conditions` | `SpecialConditionsPage` | Sí (grupo Gestión clínica) |
| `/special-conditions/create` | `SpecialConditionCreatePage` | No |
| `/special-conditions/:specialConditionId` | `SpecialConditionDetailPage` (solo lectura, incluye inactivas) | No |
| `/special-conditions/:specialConditionId/edit` | `SpecialConditionEditPage` | No |

## Funcionamiento

Idéntico al módulo [specialties](specialties.md) (el contrato de la API es el mismo): búsqueda con debounce, filtro de estado, ordenamiento (`sort_by` / `order`), paginación de 20, fechas de creación y actualización, creación (nombre máx. 120, recortado), edición parcial, detalle y cambio de estado con confirmación.

## Organización interna

Misma estructura que [roles](roles.md). Duplicación entre módulos: ADR-005 en [architecture-decisions.md](../architecture/architecture-decisions.md). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Formato de `details` en 422.
- Solo se ejecutaron `npm run build` y `npm run lint`; sin pruebas en navegador ni contra el backend.

## API pública para otros módulos

`modules/special-conditions/index.ts` exporta además de las páginas `specialConditionApi` y el tipo `SpecialCondition`, que `patients` usa para consultar el catálogo de condiciones activas al asociarlas. `special-conditions` no depende de `patients`; la relación se administra desde `patients` (spec 11).
