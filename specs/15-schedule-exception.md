# SPEC 15 — Gestión de excepciones de horarios 

## 1. Prioridad y dependencias

Esta especificación define la implementación frontend del módulo de excepciones de horarios de clínicas y miembros del personal.

Depende de:

- SPEC 05 — Módulo de clínicas.
- SPEC 08 — Módulo de personal.
- SPEC 13 — Gestión de horarios de clínicas.
- SPEC 14 — Gestión de horarios del personal.

Skills aplicables:

- `$frontend-arquitectura`: organización del módulo, navegación y rutas.
- `$frontend-integracion-api`: comunicación con los endpoints de excepciones.
- `$frontend-catalogo-componentes`: reutilización de componentes existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

La implementación debe respetar la arquitectura existente del frontend y las responsabilidades de los módulos involucrados.

## 2. Objetivo

Permitir registrar y administrar cierres o bloqueos extraordinarios que afecten la disponibilidad de una clínica o de un miembro del personal.

Una excepción representa un intervalo temporal durante el cual se debe bloquear disponibilidad.

La funcionalidad debe permitir:

- Registrar una excepción para una clínica.
- Registrar una excepción para un miembro del personal.
- Consultar las excepciones registradas.
- Filtrar excepciones por clínica, trabajador, tipo y rango temporal.
- Consultar el detalle de una excepción.
- Modificar una excepción existente.
- Eliminar una excepción únicamente si el backend confirma que se permite su eliminación física.
- Identificar claramente el objetivo, motivo, tipo y periodo de bloqueo.

**Las excepciones siempre reducen la disponibilidad. Nunca deben ampliarla ni modificar los horarios recurrentes.**

La administración se realizará desde un módulo independiente, sin incorporar el formulario de excepciones dentro de los formularios de clínicas o personal.

## 3. Alcance

Esta especificación comprende:

- Módulo independiente de excepciones de horarios.
- Listado de excepciones.
- Formulario de creación.
- Consulta del detalle.
- Formulario de edición.
- Selección del objetivo de la excepción.
- Selección del tipo de excepción.
- Registro del motivo.
- Configuración de fecha y hora de inicio y finalización.
- Filtros de consulta.
- Validaciones preventivas.
- Manejo de errores y estados de interfaz.
- Integración con la API de excepciones.

No comprende:

- Administración de horarios semanales de clínicas.
- Administración de horarios semanales del personal.
- Modificación automática de horarios recurrentes.
- Creación de citas.
- Gestión de vacaciones, licencias o asistencia como módulos independientes.
- Gestión de `schedule_override`.
- Cálculo completo de disponibilidad efectiva.
- Cancelación de excepciones mediante un campo no definido por el backend.
- Reglas adicionales de precedencia de disponibilidad que no estén establecidas en el contrato correspondiente.

## 4. Organización del módulo

La funcionalidad debe implementarse dentro de:

`frontend/src/modules/schedule_exceptions/`

El módulo será responsable de administrar las excepciones de horarios, independientemente de que afecten a una clínica o a un trabajador.

Se pueden incorporar componentes internos como:

- `ScheduleExceptionList`: listado de excepciones.
- `ScheduleExceptionForm`: formulario de creación y edición.
- `ScheduleExceptionFilters`: filtros del listado.
- `ScheduleExceptionDetail`: información de una excepción.
- `ScheduleExceptionTargetSelector`: selección de clínica o trabajador.
- `ScheduleExceptionTypeSelector`: selección del tipo de excepción.
- `ScheduleExceptionDateTimeFields`: campos de fecha y hora.

Los nombres son orientativos. Antes de crear componentes nuevos se debe inspeccionar la estructura existente.

Los componentes exclusivos de esta funcionalidad deben permanecer dentro del módulo `schedule_exceptions`.

No reorganizar los módulos existentes ni crear un módulo genérico de horarios.

## 5. Integración con la API

Prefijo:

`/api/v1`

Los endpoints definidos por el backend son:

### 5.1. Crear una excepción

Endpoint:

`POST /api/v1/schedule-exceptions`

Permite registrar una excepción asociada a una clínica o a un miembro del personal.

El frontend debe enviar exactamente uno de los dos identificadores:

- `clinic_id`
- `staff_member_id`

El identificador que no corresponda debe enviarse como `null`, conforme al contrato del backend.

Ejemplo de excepción de clínica:

```json
{
  "clinic_id": 1,
  "staff_member_id": null,
  "exception_type": "closure",
  "reason": "Mantenimiento",
  "starts_at": "2026-11-02T13:00:00-05:00",
  "ends_at": "2026-11-02T17:00:00-05:00"
}
```

Ejemplo de excepción de personal:

```json
{
  "clinic_id": null,
  "staff_member_id": 4,
  "exception_type": "absence",
  "reason": "Ausencia programada",
  "starts_at": "2026-11-03T09:00:00-05:00",
  "ends_at": "2026-11-03T12:00:00-05:00"
}
```

El frontend debe respetar el contrato de creación y no enviar campos adicionales no definidos.

### 5.2. Consultar excepciones

Endpoint:

`GET /api/v1/schedule-exceptions`

Debe utilizarse para recuperar las excepciones registradas.

El listado debe permitir filtrar por los criterios que admite el backend:

- Clínica.
- Miembro del personal.
- Tipo de excepción.
- Rango temporal.

No inventar nombres de parámetros, operadores de rango, paginación ni ordenamiento. La implementación debe utilizar los parámetros exactos que defina el contrato real de la API.

### 5.3. Consultar una excepción específica

Endpoint:

`GET /api/v1/schedule-exceptions/{exception_id}`

Debe utilizarse para recuperar el detalle de una excepción.

La interfaz debe mostrar la información disponible del registro sin permitir modificar los identificadores ni los campos de auditoría.

### 5.4. Actualizar una excepción

Endpoint:

`PATCH /api/v1/schedule-exceptions/{exception_id}`

Debe utilizarse para modificar una excepción existente.

La interfaz debe respetar los campos que el backend permita actualizar.

Si se modifica el objetivo o el intervalo temporal, el backend debe volver a validar las reglas correspondientes.

No asumir que todos los campos de creación pueden modificarse. Confirmar el contrato real de actualización antes de implementar el formulario.

### 5.5. Eliminar una excepción

El backend contempla:

`DELETE /api/v1/schedule-exceptions/{exception_id}`

Sin embargo, su implementación depende de que se confirme que no se necesita conservar historial.

Por lo tanto:

- No implementar la eliminación física hasta que el backend confirme que está habilitada.
- No mostrar una acción de eliminación si el contrato todavía no está aprobado.
- No sustituir la eliminación por un cambio de estado inventado.
- Si se aprueba un mecanismo de cancelación con historial, incorporarlo únicamente después de que el backend defina el cambio de esquema y sus endpoints.

## 6. Formulario de creación de excepciones

La creación debe realizarse desde una página independiente del módulo `schedule_exceptions`.

El formulario debe permitir registrar una excepción para una clínica o para un miembro del personal.

### 6.1. Selección del objetivo

El usuario debe seleccionar primero el tipo de objetivo de la excepción:

- Clínica.
- Miembro del personal.

La interfaz debe presentar una selección excluyente.

Cuando el usuario seleccione una clínica:

- Mostrar un selector de clínicas.
- Permitir seleccionar la clínica a bloquear.
- Enviar su `clinic_id`.
- Enviar `staff_member_id: null`.

Cuando seleccione un miembro del personal:

- Mostrar un selector de trabajadores.
- Permitir seleccionar el trabajador a bloquear.
- Enviar su `staff_member_id`.
- Enviar `clinic_id: null`.

Los selectores deben reutilizar los servicios y componentes existentes de los módulos de clínicas y personal cuando sea apropiado.

No duplicar la lógica de consulta de clínicas o trabajadores dentro del módulo de excepciones.

No enviar ambos identificadores informados ni ambos identificadores nulos.

### 6.2. Tipo de excepción

El formulario debe permitir seleccionar el tipo de excepción.

El backend propone inicialmente los siguientes valores:

- `closure`: cierre.
- `absence`: ausencia.
- `maintenance`: mantenimiento.
- `other`: otro.

La lista definitiva debe ser confirmada por el backend antes de implementar.

El frontend debe utilizar los valores de dominio exactos definidos por el backend y presentar etiquetas comprensibles para el usuario.

No enviar las etiquetas traducidas como valores de API.

No permitir valores arbitrarios ni reutilizar catálogos de estados de otros módulos.

Si el backend modifica la lista cerrada, el frontend debe actualizar sus opciones de acuerdo con el contrato aprobado.

### 6.3. Motivo

El formulario debe permitir introducir un motivo o descripción de la excepción.

El campo corresponde a:

`reason`

Es opcional y admite `null`, conforme al contrato de la tabla.

El frontend no debe convertir un campo vacío en una descripción inventada.

### 6.4. Fecha y hora de inicio y finalización

El formulario debe permitir establecer:

- Fecha y hora de inicio: `starts_at`.
- Fecha y hora de finalización: `ends_at`.

Ambos campos son obligatorios.

La interfaz debe facilitar la selección de fecha y hora, sin perder la información de zona horaria.

Los valores enviados deben incluir un desplazamiento horario o una zona horaria válida, conforme al contrato de la API.

No enviar valores `datetime-local` directamente si no incluyen la información de zona horaria requerida.

### 6.5. Secuencia de creación

La creación de una excepción es una operación independiente.

El frontend debe:

1. Permitir seleccionar el objetivo.
2. Consultar las clínicas o trabajadores disponibles para el selector.
3. Permitir seleccionar el tipo de excepción.
4. Registrar opcionalmente el motivo.
5. Solicitar fecha y hora de inicio.
6. Solicitar fecha y hora de finalización.
7. Validar los datos antes del envío.
8. Ejecutar `POST /api/v1/schedule-exceptions`.
9. Mostrar el resultado de la operación.

No ejecutar solicitudes de creación de horarios de clínicas ni de personal.

No modificar los registros de `clinic_schedule` ni `staff_schedule`.

## 7. Listado de excepciones

Crear una pantalla de listado dentro del módulo `schedule_exceptions`.

Debe permitir visualizar las excepciones registradas y distinguir claramente si afectan a una clínica o a un trabajador.

Como mínimo, mostrar los campos disponibles:

- Identificador.
- Tipo de objetivo.
- Nombre de la clínica o trabajador, cuando la respuesta o los datos relacionados permitan identificarlo.
- Tipo de excepción.
- Motivo.
- Fecha y hora de inicio.
- Fecha y hora de finalización.
- Fecha de creación, cuando esté disponible en la respuesta.

No asumir que el backend devuelve los nombres de las clínicas o trabajadores si no están incluidos en el contrato.

Si la API devuelve únicamente identificadores, utilizar los servicios existentes de los módulos correspondientes cuando sea necesario para mostrar información adicional.

### 7.1. Filtros

El listado debe permitir filtrar por:

- Clínica.
- Miembro del personal.
- Tipo de excepción.
- Rango temporal.

Los filtros deben corresponder a los parámetros realmente admitidos por el backend.

No implementar filtros que requieran parámetros inexistentes.

El usuario debe poder limpiar los filtros y volver a consultar el listado.

### 7.2. Acciones del listado

Cada registro debe permitir:

- Consultar detalle.
- Editar.

La acción de eliminación solo podrá mostrarse cuando el backend confirme que el endpoint DELETE está habilitado y que no se necesita conservar historial.

## 8. Formulario de edición

La edición debe permitir modificar una excepción existente.

Al abrir el formulario:

1. Ejecutar `GET /api/v1/schedule-exceptions/{exception_id}`.
2. Cargar la información de la excepción.
3. Identificar el objetivo actual.
4. Mostrar el tipo y motivo.
5. Mostrar el intervalo temporal.
6. Permitir modificar los campos que admita el contrato PATCH.

### 8.1. Modificación del objetivo

Si el backend permite modificar `clinic_id` o `staff_member_id`, el frontend debe permitir cambiar el objetivo mediante el mismo selector excluyente del formulario de creación.

Se debe conservar la regla de que exactamente uno de los dos identificadores esté informado.

El cambio de objetivo debe validarse nuevamente antes de guardar.

No asumir que el backend permite cambiar el objetivo después de crear la excepción. Confirmar este comportamiento en el contrato PATCH.

### 8.2. Modificación del intervalo

Si el backend permite modificar `starts_at` y `ends_at`, el formulario debe permitir editar ambos valores.

Al guardar:

- Enviar los valores con zona horaria.
- Validar que el final sea posterior al inicio.
- No modificar los horarios recurrentes.
- No ampliar disponibilidad.

### 8.3. Guardado

Al guardar los cambios, ejecutar:

`PATCH /api/v1/schedule-exceptions/{exception_id}`

La interfaz debe identificar los campos modificados y enviar únicamente los campos admitidos por el contrato.

Si el backend rechaza la modificación:

- Mostrar el error correspondiente.
- Conservar los valores introducidos.
- No actualizar visualmente la excepción como si el cambio hubiera sido exitoso.

## 9. Detalle de la excepción

La vista de detalle debe mostrar:

- Identificador de la excepción.
- Tipo de objetivo.
- Clínica o trabajador afectado.
- Tipo de excepción.
- Motivo.
- Fecha y hora de inicio.
- Fecha y hora de finalización.
- Fecha de creación y actualización, si están disponibles.

Debe quedar claro que el registro representa un bloqueo extraordinario de disponibilidad.

No presentar la excepción como un cambio de horario recurrente.

La administración debe realizarse desde el formulario de edición, sin crear formularios adicionales para modificar campos individuales.

## 10. Validaciones

El frontend debe implementar validaciones preventivas de acuerdo con las reglas del backend.

### 10.1. Objetivo

Debe existir exactamente uno de los siguientes objetivos:

- `clinic_id`.
- `staff_member_id`.

Reglas:

- No permitir ambos identificadores nulos.
- No permitir ambos identificadores informados.
- El objetivo seleccionado debe existir.
- El identificador debe corresponder al tipo de objetivo seleccionado.

### 10.2. Fecha y hora

- `starts_at` es obligatorio.
- `ends_at` es obligatorio.
- Ambos valores deben incluir información de zona horaria al enviarse.
- `ends_at` debe ser posterior a `starts_at`.
- No permitir intervalos de duración cero.
- No permitir intervalos invertidos.

### 10.3. Tipo de excepción

`exception_type` debe pertenecer a la lista cerrada aprobada por el backend.

No permitir valores que no estén definidos en el contrato.

### 10.4. Motivo

`reason` es opcional.

El formulario debe permitir dejarlo vacío y respetar la posibilidad de enviar `null`, según el contrato de la API.

### 10.5. Cambios de objetivo o intervalo

Cuando el usuario modifique el objetivo o el periodo de una excepción existente:

- Validar nuevamente los datos.
- Enviar el objetivo y el intervalo actualizados conforme al contrato PATCH.
- Mostrar los errores de validación devueltos por el backend.
- No asumir que una excepción válida anteriormente seguirá siendo válida después de cambiar sus datos.

El backend es la autoridad definitiva para validar las restricciones.

## 11. Relación con horarios de clínicas y personal

Las excepciones se relacionan conceptualmente con los horarios definidos en:

- SPEC 13 — Horarios de clínicas.
- SPEC 14 — Horarios del personal.

Sin embargo, son registros independientes.

### 11.1. Excepciones de clínica

Una excepción asociada a una clínica debe bloquear la disponibilidad de todos los profesionales de esa clínica durante el intervalo correspondiente.

La interfaz debe identificar que el bloqueo afecta a la clínica completa.

No debe crear una excepción individual por cada trabajador.

### 11.2. Excepciones de personal

Una excepción asociada a un miembro del personal debe bloquear únicamente la disponibilidad de ese trabajador.

No debe modificar el horario de apertura de la clínica ni bloquear automáticamente a otros trabajadores.

### 11.3. No modificar horarios recurrentes

La gestión de excepciones no debe modificar:

- `clinic_schedule`.
- `staff_schedule`.

Registrar, editar o eliminar una excepción no debe crear, modificar ni eliminar horarios recurrentes.

No copiar horarios de clínicas ni de personal dentro del módulo.

## 12. Relación con schedule_override y disponibilidad

Una excepción siempre representa un bloqueo.

Un `schedule_override` puede definir un intervalo operativo especial, pero nunca debe anular una excepción de cierre.

La interfaz debe respetar esta regla conceptual:

- Los horarios recurrentes definen disponibilidad semanal.
- Las excepciones reducen disponibilidad durante intervalos concretos.
- Los overrides pueden definir intervalos operativos especiales.
- Ningún override debe habilitar disponibilidad dentro de una excepción de bloqueo.

La precedencia completa entre horarios recurrentes, excepciones, overrides y citas se definirá en las especificaciones correspondientes de `schedule_override` y disponibilidad.

Esta especificación no debe implementar el algoritmo completo de disponibilidad efectiva.

### 12.1. Superposición de intervalos

La interfaz debe contemplar que una excepción puede superponerse parcial o totalmente con horarios y citas.

No debe limitarse a comparar coincidencias exactas de fecha y hora.

La validación definitiva de los intervalos y sus efectos sobre la disponibilidad corresponde al backend.

No asumir que una excepción debe rechazarse por superponerse con una cita o con otro horario, ya que esa regla no está definida en el contrato proporcionado.

## 13. Estados de interfaz

Contemplar como mínimo:

- Cargando listado.
- Listado vacío.
- Consultando excepciones.
- Cargando clínicas.
- Cargando personal.
- Creando excepción.
- Consultando detalle.
- Actualizando excepción.
- Operación completada.
- Error de consulta.
- Error de creación.
- Error de actualización.
- Error de objetivo inexistente.
- Error de objetivo inválido.
- Error de intervalo temporal.
- Error de tipo de excepción.
- Error de zona horaria.

Los errores deben mostrarse de forma comprensible y asociarse al campo correspondiente cuando sea posible.

Si el backend rechaza una operación, conservar los datos introducidos y permitir corregirlos.

## 14. Navegación y rutas

La funcionalidad debe tener una opción independiente en el sidebar.

Se recomienda incorporarla dentro del grupo funcional de gestión de citas o agenda, debido a que las excepciones afectan directamente la disponibilidad para agendamiento.

La ubicación definitiva debe respetar la estructura real del sidebar y la SPEC 00.

Archivo del sidebar:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

La opción debe utilizar los iconos existentes y las claves de traducción correspondientes.

### 14.1. Rutas

Registrar las siguientes rutas en:

`frontend/src/App.tsx`

- Listado: `/schedule-exceptions`
- Creación: `/schedule-exceptions/create`
- Detalle: `/schedule-exceptions/:exceptionId`
- Edición: `/schedule-exceptions/:exceptionId/edit`

Los nombres deben mantenerse descriptivos y coherentes con el módulo.

Las rutas de detalle y edición no necesitan aparecer como opciones independientes en el sidebar.

La implementación debe utilizar el sistema de rutas y layouts existentes.

## 15. Reutilización de componentes

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
- Componentes de diseño existentes.

La selección de clínicas debe reutilizar los recursos del módulo `clinics`.

La selección de trabajadores debe reutilizar los recursos del módulo `staff`.

No duplicar servicios ni componentes que ya existan y sean reutilizables.

Los componentes específicos de excepciones deben permanecer dentro de `frontend/src/modules/schedule_exceptions/`.

## 16. Pruebas

Verificar como mínimo:

### 16.1. Creación

- Registrar una excepción de clínica.
- Registrar una excepción de personal.
- Enviar `staff_member_id: null` al crear una excepción de clínica.
- Enviar `clinic_id: null` al crear una excepción de personal.
- Registrar el tipo de excepción permitido.
- Registrar un motivo opcional.
- Registrar fechas y horas con zona horaria.
- Confirmar que la excepción se guarda correctamente.

### 16.2. Validaciones

- Rechazar ambos objetivos nulos.
- Rechazar ambos objetivos informados.
- Rechazar una clínica inexistente.
- Rechazar un trabajador inexistente.
- Rechazar fechas sin zona horaria al preparar el envío.
- Rechazar intervalos con inicio igual o posterior al final.
- Rechazar tipos de excepción no permitidos.
- Confirmar que los campos opcionales respetan el contrato.

### 16.3. Listado y filtros

- Consultar excepciones.
- Filtrar por clínica.
- Filtrar por trabajador.
- Filtrar por tipo.
- Filtrar por rango temporal.
- Limpiar filtros.
- Mostrar correctamente el objetivo afectado.
- Manejar listados vacíos y errores de consulta.

### 16.4. Edición

- Consultar el detalle de una excepción.
- Modificar los campos permitidos.
- Modificar el objetivo cuando el backend lo permita.
- Modificar el intervalo cuando el backend lo permita.
- Revalidar objetivo e intervalo.
- Mostrar errores del backend.
- Conservar los datos introducidos cuando falle la actualización.

### 16.5. Efecto sobre disponibilidad

- Comprobar el bloqueo de una excepción de clínica.
- Comprobar el bloqueo de una excepción de personal.
- Comprobar que una excepción de clínica afecta a todos los profesionales de la clínica.
- Comprobar que una excepción de personal no afecta a otros trabajadores.
- Comprobar superposiciones parciales con horarios.
- Comprobar superposiciones parciales con citas.
- Confirmar que una excepción nunca amplía disponibilidad.
- Confirmar que registrar una excepción no modifica horarios recurrentes.
- Confirmar que un override no debe anular una excepción de cierre.

Las pruebas del algoritmo completo de disponibilidad corresponden a las especificaciones de disponibilidad y no deben implementarse como lógica propia de este módulo.

## 17. Exclusiones

Esta especificación no debe implementar:

- Formularios de excepciones dentro del módulo de clínicas.
- Formularios de excepciones dentro del módulo de personal.
- Modificación de horarios semanales de clínicas.
- Modificación de horarios semanales de personal.
- Gestión de `schedule_override`.
- Cálculo completo de disponibilidad efectiva.
- Creación o modificación de citas.
- Gestión de asistencia.
- Gestión de vacaciones o licencias como entidades independientes.
- Catálogo genérico de estados.
- Cancelación de excepciones mediante campos no definidos.
- Eliminación física mientras el backend no confirme que está permitida.
- Reglas de precedencia adicionales no definidas por el backend.

## 18. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar:

- La organización del módulo `schedule_exceptions`.
- Los endpoints utilizados.
- La selección excluyente del objetivo.
- Los tipos de excepción permitidos.
- El tratamiento de fechas y zonas horarias.
- Los filtros disponibles.
- Las validaciones de intervalos.
- La relación con los horarios de clínicas y personal.
- La relación conceptual con `schedule_override` y disponibilidad.

## 19. Criterios de aceptación

La implementación se considera completa cuando:

1. Existe un módulo independiente `schedule_exceptions`.
2. El usuario puede consultar un listado de excepciones.
3. El usuario puede filtrar por clínica, trabajador, tipo y rango temporal, según los parámetros admitidos por el backend.
4. El usuario puede registrar una excepción para una clínica.
5. El usuario puede registrar una excepción para un miembro del personal.
6. El formulario permite seleccionar exactamente un objetivo.
7. Se pueden registrar el tipo, motivo y periodo de bloqueo.
8. Las fechas y horas se envían con zona horaria.
9. El usuario puede consultar el detalle de una excepción.
10. El usuario puede modificar una excepción respetando el contrato PATCH.
11. Se muestran y gestionan correctamente los errores de validación del backend.
12. Una excepción de clínica bloquea la disponibilidad de todos los profesionales de esa clínica durante el intervalo.
13. Una excepción de personal bloquea únicamente al trabajador correspondiente.
14. Se contemplan las superposiciones parciales de intervalos.
15. Las excepciones no modifican horarios recurrentes.
16. Ninguna excepción amplía disponibilidad.
17. Ningún override puede anular una excepción de cierre.
18. No se incorporan formularios de excepciones dentro de clínicas o personal.
19. La eliminación física solo se implementa si el backend confirma que está permitida.
20. La navegación y las rutas respetan la SPEC 00 y la arquitectura existente.