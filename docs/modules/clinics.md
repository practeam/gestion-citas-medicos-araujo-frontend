# Módulo `clinics`

Spec: `specs/05-clinic.md` (la spec dice guardarse como `05-clinics.md`; el archivo real es `05-clinic.md`). Código: `frontend/src/modules/clinics/`.

## Propósito y límites

Administrar el catálogo de clínicas/sedes: listar, crear, consultar, editar y activar/desactivar. No incluye personal, especialidades, citas ni pacientes por clínica. Los horarios semanales de apertura se administran desde los formularios (spec 13, ver abajo). No expone ni edita `time_zone` (no forma parte del contrato).

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/clinics` | `ClinicsPage` | Sí (grupo Gestión clínica) |
| `/clinics/create` | `ClinicCreatePage` | No |
| `/clinics/:clinicId` | `ClinicDetailPage` (solo lectura, incluye inactivas) | No |
| `/clinics/:clinicId/edit` | `ClinicEditPage` | No |

## Funcionamiento

- **Listado:** búsqueda por nombre (debounce), filtro de estado, ordenamiento en servidor (`sort_by` `id`/`name`/`created_at`, `order`), paginación de 20. Columnas: nombre, dirección, teléfono, correo, estado, fechas y acciones; opcionales vacíos se muestran como "—".
- **Crear:** `name` (máx. 150) y `address` (máx. 255) obligatorios, recortados; `description`, `phone` y `email` opcionales y no se envían si están vacíos. El esquema de creación no admite `is_active`, por lo que no se envía.
- **Validaciones de interfaz:** teléfono con el patrón del backend (`^\+?\(?[0-9][0-9\s().-]*$`), máx. 30 caracteres y 6–15 dígitos; correo con formato válido (no comprueba existencia). La unicidad del nombre (409) la decide el backend y se muestra en el campo nombre.
- **Editar:** carga el detalle y envía solo los campos modificados; `description`, `phone` y `email` vaciados van como `null`; `name` y `address` nunca se envían vacíos. Sin cambios no se llama al backend.
- **Estado:** diálogo de confirmación → `PATCH /clinics/{id}/status` con `is_active`; el éxito se muestra solo tras la respuesta del backend.

## Horarios de atención (spec 13)

Integrados en las pantallas existentes de `clinics`; **no hay páginas, rutas ni entradas de sidebar para `clinic_schedule`**. Representan patrones semanales recurrentes de apertura, no citas ni cierres excepcionales (no se implementan excepciones, modificaciones puntuales ni cálculo de disponibilidad).

- **Contrato:** `GET /clinics/{id}/schedules` (aquí solo la primera página de hasta 100, con activos e inactivos), `POST`, `PATCH /clinics/{id}/schedules/{schedule_id}` (parcial) y `PATCH …/{schedule_id}/status` (`is_active`). Cuerpo de creación: `day_of_week` (1 = lunes … 7 = domingo), `starts_at`/`ends_at` (`HH:MM`), `valid_from` (`YYYY-MM-DD`) y `valid_until` (fecha o `null`). Nunca dentro de `POST`/`PATCH /clinics`.
- **Sin eliminación:** el `DELETE` existe en el contrato pero no se ofrece; la acción habitual es desactivar (y reactivar), conservando el registro.
- **Zona horaria:** no hay campo de zona horaria. Las horas se envían tal como se escriben (locales de la clínica), sin conversión a UTC; la interpretación la hace el backend con la zona de la clínica.
- **Validación preventiva** (`validateSchedule`, `findOverlappingKeys`): día 1–7; hora de inicio obligatoria y **anterior** a la de fin (sin duración cero ni cruce de medianoche: se usan dos días consecutivos); `valid_from` obligatoria; `valid_until` ≥ `valid_from`. **Solapamientos** entre intervalos **activos**: mismo día, horas que se pisan **y** vigencias que se pisan (no basta comparar horas); los inactivos no participan; varios intervalos por día son válidos si no se solapan. El backend decide definitivamente y sus errores (409/422) se muestran con su mensaje, conservando lo introducido.
- **Creación (`/clinics/create`):** sección "Horarios de atención" opcional (`ClinicSchedulesDrafts`): se pueden agregar varios intervalos. Antes de crear la clínica se validan los intervalos. Secuencia: `POST /clinics` → un `POST` por intervalo, secuencial; sin intervalos no se envía ninguna solicitud de horarios. Si alguno falla se informa que la clínica quedó registrada, se listan intervalos creados y pendientes (con su error), se conservan los valores y solo se reintentan los pendientes, sin crear de nuevo la clínica.
- **Edición (`/clinics/:clinicId/edit`):** `ClinicSchedulesEditor` lista los intervalos (activos e inactivos), permite editar uno (campos del intervalo), marcar desactivar/reactivar ("Deshacer") y agregar nuevos. Los cambios quedan pendientes y se aplican con **"Guardar horarios"**, tras la validación preventiva, ejecutando solo las operaciones necesarias y en este orden para liberar solapamientos: desactivar → modificar (`PATCH` solo con campos cambiados) → reactivar → crear. Si fallan operaciones se conserva lo confirmado, se informa qué se guardó y qué no, y permanecen pendientes solo las fallidas. Una reactivación rechazada por el backend (p. ej. solapamiento) muestra su error y el estado visual solo cambia al confirmarse (tras recargar). Es independiente del guardado de los datos de la clínica; el botón "Guardar horarios" actúa como confirmación de la desactivación.
- **Detalle (`/clinics/:clinicId`):** `ClinicSchedulesWeek` organiza los intervalos por día (lunes a domingo) con su vigencia y estado; los inactivos se atenúan.

## Organización interna

Misma estructura que [roles](roles.md) (`pages/`, `components/`, `hooks/` (incluye `use-clinic-schedules`), `services/` (`clinic-api.ts`, `clinic-schedule-api.ts`), `schemas/`, `types/`, `utils/`). Duplicación entre módulos: ADR-005 en [architecture-decisions.md](../architecture/architecture-decisions.md). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- **Pruebas:** la spec (§11) las exige, pero el proyecto no tiene herramienta de pruebas instalada y `frontend/AGENTS.md` exige consultar antes de instalar paquetes. No se escribieron pruebas.
- Formato de `details` en 422.
- Solo se ejecutaron `npm run build` y `npm run lint`; sin verificación en navegador ni contra el backend.

## API pública para otros módulos

`modules/clinics/index.ts` exporta además de las páginas `clinicApi` y el tipo `Clinic`, que `schedule-exceptions` usa para elegir y nombrar la clínica afectada. `clinics` no depende de `schedule-exceptions`; las excepciones se administran desde su propio módulo (spec 15).
