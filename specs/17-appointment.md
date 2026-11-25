# SPEC 17 — Gestión de citas odontológicas

## 1. Prioridad y dependencias

Esta especificación define la implementación frontend del módulo de citas odontológicas mediante una agenda visual basada en calendario.

Depende de:

- SPEC 06 — Módulo de personas.
- SPEC 07 — Módulo de pacientes.
- SPEC 08 — Módulo de personal.
- SPEC 14 — Horarios del personal.
- SPEC 15 — Excepciones de horarios.
- SPEC 16 — Modificaciones puntuales de horarios.

Skills aplicables:

- `$frontend-arquitectura`: organización del módulo, navegación, rutas y layouts.
- `$frontend-integracion-api`: comunicación con los endpoints de citas y recursos relacionados.
- `$frontend-catalogo-componentes`: reutilización de componentes, calendarios, formularios y modales existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

La implementación debe respetar la arquitectura existente del frontend.

Antes de desarrollar el calendario, inspeccionar los componentes y dependencias existentes para determinar si ya hay una solución de calendario reutilizable. No instalar una biblioteca adicional sin comprobar primero los recursos disponibles.

## 2. Objetivo

Permitir administrar citas odontológicas mediante una página centralizada de agenda.

La interfaz debe permitir:

- Visualizar las citas en un calendario.
- Consultar la agenda diaria, semanal y mensual.
- Filtrar citas por paciente, trabajador y estado.
- Navegar entre fechas.
- Crear citas desde la agenda.
- Consultar los detalles de una cita.
- Editar y reprogramar citas.
- Confirmar citas.
- Marcar citas como completadas.
- Cancelar citas.
- Identificar visualmente los estados de las citas.
- Consultar citas desde los módulos de pacientes y personal cuando corresponda.

**El calendario debe ser la vista principal del módulo de citas.**

La creación y edición deben realizarse mediante modales o diálogos integrados en la página del calendario, sin crear formularios independientes para las operaciones habituales.

## 3. Alcance

Esta especificación comprende:

- Página principal de agenda.
- Calendario interactivo.
- Vistas diaria, semanal y mensual.
- Navegación por fechas.
- Filtros de citas.
- Visualización de citas existentes.
- Modal de creación.
- Modal de consulta o detalle.
- Modal de edición y reprogramación.
- Gestión de estados.
- Integración con pacientes y personal.
- Validaciones de disponibilidad.
- Manejo de errores.
- Actualización del calendario después de las operaciones.

No comprende:

- Registro de pacientes.
- Registro de personas.
- Registro de personal.
- Gestión de horarios semanales.
- Gestión de excepciones.
- Gestión de overrides.
- Gestión de procedimientos odontológicos.
- Historia clínica.
- Facturación.
- Pagos.
- Control de asistencia.
- Eliminación física de citas.
- Implementación propia del algoritmo de disponibilidad.

## 4. Organización del módulo

La funcionalidad debe implementarse dentro de:

`frontend/src/modules/appointments/`

El módulo será responsable de administrar las citas y la agenda.

Se pueden incorporar componentes internos como:

- `AppointmentsCalendarPage`: página principal de agenda.
- `AppointmentsCalendar`: calendario interactivo.
- `AppointmentsCalendarToolbar`: controles de navegación y vistas.
- `AppointmentsFilters`: filtros de citas.
- `AppointmentCalendarEvent`: representación de una cita.
- `AppointmentFormModal`: modal de creación y edición.
- `AppointmentDetailModal`: modal de detalle.
- `AppointmentStatusActions`: acciones de estado.
- `AppointmentPatientSelector`: selector de pacientes.
- `AppointmentStaffSelector`: selector de personal.

Los nombres son orientativos. Antes de crear componentes nuevos se debe inspeccionar la estructura existente.

Los componentes exclusivos de citas deben permanecer dentro de `frontend/src/modules/appointments/`.

No reorganizar la arquitectura general del frontend.

## 5. Página principal de agenda

La ruta principal del módulo debe mostrar una página de calendario.

Ruta:

`/appointments`

Esta página debe ser el punto central desde el que el usuario administra las citas.

### 5.1. Estructura de la página

La página debe incluir:

**Encabezado:**

- Título de la página: Agenda de citas.
- Botón para crear una nueva cita.
- Controles de navegación del calendario.

**Barra de filtros:**

- Paciente.
- Miembro del personal.
- Estado de la cita.

**Calendario:**

- Vista diaria.
- Vista semanal.
- Vista mensual.
- Representación visual de las citas.
- Navegación entre periodos.
- Acceso al detalle de una cita al seleccionarla.

La distribución debe mantener los filtros accesibles y el calendario como elemento visual principal.

### 5.2. Vistas del calendario

El calendario debe permitir cambiar entre:

- Día.
- Semana.
- Mes.

La vista semanal debe facilitar la identificación de los horarios ocupados y disponibles de cada día.

La vista diaria debe facilitar la consulta detallada de las citas programadas.

La vista mensual debe proporcionar una visión general de la distribución de citas.

La navegación debe permitir:

- Ir al periodo anterior.
- Ir al periodo siguiente.
- Volver a la fecha actual.
- Seleccionar una fecha específica cuando el componente lo permita.

La fecha seleccionada debe determinar el periodo mostrado y los parámetros de consulta enviados al backend.

### 5.3. Representación de las citas

Cada cita debe representarse visualmente dentro del intervalo correspondiente.

Mostrar, cuando la información esté disponible:

- Nombre del paciente.
- Nombre del trabajador.
- Hora de inicio.
- Hora de finalización.
- Estado.

Las citas deben diferenciarse visualmente por su estado mediante colores o indicadores consistentes.

La identificación visual no debe depender exclusivamente del color. Se debe mostrar también una etiqueta o indicador textual del estado.

Al seleccionar una cita, abrir el modal de detalle.

No mostrar información clínica sensible que no pertenezca al contrato de citas.

### 5.4. Actualización del calendario

Después de crear, editar, reprogramar o cambiar el estado de una cita:

- Actualizar la información correspondiente del calendario.
- Mantener los filtros seleccionados.
- Mantener el periodo visible.
- Evitar duplicar eventos.
- Refrescar los datos desde el backend cuando corresponda.

No considerar una operación exitosa hasta recibir confirmación de la API.

## 6. Integración con la API

Prefijo:

`/api/v1`

Los endpoints definidos por el backend son:

### 6.1. Crear una cita

Endpoint:

`POST /api/v1/appointments`

Contrato:

```json
{
  "patient_id": 12,
  "staff_member_id": 4,
  "starts_at": "2026-11-03T10:00:00-05:00",
  "ends_at": "2026-11-03T10:45:00-05:00",
  "reason": "Evaluación inicial"
}
```

La creación debe realizarse desde el modal de nueva cita.

El frontend debe enviar los identificadores de paciente y trabajador, el intervalo temporal y el motivo opcional.

No enviar:

- `id`.
- `created_at`.
- `updated_at`.
- Campos calculados de disponibilidad.
- Estado inicial si el backend lo establece automáticamente y no lo admite en el contrato.

El estado inicial debe respetar el comportamiento definido por el backend.

### 6.2. Consultar citas

Endpoint:

`GET /api/v1/appointments`

Debe utilizarse para recuperar las citas que se mostrarán en el calendario.

El backend admite filtros por:

- Paciente.
- Trabajador.
- Estado.
- Rango de inicio.

El frontend debe consultar las citas correspondientes al periodo visible del calendario.

Para ello debe utilizar los parámetros de rango temporal definidos en el contrato real de la API.

No inventar nombres de parámetros, operadores de rango, paginación ni ordenamiento.

La consulta debe permitir recuperar las citas necesarias para representar correctamente el periodo solicitado.

### 6.3. Consultar una cita específica

Endpoint:

`GET /api/v1/appointments/{appointment_id}`

Debe utilizarse para recuperar el detalle de una cita cuando el usuario seleccione un evento del calendario o abra su consulta.

### 6.4. Actualizar una cita

Endpoint:

`PATCH /api/v1/appointments/{appointment_id}`

Debe utilizarse para modificar los campos editables definidos por el backend.

Principalmente:

- `starts_at`.
- `ends_at`.
- `staff_member_id`.
- `reason`.

La edición debe realizarse desde el modal correspondiente.

El frontend no debe permitir modificar campos que el backend no admita.

La modificación del horario o trabajador debe provocar una nueva validación de disponibilidad en el backend.

No enviar cambios de estado mediante este endpoint.

### 6.5. Cambiar el estado de una cita

Endpoint:

`PATCH /api/v1/appointments/{appointment_id}/status`

Debe utilizarse para cambiar el estado de una cita.

La interfaz debe ofrecer únicamente las transiciones permitidas.

No utilizar PATCH general para cambiar el estado.

### 6.6. Consultar citas de un paciente

Endpoint:

`GET /api/v1/patients/{patient_id}/appointments`

Debe utilizarse cuando sea necesario consultar el historial o las citas relacionadas con un paciente desde su módulo.

Esta consulta debe complementar la agenda general.

### 6.7. Consultar citas de un trabajador

Endpoint:

`GET /api/v1/staff-members/{staff_member_id}/appointments`

Debe utilizarse cuando sea necesario consultar las citas relacionadas con un miembro del personal desde su módulo.

Esta consulta debe complementar la agenda general.

## 7. Filtros de la agenda

La página principal debe incluir filtros para facilitar la consulta de citas.

### 7.1. Filtro por paciente

Debe permitir seleccionar un paciente y mostrar únicamente las citas asociadas.

Reutilizar los componentes y servicios del módulo de pacientes cuando corresponda.

### 7.2. Filtro por trabajador

Debe permitir seleccionar un miembro del personal y mostrar únicamente sus citas.

Reutilizar los componentes y servicios del módulo de personal.

### 7.3. Filtro por estado

Debe permitir filtrar por los estados admitidos por el backend.

Los estados iniciales propuestos son:

- `pending`.
- `confirmed`.
- `completed`.
- `cancelled`.

Las etiquetas deben ser comprensibles para el usuario.

No enviar etiquetas traducidas como valores de API.

### 7.4. Combinación de filtros

Los filtros deben poder combinarse.

Por ejemplo:

- Un trabajador específico.
- Un paciente específico.
- Citas pendientes.

La combinación debe generar una consulta con los parámetros correspondientes.

Debe existir una acción para limpiar los filtros.

Al modificar un filtro, actualizar el calendario sin perder el periodo visible.

## 8. Modal de creación de citas

La creación debe realizarse mediante un modal o diálogo dentro de la página de agenda.

No crear una página independiente de creación.

El modal debe incluir:

### 8.1. Paciente

Selector de pacientes.

Debe permitir seleccionar un paciente existente.

Se deben mostrar datos suficientes para distinguirlo, por ejemplo:

- Nombre completo.
- Número de documento, cuando esté disponible.
- Número de paciente, cuando esté disponible.

No crear pacientes desde este modal.

La persona debe estar activa y el paciente debe cumplir las condiciones definidas por el backend.

### 8.2. Miembro del personal

Selector de trabajadores.

Debe permitir seleccionar el trabajador que atenderá la cita.

Mostrar información suficiente para identificarlo.

No crear trabajadores desde este modal.

La persona relacionada debe estar activa y el estado laboral debe ser `active`, según las reglas del backend.

### 8.3. Fecha y hora

Permitir seleccionar:

- Fecha.
- Hora de inicio.
- Hora de finalización.

El intervalo debe tener una duración positiva.

La fecha y hora deben interpretarse utilizando la zona horaria de la aplicación (`APP_TIMEZONE`, por defecto `America/Lima`).

Al enviar la información, los valores deben incluir una zona horaria válida.

No enviar valores `datetime-local` directamente sin convertirlos a instantes con zona horaria.

### 8.4. Motivo

Campo opcional:

`reason`

Permitir introducir una descripción breve del motivo de la cita.

Respetar las restricciones del contrato del backend.

### 8.5. Validación de disponibilidad

Antes de confirmar la creación, el frontend puede realizar validaciones preventivas cuando disponga de información suficiente.

Sin embargo, la disponibilidad definitiva debe ser validada por el backend.

La interfaz debe permitir que el backend determine si:

- El trabajador está activo.
- La persona relacionada está activa.
- El intervalo se encuentra dentro de su disponibilidad efectiva.
- Existen excepciones que bloquean el intervalo.
- Existen citas que producen solapamiento.

No calcular disponibilidad efectiva por cuenta propia.

No asumir que una hora está disponible únicamente porque no aparece una cita en el calendario.

### 8.6. Creación

Al confirmar:

1. Validar los campos obligatorios.
2. Validar que el final sea posterior al inicio.
3. Preparar los valores con zona horaria.
4. Ejecutar `POST /api/v1/appointments`.
5. Esperar la respuesta del backend.
6. Cerrar el modal cuando la operación haya sido confirmada.
7. Actualizar el calendario.
8. Mostrar una notificación de éxito.

Si el backend rechaza la operación:

- Mantener el modal abierto.
- Mostrar el error correspondiente.
- Conservar los datos introducidos.
- Permitir corregir los campos y volver a intentar.

## 9. Modal de detalle de la cita

Al seleccionar una cita del calendario, abrir un modal de detalle.

Debe mostrar, cuando la respuesta lo permita:

- Identificador.
- Paciente.
- Miembro del personal.
- Fecha.
- Hora de inicio.
- Hora de finalización.
- Estado.
- Motivo.
- Fecha de creación.
- Fecha de actualización.

El modal debe ofrecer las acciones permitidas:

- Editar.
- Confirmar, si está pendiente.
- Completar, si está confirmada.
- Cancelar, si la transición está permitida.

No mostrar acciones que no correspondan al estado actual.

No permitir eliminación física de citas.

## 10. Modal de edición y reprogramación

La edición debe realizarse mediante un modal.

Debe permitir modificar los campos admitidos por el backend:

- Fecha y hora de inicio.
- Fecha y hora de finalización.
- Miembro del personal.
- Motivo.

El paciente no debe poder modificarse mediante PATCH si el contrato no lo permite.

### 10.1. Reprogramación

La reprogramación comprende modificar el intervalo temporal o el trabajador asignado.

Cuando el usuario cambie estos valores:

- Validar los datos introducidos.
- Enviar la modificación mediante PATCH.
- Esperar la validación definitiva del backend.
- Excluir la cita actual de su propia comprobación de solapamiento, responsabilidad del backend.
- Actualizar el calendario únicamente cuando el cambio haya sido confirmado.

La operación debe ser atómica en el backend.

Si la reprogramación falla:

- Mantener abierta la interfaz de edición.
- Conservar los datos introducidos.
- Mostrar el motivo del rechazo.
- Mantener en el calendario la cita con los datos confirmados anteriormente.

No implementar una secuencia de cancelación y creación de otra cita para simular una reprogramación.

## 11. Gestión de estados

Los estados iniciales propuestos son:

- `pending`: pendiente.
- `confirmed`: confirmada.
- `completed`: completada.
- `cancelled`: cancelada.

La interfaz debe respetar la matriz de transiciones definida por el backend.

### 11.1. Transiciones permitidas

| Estado actual | Estados permitidos |
|---|---|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `completed`, `cancelled` |
| `completed` | Ninguno |
| `cancelled` | Ninguno |

No permitir transiciones fuera de esta matriz.

### 11.2. Acciones por estado

Para una cita pendiente:

- Confirmar.
- Cancelar.

Para una cita confirmada:

- Marcar como completada.
- Cancelar.

Para una cita completada:

- No ofrecer transiciones ordinarias.

Para una cita cancelada:

- No permitir reactivación ordinaria.
- Para volver a agendar, crear una cita nueva.

### 11.3. Confirmación de acciones

Las acciones de cancelar y completar deben utilizar los mecanismos de confirmación existentes cuando corresponda.

Después de una transición exitosa:

- Actualizar el estado de la cita.
- Actualizar su representación en el calendario.
- Mostrar una notificación.
- Mantener los filtros y el periodo actual.

No actualizar el estado visual antes de recibir la confirmación del backend.

## 12. Disponibilidad y relación con horarios

El frontend debe respetar el servicio unificado de disponibilidad definido por el backend.

No debe implementar un algoritmo propio ni duplicar reglas de los módulos de horarios.

Según el contrato proporcionado, la disponibilidad efectiva del trabajador se determina considerando:

- Horarios semanales activos y vigentes del trabajador.
- Overrides activos del trabajador.
- Excepciones del trabajador.
- Excepciones con prioridad sobre overrides.

La clínica no interviene en esta validación porque el modelo de datos de citas no tiene relación con `clinic` ni con `staff_member`.

Por lo tanto:

- No solicitar una clínica para crear una cita.
- No incluir `clinic_id` en el contrato de citas.
- No exigir una intersección con horarios de clínicas.
- No asumir que el trabajador tiene una clínica asignada para validar la cita.

La interfaz debe enviar el intervalo solicitado y mostrar los resultados de validación del backend.

## 13. Solapamientos y citas que bloquean agenda

El backend define inicialmente:

- `pending` bloquea agenda.
- `confirmed` bloquea agenda.
- `cancelled` no bloquea nuevas citas futuras.
- `completed` no bloquea nuevas citas futuras.

La regla definitiva sobre `pending` debe confirmarse antes de implementar.

El frontend puede representar las citas según su estado, pero no debe utilizar una consulta del calendario como mecanismo definitivo para garantizar que no existen solapamientos.

El backend debe realizar la validación definitiva y proteger la operación ante reservas concurrentes.

Si una operación es rechazada por solapamiento:

- Mostrar un mensaje comprensible.
- Mantener los datos introducidos.
- Permitir seleccionar otro intervalo o trabajador.
- No registrar la cita como exitosa.

## 14. Zona horaria

La aplicación utiliza `APP_TIMEZONE`, cuyo valor por defecto es:

`America/Lima`

Los horarios semanales del trabajador deben interpretarse con esa zona horaria.

Los valores `starts_at` y `ends_at` deben enviarse con información de zona horaria y representar instantes consistentes.

La interfaz debe:

- Mostrar fechas y horas según la zona horaria de la aplicación.
- Convertir correctamente los valores recibidos desde la API.
- Enviar instantes con desplazamiento horario.
- Evitar interpretar los valores UTC como si fueran horas locales.
- Evitar conversiones dobles.

No modificar la zona horaria de la aplicación desde este módulo.

## 15. Consultas desde pacientes y personal

Las citas deben poder consultarse también desde los módulos relacionados.

### 15.1. Desde el detalle de un paciente

Incorporar una sección de citas en el detalle del paciente cuando corresponda a la estructura existente.

Utilizar:

`GET /api/v1/patients/{patient_id}/appointments`

Mostrar las citas relacionadas con el paciente.

No crear una página independiente para administrar citas del paciente.

La gestión principal continúa realizándose desde el calendario general.

### 15.2. Desde el detalle de un trabajador

Incorporar una sección de citas en el detalle del trabajador cuando corresponda a la estructura existente.

Utilizar:

`GET /api/v1/staff-members/{staff_member_id}/appointments`

Mostrar las citas relacionadas con el trabajador.

No crear una página independiente para administrar las citas del trabajador.

La gestión principal continúa realizándose desde el calendario general.

## 16. Estados de interfaz

Contemplar como mínimo:

- Cargando calendario.
- Calendario sin citas.
- Cargando filtros.
- Cargando pacientes.
- Cargando personal.
- Abriendo modal de creación.
- Creando cita.
- Consultando detalle.
- Editando cita.
- Reprogramando cita.
- Confirmando cita.
- Cancelando cita.
- Completando cita.
- Operación completada.
- Error de consulta.
- Error de creación.
- Error de actualización.
- Error de disponibilidad.
- Error de solapamiento.
- Error de paciente inexistente o inactivo.
- Error de trabajador inexistente o inactivo.
- Error de intervalo temporal.
- Error de transición de estado.

Los errores deben mostrarse de forma comprensible y asociarse al campo correspondiente cuando sea posible.

Si el backend rechaza una operación, conservar los datos introducidos y permitir corregirlos.

## 17. Navegación y rutas

La funcionalidad debe tener una opción independiente en el sidebar, dentro del grupo de gestión de citas.

Archivo:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

Opción recomendada:

- Gestión de citas.
  - Agenda.

No crear opciones independientes en el sidebar para crear, editar o consultar citas.

### 17.1. Rutas

Registrar en `frontend/src/App.tsx`:

- Agenda: `/appointments`

La creación, consulta y edición deben gestionarse mediante modales desde esta página.

No crear rutas independientes para:

- `/appointments/create`
- `/appointments/:appointmentId`
- `/appointments/:appointmentId/edit`

Salvo que una necesidad real de navegación profunda o un requisito posterior justifique su incorporación.

La implementación debe respetar la SPEC 00 y el sistema de rutas existente.

## 18. Reutilización de componentes

Antes de desarrollar el calendario, inspeccionar:

- Componentes de calendario existentes.
- Bibliotecas instaladas en `package.json`.
- Componentes de fecha y hora.
- Componentes de formularios.
- Modales y diálogos.
- Selectores de pacientes.
- Selectores de personal.
- Tablas y listados.
- Notificaciones.
- Estados de carga y error.

Reutilizar los componentes existentes cuando sea apropiado.

Si no existe un calendario adecuado, evaluar una biblioteca compatible con React y la arquitectura actual antes de incorporarla.

No instalar dependencias innecesarias ni desarrollar un calendario complejo desde cero si ya existe una solución apropiada.

## 19. Pruebas

Verificar como mínimo:

### 19.1. Calendario

- Mostrar las citas del periodo consultado.
- Cambiar entre vistas diaria, semanal y mensual.
- Navegar entre periodos.
- Volver a la fecha actual.
- Consultar citas de fechas diferentes.
- Representar correctamente inicio y finalización.
- Distinguir los estados visualmente.
- Mantener los filtros al navegar.
- Actualizar el calendario después de operaciones exitosas.

### 19.2. Filtros

- Filtrar por paciente.
- Filtrar por trabajador.
- Filtrar por estado.
- Combinar varios filtros.
- Limpiar filtros.
- Consultar correctamente el rango temporal visible.
- Manejar errores y resultados vacíos.

### 19.3. Creación

- Crear una cita válida.
- Seleccionar un paciente existente.
- Seleccionar un trabajador existente.
- Registrar fecha y hora.
- Registrar motivo opcional.
- Enviar fechas con zona horaria.
- Rechazar intervalos no positivos.
- Mostrar errores de disponibilidad.
- Mostrar errores de solapamiento.
- Confirmar que una creación exitosa aparece en el calendario.

### 19.4. Edición y reprogramación

- Consultar el detalle de una cita.
- Modificar el intervalo.
- Cambiar el trabajador.
- Modificar el motivo.
- Revalidar disponibilidad.
- Rechazar solapamientos.
- Mantener los datos anteriores si falla la operación.
- Actualizar el evento cuando la operación tenga éxito.

### 19.5. Estados

- Confirmar una cita pendiente.
- Cancelar una cita pendiente.
- Completar una cita confirmada.
- Cancelar una cita confirmada.
- Rechazar transiciones no permitidas.
- No permitir reactivar citas canceladas mediante transiciones ordinarias.
- Conservar las citas canceladas.

### 19.6. Integración

- Verificar los endpoints y cuerpos de solicitud.
- Confirmar que no se envían campos no permitidos.
- Confirmar que no se solicita una clínica para crear citas.
- Confirmar que el frontend no calcula disponibilidad efectiva.
- Confirmar que los errores del backend se muestran correctamente.
- Confirmar que las operaciones de reprogramación no duplican ni cancelan citas accidentalmente.

## 20. Exclusiones

Esta especificación no debe implementar:

- Registro de pacientes.
- Registro de trabajadores.
- Administración de horarios semanales.
- Administración de excepciones.
- Administración de overrides.
- Procedimientos odontológicos.
- Historia clínica.
- Facturación.
- Pagos.
- Control de asistencia.
- Eliminación física de citas.
- Cálculo propio de disponibilidad.
- Asignación de citas a clínicas.
- Transiciones de estado no definidas por el backend.
- Formularios independientes de creación y edición de citas.

## 21. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar:

- Organización del módulo `appointments`.
- Página principal de agenda.
- Componente de calendario utilizado.
- Vistas y navegación temporal.
- Filtros.
- Modales de creación, detalle y edición.
- Integración con pacientes y personal.
- Endpoints utilizados.
- Gestión de estados.
- Reprogramación.
- Tratamiento de fechas y zonas horarias.
- Integración con el servicio de disponibilidad.

## 22. Criterios de aceptación

La implementación se considera completa cuando:

1. Existe una página principal de agenda en `/appointments`.
2. El calendario es el elemento central de la página.
3. Se pueden consultar las citas en vistas diaria, semanal y mensual.
4. Se puede navegar entre fechas y periodos.
5. Se pueden filtrar las citas por paciente, trabajador y estado.
6. Las citas se representan visualmente según sus intervalos.
7. Los estados se distinguen de forma comprensible.
8. Se puede crear una cita mediante un modal.
9. Se puede consultar el detalle mediante un modal.
10. Se puede editar y reprogramar mediante un modal.
11. Se pueden confirmar, completar y cancelar citas según las transiciones permitidas.
12. El calendario se actualiza después de operaciones exitosas.
13. Se respetan las validaciones de disponibilidad del backend.
14. Se respetan las restricciones de solapamiento.
15. Se manejan correctamente las fechas y zonas horarias.
16. Las citas pueden consultarse desde los módulos de pacientes y personal.
17. No se exige seleccionar una clínica para crear una cita.
18. No se implementa un algoritmo propio de disponibilidad.
19. No se crean páginas independientes para crear, editar o consultar citas.
20. La navegación respeta la SPEC 00 y la arquitectura existente.