# Módulo `patients`

Spec: `specs/07-patient-registration.md`. Código: `frontend/src/modules/patients/`. Depende de [persons](persons.md) (`patients → persons`); `persons` no depende de `patients`.

## Propósito y límites

Gestionar la entidad paciente y sus campos propios (`patient_number`, `notes`, estado). Los datos personales pertenecen a `persons` y se muestran a partir del objeto `person` de la respuesta de la API (sin consultas adicionales). No incluye historia clínica, citas ni edición de datos personales. Las condiciones especiales se asocian desde los formularios (spec 11, ver abajo) como información administrativa, no como diagnósticos.

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/patients` | `PatientsPage` | Sí (grupo Gestión de pacientes) |
| `/patients/create` | `PatientCreatePage` | No |
| `/patients/:patientId` | `PatientDetailPage` | No |
| `/patients/:patientId/edit` | `PatientEditPage` | No |

## Funcionamiento

- **Listado:** búsqueda por nombre, documento exacto y número de paciente exacto; filtro de estado; ordenamiento en servidor (`id`, `created_at`, `patient_number`, `last_name` + `order`); paginación de 20. Columnas: nombre completo, documento, nº de paciente, estado, fecha de registro y acciones.
- **Detalle:** datos del paciente (id, número, notas, estado, fechas) y de la persona asociada (nombres, apellidos, documento, estado de la persona) con enlace al módulo Personas.
- **Editar:** solo `patient_number` y `notes`; se envía únicamente lo modificado, vaciados → `null`. Nunca se envían `person_id` ni datos personales. Un 409 en edición se muestra en el campo número de paciente. Enlace "Editar datos personales" hacia `/persons/:id/edit`.
- **Número de paciente:** opcional, hasta 30 caracteres con letras, números y `. _ / -`; se envía recortado y en mayúsculas. **Notas:** hasta 1000 caracteres, administrativas.
- **Estado:** diálogo de confirmación → `PATCH /patients/{id}/status`; no modifica a la persona.

## Registro de paciente

Dos alternativas en la misma pantalla (`/patients/create`), siempre con los campos propios del paciente:

1. **Persona existente:** `PersonSelector` con `activeOnly`; se muestra la persona seleccionada y se envía `POST /patients` con su `person_id`.
2. **Persona nueva:** `PersonForm` (con los campos del paciente como `children`). Un único envío: valida primero los campos del paciente, luego `POST /persons` y, solo si tiene éxito, `POST /patients` con el `person_id` devuelto. Si falla la persona no se continúa.

**Fallo parcial:** si la persona se crea y el paciente falla, se avisa que la persona quedó registrada pero el paciente no, se conserva el `person_id` y los datos del paciente, y solo se ofrece reintentar `POST /patients` (no se vuelve a registrar la persona ni se elimina nada). Ver ADR-007 en [architecture-decisions.md](../architecture/architecture-decisions.md).

## Condiciones especiales del paciente (spec 11)

Integradas en las pantallas existentes de `patients`; **no hay páginas, rutas ni entradas de sidebar para `patient_special_condition`**. Las notas pertenecen a la relación (paciente–condición), no a los datos propios del paciente, y las condiciones no se presentan como diagnósticos ni generan decisiones clínicas.

- **Contrato:** `GET /patients/{id}/special-conditions`; `PUT …/{special_condition_id}` (idempotente: crea la relación o reemplaza sus notas; `{}` = sin notas); `PATCH …/{special_condition_id}` (solo `notes`, obligatorio, `null` las borra); `DELETE …/{special_condition_id}` (solo la relación). Cada respuesta incluye la condición con `is_active`, así que **sí se manejan condiciones inactivas**. Se usan `PUT` para asociar y `PATCH` para cambiar notas, como recomienda la spec y admite el contrato. Notas: máx. 1000 caracteres.
- **Catálogo:** `specialConditionApi` y el tipo `SpecialCondition`, exportados por `modules/special-conditions/index.ts`; solo condiciones activas (`is_active=true`), con búsqueda por nombre y paginación del servidor (10 por página); la selección y sus notas se conservan al buscar o paginar.
- **Creación (`/patients/create`):** sección "3. Condiciones especiales del paciente" (`PatientConditionPicker`), con notas por condición elegida, tanto con persona existente como nueva. Secuencia: persona (si es nueva) → `POST /patients` → un `PUT` por condición, uno tras otro. Si alguna asociación falla se informa que el paciente quedó registrado, se listan condiciones asociadas y pendientes (con su error) y solo se reintentan las pendientes, conservando sus notas, sin crear de nuevo paciente ni persona.
- **Edición (`/patients/:patientId/edit`):** `PatientConditionsEditor` muestra las condiciones asociadas (las inactivas se distinguen y pueden retirarse), permite editar sus notas, marcar retiros ("Deshacer") y elegir condiciones activas nuevas. Un único "Guardar" coordina: `PATCH /patients/{id}` solo con lo modificado y después las operaciones necesarias —`PUT` de altas, `PATCH` de notas modificadas y `DELETE` de retiros—, sin enviar nada sobre asociaciones que no cambiaron. Si el `PATCH` del paciente falla no se ejecuta ninguna operación de condiciones. Si fallan operaciones: se conserva lo confirmado (el paciente queda guardado y no se repite el `PATCH`), se informa qué se guardó y qué no, y permanecen pendientes solo las operaciones fallidas (con las notas escritas).
- **Detalle (`/patients/:patientId`):** sección informativa (`PatientConditionsList`) con nombre, descripción, estado y notas de cada asociación, y enlace a la edición.
- **Errores:** 404 → paciente o condición no disponible; red/5xx → mensaje genérico; otros 4xx (p. ej. 409) → `message` del backend. El contrato no distingue "condición inactiva" de otros conflictos.
- **Limitaciones:** la lista de pendientes tras un fallo parcial vive en memoria (recargar la página la pierde; lo confirmado persiste en el backend).

## Errores de negocio

Los errores 4xx muestran el `message` que devuelve el backend. La spec distingue `PatientPersonNotFoundError` (422), `PatientPersonInactiveError` / `PatientAlreadyExistsError` / `PatientNumberAlreadyExistsError` (409), pero el frontend **no puede distinguirlos por código**: comparten el estado HTTP y el contrato no define un identificador de error. En el alta el mensaje se muestra como alerta general; en la edición el 409 se asocia al número de paciente. Pendiente de confirmar si el backend incluye un código en `details`.

## Organización interna

`pages/`, `components/` (`patients-table`, `patients-filters`, `patients-pagination`, `patient-fields`, `patient-edit-form`, `patient-status-dialog`, `patient-status-badge`, `patient-condition-picker`, `patient-conditions-editor`, `patient-conditions-list`, `patient-condition-status-badge`), `hooks/` (incluye `use-patient-special-conditions`, `use-active-special-conditions`), `services/` (`patient-api.ts`, `patient-special-condition-api.ts`), `schemas/`, `types/`, `utils/`. Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (spec §14): el proyecto no tiene herramienta de pruebas; `frontend/AGENTS.md` exige consultar antes de instalar paquetes.
- Formato de `details` en 422; solo se ejecutaron `npm run build` y `npm run lint`, sin verificación en navegador ni contra el backend.
- El estado "persona creada, paciente pendiente" vive en memoria; recargar la página lo pierde.

## Citas del paciente (spec 17)

El detalle del paciente incluye la sección de solo consulta `AppointmentsSection` (de `modules/appointments`), que usa `GET /patients/{id}/appointments` y enlaza a la agenda filtrada (`/appointments?patientId=`). `modules/patients/index.ts` exporta ahora `patientApi` y el tipo `Patient` para que `appointments` busque y nombre pacientes. La gestión de citas se hace en la agenda; ver [appointments](appointments.md).

## Apoderados del paciente (spec 26)

El alta (`/patients/create`) incluye la sección **Apoderados** (opcional, con `patient_guardian.create`): se agregan personas existentes o nuevas con su parentesco y se asocian después de crear el paciente, reintentando solo las pendientes si alguna falla (ver [guardians](guardians.md)). El detalle muestra los apoderados del paciente y la edición permite asociar, cambiar el parentesco y desasociar (la persona se conserva). `patients` consume `guardians`; no duplica datos ni formularios de personas.
