# Módulo `appointments`

Spec: `specs/17-appointment.md`. Código: `frontend/src/modules/appointments/`. Módulo **independiente**: la agenda es una única página con calendario; crear, consultar, editar/reprogramar y cambiar el estado se hacen con **modales** sobre esa página.

## Propósito y límites

Administrar citas odontológicas (paciente, miembro del personal, intervalo y motivo) desde un calendario. **No** incluye registro de pacientes/personas/personal, horarios, excepciones, overrides, procedimientos, historia clínica, facturación, pagos, asistencia, eliminación física de citas ni **cálculo de disponibilidad** (lo hace el backend). Tampoco se pide ni se envía una clínica: el modelo de citas no se relaciona con `clinic`.

## Rutas y navegación

| Ruta | Página | En el menú |
|---|---|---|
| `/appointments` | `AppointmentsCalendarPage` | Sí (grupo **Gestión de citas** → **Agenda**, clave `appointmentManagement` / `appointmentsAgenda`) |

No existen `/appointments/create`, `/appointments/:id` ni `/appointments/:id/edit`. La URL admite filtros iniciales opcionales (`?patientId=`, `?staffMemberId=`, `?status=`), que usan los enlaces "Ver en la agenda" de los detalles de paciente y personal.

## Calendario

- Se reutiliza **FullCalendar** (`@fullcalendar/react` ya instalado y usado por la página de plantilla `pages/main/calendar`) con los plugins `daygrid`, `timegrid`, `interaction` y el tema `classic`. No se instaló ninguna dependencia.
- Vistas **día** (`timeGridDay`), **semana** (`timeGridWeek`, vista inicial) y **mes** (`dayGridMonth`). Controles propios y traducidos: anterior, siguiente, hoy, ir a una fecha (`input type="date"`) y selector de vista.
- Cada cita muestra paciente, horario, estado (**con texto**, no solo color) y, en día/semana, el trabajador. Colores: pendiente (naranja), confirmada (marca), completada (verde), cancelada (gris, tachada).
- Al seleccionar una cita se abre el modal de detalle; al seleccionar un hueco o día se abre el modal de creación con fecha (y horas, si se eligió un hueco horario) prellenadas. Las citas no se arrastran: la reprogramación se hace desde el modal de edición.
- Los nombres de paciente y personal se resuelven con `patientApi.getById` / `staffMemberApi.getById` (una consulta por id distinto, con caché mientras la página vive). Si falla, se muestra `#id`.

## Contrato

- `GET /appointments`: filtros `patient_id`, `staff_member_id`, `status`, `starts_from` (incluido) y `starts_to` (excluido), `sort_by` (`starts_at`), `order`, `page`, `page_size` (máx. 100). Se consulta el **periodo visible**; si hay más de 100 citas se recorren hasta 10 páginas y, si aún hay más, se avisa de que el periodo está truncado.
- `POST /appointments`: `patient_id`, `staff_member_id`, `starts_at`, `ends_at`, `reason` (`null` si vacío). No se envían `id`, estado, fechas de auditoría ni clínica.
- `GET /appointments/{id}`: al abrir el detalle.
- `PATCH /appointments/{id}`: **parcial**, solo con los campos modificados entre `staff_member_id`, `starts_at`/`ends_at` y `reason`. No admite paciente ni estado. Si no hay cambios no se envía nada.
- `PATCH /appointments/{id}/status`: único mecanismo de cambio de estado.
- `GET /patients/{id}/appointments` y `GET /staff-members/{id}/appointments`: secciones de los detalles de paciente y personal (10 por página, de la más reciente a la más antigua).
- Detalles de la cita (spec 18): `GET|POST /appointments/{id}/details`, `PATCH|DELETE /appointments/{id}/details/{detail_id}`. Ver la sección **Procedimientos de la cita**.
- No existe `DELETE`: las citas canceladas se conservan.

## Filtros

Paciente, personal y estado, combinables, con acción "Limpiar filtros". Paciente y personal usan un popover con **búsqueda por nombre** (solo activos) que reutiliza `patientApi` y `staffMemberApi`, de modo que no se limita a las primeras opciones. El estado envía el valor de API (`pending`, …), nunca la etiqueta traducida. Cambiar un filtro no cambia el periodo visible; navegar de periodo no cambia los filtros.

## Creación

Modal con: paciente (selector con búsqueda; no crea pacientes), personal (idem), fecha, hora de inicio, hora de fin y motivo opcional. Validación preventiva: obligatorios, fecha/hora válidas y **fin posterior al inicio** (mismo día). El backend valida disponibilidad, solapamientos, personas activas y estado laboral; si rechaza, el modal se mantiene abierto con los datos introducidos y muestra el mensaje del backend asociado al campo (si `details` lo permite) o como alerta. Tras el éxito de la API se cierra el modal, se recarga el calendario y se muestra un aviso de éxito.

## Detalle, edición y reprogramación

- **Detalle:** id, paciente, personal, fecha, inicio, fin, estado, motivo, creación y actualización.
- **Edición/reprogramación:** el paciente es de solo lectura; se pueden cambiar personal, intervalo y motivo mediante un único `PATCH` (sin secuencia cancelar + crear). El backend revalida la disponibilidad y excluye la propia cita del solapamiento. Si falla, el calendario conserva la cita con sus datos confirmados anteriores y el modal conserva lo introducido. Tras el éxito se recarga el calendario y se vuelve a mostrar el detalle actualizado.
- Se ofrece **Editar** solo para citas pendientes o confirmadas (decisión del frontend: una cita completada o cancelada no se reprograma; el backend sigue siendo la autoridad).

## Estados

| Estado actual | Acciones ofrecidas |
|---|---|
| `pending` | Confirmar, Cancelar |
| `confirmed` | Marcar como completada, Cancelar |
| `completed` | Ninguna |
| `cancelled` | Ninguna (para volver a agendar, crear una cita nueva) |

Confirmar se ejecuta directamente; **Completar** y **Cancelar** piden confirmación dentro del propio modal. La interfaz solo cambia tras la respuesta satisfactoria; si el backend rechaza la transición se muestra su mensaje y el estado confirmado no cambia.

## Fechas y zona horaria

- `APP_TIMEZONE` se toma de `VITE_APP_TIMEZONE` (por defecto `America/Lima`). La interfaz **no depende de la zona del navegador**.
- Los campos fecha/hora del modal son "hora de pared" en `APP_TIMEZONE`; al enviar se convierten a instantes con desplazamiento (`2026-11-03T10:00:00-05:00`) con `Intl.DateTimeFormat` (`toZonedIso`) y al recibir se convierten de vuelta (`fromIso`). Todas las horas mostradas usan `timeZone: APP_TIMEZONE`.
- FullCalendar se configura con `timeZone="UTC"` y recibe las citas como hora de pared de `APP_TIMEZONE`; así se evitan conversiones dobles. El rango visible se convierte a `starts_from` / `starts_to` con el desplazamiento de `APP_TIMEZONE`.
- Limitación: el intervalo de una cita debe estar dentro de un mismo día (fecha única + dos horas). Las citas que cruzan la medianoche no se pueden crear desde el modal. El periodo consultado se filtra por **inicio** de la cita.

## Procedimientos de la cita (spec 18)

Se integran en el **mismo formulario** de la agenda (sin formulario ni ruta aparte) y en el modal de detalle. El catálogo lo administra [procedures](procedures.md); `appointments` lo consume con `procedureApi` (solo `is_active=true`, búsqueda por nombre o código) y no lo duplica.

- **Formulario:** sección "Procedimientos" con selector del catálogo (activos; estados de carga, catálogo vacío, error y sin resultados), una tarjeta por línea con cantidad (entero 1–1000), precio unitario, duración total, importe y notas, retirar y deshacer, y un **resumen** (cantidad de procedimientos, duración requerida, duración reservada, total estimado). La selección es opcional (se pueden crear citas sin procedimientos).
- **Contrato:** `POST` solo con `procedure_id`, `quantity` y `notes` (no se envían `duration_minutes` ni `unit_price`: el precio sale del catálogo y no hay precios personalizados); `PATCH` solo `quantity` y `notes` (el `procedure_id` de un detalle no cambia: para sustituirlo se retira y se añade otro); `DELETE` para retirar.
- **Creación en pasos:** `POST /appointments` y luego un `POST …/details` por procedimiento, de forma secuencial. Si la cita se crea y falla algún detalle, **no se vuelve a crear la cita**: se conserva su id, se avisa de que quedó creada parcialmente, se marca cada procedimiento pendiente con su error y "Reintentar procedimientos pendientes" ejecuta solo lo que falta (los detalles ya registrados quedan como "Guardado" y no se duplican). El calendario se refresca en cuanto la cita existe.
- **Edición:** al abrir se recuperan los detalles (`GET …/details`) y los datos de sus procedimientos (incluidos inactivos, que siguen visibles). Al guardar se aplica un `PATCH` de la cita si cambió algo y después, de una en una y en este orden, los retiros, las modificaciones y las altas. Cada línea tiene como referencia el detalle confirmado por la API, de modo que, si una operación falla, se indica qué procedimiento no se pudo guardar, se conservan los cambios que sí se registraron y reintentar ejecuta solo los pendientes.
- **Valores históricos:** precio unitario, duración e importe de un detalle guardado son los del backend; no se reemplazan por el precio actual del catálogo. Si se cambia la cantidad de un detalle, el importe y la duración se muestran como **estimación (≈)** hasta guardar (nunca se vuelve a multiplicar la duración recibida). Los importes se calculan con céntimos enteros (`bigint`), sin `float`.
- **Duración reservada:** si la duración requerida supera la reservada (fin − inicio) se avisa y se ofrece **"Ajustar hora de fin"**; nunca se cambia el horario sin acción del usuario y el backend valida la disponibilidad.
- **Consulta:** el modal de detalle muestra los procedimientos de la cita (nombre, cantidad, precio histórico, duración, importe y notas) y el resumen, en solo lectura.
- **Estado de la cita:** la edición (y por tanto añadir, modificar o retirar procedimientos) solo se ofrece en citas `pending` y `confirmed`; en `completed` y `cancelled` los detalles son de solo lectura y se conservan como historial. El backend sigue siendo la autoridad (`DELETE` no se permite en citas completadas o canceladas).
- **Decisiones de la spec §18:** se siguieron las recomendaciones (precio del catálogo, duración reservada ≥ suma, citas sin procedimientos, modificaciones en `confirmed` sujetas a la validación del backend y retiro en pendientes/confirmadas). Deben confirmarse con el backend.

## Disponibilidad

El frontend **no calcula disponibilidad efectiva** ni duplica reglas de horarios, excepciones u overrides (spec 14–16): envía el intervalo y muestra el resultado del backend. Un hueco libre del calendario no garantiza que se pueda agendar (la agenda lo indica). Los estados `pending` y `confirmed` bloquean agenda y `cancelled`/`completed` no, según el backend; la regla definitiva sobre `pending` debe confirmarse con el backend y el frontend no la usa para impedir ninguna operación.

## API pública consumida y expuesta

Consume `procedures` (`procedureApi`, `Procedure` y utilidades decimales), `patients` (`patientApi`, ahora exportada desde `modules/patients/index.ts`), `staff` (`staffMemberApi`) y `persons` (`getPersonFullName`, `getPersonDocument`). Expone `AppointmentsSection`, usada por `PatientDetailPage` y `StaffMemberDetailPage` (secciones de solo consulta, con enlace a la agenda filtrada). Esto crea una referencia circular de módulos (`patients`/`staff` ↔ `appointments`) que solo se usa en tiempo de ejecución dentro de componentes y funciones, por lo que no afecta a la inicialización.

## Organización interna

`pages/` (`appointments-calendar-page`), `components/` (`appointments-calendar`, `appointment-calendar-event`, `appointments-filters`, `appointment-entity-selector`, `appointment-form-modal`, `appointment-detail-modal`, `appointment-status-badge`, `appointments-section`, `appointment-procedures-section`, `appointment-procedure-selector`, `appointment-procedure-summary`, `appointment-detail-list`), `hooks/` (`use-appointment-details`, `use-procedure-info`, `use-procedure-options`, `use-appointments`, `use-appointment`, `use-appointment-status-change`, `use-entity-options`, `use-entity-labels`, `use-related-appointments`), `services/appointment-api.ts`, `schemas/`, `types/`, `utils/` (líneas de procedimientos, fechas con zona, estados y transiciones, estilos, vistas, errores). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (spec §19): el proyecto no tiene herramienta de pruebas; `frontend/AGENTS.md` exige consultar antes de instalar paquetes. Solo se ejecutaron `npm run build` y `npm run lint`; el calendario no se ha comprobado visualmente en navegador.
- Regla definitiva sobre si `pending` bloquea agenda (spec §13).
- Formato de `details` en 422: la asociación de errores a campos depende de él; si no coincide, el mensaje se muestra como alerta.
- 409 y 422 no se distinguen (solapamiento, disponibilidad, transición no permitida): se muestra el mensaje del backend.
- Si el backend permitiera editar citas completadas o canceladas, habría que habilitar **Editar** para ellas.
- Citas que cruzan la medianoche y periodos con más de 1000 citas.
- Spec 18: no se confirmó si el backend rechaza el mismo procedimiento dos veces en una cita (el selector impide añadirlo dos veces) ni si permite modificar detalles en citas `confirmed`; los nombres de procedimiento se consultan por id distinto.
