# SPEC 20 — Gestión de mensajes (Frontend)

## 1. Objetivo

Ampliar el módulo `conversations` definido en la SPEC 19, incorporando la visualización y gestión de mensajes dentro de la interfaz principal del chat.

La experiencia debe ser visualmente similar a WhatsApp Web, permitiendo al personal consultar el historial de mensajes de una conversación y registrar mensajes salientes desde la plataforma.

Esta especificación contempla:

- Consulta del historial de mensajes.
- Visualización de mensajes entrantes y salientes.
- Identificación del remitente.
- Diferenciación visual según dirección y tipo de remitente.
- Envío de mensajes salientes internos.
- Visualización de estados de entrega.
- Consulta de un mensaje individual.
- Manejo de errores durante el envío.
- Actualización del historial después de registrar un mensaje.
- Preparación de la interfaz para una futura integración con WhatsApp.

Los mensajes pertenecen a una conversación y deben conservar su historial.

No se permite modificar ni eliminar el contenido de mensajes históricos.

## 2. Dependencias

Esta especificación depende de:

- SPEC 19 — Gestión de conversaciones (Frontend).
- SPEC 19 — Entidad Conversation (Backend).
- SPEC 20 — Entidad Message (Backend).

También se relaciona con:

- SPEC 21 — Asignación de conversaciones (Frontend), que incorporará la información del trabajador responsable dentro de la misma interfaz.

La funcionalidad debe integrarse en el módulo existente:

`frontend/src/modules/conversations/`

No crear un módulo independiente `messages`.

La gestión de conversaciones, mensajes y asignaciones debe permanecer dentro de una misma experiencia de chat.

## 3. Organización del módulo

Los componentes y servicios específicos de mensajes deben pertenecer a:

`frontend/src/modules/conversations/`

Organización referencial:

```text
frontend/src/modules/conversations/
├── components/
│   ├── message-list/
│   ├── message-bubble/
│   ├── message-composer/
│   ├── message-status/
│   └── message-date-separator/
├── services/
│   └── message-service.ts
├── hooks/
├── types/
└── ...
```

La estructura es referencial y debe adaptarse a las convenciones existentes.

No crear carpetas vacías.

No duplicar componentes compartidos de formularios, botones, indicadores, modales o notificaciones.

Los componentes de mensajes deben ser reutilizables dentro de la pantalla de chat definida en la SPEC 19.

## 4. Integración con la interfaz de conversaciones

Los mensajes deben visualizarse en el panel central de la pantalla definida en la SPEC 19.

La interfaz tendrá tres zonas funcionales:

### 4.1. Encabezado de conversación

Se mantiene el encabezado de la SPEC 19.

Debe mostrar:

- Nombre de la persona.
- Canal de comunicación.
- Estado de la conversación.
- Información general disponible.

La gestión de asignaciones se incorporará mediante la SPEC 21.

### 4.2. Historial de mensajes

Debe ocupar el área central de la conversación.

Contendrá:

- Mensajes entrantes.
- Mensajes salientes.
- Fecha y hora de cada mensaje.
- Identificación del remitente.
- Estado de entrega de mensajes salientes.
- Separadores de fecha cuando corresponda.

### 4.3. Compositor de mensajes

Debe ubicarse en la parte inferior del historial.

Permitirá:

- Escribir mensajes de texto.
- Enviar mensajes salientes.
- Mostrar el estado de envío.
- Informar errores.
- Limpiar el campo después de un envío exitoso.

No incorporar botones de archivos, imágenes, audios o documentos hasta que exista soporte backend para multimedia.

## 5. Consulta del historial de mensajes

Endpoint:

`GET /api/v1/conversations/{conversation_id}/messages`

Se utilizará para recuperar los mensajes de una conversación.

### 5.1. Información requerida

Utilizar los campos disponibles en la respuesta del backend:

- `id`
- `conversation_id`
- `direction`
- `sender_type`
- `content`
- `message_type`
- `sent_at`
- `delivery_status`
- `external_message_id`, cuando corresponda.
- `created_at`
- `updated_at`

No asumir campos adicionales.

### 5.2. Comportamiento

Cuando el usuario seleccione una conversación:

1. Recuperar los datos de la conversación mediante el flujo definido en SPEC 19.
2. Consultar sus mensajes.
3. Mostrar el historial correspondiente.
4. Diferenciar mensajes entrantes y salientes.
5. Mantener el compositor disponible cuando el estado de la conversación lo permita.

Al cambiar de conversación, se debe limpiar o sustituir el historial anterior para evitar mostrar mensajes pertenecientes a otra persona.

No mezclar mensajes de conversaciones diferentes.

### 5.3. Orden del historial

Los mensajes deben presentarse en orden cronológico, del más antiguo al más reciente.

Utilizar el orden proporcionado por backend si su contrato lo garantiza.

Si backend no garantiza el orden, ordenar mediante los campos temporales disponibles, utilizando una regla consistente.

No utilizar el identificador como sustituto de la fecha de envío cuando exista información temporal válida.

### 5.4. Paginación

La documentación actual no define parámetros de paginación para el endpoint de mensajes.

Por tanto:

- No inventar parámetros `page`, `page_size`, `limit`, `offset` o cursores.
- Utilizar el contrato actual.
- Si posteriormente se incorpora paginación, actualizar esta especificación con los parámetros reales.
- Preparar la estructura visual para permitir cargar mensajes anteriores sin modificar la experiencia principal.

No implementar paginación ficticia en el frontend.

## 6. Representación visual de mensajes

Cada mensaje debe mostrarse mediante un componente visual reutilizable.

La apariencia debe inspirarse en WhatsApp Web, sin copiar obligatoriamente su interfaz exacta.

### 6.1. Mensajes entrantes

Los mensajes con:

`direction = inbound`

Deben representarse visualmente como mensajes recibidos.

Características:

- Alineación hacia la izquierda.
- Fondo diferenciado del mensaje propio.
- Contenido del mensaje.
- Hora disponible.
- Identificación del remitente cuando sea necesario.

El remitente esperado para los mensajes entrantes es:

`sender_type = person`

### 6.2. Mensajes salientes

Los mensajes con:

`direction = outbound`

Deben representarse visualmente como mensajes enviados desde la plataforma.

Características:

- Alineación hacia la derecha.
- Fondo visual diferenciado.
- Contenido del mensaje.
- Hora disponible.
- Indicador de estado de entrega.
- Identificación del remitente cuando sea necesario.

El remitente puede ser:

- `staff`: mensaje enviado por personal.
- `ai`: mensaje generado por inteligencia artificial.

No asumir que todos los mensajes salientes pertenecen al trabajador autenticado.

### 6.3. Identificación del remitente

La interfaz debe distinguir:

- Persona.
- Personal.
- Inteligencia artificial.

Utilizar etiquetas, iconos o indicadores discretos cuando aporten información útil.

No inventar nombres de trabajadores ni identidades de agentes de IA.

Si el backend no proporciona el nombre del remitente, mostrar únicamente su tipo.

### 6.4. Tipo de mensaje

El backend actualmente soporta:

`message_type = text`

El frontend debe mostrar el contenido como texto.

No implementar representación de imágenes, audios, videos, documentos, ubicaciones o contactos.

No asumir que `content` contiene una URL o referencia a archivos.

## 7. Fecha y hora de los mensajes

Los mensajes incluyen campos temporales:

- `sent_at`
- `created_at`
- `updated_at`

Reglas:

- Utilizar `sent_at` para mostrar la hora efectiva de envío cuando exista.
- Si `sent_at` es `NULL`, utilizar `created_at` como referencia temporal de registro, identificando correctamente que el mensaje aún no tiene confirmación de envío.
- No mostrar `updated_at` como hora de envío.
- Mostrar separadores de fecha cuando los mensajes correspondan a días diferentes.
- Formatear las fechas según las convenciones regionales del proyecto.

Las fechas recibidas desde backend están almacenadas en UTC.

El frontend debe convertirlas a la zona horaria local configurada en la aplicación para su visualización.

No modificar los valores originales enviados por backend.

## 8. Envío de mensajes

Endpoint:

`POST /api/v1/conversations/{conversation_id}/messages`

Este endpoint registra mensajes salientes internos.

No realiza por sí mismo el envío a WhatsApp.

### 8.1. Flujo de envío

1. El usuario abre una conversación.
2. Escribe un mensaje en el compositor.
3. El frontend valida el contenido.
4. El usuario ejecuta la acción de enviar.
5. El frontend realiza la solicitud al backend.
6. Backend registra el mensaje.
7. El frontend recibe la respuesta.
8. El mensaje se incorpora al historial.
9. El compositor se limpia después de una respuesta exitosa.

El mensaje debe enviarse únicamente cuando el usuario ejecute explícitamente la acción correspondiente.

### 8.2. Datos enviados

El backend determina:

- `direction = outbound`
- `message_type = text`
- `delivery_status = queued`
- `sent_at = NULL`

El frontend debe enviar únicamente los campos permitidos por el esquema de creación, correspondientes al contenido y al tipo de remitente.

Para esta implementación:

- `content`: texto del mensaje.
- `sender_type`: `staff` o `ai`, según el contexto autorizado por la aplicación.

No enviar:

- `direction`
- `delivery_status`
- `sent_at`
- `external_message_id`
- `created_at`
- `updated_at`

Estos campos son responsabilidad del backend.

No permitir que el usuario seleccione arbitrariamente un remitente de tipo `person`.

La identidad y el tipo de remitente deben respetar las reglas de autenticación y autorización del backend.

### 8.3. Validaciones del compositor

El contenido debe cumplir las reglas del backend:

- No estar vacío.
- No contener únicamente espacios.
- Tener un máximo de 4096 caracteres.
- No permitir contenido superior al límite.
- Aplicar `trim` para validar contenido vacío, sin alterar innecesariamente el texto escrito.

Deshabilitar el envío mientras se procesa una solicitud para evitar duplicaciones accidentales.

El envío mediante Enter debe seguir una convención coherente:

- Enter: enviar.
- Shift + Enter: insertar salto de línea.

Si el proyecto utiliza otra convención global, respetarla.

### 8.4. Mensaje registrado

Después de recibir una respuesta exitosa:

- Incorporar el mensaje al historial.
- Mostrar el contenido registrado.
- Mostrar el remitente.
- Mostrar su estado inicial `queued`.
- Mantener la conversación seleccionada.

No simular que el mensaje fue enviado, entregado o leído por WhatsApp.

### 8.5. Errores de envío

Si falla la solicitud:

- No limpiar el compositor.
- Conservar el contenido escrito.
- Informar el error.
- Permitir reintentar.
- Evitar duplicaciones por múltiples clics.
- No agregar un mensaje confirmado al historial cuando backend no lo haya registrado.

Si existe incertidumbre sobre el resultado de una solicitud por pérdida de conexión, consultar nuevamente el historial antes de reintentar, para evitar duplicaciones.

No asumir que una solicitud fallida en el frontend significa que backend no llegó a registrar el mensaje.

## 9. Estados de entrega

El backend establece los estados:

- `queued`
- `sent`
- `delivered`
- `read`
- `failed`

El frontend debe representar estos estados visualmente.

### 9.1. queued

El mensaje fue registrado y está pendiente de envío.

Mostrar un indicador discreto de pendiente.

No afirmar que el mensaje llegó al destinatario.

### 9.2. sent

El proveedor confirmó el envío.

Mostrar el indicador correspondiente.

### 9.3. delivered

El proveedor confirmó la entrega.

Mostrar un indicador visual diferenciado.

### 9.4. read

El proveedor confirmó la lectura, cuando el canal proporcione esta información.

Mostrar el indicador de lectura.

No asumir que todos los canales ofrecen confirmaciones de lectura.

### 9.5. failed

El envío falló.

Mostrar un indicador de error y un mensaje informativo.

No presentar un mensaje fallido como entregado.

### 9.6. Transiciones

Respetar las transiciones definidas por backend:

- `queued` → `sent` o `failed`.
- `sent` → `delivered` o `failed`.
- `delivered` → `read`.

Los eventos duplicados, atrasados o inválidos son gestionados por backend.

El frontend debe mostrar el estado recibido y no implementar una máquina de estados independiente que contradiga el contrato.

Los mensajes entrantes utilizan:

`delivery_status = received`

No deben representarse como mensajes pendientes de envío.

## 10. Consulta individual de mensajes

Endpoint:

`GET /api/v1/conversations/{conversation_id}/messages/{message_id}`

Se utilizará cuando sea necesario recuperar o actualizar información de un mensaje individual.

No es necesario realizar esta consulta para cada mensaje si el historial ya contiene todos sus datos.

La consulta debe respetar la conversación indicada.

No permitir que el identificador de un mensaje de otra conversación se utilice para mostrar información incorrecta.

## 11. Actualización del estado de entrega

Endpoint:

`PATCH /api/v1/messages/{message_id}/delivery-status`

El backend dispone de este endpoint para actualizar estados desde resultados del proveedor o webhooks autenticados.

En esta fase:

- El frontend no debe actualizar arbitrariamente los estados.
- No debe permitir que el usuario marque un mensaje como enviado, entregado o leído.
- No debe enviar actualizaciones simuladas.
- Debe reflejar el estado obtenido desde backend.

Los cambios de estado producidos por una futura integración con WhatsApp deberán llegar a la interfaz mediante una consulta de actualización o un mecanismo de tiempo real definido posteriormente.

El endpoint no debe utilizarse como acción manual del personal.

## 12. Comportamiento según el estado de la conversación

La posibilidad de enviar mensajes debe depender del estado de la conversación.

### Conversación abierta

Cuando:

`status = open`

Permitir utilizar el compositor, siempre que el backend autorice la operación.

### Conversación cerrada

Cuando:

`status = closed`

- Mostrar el historial en modo de solo lectura.
- Deshabilitar el compositor.
- No permitir registrar nuevos mensajes.
- Informar que la conversación está cerrada.

La reapertura corresponde a la SPEC 19.

Una vez reabierta, el compositor podrá habilitarse nuevamente si backend lo permite.

No cerrar automáticamente una conversación cuando se envía un mensaje.

No modificar el estado de la conversación desde el módulo de mensajes.

## 13. Actualización del historial

Actualmente no existe un mecanismo de tiempo real definido en backend.

Por tanto, el frontend debe trabajar inicialmente con los endpoints REST disponibles.

Comportamiento esperado:

- Consultar mensajes al abrir una conversación.
- Actualizar el historial después de enviar un mensaje.
- Permitir actualizar la información cuando el usuario lo solicite.
- Evitar consultas innecesarias.
- Evitar mezclar mensajes de conversaciones diferentes.
- Mantener la posición de desplazamiento cuando se agreguen mensajes nuevos.

No asumir que existen WebSocket, SSE, notificaciones push o eventos en tiempo real.

La arquitectura debe quedar preparada para incorporar un mecanismo de actualización instantánea posteriormente.

No implementar una conexión ficticia con WhatsApp.

## 14. Desplazamiento y experiencia de chat

La experiencia debe comportarse de manera similar a una aplicación de mensajería.

Se debe contemplar:

- Desplazamiento vertical del historial.
- Mantener la vista en el mensaje más reciente al abrir una conversación.
- Desplazarse al último mensaje después de enviar uno nuevo.
- No forzar el desplazamiento si el usuario está revisando mensajes anteriores.
- Separadores de fecha.
- Mensajes entrantes y salientes diferenciados.
- Indicadores de envío.
- Compositor fijo en la parte inferior del panel.
- Diseño adaptable a pantallas pequeñas.

Si posteriormente se implementa paginación, se debe permitir cargar mensajes anteriores sin perder la posición de lectura.

No implementar funcionalidades que dependan de datos que backend todavía no proporciona.

## 15. Seguridad y tratamiento del contenido

- Renderizar el contenido como texto seguro.
- No interpretar contenido recibido como HTML ejecutable.
- Evitar inyección de HTML o scripts.
- No almacenar credenciales o tokens en el contenido.
- No permitir editar mensajes históricos.
- No permitir eliminar mensajes desde la interfaz.
- No permitir crear mensajes entrantes manualmente.
- No permitir falsificar el remitente.
- Respetar las restricciones de autorización del backend.
- No mostrar información personal innecesaria.

El contenido debe presentarse respetando las reglas de seguridad de React y los componentes existentes.

## 16. Integración con las demás especificaciones

### 16.1. SPEC 19 — Conversaciones

La SPEC 19 administra:

- Listado.
- Búsqueda.
- Filtros.
- Creación.
- Consulta.
- Cierre.
- Reapertura.

La SPEC 20 utiliza la conversación seleccionada para recuperar y registrar mensajes.

No duplicar la gestión del ciclo de vida de conversaciones.

### 16.2. SPEC 21 — Asignaciones

La SPEC 21 administra:

- Trabajador asignado.
- Asignación inicial.
- Transferencia.
- Finalización.
- Historial de asignaciones.

La información del trabajador podrá mostrarse en el encabezado o panel complementario.

No implementar asignaciones desde esta especificación.

### 16.3. Integración visual

La SPEC 20 no debe crear páginas independientes.

Los mensajes deben visualizarse en el panel central de la interfaz principal de conversaciones.

El compositor debe formar parte de la misma pantalla.

## 17. Estados de interfaz

La funcionalidad debe contemplar:

- Cargando historial.
- Historial vacío.
- Error al cargar mensajes.
- Mensaje recibido.
- Mensaje enviado.
- Mensaje pendiente.
- Mensaje entregado.
- Mensaje leído.
- Mensaje fallido.
- Enviando mensaje.
- Error al enviar.
- Reintento de envío.
- Contenido vacío.
- Contenido demasiado extenso.
- Conversación cerrada.
- Compositor deshabilitado.
- Conversación sin selección.
- Error al consultar un mensaje individual.

Utilizar los componentes de estados, alertas, indicadores y notificaciones existentes en el proyecto.

## 18. Pruebas frontend

Implementar pruebas para verificar:

### Historial

- Consulta de mensajes de una conversación.
- Visualización cronológica.
- Diferenciación de mensajes entrantes y salientes.
- Diferenciación de remitentes.
- Visualización de fechas y horas.
- Estado vacío.
- Manejo de errores.
- Limpieza del historial al cambiar de conversación.

### Envío

- Envío de mensaje válido.
- Validación de contenido vacío.
- Validación de longitud máxima.
- Envío con Enter.
- Salto de línea con Shift + Enter.
- Estado de carga.
- Prevención de doble envío.
- Incorporación del mensaje registrado.
- Conservación del contenido ante errores.
- Manejo de solicitudes con resultado incierto.

### Estados de entrega

- Visualización de `queued`.
- Visualización de `sent`.
- Visualización de `delivered`.
- Visualización de `read`.
- Visualización de `failed`.
- Visualización de `received`.
- No simular cambios de estado.

### Estado de conversación

- Envío permitido en conversación abierta.
- Compositor deshabilitado en conversación cerrada.
- Historial visible en conversación cerrada.
- Habilitación después de reabrir cuando backend lo permita.

### Seguridad

- Contenido presentado como texto seguro.
- No permitir HTML ejecutable.
- No permitir mensajes entrantes manuales.
- No permitir modificar contenido histórico.
- No permitir cambiar estados de entrega manualmente.

## 19. Criterios de aceptación

La implementación se considerará correcta cuando:

1. Los mensajes se visualicen dentro del panel central de la interfaz definida en SPEC 19.
2. Se pueda consultar el historial de una conversación.
3. Los mensajes entrantes y salientes tengan representaciones diferenciadas.
4. Se identifique correctamente el tipo de remitente.
5. Se visualicen las fechas y horas correspondientes.
6. Se puedan registrar mensajes salientes internos.
7. Se respeten las validaciones de contenido del backend.
8. El frontend no envíe campos administrados por backend.
9. Los mensajes registrados aparezcan en el historial.
10. Se representen correctamente los estados de entrega.
11. No se simulen confirmaciones de envío, entrega o lectura.
12. Los mensajes históricos no puedan editarse ni eliminarse.
13. No se puedan crear mensajes entrantes manualmente.
14. El compositor se deshabilite cuando la conversación esté cerrada.
15. Se mantenga visible el historial de conversaciones cerradas.
16. Se respete la seguridad del contenido mostrado.
17. No se creen páginas independientes para mensajes.
18. Se reutilicen los componentes y convenciones existentes.
19. La funcionalidad quede preparada para una futura integración de tiempo real.
20. No se implemente todavía la conexión real con WhatsApp.

## 20. Fuera de alcance

Esta especificación no contempla:

- Integración con WhatsApp Business Platform.
- Envío real mediante proveedores externos.
- Webhooks de entrada.
- Recepción real de mensajes externos.
- Validación de firmas de proveedores.
- Gestión de credenciales de WhatsApp.
- Archivos multimedia.
- Imágenes.
- Audios.
- Videos.
- Documentos.
- Ubicaciones.
- Mensajes interactivos.
- Plantillas de WhatsApp.
- Indicadores de escritura.
- Notificaciones push.
- WebSocket o SSE.
- Inteligencia artificial.
- Respuestas automáticas.
- Edición de mensajes.
- Eliminación de mensajes.
- Asignación de trabajadores.
- Transferencia de conversaciones.

Estas funcionalidades deberán incorporarse mediante especificaciones específicas cuando exista soporte backend.

## 21. Documentación relacionada

- `specs/00-frontend-navigation-routing.md`
- `specs/19-conversations.md`
- `specs/20-messages.md`
- `specs/21-conversation-assignments.md`

La SPEC 20 complementa la SPEC 19 incorporando la gestión visual y funcional de mensajes dentro de la misma pantalla.

**Regla fundamental:** la SPEC 19 administra las conversaciones; la SPEC 20 administra los mensajes de esas conversaciones. Ambas deben formar una única experiencia de chat, sin páginas o módulos independientes.