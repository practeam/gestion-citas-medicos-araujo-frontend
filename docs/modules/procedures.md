# Módulo `procedures`

Spec: `specs/17-0-procedure.md`. Código: `frontend/src/modules/procedures/`. Administra el **catálogo** de procedimientos odontológicos. La asociación de procedimientos a citas pertenece a `appointments` (spec 18) y no se implementa aquí.

## Rutas y navegación

| Ruta | Página | En el menú |
|---|---|---|
| `/procedures` | `ProceduresPage` | Sí (grupo **Gestión de servicios**, clave `serviceManagement` → `procedures`) |
| `/procedures/create` | `ProcedureCreatePage` | No |
| `/procedures/:procedureId` | `ProcedureDetailPage` | No |
| `/procedures/:procedureId/edit` | `ProcedureEditPage` | No |

## Contrato

- `POST /procedures`: `name`, `base_price`, `base_duration_minutes` obligatorios; `code`, `description` y `parent_procedure_id` solo si tienen valor. No se envían `id`, `is_active` ni auditoría (el backend crea el procedimiento activo).
- `GET /procedures`: `search` (nombre o código, "contiene"), `is_active`, `parent_procedure_id`, `min_price`, `max_price`, `sort_by` (`id`, `name`, `code`, `base_price`, `base_duration_minutes`, `created_at`), `order`, `page`, `page_size` (20 por página).
- `GET /procedures/{id}`, `PATCH /procedures/{id}` (parcial: solo lo modificado; `code`, `description` y `parent_procedure_id` vaciados se envían como `null`), `PATCH /procedures/{id}/status` (`is_active`). **No existe `DELETE`.**

## Funcionamiento

- **Listado:** código, nombre, padre (enlace; el nombre se resuelve con `GET /procedures/{id}` por id distinto, `#id` si falla), precio base, duración, estado y acciones Ver / Editar / Activar-Desactivar. Búsqueda con retardo enviada al servidor (`search`), filtros por estado, **padre** (popover con búsqueda), precio mínimo y máximo, ordenamiento por los campos del contrato, paginación del servidor y "Limpiar filtros". Los inactivos se atenúan.
- **Precios:** `base_price` se conserva como **cadena decimal** (nunca `float`). Validación: `^\d+(\.\d{1,2})?$` (≥ 0, máx. 2 decimales). Para comparar o sumar se usan céntimos enteros (`bigint`) en `procedure-price.utils.ts` (`priceToCents`, `centsToPrice`, `multiplyPrice`), reutilizables por `appointments` para importes. En el `PATCH`, el precio se compara por valor (`"150"` = `"150.00"`).
- **Duración:** entero positivo (≤ 2147483647).
- **Formulario (crear/editar):** nombre (obligatorio, ≤ 150, no solo espacios), código (opcional, ≤ 50, no solo espacios si se escribe), precio, duración, descripción y **padre**. El estado no es editable. Los errores 409/422 del backend se asocian al campo cuando `details` lo permite o se muestran como alerta (nombre/código duplicado, padre inexistente o inactivo, jerarquía circular); se conservan los datos introducidos.
- **Selector de padre:** procedimientos **activos**, con búsqueda por nombre o código, excluye al propio procedimiento en edición y permite "Sin padre". El frontend no calcula descendientes: los **ciclos** los valida el backend.
- **Detalle:** todos los campos (auditoría de solo lectura), enlace al padre, aviso si está inactivo, activar/desactivar con confirmación (la interfaz cambia solo tras la respuesta satisfactoria) y bloque de **jerarquía**.
- **Jerarquía:** como no hay endpoint de árbol ni de hijos, se usan los existentes: la ruta de ancestros se obtiene siguiendo `parent_procedure_id` con `GET /procedures/{id}` (máx. 10 niveles) y los hijos directos con `GET /procedures?parent_procedure_id=` (hasta 100). No se asume que la API devuelva descendientes más profundos.
- **Estado:** activar/desactivar usa `/status` con diálogo de confirmación. Desactivar conserva el registro, lo deja consultable y no modifica detalles históricos de citas; no se reasignan hijos automáticamente.
- **Histórico:** editar precio o duración **no** ejecuta ninguna operación sobre citas ni detalles; los valores históricos pertenecen a `appointment_detail` en el backend.

## API pública para otros módulos

`modules/procedures/index.ts` exporta `procedureApi`, el tipo `Procedure` y las utilidades decimales (`priceToCents`, `centsToPrice`, `multiplyPrice`, `isValidPrice`) para que `appointments` (spec 18) consulte los procedimientos **activos** (`GET /procedures?is_active=true`) sin duplicar el catálogo.

## Organización interna

`pages/`, `components/` (`procedures-table`, `procedures-filters`, `procedures-pagination`, `procedure-form`, `procedure-parent-selector`, `procedure-hierarchy`, `procedure-status-badge`, `procedure-status-dialog`), `hooks/` (`use-procedures`, `use-procedure`, `use-procedure-labels`, `use-parent-options`, `use-procedure-hierarchy`), `services/procedure-api.ts`, `schemas/`, `types/`, `utils/` (errores, fechas, payload, precios). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (spec §16): el proyecto no tiene herramienta de pruebas; solo se ejecutaron `npm run build` y `npm run lint`, sin comprobación visual en navegador.
- Formato de `details` en 422 y distinción entre nombre duplicado, código duplicado y jerarquía inválida (el backend usa 409/422 con mensaje): se muestra el mensaje del backend.
- El filtro de precio se envía cuando el texto es un importe válido; no se muestra moneda porque la API no la define.
- La spec indica guardarse como `specs/17-0-procedures.md`; el archivo existente se llama `specs/17-0-procedure.md` y no se renombró.
