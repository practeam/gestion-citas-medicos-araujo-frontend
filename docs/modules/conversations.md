# Módulo `conversations`

Specs: `specs/19-conversation.md` (conversaciones), `specs/20-message.md` (mensajes) y `specs/21-conversation-assignment.md` (asignaciones). Código: `frontend/src/modules/conversations/`. Las tres forman **una sola pantalla de chat** (inspirada en WhatsApp Web) dentro de un único módulo; no hay módulos ni páginas independientes para mensajes o asignaciones.

## Ruta y navegación

| Ruta | Página | En el menú |
|---|---|---|
| `/conversations` | `ConversationsPage` | Sí (grupo **Comunicación**, clave `communication` → `conversations`) |

La conversación seleccionada se guarda en el parámetro de consulta `?conversation=<id>` (permite enlazar y volver con el botón atrás). No hay rutas para mensajes ni asignaciones.

## Distribución de la pantalla

- **Izquierda:** título, botón "Nueva conversación", filtros y listado paginado (20 por página, con "Anterior/Siguiente").
- **Centro:** encabezado (persona, canal, estado, inicio, trabajador asignado, Actualizar, Cerrar/Reabrir), historial de mensajes y compositor.
- **Derecha (`xl`):** datos de la persona, de la conversación y panel de asignación con su historial. Se puede ocultar. En pantallas menores se abre como hoja lateral desde el encabezado.
- **Móvil:** se muestra primero el listado; al seleccionar una conversación se muestra el chat con botón para volver.

## Spec 19 — Conversaciones

- `GET /conversations` con `person_id`, `channel`, `status`, `page`, `page_size`; orden del backend (`started_at` desc). Los filtros se conservan al navegar entre conversaciones y se pueden limpiar. Persona: búsqueda en el servidor entre **personas** activas (no solo pacientes). Los parámetros `started_from` / `started_to` existen en el contrato pero la interfaz no los expone (no se pide un filtro temporal en la spec).
- La respuesta solo trae `person_id`; el nombre, documento, teléfono y correo se obtienen con `GET /persons/{id}` (uno por id distinto, con caché mientras la página vive; `#id` si falla). No se muestra el último mensaje (el endpoint no lo entrega).
- Estados `open` / `closed` y canal `whatsapp` (el canal se muestra con su nombre; añadir canales es ampliar `CONVERSATION_CHANNELS`).
- **Crear:** modal con persona y canal; envía solo `person_id` y `channel` (no fechas ni estado). No crea personas, no exige que sea paciente y no se reintenta automáticamente un error (evita duplicados). Tras crear se refresca el listado y se abre la conversación.
- **Detalle:** `GET /conversations/{id}`; los datos nunca se mezclan con los de otra conversación (la pantalla se monta con `key` por id).
- **Cerrar / reabrir:** `PATCH …/status` con confirmación. El backend termina la asignación activa al cerrar y limpia `closed_at` al reabrir; el frontend **no** ejecuta operaciones propias de asignación: solo vuelve a consultar las asignaciones. Reabrir no asigna a nadie.
- `GET /persons/{id}/conversations` y `GET /staff-members/{id}/conversations` están en `conversationApi` (`listByPerson`, `listByStaffMember`) para integraciones y una vista personal futura; no hay página para ellos.

## Spec 20 — Mensajes

- `GET /conversations/{id}/messages`: aunque la spec dice que el endpoint no tiene paginación, **el contrato real sí define `page`, `page_size` (máx. 100) y `order`**, y se usan: se pide la página más reciente (`order=desc`, 50) y se muestra en orden cronológico; "Cargar mensajes anteriores" pide la siguiente página conservando la posición de lectura.
- Orden y fechas: por `sent_at` (o `created_at` si `sent_at` es `null`, indicando "envío sin confirmar") con desempate por id; separadores por día; se muestran en `VITE_APP_TIMEZONE` (por defecto `America/Lima`) sin alterar los valores del backend. `updated_at` no se usa como hora de envío.
- Burbujas: entrantes a la izquierda, salientes a la derecha; remitente `person` / `staff` / `ai` (solo el tipo, no se inventan nombres); contenido como **texto plano** (React lo escapa; nunca HTML).
- Estados de entrega (`queued`, `sent`, `delivered`, `read`, `failed`; `received` sin indicador) con símbolo y texto accesible. Se muestra el estado que informa el backend: no se simulan cambios ni se usa `PATCH /messages/{id}/delivery-status` (es del proveedor/webhooks).
- **Compositor:** Enter envía, Shift+Enter inserta salto de línea; valida no vacío (con `trim`) y ≤ 4096 caracteres sin alterar el texto; bloquea reenvíos mientras envía; solo envía `content` y `sender_type: "staff"` (nunca `person`; `ai` no se ofrece al usuario). Si falla, conserva el texto. Si se pierde la conexión y no se sabe si se registró, **consulta el historial antes de dar el envío por fallido** y, si el mensaje ya existe, lo da por enviado sin duplicar. No hay adjuntos.
- Conversación cerrada: historial visible y compositor deshabilitado con aviso. Desplazamiento: abre en el último mensaje, baja al enviar y no fuerza si el usuario lee mensajes anteriores.
- No hay tiempo real: se actualiza al abrir, al enviar y con el botón "Actualizar". `GET …/messages/{message_id}` está disponible en `messageApi.getById` (el historial ya trae todos los datos).

## Spec 21 — Asignaciones

- `GET /conversations/{id}/assignments`: la activa es la de `ended_at = null`; el historial se muestra de la más reciente a la más antigua. La API solo trae `staff_member_id`: el nombre se obtiene con `GET /staff/{id}`.
- **Asignar y transferir** usan un único `POST …/assignments` con `{ staff_member_id }` (el backend termina la anterior y crea la nueva atómicamente; si ya es el activo devuelve la existente con 200, que se acepta como éxito). Hay confirmación con trabajador actual → nuevo. **Finalizar:** `PATCH /conversation-assignments/{id}/end` con confirmación; la conversación sigue abierta y sin asignar.
- Conversación cerrada: sin acciones de asignación (solo historial). Nada se asigna automáticamente al abrir o reabrir.
- **Selector de personal:** trabajadores activos con búsqueda por nombre (`staffMemberApi`), excluye al asignado actual. La API de personal no expone el estado laboral (`employment_status`) ni permite filtrarlo, así que la elegibilidad definitiva la valida el backend y su mensaje se muestra tal cual (409/422). Tras un conflicto o un 404 se vuelven a consultar las asignaciones para reflejar el estado real.

## API pública consumida y expuesta

Consume `persons` (`personApi`, `getPersonFullName`, `getPersonDocument`) y `staff` (`staffMemberApi`). Expone `conversationApi` y los tipos `Conversation` / `AssignedConversation`. `conversations` no es consumido por otros módulos.

## Organización interna

`pages/conversations-page`, `components/` (`conversations-list`, `conversation-filters`, `conversation-create-modal`, `conversation-chat`, `conversation-header`, `conversation-info-panel`, `conversation-status-dialog`, `conversation-badges`, `message-list`, `message-bubble`, `message-composer`, `assignment-panel`, `entity-selector`, `person-avatar`), `hooks/` (`use-conversations`, `use-conversation`, `use-messages`, `use-assignments`, `use-entity-options`, `use-lookup`), `services/` (`conversation-api`, `message-api`, `assignment-api`), `types/`, `utils/` (fechas, errores, mensajes). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (specs 19–21): el proyecto no tiene herramienta de pruebas; solo se ejecutaron `npm run build` y `npm run lint`, sin comprobación visual ni contra el backend.
- Estado laboral del personal (`employment_status`) no expuesto por la API de personal.
- Formato de `details` en 422 y distinción de errores 409/422 (trabajador no elegible, conversación cerrada, conflicto): se muestra el mensaje del backend.
- Los filtros `started_from` / `started_to` del listado no se exponen en la interfaz.
- Las specs mencionan `specs/19-conversations.md`, `20-messages.md`, `21-conversation-assignments.md`, `08-staff.md`; los archivos existentes se llaman `19-conversation.md`, `20-message.md`, `21-conversation-assignment.md` y `08-staff-registration.md`.
- La zona horaria se duplica como constante en `conversation-datetime.utils.ts` (misma variable `VITE_APP_TIMEZONE` que `appointments`).

## Spec 25 / 26 (backend) — Mensajería WhatsApp en el frontend

Reemplaza lo descrito arriba sobre el listado paginado, el historial por páginas, "no hay tiempo real" y "no se envía nada a WhatsApp". El backend ahora envía y recibe por WhatsApp (webhook) y guarda los archivos en R2.

- **Bandeja:** `GET /conversations/inbox` (paginación por **cursor**: sin `cursor`, actividad de las últimas 24 h; `next_cursor` → "Cargar conversaciones anteriores"). Filtros del contrato: `status`, `assignment` (`all` / `unassigned` / `mine`) y `channel` (hoy solo WhatsApp, sin selector). Cada fila trae contacto, teléfono, último mensaje, asignación y la ventana de respuesta; ya no se resuelve la persona con `GET /persons/{id}`. Se actualiza cada 20 s (solo la primera página, fundida por id) mientras la pestaña está visible.
- **Historial:** `GET /conversations/{id}/history` por cursor (últimas 24 h; "Cargar mensajes anteriores" los incorpora al inicio conservando la posición de lectura). Cada 10 s se vuelve a pedir la primera página y se funde por id: así cambian los estados de entrega (`sent` → `delivered` → `read`). `GET …/messages` (paginado) queda en `messageApi` pero la pantalla no lo usa.
- **Ventana de respuesta (24 h):** desde `last_inbound_at` de la conversación (se vuelve a consultar cada 20 s). Con la ventana cerrada solo se permite enviar una **plantilla**; el backend sigue siendo la autoridad y su mensaje se muestra si rechaza un envío (409). No confundir con las 24 h de visualización de la bandeja.
- **Envío:** texto (`POST …/messages`), archivo (`POST …/messages/media`, `multipart/form-data` con `file` y `caption` opcional; audio sin pie) y plantilla (`POST …/messages/template`, `template_name`, `language_code`, `components` con las variables del cuerpo). Validación previa de tipo y tamaño según la spec 26 (imagen 5 MB, audio 16 MB, documento 100 MB); el backend vuelve a validar. No hay catálogo de plantillas en la API: el nombre e idioma se escriben como están aprobados en Meta.
- **Multimedia:** `GET …/messages/{id}/media` exige el token, así que se descarga con `apiClient.blob` y se muestra con una URL de objeto (liberada al desmontar). Imágenes al cargar; audio y documentos a petición. `media.is_stored = false` o 409/404/502 → "no disponible" con reintento (la consulta reintenta la descarga en el servidor).
- **Tipos de mensaje:** `text`, `image`, `audio`, `document`, `template` y `unsupported` (marcador de contenido no compatible).
- **Cliente HTTP:** `apiClient` acepta `FormData` y `apiClient.blob`; `CursorPage<T>` en `services/api/types.ts`.
- **Pendiente de verificar:** no hay pruebas automáticas ni verificación contra el backend/WhatsApp reales; la actualización es por consulta periódica (no hay WebSocket/SSE en la API).
