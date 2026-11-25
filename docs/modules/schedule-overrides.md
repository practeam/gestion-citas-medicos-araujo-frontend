# Módulo `schedule-overrides`

Spec: `specs/16-schedule-override.md`. Código: `frontend/src/modules/schedule-overrides/`. Módulo **independiente** (no hay formularios de overrides dentro de clínicas ni de personal).

> La carpeta usa kebab-case (`schedule-overrides`) porque `frontend/AGENTS.md` exige carpetas en kebab-case; la spec escribe `schedule_overrides`.

## Propósito y límites

Registrar y administrar **modificaciones puntuales de disponibilidad**: intervalos extraordinarios con fecha y hora concretas que pueden **habilitar** disponibilidad fuera del patrón semanal, para una clínica o un miembro del personal. **No modifican los horarios semanales**, no anulan excepciones (cierres, ausencias, mantenimiento) ni citas, y no se usan para registrar ausencias o cierres. No incluye cálculo de disponibilidad efectiva.

## Rutas y navegación

| Ruta | Página | En el menú |
|---|---|---|
| `/schedule-overrides` | `ScheduleOverridesPage` | Sí (grupo **Gestión de agenda**, junto a las excepciones) |
| `/schedule-overrides/create` | `ScheduleOverrideCreatePage` | No |
| `/schedule-overrides/:overrideId` | `ScheduleOverrideDetailPage` | No |
| `/schedule-overrides/:overrideId/edit` | `ScheduleOverrideEditPage` | No |

## Contrato

- `POST /schedule-overrides`, `GET /schedule-overrides`, `GET|PATCH /schedule-overrides/{id}`, `PATCH /schedule-overrides/{id}/status`. **No existe `DELETE`**: no se ofrece eliminación.
- **Creación:** `clinic_id` / `staff_member_id` (exactamente uno informado, el otro `null`), `starts_at`, `ends_at` (`date-time` con zona), `reason` (opcional, `null` si vacío) e `is_active` (el contrato lo admite, por defecto `true`; el formulario ofrece "Registrar como activa", activada por defecto).
- **PATCH:** solo `starts_at`, `ends_at` y `reason`. **El objetivo no se puede cambiar** (se registra otro override) y el estado **no** se cambia con este endpoint.
- **Estado:** `PATCH …/status` con `is_active`, usado para activar/desactivar desde el listado y el detalle.
- **Listado:** filtros `clinic_id`, `staff_member_id`, `is_active`, `range_start` ("termina después de"), `range_end` ("empieza antes de") y `page`/`page_size` (20 por página). Sin ordenamiento en el contrato.

## Funcionamiento

- **Objetivo excluyente (solo al crear):** botones Clínica / Personal; al cambiar se descarta el objetivo elegido. El selector lista clínicas o personal **activos** con búsqueda, usando `clinicApi`, `staffMemberApi` y `getPersonFullName` (APIs públicas de `clinics`, `staff`, `persons`). En edición el objetivo se muestra de solo lectura.
- **Fechas y zona horaria:** igual que en [schedule-exceptions](schedule-exceptions.md): los campos `datetime-local` se convierten a `date-time` con el desplazamiento del navegador para esa fecha (se asume que coincide con la zona de la clínica, porque `time_zone` no se expone) y se muestran con zona.
- **Validaciones preventivas:** objetivo elegido, inicio y fin obligatorios y válidos, **fin posterior al inicio** (sin duración cero ni invertidos). Errores 409/422 del backend se asocian al campo o se muestran como alerta, conservando lo introducido. No se implementan reglas propias distintas a las del backend.
- **Solapamientos:** antes de enviar un override que quedará **activo**, se consultan con el endpoint de listado los overrides activos del mismo objetivo cuyo intervalo se cruza (parcial o totalmente: `range_start` = inicio, `range_end` = fin). Si hay, se muestra un **aviso no bloqueante** con el detalle y las opciones "Revisar" o "Registrar de todos modos"; el backend (que rechaza los solapamientos ambiguos) decide y su error 409/422 se muestra. Si la consulta preventiva falla, se deja decidir al backend.
- **Activar/desactivar:** diálogo de confirmación → `PATCH …/status`. La interfaz solo cambia tras la respuesta satisfactoria; si el backend rechaza (p. ej. solapamiento al activar) se muestra su error y el estado confirmado no cambia. Los inactivos se conservan, se atenúan en el listado y se identifican como "no participan en la disponibilidad".
- **Listado:** id, objetivo (insignia y nombre, resuelto con una consulta por objetivo a `clinics`/`staff`; si falla, `#id`), inicio, fin, motivo, estado y acciones Ver / Editar / Activar-Desactivar.
- **Detalle:** indica si el override aplica a toda la clínica o a un trabajador, si está activo o no, y que es una modificación puntual, no un horario recurrente.

## Relación con horarios, excepciones y disponibilidad

- **Horarios recurrentes:** los overrides no modifican, convierten ni copian `clinic_schedule` / `staff_schedule` y no se generan a partir de ellos.
- **Excepciones (spec 15):** tienen **prioridad** sobre los overrides. Un override no anula una excepción de clínica ni de trabajador, y no se permite usar overrides para ausencias, cierres o mantenimiento (el formulario y el detalle lo indican).
- **Restricciones:** un override de clínica puede agregar apertura extraordinaria; uno de personal solo puede sumar disponibilidad **dentro de la apertura efectiva de la clínica**. El frontend no lo valida: lo hacen el backend y su servicio de disponibilidad.
- **Disponibilidad efectiva:** el cálculo (horarios activos de clínica → overrides de clínica → intersección con horarios del trabajador → overrides del trabajador limitados por la clínica → restar excepciones → restar citas → comprobar duración) pertenece a un único servicio del backend. **No se duplica en el frontend** y la existencia de un override no garantiza que se pueda agendar una cita en todo el intervalo.

## API pública consumida

`clinics` (`clinicApi`, `Clinic`), `staff` (`staffMemberApi`, `StaffMember`) y `persons` (`getPersonFullName`). `schedule-overrides` no es consumido por otros módulos.

## Organización interna

`pages/`, `components/` (`schedule-override-form`, `schedule-override-target-selector`, `schedule-overrides-filters`, `schedule-overrides-table`, `schedule-overrides-pagination`, `schedule-override-badges`, `schedule-override-status-dialog`), `hooks/` (`use-schedule-overrides`, `use-schedule-override`, `use-override-status-change`, `use-target-options`, `use-target-labels`), `services/schedule-override-api.ts`, `schemas/`, `types/`, `utils/` (fechas con zona, payloads, solapamientos, errores). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (spec §18): el proyecto no tiene herramienta de pruebas; `frontend/AGENTS.md` exige consultar antes de instalar paquetes. Las pruebas de efecto sobre disponibilidad corresponden al backend.
- Zona horaria de la clínica no expuesta (se asume la del navegador).
- Formato de `details` en 422; solo se ejecutaron `npm run build` y `npm run lint`.
- Los filtros de clínica y personal listan las primeras 100 opciones activas.
- Si el backend decide que los solapamientos nunca se permiten, el aviso no bloqueante podría pasar a ser un error.
