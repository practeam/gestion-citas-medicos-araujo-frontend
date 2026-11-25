# SPEC 18 — Integración de procedimientos en el formulario de citas 

## 1. Objetivo

Complementar la SPEC 17 — Gestión de citas odontológicas, incorporando la asociación y gestión de procedimientos del catálogo directamente en el formulario de creación y edición de citas.

Esta funcionalidad debe integrarse en el mismo formulario definido en la SPEC 17.

**No se debe crear un formulario independiente para los procedimientos ni una página independiente para los detalles de una cita.**

El objetivo es que el usuario pueda gestionar los datos principales de una cita y sus procedimientos asociados dentro de una única experiencia.

Se debe permitir:

- Seleccionar uno o varios procedimientos del catálogo.
- Asociar procedimientos a una cita.
- Definir la cantidad de cada procedimiento.
- Visualizar el precio unitario aplicado.
- Visualizar la duración total de cada procedimiento.
- Registrar notas por procedimiento.
- Modificar los procedimientos asociados cuando el estado de la cita lo permita.
- Retirar procedimientos cuando la política del negocio lo permita.
- Visualizar un resumen de los procedimientos, importes y duración requerida.
- Conservar los precios y duraciones históricos de los detalles existentes.
- Organizar visualmente los procedimientos según su jerarquía cuando corresponda.

Los precios y duraciones almacenados en los detalles representan snapshots históricos. Los cambios posteriores en el catálogo no deben modificar los valores históricos de las citas existentes.

## 2. Dependencias

Esta especificación complementa directamente:

- SPEC 17 — Gestión de citas odontológicas.
- SPEC 17-0 — Gestión del catálogo de procedimientos odontológicos.

El módulo `appointments` será responsable de coordinar la gestión de los procedimientos asociados a las citas.

El módulo `procedures` será responsable de administrar el catálogo de procedimientos.

La integración debe respetar la arquitectura y las convenciones existentes del frontend.

### Responsabilidades

**Módulo procedures:**

- Administrar el catálogo.
- Registrar y editar procedimientos.
- Gestionar precios base y duraciones estimadas.
- Gestionar la jerarquía de procedimientos.
- Activar y desactivar procedimientos.

**Módulo appointments:**

- Administrar las citas.
- Consultar el catálogo de procedimientos para seleccionar opciones disponibles.
- Asociar procedimientos a las citas.
- Administrar cantidades y notas de los detalles.
- Mostrar precios y duraciones históricas.
- Coordinar la creación, edición y eliminación de detalles.

El módulo de citas no debe duplicar las funcionalidades administrativas del catálogo.

## 3. Organización del módulo

La funcionalidad pertenece al módulo existente:

`frontend/src/modules/appointments/`

Los servicios, tipos y componentes específicos para gestionar los detalles de una cita deben pertenecer al módulo `appointments`.

Se pueden organizar dentro de subcarpetas según las convenciones existentes del proyecto.

Ejemplo referencial:

- `components/`: componentes de procedimientos asociados a una cita.
- `services/`: servicios API para los detalles.
- `types/`: tipos TypeScript de los detalles.

No crear un módulo independiente `appointment_details`.

No duplicar la administración del catálogo de procedimientos.

Los componentes específicos para administrar el catálogo permanecen en:

`frontend/src/modules/procedures/`

Los componentes compartidos deben reutilizarse desde las carpetas existentes del proyecto.

## 4. Integración obligatoria con el formulario de citas de SPEC 17

La SPEC 18 amplía el formulario definido en la SPEC 17. Ambas especificaciones deben implementarse conjuntamente como una sola experiencia de usuario.

El formulario de citas tendrá las siguientes secciones:

### 4.1. Datos principales de la cita

Se mantienen los campos definidos en la SPEC 17:

- Paciente.
- Personal responsable.
- Fecha.
- Hora de inicio.
- Hora de fin.
- Motivo.

### 4.2. Procedimientos asociados

Se incorpora una sección adicional dentro del mismo formulario para gestionar los procedimientos.

Esta sección permitirá:

- Buscar procedimientos en el catálogo.
- Seleccionar procedimientos activos.
- Agregar uno o varios procedimientos.
- Indicar la cantidad.
- Visualizar el precio unitario.
- Visualizar la duración total.
- Registrar notas opcionales.
- Modificar cantidades antes de guardar.
- Retirar procedimientos antes de guardar.

La selección de procedimientos será opcional. Una cita podrá crearse sin procedimientos asociados.

No se deben crear procedimientos desde este formulario. Los procedimientos deben existir previamente en el catálogo.

### 4.3. Resumen de la cita

Dentro del mismo formulario se debe mostrar un resumen con:

- Procedimientos seleccionados.
- Cantidad de cada procedimiento.
- Precio unitario.
- Importe calculado por línea.
- Duración total de los procedimientos.
- Importe total estimado.

Los importes y duraciones mostrados son valores derivados de los detalles y no representan campos adicionales que deban persistirse en la cita.

### 4.4. Jerarquía de procedimientos

El catálogo permite organizar procedimientos mediante `parent_procedure_id`.

Cuando existan procedimientos jerárquicos, el selector debe facilitar su identificación visual.

Se debe permitir:

- Mostrar el procedimiento padre.
- Mostrar sus procedimientos hijos.
- Identificar el nivel jerárquico de cada procedimiento.
- Buscar por nombre o código.

La jerarquía es una organización del catálogo y no implica que seleccionar un procedimiento padre agregue automáticamente sus hijos.

Cada procedimiento seleccionado debe generar su propio detalle de cita.

No asumir que los procedimientos padre son categorías no seleccionables. Se debe permitir seleccionar cualquier procedimiento activo, siempre que el backend lo admita.

## 5. Consulta del catálogo de procedimientos

Para seleccionar procedimientos, el formulario de citas debe consumir el catálogo definido en la SPEC 17-0.

Endpoint:

`GET /api/v1/procedures`

### 5.1. Parámetros disponibles

Utilizar los parámetros definidos por backend:

- `search`: búsqueda por nombre o código.
- `is_active`: filtrar por estado.
- `parent_procedure_id`: filtrar por procedimiento padre.
- `min_price`: precio mínimo.
- `max_price`: precio máximo.

Para nuevas asociaciones, utilizar:

`is_active=true`

La búsqueda debe permitir localizar procedimientos por nombre o código.

La consulta debe respetar la paginación del backend.

No implementar una búsqueda exclusivamente local que ignore la paginación y los filtros del servidor.

### 5.2. Información requerida

El selector debe disponer de los siguientes campos:

- `id`
- `parent_procedure_id`
- `code`
- `name`
- `base_price`
- `base_duration_minutes`
- `is_active`

Estos campos permiten identificar el procedimiento, mostrar su información y realizar las estimaciones previas a la asociación.

### 5.3. Comportamiento del selector

El selector debe:

- Mostrar procedimientos activos.
- Permitir buscar por nombre o código.
- Mostrar el nombre del procedimiento.
- Mostrar el código cuando exista.
- Mostrar el precio base.
- Mostrar la duración base.
- Mostrar su relación jerárquica cuando corresponda.
- Permitir agregar varios procedimientos.
- Evitar agregar accidentalmente el mismo procedimiento varias veces como líneas independientes.

Si se necesita agregar nuevamente un procedimiento ya seleccionado, se debe actualizar su cantidad en lugar de generar una línea duplicada, salvo que el negocio defina explícitamente que se permiten líneas separadas.

Los procedimientos inactivos no deben aparecer como opciones para nuevas asociaciones.

## 6. Comportamiento en la creación de citas

Desde la agenda definida en la SPEC 17, el usuario abrirá el formulario de creación de citas.

En ese mismo formulario podrá completar los datos principales y seleccionar los procedimientos que desea asociar.

El flujo será:

1. Seleccionar paciente.
2. Seleccionar personal responsable.
3. Definir fecha y horario.
4. Registrar el motivo, si corresponde.
5. Consultar el catálogo de procedimientos activos.
6. Seleccionar opcionalmente uno o varios procedimientos.
7. Definir cantidad y notas por procedimiento.
8. Visualizar el precio unitario y la duración estimada.
9. Visualizar el resumen de la cita.
10. Guardar la cita.

La creación se realizará mediante operaciones API independientes:

1. Crear la cita mediante `POST /api/v1/appointments`.
2. Obtener el `appointment_id`.
3. Registrar cada procedimiento mediante `POST /api/v1/appointments/{appointment_id}/details`.

Se realizará una llamada por cada procedimiento seleccionado.

El frontend no debe enviar nuevamente los datos principales de la cita al crear cada detalle.

### 6.1. Creación sin procedimientos

Se debe permitir crear una cita sin procedimientos asociados.

En ese caso:

- Ejecutar únicamente `POST /api/v1/appointments`.
- No realizar llamadas al endpoint de detalles.
- Mostrar la cita normalmente en la agenda.

### 6.2. Manejo de fallos parciales

Si la cita se crea correctamente, pero falla la asociación de uno o varios procedimientos:

- No volver a crear la cita.
- Conservar el `appointment_id`.
- Informar que la cita fue creada parcialmente.
- Identificar los procedimientos que no pudieron registrarse.
- Permitir reintentar únicamente las asociaciones pendientes.
- Evitar duplicar los detalles que se registraron correctamente.
- Mantener la información necesaria para recuperar el proceso si el usuario recarga la página o vuelve a abrir la cita.

El frontend debe recuperar los detalles existentes mediante:

`GET /api/v1/appointments/{appointment_id}/details`

Antes de reintentar una operación, debe verificar cuáles detalles se registraron correctamente.

No se debe asumir que ambas operaciones forman una transacción única.

No se debe eliminar automáticamente la cita cuando falle la asociación de un procedimiento.

## 7. Comportamiento en la edición de citas

El formulario de edición definido en la SPEC 17 debe incorporar la misma sección de procedimientos.

Al abrir el formulario, se deben recuperar:

- Los datos principales de la cita.
- Los procedimientos actualmente asociados.
- La cantidad de cada procedimiento.
- El precio unitario histórico.
- La duración total histórica.
- Las notas de cada detalle.

El usuario podrá:

- Agregar nuevos procedimientos.
- Modificar la cantidad de un procedimiento existente.
- Modificar sus notas.
- Retirar procedimientos cuando esté permitido.
- Visualizar los precios y duraciones históricos.

Los detalles existentes deben identificarse mediante su `detail_id`.

No se debe cambiar directamente el `procedure_id` de un detalle existente.

Para sustituir un procedimiento se debe retirar el detalle anterior y agregar uno nuevo, respetando las restricciones del backend y el estado de la cita.

Las operaciones se realizarán utilizando los endpoints correspondientes.

### 7.1. Modificación de cantidad

Cuando se modifique la cantidad:

- El backend debe recalcular la duración total de la línea.
- El precio unitario histórico debe conservarse.
- El frontend debe actualizar la duración utilizando la respuesta del backend o consultando nuevamente el detalle.
- No se debe volver a multiplicar la duración histórica por la cantidad.

### 7.2. Modificación de notas

La modificación de notas no debe alterar:

- `procedure_id`
- `quantity`
- `unit_price`
- `duration_minutes`

Únicamente se debe modificar el campo permitido.

### 7.3. Manejo de errores

Si una operación falla, se debe informar específicamente qué procedimiento no pudo actualizarse, sin perder los cambios que sí fueron registrados correctamente.

No volver a ejecutar operaciones que ya hayan finalizado correctamente.

## 8. Comportamiento en la consulta de citas

El modal de consulta definido en la SPEC 17 debe mostrar los procedimientos asociados.

La información debe visualizarse dentro del mismo detalle de la cita.

Por cada procedimiento se mostrará:

- Nombre del procedimiento.
- Código, cuando exista y esté disponible.
- Cantidad.
- Precio unitario histórico.
- Duración total de la línea.
- Importe calculado.
- Notas, cuando existan.

No se debe crear un modal o página independiente para consultar los detalles de una cita.

Los valores históricos deben recuperarse de los detalles almacenados por el backend.

No utilizar los valores actuales del catálogo para reemplazar los snapshots históricos.

## 9. Integración con la API de detalles

Prefijo base:

`/api/v1`

### 9.1. Consultar detalles

`GET /appointments/{appointment_id}/details`

Recupera los procedimientos asociados a una cita.

Se utilizará para:

- Mostrar los procedimientos en el detalle de la cita.
- Recuperar los detalles al editar una cita.
- Verificar qué asociaciones se registraron correctamente.
- Recuperar el estado de una creación parcial.

### 9.2. Crear detalle

`POST /appointments/{appointment_id}/details`

El frontend enviará:

- `procedure_id`
- `quantity`
- `notes`, cuando corresponda.

El backend debe obtener del catálogo:

- `base_price`
- `base_duration_minutes`

Y generar los snapshots:

- `unit_price`: copia del precio base vigente al crear el detalle.
- `duration_minutes`: duración base multiplicada por la cantidad.

El frontend no debe enviar `duration_minutes` en la creación normal.

El frontend tampoco debe enviar un `unit_price` arbitrario.

En esta implementación no se contemplan precios personalizados.

El precio mostrado antes de guardar debe provenir del catálogo, pero el valor definitivo almacenado corresponde al backend.

### 9.3. Modificar detalle

`PATCH /appointments/{appointment_id}/details/{detail_id}`

Se utilizará para modificar los campos que el backend permita.

El frontend no debe asumir que puede modificar:

- `appointment_id`
- `procedure_id`
- `unit_price`
- `duration_minutes`

Cuando se modifique la cantidad:

- El backend debe recalcular `duration_minutes`.
- El precio unitario histórico debe conservarse.
- El frontend debe actualizar la información con la respuesta del backend.

Cuando se modifiquen notas, no deben cambiarse los snapshots de precio ni duración.

El contrato definitivo de PATCH debe confirmar estos comportamientos antes de implementar.

### 9.4. Eliminar detalle

`DELETE /appointments/{appointment_id}/details/{detail_id}`

Se utilizará únicamente cuando la política del negocio permita retirar el detalle.

No se debe mostrar la acción de eliminación cuando el estado de la cita impida realizarla.

El frontend debe manejar los errores y conservar la información cuando la operación falle.

No se debe permitir modificar `appointment_id` para trasladar un detalle a otra cita.

## 10. Reglas de negocio y validaciones

### 10.1. Procedimientos disponibles

- Mostrar únicamente procedimientos activos para nuevas asociaciones.
- No permitir agregar procedimientos inactivos.
- Los procedimientos inactivos que ya estén asociados deben continuar visibles en citas existentes.
- Los cambios posteriores del catálogo no deben modificar los detalles históricos.
- No eliminar automáticamente detalles cuando se desactive un procedimiento.
- La validación definitiva del estado del procedimiento corresponde al backend.

### 10.2. Cantidad

- Debe ser un entero positivo.
- No permitir valores negativos, cero ni decimales.
- Validar antes de enviar la solicitud.

### 10.3. Precio

- Mostrar el precio unitario aplicado.
- Utilizar representación decimal compatible con el contrato de la API.
- No utilizar `float` para cálculos financieros.
- No permitir más de dos decimales.
- No permitir precios personalizados en esta implementación.
- No reemplazar precios históricos por precios actuales del catálogo.
- El precio aplicado a un nuevo detalle debe provenir del `base_price` vigente del catálogo al momento de crear el detalle.

### 10.4. Duración

La duración total de una línea se calcula mediante:

`duration_minutes = procedure.base_duration_minutes × quantity`

Reglas:

- La duración base se obtiene del catálogo al momento de crear el detalle.
- El backend calcula y almacena la duración total de la línea.
- El frontend puede mostrar una estimación previa utilizando `base_duration_minutes`.
- El valor definitivo corresponde al backend.
- No enviar `duration_minutes` en la creación normal.
- No volver a multiplicar la duración recibida del backend por la cantidad.
- Al modificar la cantidad, el backend debe recalcular la duración total conforme a la regla establecida.

### 10.5. Importe de línea

El importe se calcula mediante:

`importe = unit_price × quantity`

El frontend puede mostrar el importe calculado, pero no debe enviarlo ni persistirlo como un campo adicional no definido en el contrato.

### 10.6. Resumen

Mostrar:

- Cantidad de procedimientos.
- Importe de cada línea.
- Importe total estimado.
- Duración total de los procedimientos.

El resumen debe actualizarse cuando se agreguen, modifiquen o retiren procedimientos.

Los totales deben calcularse utilizando una representación decimal adecuada.

No persistir totales financieros duplicados.

## 11. Coherencia con la duración y disponibilidad de la cita

La duración reservada de la cita está determinada por:

- `appointment.starts_at`
- `appointment.ends_at`

La suma de las duraciones de los detalles representa el tiempo requerido por los procedimientos.

Se establece como regla funcional inicial:

`duración reservada >= suma de duraciones de los detalles`

El tiempo reservado puede incluir margen adicional de preparación, siempre que el negocio lo permita.

Cuando los cambios en los procedimientos provoquen que la duración reservada sea insuficiente, el frontend debe:

- Informar al usuario.
- Mostrar la diferencia entre el tiempo reservado y el tiempo requerido.
- Permitir ajustar manualmente la hora de fin.
- No cambiar automáticamente la fecha u hora de la cita sin confirmación.
- Solicitar nuevamente la validación de disponibilidad al backend.

La disponibilidad y los solapamientos deben validarse conforme a la SPEC 17 y las especificaciones de horarios, excepciones y modificaciones puntuales.

No implementar un algoritmo de disponibilidad independiente en el frontend.

La validación definitiva corresponde al backend.

### 11.1. Consistencia de las operaciones

La creación y modificación de detalles puede cambiar el tiempo requerido para una cita.

Por tanto, el backend debe validar que los detalles sean compatibles con el intervalo reservado y la disponibilidad del personal.

El contrato backend debe definir cómo se valida esta condición cuando se crea o modifica un detalle.

El frontend no debe asumir que modificar un detalle extiende automáticamente el horario de la cita.

## 12. Restricciones según el estado de la cita

Se recomienda aplicar las siguientes reglas:

- `pending`: permitir agregar, modificar y retirar detalles.
- `confirmed`: permitir modificaciones únicamente si la política del negocio lo autoriza y se valida nuevamente la disponibilidad.
- `completed`: impedir modificaciones ordinarias de detalles.
- `cancelled`: impedir modificaciones ordinarias de detalles.

Los detalles de citas completadas o canceladas deben conservarse como historial.

El frontend debe habilitar o deshabilitar acciones según el estado de la cita y los contratos del backend.

La validación definitiva debe realizarse en el backend.

## 13. Componentes y reutilización

Se deben inspeccionar los componentes existentes antes de desarrollar nuevos componentes.

Se pueden incorporar componentes específicos dentro del módulo `appointments`, por ejemplo:

- `AppointmentProceduresSection`: sección integrada de procedimientos.
- `ProcedureSelector`: búsqueda y selección del catálogo.
- `AppointmentDetailList`: listado de procedimientos asociados.
- `AppointmentDetailForm`: edición de cantidad y notas.
- `AppointmentProcedureSummary`: resumen de importes y duración.

Los nombres son referenciales y deben adaptarse a las convenciones existentes.

Reutilizar los componentes compartidos de formularios, modales, tablas, búsqueda, selección, alertas y estados de carga.

No duplicar componentes existentes del catálogo de procedimientos.

No trasladar los componentes administrativos de `procedures` al módulo `appointments`.

## 14. Navegación y rutas

Esta especificación no agrega nuevas páginas, rutas ni opciones de sidebar.

Se mantienen las definidas en la SPEC 17:

- `/appointments`: agenda principal.
- Creación mediante el formulario de citas.
- Consulta mediante el detalle de la cita.
- Edición mediante el mismo formulario.

Los procedimientos deben gestionarse exclusivamente dentro de estos flujos.

No crear rutas independientes para los detalles de citas.

La administración del catálogo conserva sus propias rutas, definidas en la SPEC 17-0:

- `/procedures`
- `/procedures/create`
- `/procedures/:procedureId`
- `/procedures/:procedureId/edit`

Estas rutas pertenecen exclusivamente al módulo `procedures` y no forman parte de la navegación de detalles de citas.

## 15. Estados de interfaz

La sección de procedimientos debe contemplar:

- Cargando catálogo.
- Catálogo vacío.
- Error al cargar catálogo.
- Búsqueda sin resultados.
- Procedimientos seleccionados.
- Procedimiento inactivo en un detalle histórico.
- Cantidad inválida.
- Cargando detalles existentes.
- Error al recuperar detalles.
- Guardando detalle.
- Error al crear detalle.
- Error al actualizar detalle.
- Error al retirar detalle.
- Cita creada parcialmente.
- Reintento de asociaciones pendientes.
- Cita sin procedimientos.
- Duración reservada insuficiente.
- Detalles en modo de solo lectura.

Se deben utilizar los mecanismos visuales existentes en el proyecto.

## 16. Pruebas frontend

Se deben implementar pruebas para verificar:

### Catálogo

- Carga de procedimientos activos.
- Búsqueda por nombre.
- Búsqueda por código.
- Visualización de precio y duración base.
- Visualización de jerarquías.
- Exclusión de procedimientos inactivos para nuevas asociaciones.
- Manejo de paginación.
- Manejo de errores.

### Creación

- Integración de procedimientos en el mismo formulario de citas de la SPEC 17.
- Selección de uno o varios procedimientos.
- Validación de cantidades.
- Visualización de precios unitarios.
- Cálculo de importes por línea.
- Visualización de duración total.
- Actualización del resumen.
- Creación de citas sin procedimientos.
- Creación de citas con procedimientos.
- Ejecución secuencial de las operaciones API.
- Manejo de fallos parciales.
- Reintento sin duplicar citas ni detalles.

### Consulta y edición

- Recuperación de detalles históricos.
- Conservación de precios y duraciones históricas.
- Visualización de procedimientos inactivos asociados anteriormente.
- Modificación de cantidades y notas.
- Recalculo de duración después de modificar cantidad.
- Conservación del precio histórico al cambiar cantidad.
- Retiro de detalles cuando esté permitido.
- Bloqueo de modificaciones en citas completadas o canceladas.

### Disponibilidad

- Validación de duración reservada insuficiente.
- Ajuste manual del horario.
- Solicitud de nueva validación de disponibilidad.
- Manejo de errores del backend.

### Integridad

- No duplicar detalles durante reintentos.
- No modificar detalles históricos al cambiar el catálogo.
- No cambiar el procedimiento asociado a un detalle existente.
- No modificar automáticamente el horario de una cita.

## 17. Criterios de aceptación

La implementación se considerará correcta cuando:

1. Los procedimientos estén integrados en el mismo formulario de citas definido en la SPEC 17.
2. No exista un formulario independiente para gestionar procedimientos asociados.
3. Se puedan asociar varios procedimientos a una cita.
4. Se pueda especificar cantidad y notas por procedimiento.
5. Se visualicen correctamente el precio unitario y la duración total.
6. El catálogo se consulte desde el módulo `procedures` mediante su API existente.
7. Se puedan buscar procedimientos por nombre o código.
8. Se muestren únicamente procedimientos activos para nuevas asociaciones.
9. Los procedimientos históricos permanezcan visibles aunque posteriormente se desactiven.
10. El precio aplicado a nuevos detalles provenga del precio base vigente del catálogo.
11. El frontend no envíe precios arbitrarios ni `duration_minutes` en la creación normal.
12. Los detalles históricos conserven sus precios y duraciones.
13. La cantidad y las notas se puedan modificar según las reglas del backend.
14. Se utilicen exclusivamente los endpoints definidos por backend.
15. Los fallos parciales no provoquen duplicaciones.
16. Se respeten las restricciones de modificación y eliminación según el estado de la cita.
17. Se valide la coherencia entre duración reservada y duración de los procedimientos.
18. Se mantenga la experiencia de agenda definida en la SPEC 17.
19. No se agreguen páginas, rutas ni opciones de sidebar independientes para los detalles de citas.
20. Se reutilicen los componentes y convenciones existentes del frontend.

## 18. Fuera de alcance

Esta especificación no contempla:

- Crear o administrar el catálogo de procedimientos.
- Gestionar precios generales del catálogo.
- Implementar pagos o facturación.
- Gestionar presupuestos.
- Registrar consumos de materiales o inventario.
- Gestionar diagnósticos o historias clínicas.
- Implementar autorización de precios personalizados mediante roles.
- Crear páginas o formularios independientes para detalles de citas.
- Persistir totales financieros no definidos por backend.
- Implementar transacciones frontend no soportadas por backend.
- Modificar automáticamente el horario de una cita cuando cambien sus procedimientos.
- Asignar procedimientos a odontólogos.

## 19. Decisiones y contratos que deben confirmarse antes de implementar

Aunque las reglas funcionales principales están definidas, se deben confirmar los siguientes comportamientos en el backend:

1. **Precio aplicado:** el backend debe obtener `base_price` del catálogo y copiarlo a `unit_price` al crear el detalle. No se permiten precios personalizados en esta fase.
2. **Duración reservada:** se establece como regla inicial que el tiempo reservado sea mayor o igual a la suma de las duraciones de los detalles.
3. **Citas sin procedimientos:** se permite crear citas sin detalles asociados.
4. **Citas confirmadas:** se recomienda permitir modificaciones de procedimientos siempre que se valide nuevamente la disponibilidad y el estado lo permita.
5. **Citas completadas o canceladas:** no permitir modificaciones ordinarias de detalles.
6. **Actualización de cantidad:** el backend debe recalcular `duration_minutes` y conservar `unit_price`.
7. **Modificación de notas:** no debe alterar los snapshots de precio y duración.
8. **Eliminación:** confirmar las restricciones de eliminación según el estado de la cita.
9. **Validación de disponibilidad:** el backend debe definir cómo se valida el tiempo requerido al crear o modificar detalles.
10. **Fallos parciales:** definir cómo recuperar y reintentar las asociaciones pendientes sin duplicar detalles.

La implementación debe respetar los contratos definitivos del backend. No se deben inventar campos, endpoints ni reglas de negocio.

---

## 20. Relación con las demás especificaciones

Esta especificación complementa la SPEC 17 y depende de la SPEC 17-0.

Las responsabilidades quedan distribuidas de la siguiente manera:

- **SPEC 17-0 — Catálogo de procedimientos:** administra los procedimientos, sus nombres, códigos, precios base, duraciones, jerarquías y estados.
- **SPEC 17 — Gestión de citas:** administra la agenda, los datos principales, los horarios y los estados de las citas.
- **SPEC 18 — Integración de procedimientos en el formulario de citas:** permite seleccionar y gestionar procedimientos asociados dentro del mismo formulario de creación y edición de citas definido en la SPEC 17.

Las tres especificaciones deben implementarse respetando sus responsabilidades y contratos independientes.

**Regla fundamental:** la SPEC 18 no crea una experiencia de gestión independiente. Amplía el formulario de citas de la SPEC 17 incorporando la sección de procedimientos y sus detalles.