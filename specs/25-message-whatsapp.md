## 3. Revisión obligatoria del contexto existente

Antes de implementar, el agente debe comprender cómo está construido actualmente el frontend, utilizando las instrucciones, skills, especificaciones y módulos existentes.

**No se debe rediseñar la arquitectura ni investigar tecnologías alternativas. La arquitectura, las tecnologías y las convenciones del proyecto ya están establecidas.**

El objetivo de esta revisión es identificar cómo implementar la mensajería siguiendo exactamente los patrones existentes.

### 3.1. Revisar las instrucciones y skills del proyecto

Buscar y leer:

- AGENTS.md y demás archivos de instrucciones aplicables.
- Las skills propias del proyecto.
- Las skills especializadas relacionadas con la arquitectura frontend.
- Las skills de documentación y especificaciones.
- Las skills de consulta del OpenAPI.
- Las skills de organización de módulos, componentes y servicios.
- Las skills que permiten consultar y reutilizar componentes existentes.
- Las skills relacionadas con formularios, validaciones, estados y consumo de APIs, cuando correspondan.

**Importante:**

El proyecto ya dispone de skills preparadas para trabajar siguiendo sus convenciones.

Por tanto:

1. Identificar las skills disponibles.
2. Leer las instrucciones de las skills relacionadas con esta implementación.
3. Identificar qué información proporciona cada skill.
4. Utilizar las skills para consultar la arquitectura, los contratos del backend y los componentes existentes.
5. Reutilizar los mecanismos definidos por el proyecto.

No crear nuevas skills ni descargar otras por iniciativa propia.

No sustituir las skills existentes por investigaciones genéricas o documentación de tecnologías que ya están definidas en el proyecto.

Si alguna skill depende de documentación adicional, seguir las instrucciones que contiene.

### 3.2. Revisar las especificaciones existentes

Leer obligatoriamente:

- `specs/19-conversation.md`
- `specs/20-message.md`
- `specs/21-conversation-assignment.md`

Ubicación:

`C:\Users\braya\OneDrive - unc.edu.pe\TESIS\implementacion\frontend_gestion_citas\specs\`

Estas especificaciones son la referencia para identificar las entidades, relaciones, responsabilidades y funcionalidades existentes del módulo de mensajería.

También utilizar como referencia las especificaciones del backend:

- `25-message-whatsapp.md`
- `26-message-media.md`

La revisión debe permitir identificar:

- Qué funcionalidades ya están definidas.
- Qué responsabilidades corresponden a cada entidad.
- Qué información necesita mostrar el frontend.
- Qué operaciones necesita realizar el frontend.
- Qué relaciones existen entre conversaciones, mensajes, multimedia y asignaciones.
- Qué funcionalidades dependen de otros módulos existentes.

No modificar las especificaciones por iniciativa propia.

Si se detecta una diferencia que afecta directamente a la implementación, documentarla y justificar cualquier actualización necesaria.

### 3.3. Identificar los módulos relacionados

Utilizando las especificaciones y las skills del proyecto, identificar exclusivamente los módulos del frontend que tengan una relación funcional o técnica con la mensajería.

Revisar únicamente los módulos necesarios para comprender cómo reutilizar sus implementaciones.

Como referencia, considerar:

| Módulo | Motivo de revisión |
|---|---|
| Conversation | Comprender la estructura y gestión de conversaciones. |
| Message | Comprender la estructura y presentación de mensajes. |
| Conversation Assignment | Comprender las asignaciones de conversaciones. |
| Person / Contact | Comprender cómo se identifican y muestran los contactos. |
| Staff Member | Comprender cómo se representan los trabajadores asignados. |
| Authentication / Authorization | Reutilizar la autenticación y los permisos existentes. |
| API / OpenAPI | Consultar los contratos y endpoints disponibles. |
| Components / UI | Identificar componentes visuales reutilizables. |
| Notifications | Reutilizar los mecanismos existentes de notificaciones. |

Esta lista es orientativa.

El agente debe determinar los módulos reales a partir de las especificaciones y la organización existente del repositorio.

**No revisar todos los módulos del sistema.**

No inspeccionar funcionalidades de citas, horarios, disponibilidad, servicios odontológicos u otros módulos que no tengan una dependencia directa con la mensajería.

Si una dependencia técnica obliga a consultar otro módulo, justificar brevemente por qué es necesario.

### 3.4. Revisar las implementaciones existentes

Una vez identificados los módulos relacionados, estudiar su implementación real.

Revisar únicamente los archivos necesarios para comprender:

- Cómo se organizan los módulos.
- Cómo se estructuran sus componentes.
- Cómo se implementan sus páginas.
- Cómo se organizan los servicios.
- Cómo se consumen los endpoints.
- Cómo se definen los tipos y contratos.
- Cómo se gestionan los estados.
- Cómo se validan los formularios.
- Cómo se gestionan errores y notificaciones.
- Cómo se aplican permisos.
- Cómo se reutilizan los componentes visuales.

Utilizar las skills del proyecto para consultar los componentes disponibles antes de crear nuevos.

No inspeccionar indiscriminadamente todo el código fuente.

No duplicar componentes, hooks, servicios, utilidades ni mecanismos que ya existan.

### 3.5. Consultar los contratos del backend mediante OpenAPI

Utilizar obligatoriamente la skill existente encargada de consultar OpenAPI y los contratos del backend.

Identificar los endpoints disponibles para:

- Consultar la bandeja de conversaciones.
- Consultar una conversación.
- Consultar el historial de mensajes.
- Enviar mensajes de texto.
- Enviar archivos multimedia.
- Enviar plantillas.
- Consultar archivos multimedia.
- Gestionar asignaciones.
- Consultar actualizaciones de mensajes.

También revisar:

- Métodos HTTP.
- Parámetros.
- Esquemas de entrada.
- Esquemas de respuesta.
- Códigos de error.
- Autenticación.
- Permisos.
- Paginación.
- Cursores.
- Formatos de fechas.
- Estados de mensajes.

La información del OpenAPI debe contrastarse con las especificaciones 25 y 26 del backend.

No inventar endpoints ni crear contratos paralelos.

Si alguna operación requerida por la interfaz todavía no está implementada en el backend, documentar la dependencia.

### 3.6. Identificar componentes reutilizables

Utilizar la skill existente que permite consultar los componentes del frontend.

Identificar componentes que puedan reutilizarse para:

- Listados.
- Elementos de conversación.
- Avatares.
- Búsquedas.
- Indicadores de estado.
- Ventanas modales.
- Menús.
- Formularios.
- Selectores de archivos.
- Visores de imágenes.
- Reproductores de audio.
- Descargas.
- Notificaciones.
- Estados de carga.
- Paginación.
- Scroll y contenedores.

No crear componentes nuevos cuando exista uno que cumpla la misma responsabilidad.

Si es necesario desarrollar componentes específicos para mensajería, mantenerlos dentro de la organización modular ya establecida.

---

## 4. Análisis funcional y planificación de la implementación

Después de revisar las especificaciones, las skills y los módulos relacionados, realizar un análisis funcional antes de escribir código.

### 4.1. Identificar las funcionalidades que necesita el frontend

Determinar qué funcionalidades se deben implementar para cada entidad:

**Conversation**
- Bandeja de conversaciones.
- Información del contacto.
- Última actividad.
- Selección de conversación.
- Navegación por conversaciones anteriores.

**Message**
- Historial de mensajes.
- Identificación de mensajes entrantes y salientes.
- Envío de texto.
- Visualización de estados.
- Navegación por el historial.

**Message Media**
- Selección de archivos.
- Vista previa.
- Envío de archivos.
- Visualización de imágenes.
- Reproducción de audios.
- Descarga de documentos.
- Estados de disponibilidad multimedia.

**Conversation Assignment**
- Visualización del trabajador asignado.
- Gestión de asignaciones, si los endpoints disponibles lo permiten.

Estas funcionalidades deben contrastarse con los contratos reales del backend.

### 4.2. Estrategia de carga del historial

Prestar especial atención al rendimiento de la bandeja y del historial.

El comportamiento solicitado es:

**Conversaciones:**
- Mostrar inicialmente las conversaciones con actividad de las últimas 24 horas.
- Permitir retroceder para consultar conversaciones anteriores.
- Utilizar el mecanismo de paginación disponible en el backend.

**Mensajes:**
- Mostrar inicialmente los mensajes recientes de la conversación.
- Permitir consultar mensajes anteriores progresivamente.
- Utilizar cursores cuando estén disponibles.
- Incorporar mensajes antiguos al inicio del historial.
- Mantener la posición visual del usuario al cargar mensajes anteriores.
- Evitar descargar todo el historial de una sola vez.

No confundir las últimas 24 horas de visualización con la ventana de atención de WhatsApp.

No implementar paginación distinta de la proporcionada por el backend.

### 4.3. Definir el plan de implementación

Antes de desarrollar, presentar un plan breve que identifique:

1. Módulos existentes que se reutilizarán.
2. Componentes existentes que se reutilizarán.
3. Componentes específicos de mensajería que será necesario crear.
4. Servicios existentes que se aprovecharán.
5. Operaciones del backend que se consumirán.
6. Funcionalidades que dependen de endpoints todavía no disponibles.
7. Archivos que será necesario modificar o crear.

El plan debe ser concreto y limitado a mensajería.

No presentar propuestas de cambio de arquitectura ni alternativas tecnológicas.

Una vez completado el análisis, proceder con la implementación siguiendo las convenciones existentes.

### 4.4. Restricción de alcance de la revisión

La revisión del código debe ser dirigida por las dependencias funcionales identificadas en las especificaciones.

No realizar una auditoría general del frontend.

No analizar todos los módulos.

No leer archivos que no aporten información necesaria para implementar mensajería.

La prioridad es comprender el contexto suficiente para desarrollar correctamente el módulo sin duplicar funcionalidades ni modificar partes ajenas del sistema.