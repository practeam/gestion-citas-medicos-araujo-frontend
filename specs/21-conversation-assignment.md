# SPEC 21 — Asignación de conversaciones (Frontend)

## 1. Objetivo

Ampliar el módulo `conversations` definido en las SPEC 19 y 20, incorporando la gestión de asignaciones de conversaciones al personal de la clínica.

La funcionalidad permitirá:

- Consultar el trabajador actualmente asignado a una conversación.
- Asignar una conversación a un trabajador.
- Transferir una conversación a otro trabajador.
- Finalizar una asignación activa.
- Consultar el historial de asignaciones.
- Identificar cuándo una conversación no tiene un trabajador asignado.
- Mostrar información del trabajador responsable.
- Integrar las operaciones de asignación dentro de la interfaz principal del chat.

La asignación representa qué trabajador está atendiendo una conversación en un momento determinado.

No se debe confundir el estado de asignación con el estado de la conversación.

Una conversación puede estar abierta sin tener una asignación activa.

Una conversación cerrada no puede recibir nuevas asignaciones.

## 2. Dependencias

Esta especificación depende de:

- SPEC 19 — Gestión de conversaciones (Frontend).
- SPEC 20 — Gestión de mensajes (Frontend).
- SPEC 19 — Entidad Conversation (Backend).
- SPEC 21 — Entidad Conversation Assignment (Backend).
- SPEC 08 — Gestión de personal (Frontend).

La funcionalidad debe integrarse en el módulo existente:

`frontend/src/modules/conversations/`

El módulo `staff` es responsable de administrar el personal.

El módulo `conversations` es responsable de administrar las asignaciones de sus conversaciones.

No crear un módulo independiente `conversation_assignments`.

## 3. Organización del módulo

Los componentes y servicios específicos de asignaciones deben permanecer dentro de:

`frontend/src/modules/conversations/`

Organización referencial:

```text
frontend/src/modules/conversations/
├── components/
│   ├── assignment-panel/
│   ├── assignment-selector/
│   ├── assignment-history/
│   ├── assignment-card/
│   └── end-assignment-dialog/
├── services/
│   └── conversation-assignment-service.ts
├── hooks/
├── types/
└── ...
```

La estructura es referencial y debe adaptarse a las convenciones existentes del repositorio.

No crear carpetas vacías ni abstracciones anticipadas.

Los componentes exclusivos de asignaciones deben permanecer dentro del módulo `conversations`.

Reutilizar los componentes compartidos de selección, formularios, modales, tablas, avatares, alertas y notificaciones existentes.

No duplicar los formularios ni los servicios de administración de personal.

## 4. Integración con la interfaz principal del chat

La gestión de asignaciones debe integrarse en la pantalla definida por la SPEC 19.

No crear páginas independientes para administrar asignaciones.

Se debe incorporar la información de asignación en el encabezado o panel derecho de la conversación.

### 4.1. Información de asignación

Cuando exista una asignación activa, mostrar:

- Nombre del trabajador.
- Información identificativa disponible.
- Fecha y hora de asignación.
- Estado de la conversación.
- Acción para transferir.
- Acción para finalizar la asignación, cuando corresponda.

Utilizar únicamente información disponible en las respuestas del backend.

No inventar nombres, fotografías, cargos o especialidades.

### 4.2. Conversación sin asignación

Cuando no exista una asignación activa:

- Mostrar que la conversación está sin asignar.
- Permitir asignar un trabajador cuando la conversación esté abierta.
- No presentar un trabajador ficticio.
- Mantener disponible el historial de mensajes según los permisos existentes.

La ausencia de asignación no implica que la conversación esté cerrada.

### 4.3. Historial de asignaciones

Debe existir una sección que permita consultar las asignaciones anteriores.

Por cada asignación mostrar, cuando esté disponible:

- Trabajador.
- Fecha de asignación.
- Fecha de finalización.
- Estado de la asignación, derivado de `ended_at`.

Una asignación con `ended_at = null` representa una asignación activa.

Una asignación con `ended_at` informado representa una asignación finalizada.

No confundir una asignación finalizada con una conversación cerrada.

## 5. Consulta de asignaciones

Endpoint:

`GET /api/v1/conversations/{conversation_id}/assignments`

Se utilizará para recuperar el historial de asignaciones de una conversación.

La consulta debe realizarse al abrir una conversación o cuando el usuario acceda a la sección de asignaciones.

### 5.1. Información requerida

Utilizar los campos disponibles en la respuesta del backend:

- `id`
- `conversation_id`
- `staff_member_id`
- `assigned_at`
- `ended_at`

Si backend devuelve información resumida del trabajador, utilizarla.

Si únicamente devuelve `staff_member_id`, obtener la información adicional mediante los servicios existentes de personal, siempre que exista un endpoint adecuado.

No asumir que la respuesta incluye un objeto `staff_member`.

### 5.2. Identificación de la asignación activa

La asignación activa se identifica mediante:

`ended_at = null`

El frontend debe:

- Identificar la asignación activa.
- Mostrar el trabajador responsable.
- Diferenciarla de las asignaciones anteriores.
- Mostrar el historial cronológico.

La regla de unicidad de una asignación activa por conversación está garantizada por backend mediante el índice único parcial.

El frontend no debe implementar una segunda regla de persistencia.

### 5.3. Ordenamiento

Mostrar el historial de manera comprensible, preferentemente desde la asignación más reciente hasta la más antigua.

Utilizar las fechas disponibles.

No inventar parámetros de ordenamiento en el endpoint.

## 6. Selección de trabajadores

Para asignar o transferir una conversación se debe permitir seleccionar un trabajador elegible.

Se debe reutilizar la información del módulo `staff`.

El selector debe mostrar únicamente trabajadores que puedan recibir asignaciones conforme a las reglas de negocio del backend.

La política inicial requiere:

- Persona activa.
- Registro de personal activo.
- `employment_status = active`.

### 6.1. Consulta de personal

Utilizar el endpoint de listado de personal existente en el módulo `staff`.

Aplicar los filtros y parámetros definidos por su contrato real.

No inventar endpoints específicos para trabajadores asignables.

Si el endpoint de listado no permite filtrar por todos los criterios de elegibilidad, el frontend puede presentar opciones candidatas y manejar los rechazos de backend.

La validación definitiva corresponde al backend.

### 6.2. Información mostrada

El selector puede mostrar:

- Nombre del trabajador.
- Número de documento, si está disponible.
- Número de empleado, si existe.
- Estado del trabajador.

No mostrar información innecesaria.

No asumir que todos los trabajadores tienen número de empleado.

### 6.3. Trabajadores no elegibles

No permitir seleccionar intencionalmente trabajadores que el frontend pueda identificar como:

- Inactivos.
- Terminados.
- En licencia.
- Con persona inactiva.

Si la elegibilidad no puede determinarse con los datos disponibles, no inventar reglas adicionales.

Mostrar los errores devueltos por backend cuando un trabajador no pueda recibir asignaciones.

## 7. Asignación inicial

Endpoint:

`POST /api/v1/conversations/{conversation_id}/assignments`

La asignación inicial se realiza cuando una conversación abierta no tiene una asignación activa.

### 7.1. Flujo

1. El usuario abre una conversación.
2. La interfaz consulta sus asignaciones.
3. Se verifica si existe una asignación activa.
4. Si no existe, se muestra la opción de asignar.
5. El usuario selecciona un trabajador.
6. Confirma la operación.
7. El frontend envía la solicitud.
8. El backend crea la asignación.
9. El frontend actualiza la información de la conversación.

### 7.2. Datos enviados

El cuerpo de la solicitud debe contener únicamente:

```json
{
  "staff_member_id": 4
}
```

El identificador debe corresponder al trabajador seleccionado.

No enviar:

- `conversation_id` dentro del cuerpo.
- `assigned_at`.
- `ended_at`.
- `id`.

Estos valores son administrados por backend o forman parte de la ruta.

### 7.3. Resultado

Después de una asignación exitosa:

- Actualizar el trabajador mostrado.
- Actualizar la asignación activa.
- Actualizar el historial.
- Ocultar la acción de asignación inicial.
- Mostrar las acciones disponibles para la asignación existente.

### 7.4. Asignación idempotente

Si el trabajador seleccionado ya es el asignado activo, backend devuelve la asignación existente con respuesta exitosa `200`.

El frontend debe aceptar este resultado como operación exitosa.

No mostrar un error ni duplicar la asignación.

## 8. Transferencia de conversaciones

La transferencia consiste en reemplazar al trabajador actualmente asignado por otro trabajador elegible.

Endpoint:

`POST /api/v1/conversations/{conversation_id}/assignments`

Se utiliza el mismo endpoint de asignación.

### 8.1. Flujo

1. Consultar la asignación activa.
2. El usuario selecciona la acción de transferir.
3. Mostrar el trabajador actual.
4. Permitir seleccionar un nuevo trabajador.
5. Confirmar la transferencia.
6. Enviar el nuevo `staff_member_id`.
7. Backend termina la asignación anterior.
8. Backend crea la nueva asignación en una sola transacción.
9. El frontend actualiza la asignación activa y el historial.

### 8.2. Reglas

- No transferir a un trabajador que no pueda recibir asignaciones.
- No transferir una conversación cerrada.
- No crear una nueva asignación si el trabajador seleccionado ya es el asignado activo.
- No finalizar la asignación anterior desde el frontend antes de solicitar la transferencia.
- No realizar dos operaciones independientes para transferir.
- No perder el historial de asignaciones anteriores.

La atomicidad de la transferencia corresponde al backend.

Si la operación falla, el frontend debe conservar la asignación anterior mostrada o volver a consultar el estado actual.

### 8.3. Confirmación

Antes de ejecutar la transferencia, mostrar una confirmación indicando:

- Trabajador actual.
- Trabajador nuevo.

La interfaz debe permitir cancelar la operación antes de enviarla.

## 9. Finalización de asignaciones

Endpoint:

`PATCH /api/v1/conversation-assignments/{assignment_id}/end`

Se utilizará para finalizar una asignación activa sin transferirla inmediatamente a otro trabajador.

### 9.1. Flujo

1. El usuario selecciona finalizar asignación.
2. Se solicita confirmación.
3. El frontend envía la solicitud.
4. Backend establece `ended_at`.
5. El frontend actualiza la información.
6. La conversación queda sin asignación activa.

### 9.2. Comportamiento

Después de finalizar:

- Mostrar que la conversación está sin asignar.
- Actualizar el historial.
- Permitir una asignación posterior si la conversación continúa abierta.

Finalizar una asignación no debe cerrar la conversación.

No eliminar la asignación histórica.

No modificar los mensajes.

### 9.3. Errores

Manejar:

- Asignación inexistente.
- Asignación ya finalizada.
- Conflicto de estado.
- Conversación no disponible.

Si backend informa un conflicto, recuperar las asignaciones para reflejar el estado real.

## 10. Restricciones según el estado de la conversación

### 10.1. Conversación abierta

Cuando:

`conversation.status = open`

Se puede:

- Asignar un trabajador.
- Transferir a otro trabajador.
- Finalizar la asignación activa.
- Consultar el historial.

### 10.2. Conversación cerrada

Cuando:

`conversation.status = closed`

- No permitir nuevas asignaciones.
- No permitir transferencias.
- Mostrar el historial de asignaciones.
- No ofrecer una asignación activa como si continuara vigente.

Backend termina automáticamente la asignación activa al cerrar la conversación.

El frontend no debe ejecutar otra operación para finalizarla.

### 10.3. Reapertura

Cuando una conversación cerrada se reabre mediante la SPEC 19:

- Consultar nuevamente las asignaciones.
- No asumir que existe una asignación activa.
- Permitir asignar un trabajador si no existe asignación activa.

La reapertura no asigna automáticamente al último trabajador.

## 11. Consulta de conversaciones de un trabajador

Endpoint:

`GET /api/v1/staff-members/{staff_member_id}/conversations`

Se utilizará para consultar las conversaciones actualmente asignadas a un trabajador.

Esta consulta puede servir para desarrollar posteriormente una vista de trabajo personal.

En esta especificación, su uso principal es permitir la integración con las funcionalidades de personal y facilitar la consulta de conversaciones asignadas.

No crear una página independiente de conversaciones por trabajador dentro de esta especificación.

No inventar filtros o parámetros que no estén definidos en el contrato.

## 12. Servicio de asignaciones

Crear un servicio dentro de:

`frontend/src/modules/conversations/services/`

Responsable de:

- Consultar asignaciones de una conversación.
- Asignar un trabajador.
- Transferir una conversación.
- Finalizar una asignación.
- Consultar conversaciones de un trabajador.

El servicio debe utilizar el cliente HTTP compartido del proyecto.

Respetar:

- Interceptores.
- Autenticación existente.
- Manejo centralizado de errores.
- Convenciones de tipos.
- Manejo de respuestas.

No crear un cliente HTTP independiente.

## 13. Tipos TypeScript

Definir los tipos de acuerdo con los contratos reales del backend.

Como referencia:

- `ConversationAssignment`
- `ConversationAssignmentHistory`
- `AssignConversationRequest`
- `ConversationAssignmentFilters`, únicamente si existen filtros reales.

La estructura de respuesta debe coincidir con el backend.

No utilizar `any`.

No agregar propiedades que no estén definidas en los contratos.

## 14. Estados de interfaz

La funcionalidad debe contemplar:

- Cargando asignaciones.
- Conversación sin asignación.
- Conversación con asignación activa.
- Historial vacío.
- Historial con asignaciones anteriores.
- Error al consultar asignaciones.
- Cargando trabajadores.
- Trabajadores disponibles.
- Error al cargar trabajadores.
- Asignación en proceso.
- Asignación exitosa.
- Transferencia en proceso.
- Transferencia exitosa.
- Error de transferencia.
- Finalización en proceso.
- Finalización exitosa.
- Error al finalizar.
- Conversación cerrada.
- Trabajador no elegible.
- Conflicto por asignación concurrente.

Utilizar los componentes existentes de alertas, notificaciones, confirmación y carga.

## 15. Integración con las SPEC 19 y 20

### 15.1. SPEC 19 — Conversaciones

La SPEC 19 administra:

- Listado.
- Búsqueda.
- Filtros.
- Creación.
- Consulta.
- Cierre.
- Reapertura.

La asignación se integra en la conversación seleccionada.

No duplicar la gestión del estado de conversación.

### 15.2. SPEC 20 — Mensajes

La SPEC 20 administra:

- Historial de mensajes.
- Visualización.
- Envío.
- Estados de entrega.

La SPEC 21 debe permitir identificar quién está atendiendo la conversación.

No modificar el contenido de mensajes ni sus estados de entrega.

La asignación no implica que el trabajador sea el remitente de todos los mensajes.

El remitente se determina mediante `sender_type` y las reglas de backend.

### 15.3. Integración visual final

La pantalla de chat debe quedar integrada de la siguiente manera:

- Panel izquierdo: listado de conversaciones, búsqueda y filtros.
- Panel central: encabezado, historial y compositor de mensajes.
- Panel derecho: información de la persona, trabajador asignado e historial de asignaciones.

La información de asignación puede mostrarse en el encabezado si el diseño responsive lo requiere.

No crear páginas independientes para asignaciones.

## 16. Seguridad y restricciones

- No asumir que una asignación otorga autorización para leer conversaciones.
- No implementar reglas de autorización que backend todavía no soporte.
- No permitir asignar trabajadores inexistentes.
- No permitir seleccionar intencionalmente trabajadores no elegibles.
- No permitir asignar conversaciones cerradas.
- No modificar fechas de asignación desde frontend.
- No eliminar asignaciones históricas.
- No modificar mensajes.
- No finalizar una asignación para transferirla mediante dos operaciones separadas.
- No ejecutar operaciones de asignación automáticamente al abrir una conversación.
- Respetar las respuestas de conflicto de backend.

La autorización efectiva de acceso a conversaciones deberá implementarse en el backend cuando corresponda.

## 17. Pruebas frontend

Implementar pruebas para verificar:

### Consulta

- Carga de asignaciones.
- Identificación de la asignación activa.
- Visualización del historial.
- Identificación de asignaciones finalizadas.
- Conversación sin asignación.
- Manejo de errores.

### Selección de trabajadores

- Carga de personal.
- Selección de trabajador elegible.
- Exclusión de trabajadores que se identifican como no elegibles.
- Manejo de información incompleta.
- Manejo de errores del backend.

### Asignación

- Asignación inicial.
- Actualización del trabajador asignado.
- Manejo de respuesta `201`.
- Manejo de respuesta idempotente `200`.
- Rechazo de trabajador no elegible.
- Rechazo de conversación cerrada.
- Manejo de conflictos.

### Transferencia

- Selección de nuevo trabajador.
- Confirmación.
- Ejecución mediante una sola operación.
- Actualización del historial.
- Conservación de la asignación anterior.
- Manejo de errores.
- Recuperación del estado real después de un conflicto.

### Finalización

- Finalización de asignación activa.
- Actualización de la interfaz.
- Conversación sin asignación.
- Conservación del historial.
- Manejo de asignación inexistente o ya finalizada.

### Ciclo de vida

- Cierre automático de asignación reflejado al cerrar conversación.
- Reapertura sin asignación automática.
- Nueva asignación después de reabrir.
- Historial conservado.

## 18. Criterios de aceptación

La implementación se considerará correcta cuando:

1. La información de asignación se muestre dentro de la interfaz principal de conversaciones.
2. Se pueda identificar al trabajador actualmente asignado.
3. Se pueda consultar el historial de asignaciones.
4. Se pueda asignar una conversación abierta a un trabajador elegible.
5. Se pueda transferir una conversación mediante una única operación backend.
6. Se pueda finalizar una asignación sin cerrar la conversación.
7. Se respete la idempotencia de asignaciones al mismo trabajador.
8. Se respeten las restricciones de elegibilidad del personal.
9. No se permitan nuevas asignaciones para conversaciones cerradas.
10. Se refleje correctamente el cierre automático de asignaciones.
11. La reapertura de una conversación no asigne automáticamente al último trabajador.
12. Se conserve el historial de asignaciones.
13. No se creen páginas independientes para asignaciones.
14. No se duplique la administración del personal.
15. Se utilicen exclusivamente los endpoints y contratos disponibles.
16. Se respeten las reglas de backend sobre atomicidad y unicidad.
17. No se confunda el estado de asignación con el estado de conversación.
18. La funcionalidad quede integrada con las SPEC 19 y 20.
19. Se respete la arquitectura existente del frontend.
20. Se reutilicen los componentes compartidos disponibles.

## 19. Fuera de alcance

Esta especificación no contempla:

- Crear trabajadores.
- Editar trabajadores.
- Administrar personas.
- Administrar roles o permisos.
- Definir autorizaciones de lectura de conversaciones.
- Implementar colas automáticas de asignación.
- Implementar asignación automática por disponibilidad.
- Implementar distribución por especialidad.
- Implementar asignación por carga de trabajo.
- Implementar métricas de rendimiento de trabajadores.
- Implementar SLA o tiempos de atención.
- Implementar notificaciones push.
- Implementar WhatsApp Business Platform.
- Implementar webhooks.
- Modificar mensajes.
- Gestionar estados de entrega.
- Crear una página independiente de asignaciones.

Estas funcionalidades podrán incorporarse mediante especificaciones específicas cuando exista un contrato funcional y técnico definido.

## 20. Documentación relacionada

- `specs/00-frontend-navigation-routing.md`
- `specs/08-staff.md`
- `specs/19-conversations.md`
- `specs/20-messages.md`
- `specs/21-conversation-assignments.md`

La SPEC 21 complementa las SPEC 19 y 20 incorporando la asignación y transferencia de trabajadores dentro de la misma experiencia de chat.

**Regla fundamental:** la SPEC 19 administra las conversaciones, la SPEC 20 administra los mensajes y la SPEC 21 administra las asignaciones. Las tres forman un único módulo funcional de atención dentro de la plataforma.