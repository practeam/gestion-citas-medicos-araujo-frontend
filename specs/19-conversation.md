# SPEC 19 — Gestión de conversaciones 

## 1. Objetivo

Implementar la interfaz principal de gestión de conversaciones dentro de la plataforma de gestión odontológica, con una experiencia visual y funcional inspirada en WhatsApp Web.

El módulo permitirá al personal de la clínica visualizar, buscar, filtrar, abrir, crear, cerrar y reabrir conversaciones con personas a través de los canales de comunicación habilitados.

Esta especificación contempla exclusivamente la gestión de conversaciones y su ciclo de vida.

La gestión detallada de mensajes y las asignaciones de personal se desarrollarán en:

- SPEC 20 — Gestión de mensajes (Frontend).
- SPEC 21 — Asignación de conversaciones (Frontend).

Estas funcionalidades deberán integrarse posteriormente en la misma interfaz de chat, sin crear módulos o pantallas independientes innecesarias.

## 2. Alcance funcional

El módulo debe permitir:

- Visualizar el listado de conversaciones.
- Buscar conversaciones.
- Filtrar por persona, canal y estado.
- Consultar conversaciones de una persona.
- Crear conversaciones desde la plataforma para una persona existente.
- Abrir una conversación y visualizar sus datos generales.
- Cerrar conversaciones.
- Reabrir conversaciones cerradas.
- Identificar el canal de comunicación.
- Mostrar el estado de cada conversación.
- Mostrar información básica de la persona asociada.
- Acceder al historial de una conversación.
- Navegar entre conversaciones sin abandonar la pantalla principal.

La conversación pertenece a `person`, no directamente a `patient`.

Una persona puede tener conversaciones aunque todavía no esté registrada como paciente.

## 3. Organización del módulo

Crear el módulo:

`frontend/src/modules/conversations/`

La funcionalidad debe pertenecer a un único módulo de conversaciones.

Organización referencial:

```text
frontend/src/modules/conversations/
├── components/
│   ├── conversation-list/
│   ├── conversation-search/
│   ├── conversation-filters/
│   ├── conversation-header/
│   └── conversation-status/
├── pages/
│   └── conversations-page.tsx
├── services/
│   └── conversation-service.ts
├── hooks/
├── types/
└── index.ts
```

La estructura es referencial y debe adaptarse a las convenciones existentes del repositorio.

No crear carpetas vacías ni componentes que no sean necesarios.

Los componentes exclusivos de conversaciones deben permanecer dentro del módulo.

Los componentes compartidos deben reutilizarse desde las carpetas existentes del proyecto.

No reorganizar la estructura general del frontend ni trasladar componentes existentes.

## 4. Interfaz principal del chat

La página principal debe ofrecer una experiencia similar a WhatsApp Web.

Se propone una distribución de tres zonas:

### 4.1. Panel izquierdo: listado de conversaciones

Debe ocupar el lateral izquierdo de la interfaz.

Contendrá:

- Encabezado del módulo.
- Campo de búsqueda.
- Filtros de conversaciones.
- Listado de conversaciones.
- Indicadores de estado.
- Identificación de la persona.
- Canal de comunicación.
- Fecha u hora de la última actividad, cuando exista información disponible.
- Acceso a cada conversación.

Cada elemento del listado debe mostrar, cuando la información esté disponible:

- Nombre de la persona.
- Número de documento, si se considera necesario.
- Canal.
- Estado de la conversación.
- Fecha de inicio o última actividad disponible.
- Información del último mensaje, únicamente cuando esté disponible mediante la integración de la SPEC 20.

No inventar información de último mensaje ni asumir que el endpoint de conversaciones devuelve mensajes.

### 4.2. Panel central: área de conversación

Debe ocupar el espacio principal.

Cuando el usuario seleccione una conversación, se mostrará:

- Encabezado con información de la persona.
- Canal de comunicación.
- Estado de la conversación.
- Fecha de inicio.
- Historial de conversación, cuya implementación corresponde a la SPEC 20.
- Área de mensajes, cuya implementación corresponde a la SPEC 20.

En esta primera especificación, el panel debe quedar preparado para integrar los componentes de mensajes.

No implementar todavía el envío ni la recepción de mensajes.

Cuando no exista una conversación seleccionada, mostrar un estado inicial que invite a seleccionar una conversación o crear una nueva.

### 4.3. Panel derecho: información de la conversación

Cuando el espacio disponible lo permita, se debe mostrar un panel de información complementaria.

Podrá incluir:

- Nombre de la persona.
- Documento de identidad, si existe.
- Teléfono, si está disponible.
- Correo electrónico, si está disponible.
- Estado de la persona, si se dispone de esta información.
- Canal de comunicación.
- Fecha de inicio de la conversación.
- Estado de la conversación.

La información personal debe obtenerse de los datos disponibles en la API.

No inventar campos ni realizar consultas adicionales que no estén definidas en los contratos existentes.

La información de asignación del trabajador se incorporará mediante la SPEC 21.

### 4.4. Adaptabilidad

La interfaz debe adaptarse a diferentes tamaños de pantalla.

En escritorio:

- Listado de conversaciones a la izquierda.
- Conversación en el centro.
- Información complementaria a la derecha, cuando corresponda.

En pantallas medianas:

- Mantener el listado y el área de conversación.
- Permitir ocultar el panel de información.

En dispositivos pequeños:

- Mostrar inicialmente el listado.
- Al seleccionar una conversación, mostrar el chat.
- Permitir regresar al listado.
- Mostrar la información complementaria mediante un panel o modal.

Se deben utilizar los mecanismos de diseño responsive existentes en el proyecto.

## 5. Listado de conversaciones

El listado debe consumir:

`GET /api/v1/conversations`

El listado debe permitir consultar las conversaciones existentes y seleccionar una para visualizar su información.

### 5.1. Información mostrada

Utilizar los campos disponibles en la respuesta del backend.

Como mínimo, se necesita identificar:

- `id`
- `person_id`
- `channel`
- `status`
- `started_at`
- `closed_at`
- `created_at`
- `updated_at`

Si el backend devuelve información resumida de la persona, utilizarla directamente.

Si no la devuelve, se debe evaluar el contrato disponible antes de realizar consultas adicionales.

No asumir que existe un objeto `person` dentro de la respuesta si no está definido.

### 5.2. Estados de conversación

Los estados disponibles son:

- `open`
- `closed`

Representarlos visualmente de forma diferenciada.

Por ejemplo:

- Abierta: indicador visual de conversación activa.
- Cerrada: indicador visual de conversación finalizada.

No agregar estados como `pending_human`, `assigned`, `waiting` o similares porque no forman parte del contrato actual.

La asignación de trabajadores no determina el estado de la conversación.

### 5.3. Canales

El backend actualmente habilita:

- `whatsapp`

El frontend debe representar el canal de manera visual y legible.

La implementación debe permitir incorporar canales adicionales en el futuro sin rediseñar la lógica principal del módulo.

No mostrar canales que no estén habilitados por backend.

### 5.4. Ordenamiento

El orden del listado debe utilizar el comportamiento definido por el backend.

Si el backend no proporciona parámetros de ordenamiento, no inventar parámetros de consulta.

Se puede utilizar el orden recibido para presentar las conversaciones.

No asumir que `updated_at` representa la fecha del último mensaje.

## 6. Búsqueda y filtros

El listado debe permitir localizar conversaciones.

Los filtros deben corresponder a los parámetros reales del endpoint.

### 6.1. Filtros disponibles

- Persona (`person_id`).
- Canal (`channel`).
- Estado (`status`).
- Rango temporal, cuando esté soportado por el contrato del backend.

La búsqueda por persona debe permitir seleccionar una persona existente mediante un mecanismo de búsqueda apropiado.

No implementar filtros que el backend no soporte.

### 6.2. Búsqueda por persona

La conversación pertenece a `person`.

Se debe utilizar la información de personas disponible en el proyecto para permitir identificar a la persona correspondiente.

No limitar la búsqueda únicamente a pacientes.

Una persona puede tener una conversación sin tener un registro en `patient`.

### 6.3. Comportamiento de filtros

- Permitir combinar filtros cuando el backend lo admita.
- Permitir limpiar filtros.
- Actualizar el listado cuando cambien los criterios.
- Mantener los filtros mientras el usuario navega entre conversaciones, cuando sea posible.
- Mostrar un estado vacío cuando no existan resultados.
- Mostrar errores cuando falle la consulta.

No realizar búsquedas exclusivamente locales si el conjunto de datos está paginado en backend.

## 7. Creación de conversaciones

Se permitirá crear conversaciones desde la plataforma para usos internos autorizados.

Endpoint:

`POST /api/v1/conversations`

La creación debe realizarse seleccionando una persona existente.

### 7.1. Flujo de creación

1. El usuario selecciona la opción para crear una conversación.
2. Se abre un modal o formulario integrado.
3. Se busca y selecciona una persona existente.
4. Se selecciona un canal habilitado.
5. Se confirma la creación.
6. El frontend envía la solicitud al backend.
7. Se obtiene la conversación creada.
8. Se actualiza el listado.
9. Se abre la conversación creada.

### 7.2. Campos

Utilizar únicamente los campos permitidos por el contrato de creación.

La información mínima necesaria es:

- `person_id`
- `channel`

El estado inicial debe ser determinado por backend según su contrato.

No enviar:

- `started_at`
- `closed_at`
- `created_at`
- `updated_at`

Estas fechas son administradas por backend.

No permitir seleccionar arbitrariamente un estado inicial si el contrato no lo contempla.

### 7.3. Selección de persona

Se debe permitir seleccionar personas existentes.

No crear automáticamente una persona desde el formulario de conversaciones.

La creación de personas corresponde al módulo `persons`.

No exigir que la persona tenga un registro de paciente.

### 7.4. Canales disponibles

El selector debe mostrar únicamente los canales habilitados.

Actualmente:

- WhatsApp.

La creación de una conversación con canal WhatsApp no significa que exista una conexión real con WhatsApp.

En esta etapa se trata de una conversación interna registrada en la plataforma.

No realizar llamadas a proveedores externos.

### 7.5. Manejo de errores

Contemplar:

- Persona inexistente.
- Canal inválido.
- Datos incompletos.
- Error de validación.
- Error de comunicación con backend.

Mostrar mensajes comprensibles para el usuario.

No crear conversaciones duplicadas automáticamente como mecanismo de reintento.

## 8. Consulta de una conversación

Endpoint:

`GET /api/v1/conversations/{conversation_id}`

Se debe utilizar para recuperar la información de una conversación seleccionada.

El detalle debe mostrar:

- Identificador.
- Persona asociada.
- Canal.
- Estado.
- Fecha de inicio.
- Fecha de cierre, cuando exista.
- Fechas de creación y actualización, cuando corresponda.

El frontend debe respetar los datos devueltos por backend.

Si una conversación no existe, mostrar el estado correspondiente y regresar al listado cuando sea necesario.

No utilizar datos de otra conversación para completar la información.

## 9. Cierre de conversaciones

Endpoint:

`PATCH /api/v1/conversations/{conversation_id}/status`

Se debe permitir cerrar una conversación abierta.

El cambio debe realizarse mediante el contrato definido por backend.

### 9.1. Comportamiento

Cuando el usuario seleccione cerrar conversación:

1. Mostrar una confirmación.
2. Ejecutar la solicitud de actualización de estado.
3. Actualizar los datos de la conversación.
4. Reflejar el estado cerrado en el listado.
5. Actualizar el encabezado de la conversación.

El backend se encarga de:

- Cambiar `status` a `closed`.
- Establecer `closed_at`.
- Terminar la asignación activa en la misma transacción.
- Conservar todos los mensajes.
- Conservar el historial de asignaciones.

El frontend no debe ejecutar operaciones independientes para terminar la asignación al cerrar una conversación.

Esta responsabilidad corresponde al backend.

### 9.2. Restricciones

- No permitir cerrar una conversación que ya esté cerrada como una operación diferente.
- Repetir el mismo estado no debe provocar efectos secundarios.
- No eliminar conversaciones.
- No eliminar mensajes.
- No eliminar asignaciones históricas.

## 10. Reapertura de conversaciones

Endpoint:

`PATCH /api/v1/conversations/{conversation_id}/status`

Se debe permitir reabrir una conversación cerrada.

La reapertura debe realizarse explícitamente mediante la acción correspondiente.

### 10.1. Comportamiento

1. El usuario selecciona reabrir conversación.
2. Se solicita confirmación cuando corresponda.
3. Se ejecuta la actualización de estado.
4. Se actualiza la conversación en pantalla.
5. Se refleja el estado `open`.

El backend se encarga de:

- Cambiar `status` a `open`.
- Limpiar `closed_at`, según la regla ya establecida.
- Conservar los mensajes anteriores.
- Conservar el historial de asignaciones.

La reapertura no implica asignar automáticamente un trabajador.

La asignación se gestiona mediante la SPEC 21.

## 11. Integración con la API

Todos los endpoints utilizan el prefijo:

`/api/v1`

Endpoints correspondientes a esta especificación:

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/conversations` | Crear conversación. |
| GET | `/conversations` | Listar y filtrar conversaciones. |
| GET | `/conversations/{conversation_id}` | Consultar conversación. |
| PATCH | `/conversations/{conversation_id}/status` | Cerrar o reabrir conversación. |
| GET | `/persons/{person_id}/conversations` | Consultar conversaciones de una persona. |

### 11.1. Servicio

Crear un servicio de conversaciones dentro del módulo.

Debe centralizar:

- Listado.
- Consulta por identificador.
- Creación.
- Actualización de estado.
- Consulta por persona.

Respetar el cliente HTTP, autenticación, interceptores, manejo de errores y convenciones existentes del proyecto.

No crear un segundo cliente HTTP si ya existe uno compartido.

### 11.2. Tipos

Definir los tipos TypeScript a partir de los contratos reales del backend.

Como referencia conceptual:

- `Conversation`
- `ConversationStatus`
- `ConversationChannel`
- `ConversationFilters`
- `CreateConversationRequest`

Los valores de dominio deben coincidir con backend.

No incluir campos que no existan en las respuestas.

No utilizar tipos `any` para evitar definir contratos.

## 12. Integración con las SPEC 20 y 21

Esta especificación constituye la base del módulo de conversaciones.

Las siguientes especificaciones ampliarán la misma pantalla.

### 12.1. Integración con SPEC 20 — Mensajes

La SPEC 20 incorporará:

- Consulta del historial de mensajes.
- Visualización de mensajes entrantes y salientes.
- Envío de mensajes internos.
- Compositor de mensajes.
- Estados de entrega.
- Actualización del historial.

Los componentes de mensajes deben integrarse en el panel central de la pantalla definida en esta especificación.

No crear una página independiente para mensajes.

### 12.2. Integración con SPEC 21 — Asignaciones

La SPEC 21 incorporará:

- Visualización del trabajador asignado.
- Asignación inicial.
- Transferencia entre trabajadores.
- Finalización de asignaciones.
- Historial de asignaciones.

Estas funcionalidades deben integrarse en el encabezado o panel de información de la conversación.

No crear una página independiente para administrar las asignaciones.

### 12.3. Responsabilidades independientes

La gestión de conversaciones no debe duplicar la lógica de mensajes ni de asignaciones.

El estado de la conversación es independiente del estado de entrega de sus mensajes y de la existencia de una asignación activa.

## 13. Actualización de datos y tiempo real

Los endpoints documentados actualmente permiten consultar y modificar conversaciones mediante HTTP.

No se ha definido todavía un mecanismo de comunicación en tiempo real.

Por tanto:

- No asumir que existe WebSocket.
- No asumir que existe SSE.
- No simular actualizaciones instantáneas.
- No implementar conexiones a proveedores externos.
- No depender de WhatsApp para visualizar las conversaciones internas.

La interfaz debe permitir actualizar el listado y los datos de la conversación mediante las operaciones disponibles.

Se debe mantener la arquitectura preparada para incorporar posteriormente WebSocket o SSE sin modificar la responsabilidad principal de los componentes.

La implementación de tiempo real deberá definirse mediante una especificación técnica independiente o una ampliación aprobada.

## 14. Estados de interfaz

La página debe contemplar:

- Cargando conversaciones.
- Listado vacío.
- Error al cargar conversaciones.
- Búsqueda sin resultados.
- Filtros sin resultados.
- Conversación seleccionada.
- Cargando detalle.
- Conversación no encontrada.
- Error al consultar detalle.
- Formulario de creación.
- Creación exitosa.
- Error al crear.
- Confirmación de cierre.
- Confirmación de reapertura.
- Actualización de estado en proceso.
- Error al actualizar estado.
- Conversación abierta.
- Conversación cerrada.
- Vista sin conversación seleccionada.

Los estados deben utilizar los componentes y convenciones visuales existentes.

## 15. Pruebas frontend

Implementar pruebas para verificar:

### Listado

- Carga de conversaciones.
- Visualización de datos.
- Identificación de canales.
- Identificación de estados.
- Selección de una conversación.
- Estado vacío.
- Manejo de errores.

### Búsqueda y filtros

- Búsqueda y selección de persona.
- Filtro por canal.
- Filtro por estado.
- Filtros combinados cuando estén soportados.
- Limpieza de filtros.
- Resultados vacíos.

### Creación

- Selección de persona.
- Selección de canal habilitado.
- Creación exitosa.
- Apertura de la conversación creada.
- Manejo de validaciones.
- Manejo de errores.
- No enviar fechas administradas por backend.
- No exigir que la persona sea paciente.

### Consulta

- Recuperación de una conversación.
- Visualización de sus datos.
- Manejo de identificador inexistente.
- Separación correcta entre conversaciones.

### Cierre y reapertura

- Cierre de conversación abierta.
- Reapertura de conversación cerrada.
- Actualización visual del estado.
- Manejo de errores.
- Conservación de la información histórica.
- No ejecutar operaciones adicionales de asignación desde el frontend.

## 16. Navegación y rutas

Agregar una opción de navegación para acceder al módulo de conversaciones.

La ubicación debe corresponder al área funcional de comunicación o atención al cliente, respetando la organización actual del sidebar.

La opción debe configurarse en:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

Registrar la ruta principal en:

`frontend/src/App.tsx`

Ruta propuesta:

`/conversations`

No agregar rutas independientes para mensajes ni asignaciones.

La ruta debe utilizar el layout existente de la aplicación y mantener coherencia con SPEC 00 — Navegación y enrutamiento del frontend.

La conversación seleccionada puede gestionarse mediante estado interno o parámetros de ruta, según las convenciones existentes del router.

No crear rutas adicionales sin una necesidad funcional justificada.

## 17. Seguridad y restricciones

- No almacenar credenciales de WhatsApp en el frontend.
- No realizar llamadas directas a WhatsApp Business Platform.
- No implementar webhooks en el frontend.
- No permitir falsificar mensajes entrantes.
- No enviar mensajes en esta especificación.
- No asumir que el usuario autenticado tiene autorización para consultar todas las conversaciones; la autorización efectiva dependerá de la implementación correspondiente del backend.
- No exponer datos personales innecesarios.
- No modificar mensajes ni asignaciones desde esta especificación.
- No permitir la eliminación física de conversaciones.

## 18. Fuera de alcance

Esta especificación no contempla:

- Integración real con WhatsApp.
- WhatsApp Business Platform o Cloud API.
- Webhooks de proveedores.
- Envío de mensajes.
- Recepción de mensajes.
- Historial visual de mensajes.
- Archivos multimedia.
- Notificaciones de mensajes nuevos.
- Indicadores de escritura.
- Confirmaciones de lectura.
- WebSocket o SSE.
- Inteligencia artificial.
- Respuestas automáticas.
- Gestión de asignaciones.
- Transferencias de trabajadores.
- Administración de pacientes.
- Creación de personas.
- Autorización efectiva de lectura basada en asignaciones.

Estas funcionalidades se desarrollarán en las especificaciones correspondientes.

## 19. Criterios de aceptación

La implementación se considerará correcta cuando:

1. Exista una página principal de conversaciones con una experiencia visual inspirada en WhatsApp Web.
2. Se pueda visualizar el listado de conversaciones.
3. Se pueda buscar y filtrar según los parámetros disponibles en backend.
4. Se pueda identificar a la persona asociada a cada conversación.
5. Se pueda crear una conversación para una persona existente.
6. No sea obligatorio que la persona esté registrada como paciente.
7. Se pueda consultar una conversación.
8. Se pueda cerrar una conversación.
9. Se pueda reabrir una conversación.
10. Se respeten las reglas de `closed_at` establecidas por backend.
11. No se eliminen mensajes ni asignaciones históricas.
12. Se utilicen los endpoints reales definidos.
13. No se inventen parámetros, campos ni estados.
14. La interfaz esté preparada para integrar mensajes y asignaciones.
15. La gestión de mensajes se incorpore mediante SPEC 20 en la misma pantalla.
16. La gestión de asignaciones se incorpore mediante SPEC 21 en la misma pantalla.
17. No se implemente una conexión ficticia con WhatsApp.
18. Se respete la arquitectura existente del frontend.
19. Se reutilicen los componentes compartidos disponibles.
20. La navegación y las rutas sean coherentes con SPEC 00.

## 20. Documentación relacionada

- `specs/00-frontend-navigation-routing.md`
- `specs/19-conversations.md`
- `specs/20-messages.md`
- `specs/21-conversation-assignments.md`

Esta especificación establece la base de la experiencia de chat. Las SPEC 20 y 21 la complementarán sin crear módulos o pantallas independientes.

**Regla fundamental:** la SPEC 19 administra las conversaciones; la SPEC 20 administra sus mensajes; la SPEC 21 administra sus asignaciones. Las tres funcionalidades forman una única experiencia de atención dentro de la plataforma.