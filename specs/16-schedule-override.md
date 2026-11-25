# SPEC 16 — Gestión de modificaciones puntuales de horarios (Frontend)

## 1. Prioridad y dependencias

Esta especificación define la implementación frontend del módulo de modificaciones puntuales de horarios de clínicas y miembros del personal.

Depende de:

- SPEC 05 — Módulo de clínicas.
- SPEC 08 — Módulo de personal.
- SPEC 13 — Gestión de horarios de clínicas.
- SPEC 14 — Gestión de horarios del personal.
- SPEC 15 — Gestión de excepciones de horarios.

Skills aplicables:

- `$frontend-arquitectura`: organización del módulo, navegación y rutas.
- `$frontend-integracion-api`: comunicación con los endpoints de overrides.
- `$frontend-catalogo-componentes`: reutilización de componentes existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

La implementación debe respetar la arquitectura existente del frontend y las responsabilidades de cada módulo.

## 2. Objetivo

Permitir registrar y administrar modificaciones puntuales de disponibilidad para una clínica o un miembro del personal.

Un override representa un intervalo extraordinario con fecha y hora concretas que permite habilitar disponibilidad fuera del patrón semanal habitual, siempre sujeto a las restricciones de la clínica y a las reglas de disponibilidad.

La funcionalidad debe permitir:

- Registrar un override para una clínica.
- Registrar un override para un miembro del personal.
- Consultar los overrides registrados.
- Filtrar por clínica, trabajador, estado y rango temporal.
- Consultar el detalle de un override.
- Modificar un override existente.
- Activar o desactivar un override.
- Identificar claramente el objetivo, motivo y periodo extraordinario.

**Los overrides no modifican ni reescriben los horarios semanales.**

La gestión debe realizarse desde un módulo independiente, sin incorporar los formularios de overrides dentro de los formularios de clínicas o personal.

## 3. Alcance

Esta especificación comprende:

- Módulo independiente `schedule_overrides`.
- Listado de overrides.
- Formulario de creación.
- Consulta de detalle.
- Formulario de edición.
- Selección del objetivo del override.
- Configuración del intervalo extraordinario.
- Registro del motivo.
- Activación y desactivación.
- Filtros de consulta.
- Validaciones preventivas.
- Manejo de errores y operaciones.
- Integración conceptual con horarios, excepciones y disponibilidad.

No comprende:

- Administración de horarios semanales de clínicas.
- Administración de horarios semanales del personal.
- Gestión de excepciones de horarios.
- Creación o modificación de citas.
- Cálculo independiente de disponibilidad efectiva.
- Modificación automática de patrones semanales.
- Gestión de ausencias, cierres o mantenimientos mediante overrides.
- Implementación de un servicio de disponibilidad duplicado.
- Gestión de asistencia o licencias.

## 4. Organización del módulo

La funcionalidad debe implementarse dentro de:

`frontend/src/modules/schedule_overrides/`

El módulo será responsable de administrar las modificaciones puntuales de horarios, independientemente de que afecten a una clínica o a un trabajador.

Se pueden incorporar componentes internos como:

- `ScheduleOverrideList`: listado de overrides.
- `ScheduleOverrideForm`: formulario de creación y edición.
- `ScheduleOverrideFilters`: filtros del listado.
- `ScheduleOverrideDetail`: información de un override.
- `ScheduleOverrideTargetSelector`: selección de clínica o trabajador.
- `ScheduleOverrideDateTimeFields`: campos de fecha y hora.
- `ScheduleOverrideStatusAction`: acción para activar o desactivar.

Los nombres son orientativos. Antes de crear componentes nuevos se debe inspeccionar la estructura existente.

Los componentes exclusivos de esta funcionalidad deben permanecer dentro del módulo `schedule_overrides`.

No reorganizar los módulos existentes ni crear un módulo genérico de horarios.

## 5. Integración con la API

Prefijo:

`/api/v1`

Los endpoints definidos por el backend son:

### 5.1. Crear un override

Endpoint:

`POST /api/v1/schedule-overrides`

Permite registrar una modificación puntual de horario para una clínica o un miembro del personal.

El frontend debe enviar exactamente uno de los dos identificadores:

- `clinic_id`.
- `staff_member_id`.

El identificador que no corresponda debe enviarse como `null`.

Contrato de creación:

```json
{
  "clinic_id": 1,
  "staff_member_id": null,
  "starts_at": "2026-11-07T09:00:00-05:00",
  "ends_at": "2026-11-07T13:00:00-05:00",
  "reason": "Apertura extraordinaria",
  "is_active": true
}
```

Para un override de personal, se debe utilizar `clinic_id: null` y enviar el `staff_member_id` correspondiente.

El frontend debe respetar el contrato de creación y no enviar campos adicionales no definidos.

### 5.2. Consultar overrides

Endpoint:

`GET /api/v1/schedule-overrides`

Debe utilizarse para recuperar los overrides registrados.

El listado debe permitir filtrar por:

- Clínica.
- Miembro del personal.
- Estado activo.
- Rango temporal.

Los filtros deben utilizar exclusivamente los parámetros admitidos por el backend.

No inventar nombres de parámetros, operadores de rango, paginación ni ordenamiento.

### 5.3. Consultar un override específico

Endpoint:

`GET /api/v1/schedule-overrides/{override_id}`

Debe utilizarse para recuperar el detalle de un override.

La interfaz debe mostrar la información disponible del registro sin permitir modificar identificadores ni campos de auditoría.

### 5.4. Actualizar un override

Endpoint:

`PATCH /api/v1/schedule-overrides/{override_id}`

Debe utilizarse para modificar un override existente.

La interfaz debe respetar los campos admitidos por el contrato PATCH.

Si el backend permite modificar el objetivo o el intervalo, deben volver a validarse todas las reglas correspondientes.

No asumir que todos los campos de creación pueden modificarse. Confirmar el contrato real de actualización antes de implementar el formulario.

### 5.5. Activar o desactivar un override

Endpoint:

`PATCH /api/v1/schedule-overrides/{override_id}/status`

Debe utilizarse para modificar el estado del override.

La interfaz debe ofrecer acciones para:

- Activar un override inactivo.
- Desactivar un override activo.

Los overrides inactivos deben conservarse y permanecer consultables.

Un override inactivo no debe participar en la disponibilidad.

No utilizar el endpoint PATCH general para modificar el estado si el backend dispone de un endpoint específico.

No asumir que existe un endpoint DELETE, ya que no está definido.

## 6. Formulario de creación de overrides

La creación debe realizarse desde una página independiente del módulo `schedule_overrides`.

El formulario debe permitir registrar un intervalo extraordinario para una clínica o un miembro del personal.

### 6.1. Selección del objetivo

El usuario debe seleccionar primero el tipo de objetivo:

- Clínica.
- Miembro del personal.

La selección debe ser excluyente.

Cuando el usuario seleccione una clínica:

- Mostrar un selector de clínicas.
- Permitir seleccionar la clínica.
- Enviar su `clinic_id`.
- Enviar `staff_member_id: null`.

Cuando seleccione un miembro del personal:

- Mostrar un selector de trabajadores.
- Permitir seleccionar el trabajador.
- Enviar su `staff_member_id`.
- Enviar `clinic_id: null`.

Los selectores deben reutilizar los servicios y componentes existentes de los módulos de clínicas y personal.

No duplicar la lógica de consulta de clínicas o trabajadores.

### 6.2. Periodo extraordinario

El formulario debe permitir establecer:

- Fecha y hora de inicio: `starts_at`.
- Fecha y hora de finalización: `ends_at`.

Ambos campos son obligatorios.

Los valores deben representar instantes válidos con información de zona horaria.

La interfaz debe permitir seleccionar intervalos puntuales con fecha y hora concretas.

No utilizar días de la semana ni fechas de vigencia recurrentes, ya que esos campos pertenecen a los horarios semanales de las SPEC 13 y 14.

### 6.3. Motivo

El formulario debe permitir registrar un motivo opcional:

`reason`

Ejemplos:

- Apertura extraordinaria.
- Atención especial.
- Jornada extendida.
- Disponibilidad extraordinaria.

El motivo debe ser descriptivo.

No utilizar el override para registrar ausencias, cierres o mantenimientos. Estos casos corresponden a la SPEC 15.

### 6.4. Estado inicial

El contrato de creación incluye:

`is_active`

El formulario debe respetar el valor inicial definido por el backend.

Si el contrato permite que el cliente envíe el estado, la interfaz puede ofrecer una opción para registrar el override activo o inactivo, siempre que esa posibilidad sea confirmada en el contrato definitivo.

No asumir valores distintos del comportamiento establecido por el backend.

### 6.5. Secuencia de creación

La creación de un override es una operación independiente.

El frontend debe:

1. Permitir seleccionar el objetivo.
2. Consultar clínicas o trabajadores para los selectores.
3. Solicitar fecha y hora de inicio.
4. Solicitar fecha y hora de finalización.
5. Registrar opcionalmente el motivo.
6. Establecer el estado inicial conforme al contrato.
7. Validar los datos.
8. Ejecutar `POST /api/v1/schedule-overrides`.
9. Mostrar el resultado de la operación.

No ejecutar solicitudes de creación o modificación de horarios semanales.

No modificar los registros de `clinic_schedule`, `staff_schedule` ni `schedule_exception`.

## 7. Listado de overrides

Crear una pantalla de listado dentro del módulo `schedule_overrides`.

Debe permitir consultar los overrides registrados y distinguir si afectan a una clínica o a un trabajador.

Como mínimo, mostrar los campos disponibles:

- Identificador.
- Tipo de objetivo.
- Nombre de la clínica o trabajador, cuando la respuesta o los datos relacionados permitan identificarlo.
- Fecha y hora de inicio.
- Fecha y hora de finalización.
- Motivo.
- Estado activo o inactivo.
- Fecha de creación, cuando esté disponible en la respuesta.

No asumir que el backend devuelve los nombres de clínicas o trabajadores si no están incluidos en el contrato.

Si la API devuelve únicamente identificadores, reutilizar los servicios de los módulos correspondientes cuando sea necesario.

### 7.1. Filtros

El listado debe permitir filtrar por:

- Clínica.
- Miembro del personal.
- Estado.
- Rango temporal.

Los filtros deben utilizar los parámetros realmente admitidos por el backend.

El usuario debe poder limpiar los filtros y volver a consultar el listado.

No implementar filtros que requieran parámetros inexistentes.

### 7.2. Acciones del listado

Cada registro debe permitir:

- Consultar detalle.
- Editar.
- Activar o desactivar.

La acción de estado debe utilizar el endpoint específico.

No implementar eliminación física porque no está definida en el contrato.

## 8. Formulario de edición

La edición debe permitir modificar un override existente.

Al abrir el formulario:

1. Ejecutar `GET /api/v1/schedule-overrides/{override_id}`.
2. Cargar la información del override.
3. Identificar el objetivo.
4. Mostrar el periodo extraordinario.
5. Mostrar el motivo.
6. Mostrar el estado actual.
7. Permitir modificar los campos admitidos por PATCH.

### 8.1. Modificación del objetivo

Si el backend permite modificar `clinic_id` o `staff_member_id`, el frontend debe permitir cambiar el objetivo mediante el mismo selector excluyente del formulario de creación.

Debe conservarse la regla de exactamente un objetivo informado.

El cambio debe validarse nuevamente.

No asumir que el objetivo puede modificarse después de crear el override. Confirmar el contrato PATCH.

### 8.2. Modificación del intervalo

Si el backend permite modificar `starts_at` y `ends_at`, el formulario debe permitir editar ambos valores.

Al guardar:

- Enviar valores con zona horaria.
- Validar que el final sea posterior al inicio.
- Considerar las reglas de solapamiento.
- No modificar horarios recurrentes.
- No ampliar el horario efectivo de la clínica mediante un override de personal.

### 8.3. Modificación del motivo

Si el contrato PATCH lo permite, el usuario debe poder modificar `reason`.

El campo debe conservar su carácter opcional.

### 8.4. Guardado

Al guardar los cambios, ejecutar:

`PATCH /api/v1/schedule-overrides/{override_id}`

La interfaz debe enviar únicamente los campos modificados y admitidos por el contrato.

Si el backend rechaza la operación:

- Mostrar el error correspondiente.
- Conservar los valores introducidos.
- No actualizar visualmente el override como si el cambio hubiera sido exitoso.

## 9. Detalle del override

La vista de detalle debe mostrar:

- Identificador.
- Tipo de objetivo.
- Clínica o trabajador afectado.
- Fecha y hora de inicio.
- Fecha y hora de finalización.
- Motivo.
- Estado activo o inactivo.
- Fecha de creación y actualización, si están disponibles.

Debe quedar claro que se trata de una modificación puntual y no de un horario semanal recurrente.

Los overrides inactivos deben distinguirse visualmente de los activos.

La administración debe realizarse desde el formulario de edición o mediante la acción de estado correspondiente.

## 10. Activación y desactivación

El usuario debe poder cambiar el estado de un override desde el listado, detalle o formulario de edición, según los patrones existentes.

Utilizar:

`PATCH /api/v1/schedule-overrides/{override_id}/status`

Reglas de interfaz:

- Un override activo debe identificarse como participante potencial de la disponibilidad.
- Un override inactivo debe identificarse como no participante.
- La desactivación no debe eliminar el registro.
- La activación debe solicitar confirmación cuando corresponda al patrón de interfaz existente.
- La interfaz debe actualizar el estado únicamente después de confirmar el resultado de la API.

Si el backend rechaza una activación por restricciones de disponibilidad o solapamiento, mostrar el error sin alterar el estado visual confirmado.

## 11. Validaciones

El frontend debe implementar validaciones preventivas de acuerdo con las reglas del backend.

### 11.1. Objetivo

Debe existir exactamente uno de los siguientes identificadores:

- `clinic_id`.
- `staff_member_id`.

Reglas:

- No permitir ambos identificadores nulos.
- No permitir ambos identificadores informados.
- El objetivo seleccionado debe existir.
- El identificador debe corresponder al tipo seleccionado.

### 11.2. Fecha y hora

- `starts_at` es obligatorio.
- `ends_at` es obligatorio.
- Ambos valores deben incluir información de zona horaria al enviarse.
- `ends_at` debe ser posterior a `starts_at`.
- No permitir intervalos de duración cero.
- No permitir intervalos invertidos.

### 11.3. Estado

`is_active` debe ser booleano.

Los overrides inactivos no deben considerarse para disponibilidad.

### 11.4. Solapamientos

El backend recomienda rechazar overrides activos solapados para el mismo objetivo cuando sean ambiguos.

El frontend debe realizar validaciones preventivas cuando disponga de información suficiente.

Se deben considerar:

- El tipo de objetivo.
- El identificador del objetivo.
- El estado activo.
- La fecha y hora de inicio.
- La fecha y hora de finalización.

No limitar la comparación a coincidencias exactas.

Un intervalo puede solaparse parcialmente con otro.

El frontend debe mostrar los errores de solapamiento devueltos por el backend.

La regla definitiva de rechazo debe quedar establecida en el contrato del backend. No implementar reglas diferentes por cuenta propia.

### 11.5. Restricciones de clínica y personal

Un override de clínica puede agregar un intervalo extraordinario de apertura.

Un override de personal únicamente puede añadir disponibilidad dentro del horario efectivo de la clínica.

El frontend no debe asumir que un trabajador puede atender fuera del horario efectivo de apertura.

La validación definitiva corresponde al backend y al servicio compartido de disponibilidad.

## 12. Relación con horarios recurrentes

Los overrides se relacionan con:

- SPEC 13 — Horarios de clínicas.
- SPEC 14 — Horarios del personal.

Sin embargo, no modifican los patrones semanales.

Reglas:

1. No modificar registros de `clinic_schedule`.
2. No modificar registros de `staff_schedule`.
3. No convertir overrides en horarios recurrentes.
4. No copiar horarios de clínicas a trabajadores.
5. No generar automáticamente overrides a partir de horarios semanales.
6. Permitir consultar y administrar los overrides desde su módulo independiente.

Un override de clínica puede habilitar un intervalo extraordinario de apertura fuera del horario semanal.

Un override de personal puede agregar disponibilidad del trabajador, pero siempre dentro de la apertura efectiva de la clínica.

## 13. Relación con las excepciones de horarios

Los overrides se relacionan directamente con la SPEC 15.

Las excepciones y los overrides tienen propósitos distintos:

- `schedule_override`: habilita un intervalo extraordinario de disponibilidad.
- `schedule_exception`: bloquea disponibilidad durante un intervalo extraordinario.

Las excepciones tienen prioridad sobre los overrides.

Por lo tanto:

- Un override de clínica no puede anular una excepción de clínica.
- Un override de personal no puede anular una excepción del trabajador.
- Una excepción de clínica debe bloquear a los trabajadores de esa clínica durante el intervalo.
- Un override de personal no puede superar un bloqueo de la clínica.

La interfaz debe reflejar esta diferencia conceptual y no permitir registrar ausencias, cierres o mantenimientos como overrides.

## 14. Relación con el cálculo de disponibilidad

El cálculo de disponibilidad debe implementarse en un único servicio compartido del backend.

El frontend no debe duplicar este algoritmo.

La precedencia obligatoria es:

1. Obtener los horarios semanales activos y vigentes de la clínica.
2. Aplicar los overrides activos de clínica como intervalos extraordinarios de apertura.
3. Intersectar la apertura resultante con los horarios semanales activos y vigentes del trabajador.
4. Aplicar los overrides activos del trabajador, siempre limitados por la apertura efectiva de la clínica.
5. Restar las excepciones de clínica y trabajador.
6. Restar las citas existentes y cualquier otro bloqueo definido por el módulo de citas.
7. Verificar que la duración completa de una cita quepa dentro de un intervalo disponible.

La interfaz debe consumir los resultados de disponibilidad proporcionados por el backend cuando exista el endpoint correspondiente.

No implementar este cálculo dentro del módulo `schedule_overrides`.

No interpretar la existencia de un override como garantía de que se pueda crear una cita en todo el intervalo.

## 15. Estados de interfaz

Contemplar como mínimo:

- Cargando listado.
- Listado vacío.
- Consultando overrides.
- Cargando clínicas.
- Cargando personal.
- Creando override.
- Consultando detalle.
- Actualizando override.
- Activando override.
- Desactivando override.
- Operación completada.
- Error de consulta.
- Error de creación.
- Error de actualización.
- Error de estado.
- Error de objetivo inexistente.
- Error de intervalo inválido.
- Error de zona horaria.
- Error de solapamiento.
- Error por restricción de disponibilidad de clínica.

Los errores deben mostrarse de forma comprensible y asociarse al campo correspondiente cuando sea posible.

Si el backend rechaza una operación, conservar los datos introducidos y permitir corregirlos.

## 16. Navegación y rutas

La funcionalidad debe tener una opción independiente en el sidebar.

Se recomienda ubicarla dentro del grupo funcional de gestión de citas o agenda, junto con las excepciones de horarios de la SPEC 15.

Ejemplo conceptual:

- Gestión de citas
  - Calendario.
  - Citas.
  - Excepciones de horarios.
  - Modificaciones puntuales de horarios.

La ubicación definitiva debe respetar la estructura real del sidebar y la SPEC 00.

Archivo del sidebar:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

La opción debe utilizar los iconos existentes y las claves de traducción correspondientes.

### 16.1. Rutas

Registrar las siguientes rutas en:

`frontend/src/App.tsx`

- Listado: `/schedule-overrides`
- Creación: `/schedule-overrides/create`
- Detalle: `/schedule-overrides/:overrideId`
- Edición: `/schedule-overrides/:overrideId/edit`

Las rutas de detalle y edición no necesitan aparecer como opciones independientes en el sidebar.

La implementación debe utilizar el sistema de rutas y layouts existentes.

## 17. Reutilización de componentes

Antes de crear componentes nuevos, inspeccionar los recursos disponibles.

Reutilizar cuando corresponda:

- Selectores de clínicas.
- Selectores de personal.
- Campos de fecha.
- Campos de hora.
- Campos de fecha y hora.
- Formularios.
- Tablas y listados.
- Filtros.
- Diálogos de confirmación.
- Alertas y notificaciones.
- Estados de carga y error.
- Componentes de horarios existentes.
- Componentes de excepciones de la SPEC 15.

Los componentes específicos de overrides deben permanecer dentro de `frontend/src/modules/schedule_overrides/`.

No duplicar servicios ni componentes que ya existan y sean reutilizables.

## 18. Pruebas

Verificar como mínimo:

### 18.1. Creación

- Registrar un override de clínica.
- Registrar un override de personal.
- Enviar `staff_member_id: null` para un override de clínica.
- Enviar `clinic_id: null` para un override de personal.
- Registrar intervalos con fecha y hora concretas.
- Enviar valores con zona horaria.
- Registrar un motivo opcional.
- Registrar el estado conforme al contrato.
- Confirmar que el override se crea correctamente.

### 18.2. Validaciones

- Rechazar ambos objetivos nulos.
- Rechazar ambos objetivos informados.
- Rechazar una clínica inexistente.
- Rechazar un trabajador inexistente.
- Rechazar fechas sin zona horaria al preparar el envío.
- Rechazar intervalos con inicio igual o posterior al final.
- Rechazar valores no válidos de estado.
- Detectar solapamientos cuando sea posible.
- Mostrar los errores definitivos del backend.

### 18.3. Listado y filtros

- Consultar overrides.
- Filtrar por clínica.
- Filtrar por trabajador.
- Filtrar por estado.
- Filtrar por rango temporal.
- Limpiar filtros.
- Mostrar correctamente el objetivo afectado.
- Distinguir overrides activos e inactivos.
- Manejar listados vacíos y errores de consulta.

### 18.4. Edición y estado

- Consultar el detalle de un override.
- Modificar los campos permitidos.
- Modificar el objetivo cuando el backend lo permita.
- Modificar el intervalo cuando el backend lo permita.
- Modificar el motivo cuando esté permitido.
- Activar un override.
- Desactivar un override.
- Conservar registros inactivos.
- Mostrar errores del backend.
- Conservar los datos introducidos cuando falle una operación.

### 18.5. Efecto sobre disponibilidad

- Comprobar que un override de clínica añade disponibilidad fuera del horario semanal.
- Comprobar que un override de personal no excede la apertura efectiva de la clínica.
- Comprobar que un override inactivo no afecta la disponibilidad.
- Comprobar que una excepción bloquea incluso cuando existe un override.
- Comprobar que las excepciones tienen prioridad sobre los overrides.
- Comprobar que los overrides no anulan citas existentes.
- Comprobar que los intervalos solapados se rechazan o resuelven conforme a la regla aprobada.
- Confirmar que los overrides no modifican los horarios recurrentes.
- Confirmar que la interfaz no calcula disponibilidad efectiva por su cuenta.

## 19. Exclusiones

Esta especificación no debe implementar:

- Formularios de overrides dentro del módulo de clínicas.
- Formularios de overrides dentro del módulo de personal.
- Modificación de horarios semanales.
- Gestión de excepciones de horarios.
- Gestión de citas.
- Cálculo propio de disponibilidad efectiva.
- Modificación automática de patrones recurrentes.
- Ausencias, cierres o mantenimientos mediante overrides.
- Eliminación física de overrides mediante un endpoint no definido.
- Un servicio de disponibilidad duplicado en el frontend.
- Reglas de precedencia diferentes a las establecidas por el backend.

## 20. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar:

- Organización del módulo `schedule_overrides`.
- Endpoints utilizados.
- Selección excluyente del objetivo.
- Manejo de fechas y zonas horarias.
- Filtros disponibles.
- Activación y desactivación.
- Validaciones de intervalos.
- Reglas de solapamiento.
- Relación con horarios recurrentes.
- Relación con excepciones.
- Precedencia conceptual dentro de la disponibilidad.

## 21. Criterios de aceptación

La implementación se considera completa cuando:

1. Existe un módulo independiente `schedule_overrides`.
2. El usuario puede consultar un listado de overrides.
3. El usuario puede filtrar por clínica, trabajador, estado y rango temporal, según los parámetros admitidos por el backend.
4. El usuario puede registrar un override para una clínica.
5. El usuario puede registrar un override para un miembro del personal.
6. El formulario permite seleccionar exactamente un objetivo.
7. Se pueden registrar intervalos puntuales con fecha y hora.
8. Los valores se envían con zona horaria.
9. El usuario puede consultar el detalle de un override.
10. El usuario puede modificar los campos permitidos por el contrato PATCH.
11. El usuario puede activar y desactivar overrides.
12. Los overrides inactivos se conservan y no participan en disponibilidad.
13. Se muestran correctamente los errores de validación del backend.
14. Un override de clínica puede añadir disponibilidad fuera del horario semanal.
15. Un override de personal no puede ampliar la apertura efectiva de la clínica.
16. Las excepciones tienen prioridad sobre los overrides.
17. Los overrides no anulan citas ni otros bloqueos.
18. Los solapamientos se gestionan conforme a la regla aprobada por el backend.
19. Los overrides no modifican los horarios recurrentes.
20. No se crean formularios de overrides dentro de clínicas o personal.
21. La navegación y las rutas respetan la SPEC 00 y la arquitectura existente.
22. El frontend no duplica el cálculo de disponibilidad efectiva.