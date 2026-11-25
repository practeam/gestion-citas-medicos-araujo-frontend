# Módulo `schedule-exceptions`

Spec: `specs/15-schedule-exception.md`. Código: `frontend/src/modules/schedule-exceptions/`. Módulo **independiente** (no hay formularios de excepciones dentro de clínicas ni de personal).

> La carpeta usa kebab-case (`schedule-exceptions`) porque `frontend/AGENTS.md` exige carpetas en kebab-case; la spec escribe `schedule_exceptions`. Mismo criterio que `special-conditions`.

## Propósito y límites

Registrar y administrar **bloqueos extraordinarios** (cierres, ausencias, mantenimiento, otros) que afectan la disponibilidad de una clínica o de un miembro del personal. **Una excepción siempre reduce la disponibilidad: nunca la amplía ni modifica los horarios recurrentes** (`clinic_schedule`, `staff_schedule`). No incluye `schedule_override`, citas, vacaciones/licencias como módulos, ni el cálculo de disponibilidad efectiva.

## Rutas y navegación

| Ruta | Página | En el menú |
|---|---|---|
| `/schedule-exceptions` | `ScheduleExceptionsPage` | Sí (grupo **Gestión de agenda**, `scheduleManagement`) |
| `/schedule-exceptions/create` | `ScheduleExceptionCreatePage` | No |
| `/schedule-exceptions/:exceptionId` | `ScheduleExceptionDetailPage` | No |
| `/schedule-exceptions/:exceptionId/edit` | `ScheduleExceptionEditPage` | No |

El grupo se llama "Gestión de agenda" porque aún no existe un grupo de citas; podrá reunir otras opciones de agenda.

## Contrato

- `POST /schedule-exceptions`, `GET /schedule-exceptions`, `GET|PATCH /schedule-exceptions/{id}`. **No existe `DELETE`** en el contrato: no se ofrece eliminación ni se sustituye por un estado inventado.
- **Creación:** `clinic_id`, `staff_member_id` (exactamente uno informado, el otro `null`), `exception_type`, `reason` (opcional, `null` si está vacío), `starts_at`, `ends_at` (`date-time` con zona horaria).
- **Tipos** (lista cerrada del backend, valores de API): `closure`, `absence`, `maintenance`, `other`. La interfaz muestra etiquetas traducidas pero **envía el valor de API**.
- **Listado:** filtros `clinic_id`, `staff_member_id`, `exception_type`, `range_start` ("termina después de") y `range_end` ("empieza antes de"), más `page`/`page_size` (20 por página). No hay ordenamiento en el contrato.
- **PATCH:** admite `clinic_id`, `staff_member_id`, `exception_type`, `reason`, `starts_at`, `ends_at` (todos opcionales); al cambiar objetivo o intervalo el backend revalida todo.

## Funcionamiento

- **Objetivo excluyente:** botones Clínica / Personal; al cambiar se descarta el objetivo elegido. El selector (`ScheduleExceptionTargetSelector`) lista solo clínicas o personal **activos**, con búsqueda por nombre, usando los servicios de `clinics` y `staff` (`clinicApi`, `staffMemberApi`) y `getPersonFullName` de `persons`, sin duplicar su lógica. Se envía el identificador del tipo elegido y `null` en el otro.
- **Fechas y zona horaria:** los campos `datetime-local` no traen zona; `toOffsetIso` completa `YYYY-MM-DDTHH:mm` con el **desplazamiento del navegador para esa fecha** (respeta horario de verano), p. ej. `2026-11-02T13:00:00-05:00`. La API no expone `time_zone` de la clínica, por lo que **se asume que el navegador está en la zona horaria de la clínica**; el formulario muestra el desplazamiento que se enviará. Las fechas se muestran con la zona del navegador.
- **Validaciones preventivas:** objetivo elegido (exactamente uno), tipo de la lista cerrada, inicio y fin obligatorios y válidos, **fin posterior al inicio** (sin duración cero ni invertidos). El backend es la autoridad: sus errores 422 se asocian al campo (`clinic_id`/`staff_member_id` → objetivo, `exception_type`, `reason`, `starts_at`, `ends_at`) o se muestran como alerta, conservando lo introducido. No se rechaza una excepción por superponerse con horarios o citas (regla no definida en el contrato).
- **Edición:** carga el detalle y envía solo lo modificado; si cambia el objetivo se envían ambos identificadores (uno `null`) y si cambia el intervalo se envían ambos extremos. Sin cambios no se llama al backend.
- **Listado:** muestra id, objetivo (insignia Clínica/Personal y nombre), tipo, motivo, inicio, fin y acciones Ver/Editar. La API devuelve solo identificadores, así que los nombres se resuelven con los servicios de `clinics`/`staff` (una consulta por objetivo; si falla se muestra `#id`).
- **Detalle:** deja claro si el bloqueo afecta a toda la clínica o solo al trabajador, y que es un bloqueo extraordinario, no un cambio del horario recurrente.

## Relación con horarios y disponibilidad

- Las **excepciones tienen prioridad sobre los overrides** ([schedule-overrides](schedule-overrides.md)): ningún override puede habilitar disponibilidad dentro de una excepción de bloqueo.

- Una excepción de **clínica** bloquea a todos los profesionales de la clínica (un solo registro, no uno por trabajador); una de **personal** bloquea solo a ese trabajador y no cambia el horario de apertura. Esto es semántica del backend; el frontend solo lo comunica.
- Registrar o editar una excepción **no** crea, modifica ni elimina `clinic_schedule` ni `staff_schedule`, y no copia horarios.
- `schedule_override` y la precedencia completa (horarios, excepciones, overrides, citas) se definen en sus propias specs; ningún override puede habilitar disponibilidad dentro de una excepción de cierre. **No se calcula disponibilidad efectiva en el frontend.**

## API pública consumida

`clinics` (`clinicApi`, `Clinic`), `staff` (`staffMemberApi`, `StaffMember`) y `persons` (`getPersonFullName`), todos desde sus `index.ts`. `schedule-exceptions` no es consumido por otros módulos.

## Organización interna

`pages/`, `components/` (`schedule-exception-form`, `schedule-exception-target-selector`, `schedule-exceptions-filters`, `schedule-exceptions-table`, `schedule-exceptions-pagination`, `schedule-exception-badges`), `hooks/` (`use-schedule-exceptions`, `use-schedule-exception`, `use-target-options`, `use-target-labels`), `services/schedule-exception-api.ts`, `schemas/`, `types/`, `utils/` (fechas con zona, payloads, errores). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (spec §16): el proyecto no tiene herramienta de pruebas; `frontend/AGENTS.md` exige consultar antes de instalar paquetes. Las pruebas de efecto sobre disponibilidad corresponden al backend.
- Zona horaria de la clínica no expuesta: confirmar que asumir la del navegador es aceptable.
- Formato de `details` en 422; solo se ejecutaron `npm run build` y `npm run lint`.
- Los filtros de clínica y personal listan las primeras 100 opciones activas (máximo del backend por página).
