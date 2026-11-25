# Módulo `staff`

Spec: `specs/08-staff-registration.md`. Código: `frontend/src/modules/staff/`. Depende de [persons](persons.md) (`staff → persons`); `persons` no depende de `staff`. Entidad de la API: `staff_member`; prefijo `/api/v1/staff`.

## Propósito y límites

Gestionar el registro de personal y sus campos propios (`employee_number`, `hire_date`, estado). Los datos personales pertenecen a `persons` y se muestran a partir del objeto `person` de la respuesta. Asigna **roles** (spec 09) y asocia **especialidades** (spec 12), ver abajo, y administra su **disponibilidad semanal** (spec 14), pero **no** clínicas; no crea credenciales y no gestiona horarios, citas ni autorización. `employment_status` no forma parte del contrato y no se muestra ni edita (el estado es `is_active`).

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/staff` | `StaffMembersPage` | Sí (grupo Gestión de personal) |
| `/staff/create` | `StaffMemberCreatePage` | No |
| `/staff/:staffId` | `StaffMemberDetailPage` | No |
| `/staff/:staffId/edit` | `StaffMemberEditPage` | No |

## Funcionamiento

- **Listado:** búsqueda por nombre, documento exacto y número de empleado exacto; filtro de estado; ordenamiento en servidor (`id`, `created_at`, `employee_number`, `last_name` + `order`); paginación de 20. Columnas: nombre completo, documento, nº de empleado, fecha de contratación, estado, fecha de registro y acciones.
- **Detalle:** datos del personal (id, número de empleado, fecha de contratación, estado, fechas) y de la persona asociada (nombres, apellidos, documento, estado) con enlace al módulo Personas.
- **Editar:** solo `employee_number` y `hire_date`; se envía únicamente lo modificado y los vaciados van como `null`. Nunca se envían `person_id` ni datos personales. Un 409 en edición se muestra en el campo número de empleado. Enlace "Editar datos personales" hacia `/persons/:id/edit`.
- **Número de empleado:** opcional, hasta 30 caracteres (letras, números y `. _ / -`, según el patrón del contrato); se envía recortado y en mayúsculas. **Fecha de contratación:** opcional, solo se valida que sea una fecha válida; no se asumen reglas laborales adicionales.
- **Estado:** diálogo de confirmación → `PATCH /staff/{id}/status`; no modifica a la persona.

## Registro de personal

Idéntico al flujo de [patients](patients.md) (ADR-007): persona existente (`PersonSelector` con `activeOnly`) o persona nueva (`PersonForm` con los campos del registro como `children`; primero `POST /persons`, después `POST /staff` con el `person_id`). Ante un fallo parcial se informa que la persona quedó registrada pero el registro de personal no, se conservan el `person_id` y los datos propios y solo se reintenta `POST /staff`, sin duplicar ni eliminar la persona. Ver las secciones de roles y especialidades más abajo; no hay controles para clínicas. La disponibilidad se describe más abajo.

## Roles del personal (spec 09)

Integrados en las pantallas existentes de `staff`; **no hay páginas, rutas ni entradas de sidebar nuevas**. Asignar un rol no autentica ni autoriza.

- **Contrato:** `GET|POST /staff-members/{id}/roles` y `DELETE /staff-members/{id}/roles/{role_id}` (independientes de `/staff`). Una solicitud por rol, sin operaciones masivas. `GET` acepta `include_inactive`: se usa `true` para ver también asignaciones a roles que luego quedaron inactivos; la respuesta (`StaffRoleResponse`) trae el rol sin permisos expandidos.
- **Catálogo:** se consulta con `roleApi` y el tipo `Role`, exportados por `modules/roles/index.ts`; solo se ofrecen roles activos (`is_active=true`, hasta 100; la búsqueda filtra por nombre en el servidor y la selección se conserva al buscar).
- **Creación (`/staff/create`):** sección "3. Roles del personal" (`StaffRolePicker`). Secuencia: persona (existente o `POST /persons`) → `POST /staff` → un `POST` de asignación por rol, de forma secuencial. Si todo sale bien se termina; si alguna asignación falla se informa que el integrante quedó registrado, se listan roles asignados y pendientes (con su error) y solo se reintentan los pendientes (sin crear de nuevo el personal ni repetir las asignaciones hechas). Un 409 al asignar se considera resuelto (el rol ya está asignado).
- **Edición (`/staff/:staffId/edit`):** `StaffRolesEditor` muestra los roles actuales (los inactivos se distinguen y pueden retirarse) y permite agregar con el selector o marcar para retirar (con "Deshacer"). Los cambios quedan pendientes y se aplican con **"Guardar roles"**, que ejecuta solo la diferencia (altas y bajas), de forma secuencial; ese botón es independiente del guardado de los datos propios. Tras guardar se recarga el estado y solo permanecen pendientes las operaciones fallidas; un 409 se informa y se refresca. El botón "Guardar roles" actúa como confirmación del retiro (no hay diálogo adicional).
- **Detalle (`/staff/:staffId`):** sección informativa (`StaffRolesList`) con nombre, descripción y estado de cada rol, y enlace a la edición.
- **Errores:** duplicado (409 al asignar) → "ya asignado"; 404 → integrante o rol no disponible; red/5xx → mensaje genérico; otros 4xx → `message` del backend. El contrato no define códigos que distingan "rol inexistente" de "rol inactivo".

## Especialidades del personal (spec 12)

Integradas en las pantallas existentes de `staff`, igual que los roles y **sin mezclarse con ellos**; **no hay páginas, rutas ni entradas de sidebar para `staff_specialty`**. Una asociación es una relación declarada: no es una certificación profesional ni una autorización para realizar procedimientos, y la interfaz lo indica.

- **Opcional:** el personal se registra sin especialidades; si no se elige ninguna no se envía ninguna solicitud de asignación.
- **Contrato:** `GET /staff-members/{id}/specialties` (incluye las que quedaron inactivas, con `is_active`); `PUT …/{specialty_id}` (idempotente, **sin cuerpo**); `DELETE …/{specialty_id}` (solo la asociación). Una solicitud por especialidad; nunca dentro de `POST`/`PATCH /staff`.
- **Catálogo:** `specialtyApi` y el tipo `Specialty`, exportados por `modules/specialties/index.ts`; solo especialidades activas (`is_active=true`), con búsqueda por nombre y paginación del servidor (10 por página); la selección se conserva al buscar o paginar.
- **Creación (`/staff/create`):** sección "4. Especialidades del personal" (`StaffSpecialtyPicker`). Secuencia: persona → `POST /staff` → un `POST` por rol → un `PUT` por especialidad, todo secuencial. Si algo falla se informa que el integrante quedó registrado y se muestran **por separado** los resultados de roles y de especialidades (asignados / pendientes con su error); el reintento solo repite lo pendiente de cada relación, sin crear de nuevo personal ni repetir lo ya confirmado.
- **Edición (`/staff/:staffId/edit`):** `StaffSpecialtiesEditor` (mismo patrón que `StaffRolesEditor`): muestra las asociadas (las inactivas se distinguen y pueden retirarse), permite marcar retiros ("Deshacer") y elegir especialidades activas nuevas; los cambios quedan pendientes y se aplican con **"Guardar especialidades"**, que ejecuta solo la diferencia, de forma secuencial. Su estado es independiente del de los datos propios y del de los roles, de modo que un fallo en una relación no afecta a las demás. Tras guardar se recarga y solo permanecen pendientes las operaciones fallidas.
- **Detalle (`/staff/:staffId`):** sección informativa (`StaffSpecialtiesList`) con nombre, descripción y estado, y enlace a la edición.
- **Errores:** 404 → integrante o especialidad no disponible; red/5xx → mensaje genérico; otros 4xx (p. ej. 409) → `message` del backend. `PUT` es idempotente, así que un 409 es un conflicto real (el contrato no distingue "especialidad inactiva" de otros conflictos).
- **Limitación:** la lista de pendientes tras un fallo parcial en la creación vive en memoria; recargar la página la pierde (el integrante ya existe y se puede completar desde su edición).

## Disponibilidad semanal del personal (spec 14)

Integrada en las pantallas existentes de `staff`; **no hay páginas, rutas ni entradas de sidebar para `staff_schedule`**. Son patrones recurrentes de disponibilidad **declarada**: no son horas trabajadas, asistencia, ausencias, licencias ni disponibilidad efectiva para citas, y la interfaz lo indica.

- **Opcional:** el personal se registra sin horarios; sin intervalos no se envía ninguna solicitud de horarios.
- **Contrato:** `GET /staff-members/{id}/schedules` (aquí la primera página de hasta 100, con activos e inactivos), `POST`, `PATCH …/{schedule_id}` (parcial) y `PATCH …/{schedule_id}/status`. Cuerpo de creación: `day_of_week` (1 = lunes … 7 = domingo), `starts_at`/`ends_at` (`HH:MM`), `valid_from` y `valid_until` (fecha o `null`). No hay `DELETE`: los intervalos se desactivan y reactivan. Nunca dentro de `POST`/`PATCH /staff`.
- **Validación preventiva y zona horaria:** idéntica a la de los horarios de clínica ([clinics.md](clinics.md)): día 1–7; inicio anterior a fin (sin duración cero ni cruce de medianoche); `valid_from` obligatoria y `valid_until` ≥ `valid_from`; solapamiento entre intervalos **activos** del mismo trabajador considerando día, horas **y** vigencias. Horas locales enviadas tal cual, sin conversión a UTC. El backend decide y sus errores (409/422) prevalecen.
- **Creación (`/staff/create`):** sección "5. Disponibilidad semanal" (`StaffSchedulesDrafts`), tras datos, roles y especialidades. Se validan los intervalos antes de crear la persona o el personal. Secuencia: persona → `POST /staff` → roles → especialidades → un `POST` por intervalo, todo secuencial. Si algo falla se informa que el integrante quedó registrado y los resultados de **roles, especialidades y horarios se muestran por separado**; el reintento repite solo lo pendiente de cada relación (conservando los valores de los intervalos), sin crear de nuevo el personal ni repetir lo confirmado.
- **Edición (`/staff/:staffId/edit`):** `StaffSchedulesEditor` (mismo comportamiento que el de clínicas): lista los intervalos, permite editar, marcar desactivar/reactivar y agregar; los cambios se aplican con **"Guardar disponibilidad"** ejecutando solo la diferencia en el orden desactivar → modificar → reactivar → crear. Estado independiente del de los datos propios, roles y especialidades.
- **Detalle (`/staff/:staffId`):** `StaffSchedulesWeek` organiza los intervalos por día con vigencia y estado.
- **Relación con los horarios de clínica:** son configuraciones independientes (spec 13 vs spec 14). **No se copian ni se asignan automáticamente** los horarios de una clínica al personal, ni se interpreta la disponibilidad individual como ampliación del horario de apertura. La disponibilidad efectiva (intersección de horarios activos de clínica y personal, excepciones, citas, estado laboral y de la persona) **no se calcula en el frontend**. Tampoco se desactivan horarios por cambios de estado laboral.
- **Limitación:** la lista de pendientes tras un fallo parcial en la creación vive en memoria; recargar la página la pierde.

## Errores de negocio

Los 4xx muestran el `message` del backend. El contrato no define un código de error, por lo que el frontend no puede distinguir `StaffMemberPersonInactiveError`, `StaffMemberAlreadyExistsError` y `EmployeeNumberAlreadyExistsError` (todos 409): en el alta se muestra como alerta general y en la edición el 409 se asocia al número de empleado. Pendiente de confirmar si el backend envía un código en `details`.

## Organización interna

`pages/`, `components/` (`staff-members-table`, `staff-members-filters`, `staff-members-pagination`, `staff-member-fields`, `staff-member-edit-form`, `staff-member-status-dialog`, `staff-member-status-badge`, `staff-role-picker`, `staff-roles-editor`, `staff-roles-list`, `staff-role-status-badge`, `staff-specialty-picker`, `staff-specialties-editor`, `staff-specialties-list`, `staff-specialty-status-badge`, `staff-schedule-fields`, `staff-schedules-drafts`, `staff-schedules-editor`, `staff-schedules-week`, `staff-schedule-status-badge`), `hooks/` (incluye `use-staff-roles`, `use-active-roles`, `use-staff-specialties`, `use-active-specialties`, `use-staff-schedules`), `services/` (`staff-member-api.ts`, `staff-role-api.ts`, `staff-specialty-api.ts`, `staff-schedule-api.ts`), `schemas/`, `types/`, `utils/`. Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (spec §14): el proyecto no tiene herramienta de pruebas; `frontend/AGENTS.md` exige consultar antes de instalar paquetes.
- Formato de `details` en 422; solo se ejecutaron `npm run build` y `npm run lint`, sin verificación en navegador ni contra el backend.
- El estado "persona creada, registro pendiente" vive en memoria; recargar la página lo pierde.
- De las rutas `/staff-members/{id}/…` solo se usan las de roles, especialidades y horarios; `appointments` y `conversations` pertenecen a otras specs.
- Los estados de las asignaciones viven en memoria: recargar la página durante un fallo parcial de roles pierde la lista de pendientes (el integrante ya existe; se pueden terminar desde su edición).

## API pública para otros módulos

`modules/staff/index.ts` exporta además de las páginas `staffMemberApi` y el tipo `StaffMember`, que `schedule-exceptions`, `schedule-overrides` y `appointments` usan para elegir y nombrar al trabajador afectado. `staff` no depende de `schedule-exceptions` (spec 15).

## Citas del personal (spec 17)

El detalle del trabajador incluye la sección de solo consulta `AppointmentsSection` (de `modules/appointments`), que usa `GET /staff-members/{id}/appointments` y enlaza a la agenda filtrada (`/appointments?staffMemberId=`). La gestión de citas se hace en la agenda; ver [appointments](appointments.md).
