# Catálogo de componentes y recursos

Índice de recursos reutilizables verificados en el código. El código es la fuente de verdad sobre las props. Para regenerar el inventario estructural: `node ../scripts/project-inventory.mjs` desde `frontend/`.

> La skill `frontend-arquitectura` menciona `docs/frontend/component-catalog.md`; la skill `frontend-documentacion` (fuente de verdad documental) fija `docs/architecture/component-catalog.md`. Se usa esta última.

## Usados por el módulo de roles

| Recurso | Ubicación | Uso / particularidades |
|---|---|---|
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` | `components/ui/table.tsx` | Tabla simple; `TableCell` acepta `isHeader`. Estilos de cabecera/filas copiados del patrón de `pages/main/tables/basic-tables/table-one`. |
| `Pagination*` | `components/ui/pagination.tsx` | Primitivas; la lógica de páginas la aporta quien las usa. `disabled` en `PaginationLink`. |
| `Dialog*` | `components/ui/dialog.tsx` | Controlado con `open` / `onOpenChange`. No existe `Modal` ni `useModal`. |
| `Field`, `FieldLabel`, `FieldError` | `components/ui/field.tsx` | `FieldError` recibe `errors={[{ message }]}`. |
| `Input`, `Textarea`, `Select*`, `Button`, `Badge`, `Alert*`, `Spinner` | `components/ui/` | `Button` con `render={<Link/>}` + `nativeButton={false}` para enlaces. `Select` de Base UI: `SelectValue` admite función hija para mostrar la etiqueta. |
| `PageMeta`, `PageBreadcrumb`, `ComponentCard` | `components/shared/` | Cabecera estándar de página. `PageBreadcrumb` tiene "Home" fijo. |
| `useTranslations(namespace)` | `i18n/hooks.ts` | Toda cadena nueva va en `messages/{en,es,de,ar}.json`. |
| Iconos `LockIcon`, `PlusIcon`, `SearchIcon` | `icons/` | Importar desde `@/icons`. |

## Infraestructura añadida

| Recurso | Ubicación | Responsabilidad |
|---|---|---|
| `apiClient` | `services/api/client.ts` | `get` / `post` / `patch` sobre `fetch`; devuelve `data.result`. |
| `ApiError`, `isApiError`, `isAbortError`, `getFieldErrors` | `services/api/errors.ts` | Error tipado (`kind`, `status`, `details`). |
| `ApiResponse<T>`, `ApiData<T>`, `PageResult<T>` | `services/api/types.ts` | Tipos del envoltorio común. |

## Específicos de `modules/roles`

Ver [../modules/roles.md](../modules/roles.md). No reutilizar fuera del módulo.
