# Decisiones arquitectónicas

## ADR-001 — Conservar la plantilla y extender con `modules/` y `services/`

- **Estado:** aceptada
- **Contexto:** el proyecto parte de TailAdmin React. Las skills piden conservar su estructura y añadir funcionalidades por dominio.
- **Decisión:** no se mueve nada de `components/`, `pages/`, `contexts/`, etc. Se añaden `src/modules/<dominio>/` (funcionalidad) y `src/services/api/` (infraestructura HTTP).
- **Consecuencias:** las páginas de demostración de la plantilla siguen existiendo junto a los módulos; convivirán hasta que se decida retirarlas (decisión pendiente, no autorizada).

## ADR-002 — Cliente HTTP con `fetch`, sin dependencias nuevas

- **Estado:** aceptada
- **Contexto:** el proyecto no tenía cliente HTTP y `AGENTS.md` exige consultar antes de instalar paquetes.
- **Decisión:** `services/api/client.ts` usa `fetch`, desenvuelve `ApiResponse.data.result` y lanza `ApiError`. La URL base sale de `VITE_API_BASE_URL`.
- **Consecuencias:** el token y el 401 se enlazan mediante `configureApiAuth` (spec 23, ver [auth](../modules/auth.md)). Cancelación mediante `AbortSignal`.

## ADR-003 — Carga de datos con hooks propios, sin librería de caché

- **Estado:** aceptada
- **Decisión:** `useRoles` / `useRole` usan `useEffect` + `AbortController` y derivan `isLoading` comparando una clave de petición con el último resultado (evita `setState` síncrono en efectos, regla de lint del proyecto).
- **Consecuencias:** sin caché compartida entre pantallas. Si crece el número de módulos puede evaluarse una librería de datos (requiere autorización para instalar).

## ADR-004 — Avisos de éxito mediante `location.state`

- **Estado:** aceptada
- **Contexto:** la plantilla no incluye sistema de notificaciones y las skills prohíben nuevos providers sin requisito explícito.
- **Decisión:** tras crear/editar, la página navega a `/roles` con `state.notice`; el listado muestra un `Alert` y limpia el estado.

## ADR-005 — Módulos independientes aunque compartan patrón (roles / permissions / persons / patients / staff / clinics / specialties / special-conditions)

- **Estado:** aceptada (revisable)
- **Contexto:** `permissions`, `persons`, `patients`, `staff`, `clinics`, `specialties` y `special-conditions` repiten el patrón de `roles` (filtros con debounce, tabla, paginación, diálogo de estado). Las skills prohíben que un módulo importe internos de otro y mover componentes existentes sin autorización.
- **Decisión:** cada módulo tiene sus propias copias adaptadas; `roles` no se modificó.
- **Consecuencias:** hay duplicación. Con ocho módulos conviene promover paginación, filtros y diálogo de estado a `components/shared/` (requiere autorizar el cambio en `roles`).

## ADR-006 — `persons` expone una API pública para otros módulos

- **Estado:** aceptada
- **Contexto:** pacientes y personal dependerán de `person` (spec 06) y no deben duplicar formulario, validaciones ni servicio.
- **Decisión:** `modules/persons/index.ts` exporta, además de las páginas, `PersonForm`, `PersonSelector`, `personApi`, `toCreatePayload`, helpers de nombre/documento y tipos. Los consumidores importan solo desde ese índice; la dependencia es `patients → persons` y `staff → persons`, nunca al revés.
- **Consecuencias:** `PersonForm` no registra entidades dependientes: comunica los valores por `onSubmit`. El flujo combinado (crear persona y luego paciente/personal, conservando `person_id` ante fallos parciales) lo implementará cada módulo consumidor cuando exista su especificación.

## ADR-007 — Alta combinada persona + entidad dependiente orquestada en `patients` y `staff`

- **Estado:** aceptada
- **Contexto:** la API no ofrece un endpoint único; hay que llamar `POST /persons` y después `POST /patients`, sin transacción (spec 07 §6).
- **Decisión:** `PatientCreatePage` (y, con el mismo diseño, `StaffMemberCreatePage`) orquesta ambas operaciones usando solo la API pública de `persons` (`PersonForm`, `PersonSelector`, `personApi`). Los campos propios del paciente son un formulario del módulo `patients` (`PatientFields`) y se inyectan dentro de `PersonForm` mediante su prop `children`, de modo que el usuario completa todo en una sola pantalla con un único envío. Antes de crear la persona se validan los campos del paciente.
- **Fallos parciales:** si la persona se crea y el paciente falla, el `Person` creado se guarda en el estado de la página, se muestra un aviso (la persona quedó registrada, el paciente no) y solo se ofrece "Reintentar" el `POST /patients` con ese `person_id`; `PersonForm` deja de mostrarse para no duplicar la persona. No se elimina nada automáticamente. El estado vive en memoria: si el usuario recarga la página pierde la referencia (la persona sigue existiendo y puede seleccionarse con `PersonSelector`).

## ADR-008 — Asignación de roles integrada en los formularios de `staff`

- **Estado:** aceptada
- **Contexto:** la spec 09 prohíbe páginas, rutas y entradas de sidebar para las relaciones personal–rol y exige operaciones individuales sin transacción única.
- **Decisión:** la asignación vive en `modules/staff` (selector, editor y lista de roles) y consume solo la API pública de `roles` (`roleApi`, `Role`). Las operaciones (`POST`/`DELETE`) se ejecutan de forma secuencial y sin detenerse ante fallos, con resultado por rol. En la edición los cambios se acumulan y se aplican con un botón propio (estado separado del guardado de datos del personal). En la creación se asignan tras `POST /staff` y los fallos se reintentan solo sobre los roles pendientes.
- **Infraestructura:** se añadió `delete` al cliente HTTP global (`services/api/client.ts`), necesario para retirar asignaciones.
- **Consecuencias:** sin caché compartida del catálogo; un 409 al asignar se trata como "ya asignado" (resuelto) pero se informa.

## ADR-009 — Asignación de permisos integrada en los formularios de `roles`

- **Estado:** aceptada
- **Contexto:** la spec 10 prohíbe páginas y rutas para `role_permission` y exige operaciones individuales sin transacción única, a diferencia de ADR-008 (staff) donde se eligió un guardado separado para los roles.
- **Decisión:** la asignación vive en `modules/roles` y consume solo la API pública de `permissions` (`permissionApi`, `Permission`). En la edición un único guardado coordina `PATCH` del rol y las operaciones de permisos (la spec 10 §7.4 lo pide así): primero el `PATCH`; si falla no se tocan los permisos; después `POST`/`DELETE` secuenciales con resultado por permiso. En la creación se asigna tras `POST /roles` y los fallos se reintentan solo sobre los pendientes. `RoleForm` admite `children` para alojar la sección.
- **Consecuencias:** el estado "rol guardado, permisos pendientes" vive en memoria; un 409 al asignar se trata como "ya asignado" (resuelto) pero se informa. Se añadió la ruta de detalle `/roles/:roleId`, necesaria para la sección informativa de permisos.

## ADR-010 — Condiciones especiales integradas en los formularios de `patients`

- **Estado:** aceptada
- **Contexto:** la spec 11 prohíbe páginas y rutas para `patient_special_condition`, exige operaciones individuales sin transacción única y añade notas por relación y un `PUT` idempotente.
- **Decisión:** la asociación vive en `modules/patients` y consume solo la API pública de `special-conditions`. Operaciones: `PUT` (alta, con notas), `PATCH` (solo notas) y `DELETE`, secuenciales y con resultado por condición. Como en ADR-009, un único guardado coordina el `PATCH` del paciente y las operaciones de condiciones (primero el paciente; si falla no se tocan las condiciones). En la creación se asocian tras `POST /patients` y se reintentan solo las pendientes conservando sus notas. `PatientEditForm` admite `children` para alojar la sección.
- **Infraestructura:** se añadió `put` al cliente HTTP global.
- **Consecuencias:** el estado de pendientes vive en memoria. Las condiciones se muestran como información administrativa asociada a la relación, sin interpretación clínica.

## ADR-011 — Especialidades del personal integradas en `staff`, separadas de los roles

- **Estado:** aceptada
- **Contexto:** la spec 12 añade una segunda relación (especialidades) a los formularios de personal, opcional, y pide mantener separados los resultados de roles y especialidades.
- **Decisión:** se sigue el patrón de ADR-008: la asociación vive en `modules/staff`, consume solo la API pública de `specialties` (`specialtyApi`, `Specialty`) y en la edición cada relación tiene su propio editor y botón de guardado, con estado independiente del de los datos propios y del de la otra relación. En la creación una sola función coordina ambas asignaciones tras `POST /staff`, pero registra y reintenta cada relación por separado (`RelationsOutcome`).
- **Infraestructura:** sin cambios; `PUT` sin cuerpo usa `apiClient.put(path, undefined)`.
- **Consecuencias:** hay dos editores casi idénticos (roles y especialidades), consistente con ADR-005; si aparece una tercera relación conviene extraer un editor genérico. El estado de pendientes de la creación vive en memoria.

## ADR-012 — Horarios de clínica integrados en `clinics` con validación preventiva

- **Estado:** aceptada
- **Contexto:** la spec 13 prohíbe páginas y rutas para `clinic_schedule`, pide operaciones individuales sin transacción única, validaciones preventivas (incluido solapamiento con vigencias) y desactivar en lugar de eliminar.
- **Decisión:** la funcionalidad vive en `modules/clinics`. En la edición, un editor propio con botón "Guardar horarios" (patrón de ADR-008/011, estado independiente del de los datos de la clínica) acumula cambios y, al guardar, valida y ejecuta solo la diferencia en orden desactivar → modificar → reactivar → crear. En la creación se registran los intervalos tras `POST /clinics` y se reintentan solo los pendientes conservando sus valores. La validación preventiva (reglas de horas, vigencia y solapamiento entre intervalos activos) es una ayuda: el backend decide y sus errores prevalecen.
- **Infraestructura:** sin cambios en `services/api`.
- **Consecuencias:** solo se carga la primera página (hasta 100) de horarios; si hubiera más se avisa. El estado de pendientes de la creación vive en memoria. No se ofrece eliminación física.

## ADR-013 — Disponibilidad semanal del personal: copia independiente del patrón de clínicas

- **Estado:** aceptada
- **Contexto:** la spec 14 define horarios del personal con el mismo contrato y reglas que los de clínica (spec 13), pero exige que sean configuraciones independientes, sin copiar ni sincronizar datos entre ambos y sin calcular disponibilidad efectiva.
- **Decisión:** `modules/staff` tiene su propia implementación (tipos, servicio, validaciones, editor, borradores y vista semanal) derivada de la de `clinics`, sin importar sus internos (consistente con ADR-005). En la creación una única función coordina roles, especialidades y horarios tras `POST /staff`, pero registra y reintenta cada relación por separado (`RelationsOutcome` ampliado con `schedules`). Se valida la lista de intervalos antes de crear la persona o el personal para evitar fallos evitables.
- **Consecuencias:** las reglas de validación y solapamiento están duplicadas entre `clinics` y `staff`; si cambian en el backend hay que actualizar ambas. Conviene extraer un módulo compartido de intervalos semanales si surge una tercera consumidora (autorización y cambios en `components/shared` requeridos). Sin cambios en `services/api`.

## ADR-014 — Módulo independiente `schedule-exceptions` que consume APIs públicas de `clinics`, `staff` y `persons`

- **Estado:** aceptada
- **Contexto:** la spec 15 exige un módulo propio para los bloqueos extraordinarios (no formularios dentro de clínicas o personal), con objetivo excluyente, fechas con zona horaria y sin `DELETE` en el contrato.
- **Decisión:** `modules/schedule-exceptions` es autónomo y consume solo `index.ts` de otros módulos: `clinics` (`clinicApi`, `Clinic`), `staff` (`staffMemberApi`, `StaffMember`) y `persons` (`getPersonFullName`), que ahora los exportan. La carpeta usa kebab-case (como `special-conditions`). Los nombres de los objetivos se resuelven con una consulta por objetivo porque la API devuelve identificadores. Las fechas `datetime-local` se convierten a `date-time` con el desplazamiento del navegador para esa fecha; se **asume que el navegador está en la zona de la clínica** porque `time_zone` no se expone. No se ofrece eliminación.
- **Consecuencias:** posibles desajustes si el usuario trabaja en una zona distinta a la de la clínica (se muestra el desplazamiento enviado); varias consultas para nombrar objetivos en el listado (máx. 20 por página); sin cálculo de disponibilidad en el frontend.

## ADR-015 — Módulo `schedule-overrides`: copia adaptada de `schedule-exceptions` con aviso preventivo de solapamiento

- **Estado:** aceptada
- **Contexto:** la spec 16 es análoga a la 15 (objetivo excluyente, fechas con zona, módulo independiente, sin `DELETE`) pero con estado activo/inactivo, creación con `is_active`, `PATCH` limitado a intervalo y motivo (objetivo inmutable) y una regla de solapamiento de overrides activos.
- **Decisión:** `modules/schedule-overrides` es autónomo (consume solo APIs públicas de `clinics`, `staff` y `persons`) y reutiliza el patrón y las utilidades de fechas de `schedule-exceptions` mediante copia adaptada (consistente con ADR-005), sin importar sus internos. El cambio de estado usa siempre `/status` con confirmación y sin actualizar la interfaz hasta la respuesta. Para solapamientos se hace una consulta preventiva (`findOverlappingOverrides`) y se muestra un **aviso no bloqueante**; el backend decide y sus errores prevalecen, para no imponer reglas propias.
- **Consecuencias:** las utilidades de fecha/zona horaria están duplicadas entre ambos módulos; conviene extraerlas si surge una tercera consumidora. Cada alta/edición de un override activo hace una consulta extra de listado. La disponibilidad efectiva y su precedencia siguen siendo exclusivas del backend.

## ADR-016 — Módulo `appointments`: calendario en hora de pared de `APP_TIMEZONE` y secciones en paciente/personal

- **Estado:** aceptada
- **Contexto:** la spec 17 exige una agenda con calendario como vista principal, modales en lugar de rutas, fechas coherentes con `APP_TIMEZONE` (por defecto `America/Lima`), y consultas de citas desde los detalles de paciente y personal. El proyecto ya incluye FullCalendar.
- **Decisión:** se reutiliza FullCalendar (sin nuevas dependencias) con `timeZone="UTC"` y las citas se entregan como hora de pared de `APP_TIMEZONE`, convertida con `Intl.DateTimeFormat` (`toZonedIso` / `fromIso`), para no depender de la zona del navegador ni convertir dos veces. Los controles de navegación son propios. Creación, detalle, edición y cambios de estado son modales de la página `/appointments`; el estado solo cambia con `/status` tras confirmación (completar y cancelar) y la edición envía un `PATCH` parcial. Los nombres de paciente y personal se resuelven por id con las APIs públicas de `patients` y `staff`. `AppointmentsSection` (solo consulta) se expone para `patients` y `staff`, lo que crea una referencia circular de módulos usada solo en tiempo de ejecución.
- **Consecuencias:** una cita no puede cruzar la medianoche desde el modal; los periodos muy cargados se truncan a 1000 citas con aviso; resolver nombres implica una consulta por id distinto (conviene que el backend los incluya en la respuesta de citas). La disponibilidad efectiva y las reglas de solapamiento siguen siendo exclusivas del backend. Se sustituye por una solución mejor si el backend expone `time_zone` o nombres en citas.

## ADR-017 — Módulo `procedures`: precios como cadena decimal y jerarquía con endpoints existentes

- **Estado:** aceptada
- **Contexto:** la spec 17-0 pide un catálogo con precios monetarios, jerarquía por `parent_procedure_id` y que `appointments` lo consuma, sin inventar endpoints. La API entrega `base_price` como cadena y no ofrece un endpoint de árbol ni de hijos.
- **Decisión:** `base_price` se conserva como cadena decimal y las comparaciones y sumas usan céntimos enteros (`bigint`) en utilidades exportadas por el módulo (`priceToCents`, `centsToPrice`, `multiplyPrice`), sin `float`. La jerarquía se visualiza con los endpoints existentes: ancestros siguiendo `parent_procedure_id` con `GET /procedures/{id}` e hijos directos con el filtro `parent_procedure_id` del listado. El selector de padre solo ofrece activos y excluye al propio procedimiento; los ciclos los valida el backend. El módulo expone `procedureApi` y `Procedure` para `appointments` (spec 18), sin que `procedures` conozca las citas.
- **Consecuencias:** los nombres de padres se resuelven con una consulta por id distinto; el árbol solo llega a hijos directos y ancestros; la validación de ciclos y unicidad depende del mensaje del backend.

## ADR-018 — Procedimientos de la cita: formulario único con operaciones secuenciales idempotentes por diferencia

- **Estado:** aceptada
- **Contexto:** la spec 18 integra los procedimientos en el formulario de citas, pero el backend expone cita y detalles como llamadas independientes (sin transacción). Hay que evitar duplicados al reintentar y no perder los cambios ya registrados.
- **Decisión:** el formulario mantiene una lista de líneas; cada línea guarda el detalle confirmado por la API (`saved`) y la operación pendiente se **deriva por diferencia** (crear, modificar, retirar). Al guardar se ejecutan una a una (retiros, cambios, altas), y cada respuesta satisfactoria actualiza la referencia de su línea; las que fallan conservan el error. Reintentar vuelve a calcular la diferencia, por lo que solo ejecuta lo pendiente, no recrea la cita (su id se conserva) y no duplica detalles. El precio sale del catálogo (no se envía `unit_price`) y la duración la calcula el backend (no se envía `duration_minutes`). Importes con céntimos enteros. La duración reservada insuficiente solo avisa y ofrece ajustar la hora de fin.
- **Consecuencias:** no hay atomicidad entre cita y detalles (se informa como creación parcial); los totales con cantidades modificadas son estimaciones hasta guardar; cada procedimiento nuevo implica una llamada y los nombres del catálogo se consultan por id.

## ADR-019 — Módulo `conversations`: una pantalla de chat con mensajes y asignaciones, sin tiempo real

- **Estado:** aceptada
- **Contexto:** las specs 19, 20 y 21 piden una sola experiencia de chat (listado, conversación con mensajes y panel con asignaciones) sin páginas independientes, sin WebSocket/SSE y sin llamar a proveedores externos. Las APIs solo entregan ids (persona, trabajador) y el contrato de mensajes sí es paginado aunque la spec dice lo contrario.
- **Decisión:** un único módulo `conversations` con una página `/conversations`; la conversación seleccionada va en `?conversation=` y el panel central se monta con `key` por id para no mezclar datos entre conversaciones. Los nombres se resuelven con `persons` y `staff` por id. Los mensajes usan `page`/`page_size`/`order` del contrato (más recientes primero, mostrados cronológicamente, con "cargar anteriores"). El envío es una operación explícita con bloqueo de reenvío y recuperación ante resultado incierto (consulta del historial antes de reintentar). Asignar y transferir son una sola llamada (`POST …/assignments`); cerrar o reabrir solo usan `/status` y la interfaz relee las asignaciones sin operar sobre ellas. La actualización es a petición (botón "Actualizar"), dejando los hooks (`useMessages`, `useAssignments`, `useConversation`) aislados para incorporar un mecanismo de tiempo real sin tocar los componentes.
- **Consecuencias:** sin tiempo real los mensajes entrantes y los cambios de entrega solo se ven al actualizar; resolver nombres implica una consulta por id; la elegibilidad del personal depende del backend porque la API de personal no expone el estado laboral.

## ADR-020 — Módulo `guardians`: personas ya registradas, asociación tras crear el paciente y consulta partiendo de la persona

- **Estado:** aceptada
- **Contexto:** la spec 26 pide asociar apoderados (personas) a pacientes reutilizando `persons` y `patients`, sin duplicar datos ni formularios. El backend asocia con un `POST` por apoderado sobre un paciente existente y no ofrece un listado general de apoderados; el OpenAPI se actualizó después de la primera implementación y confirma el contrato.
- **Decisión:** `guardians` es un módulo propio que consume `persons` y es consumido por `patients`. En el alta, cada apoderado es una **persona ya registrada** (existente o creada en ese momento con `PersonForm`) más su parentesco; las asociaciones se ejecutan después de crear el paciente, de forma secuencial, y se reintentan solo las pendientes (la persona y el paciente no se vuelven a crear; el `UNIQUE (patient_id, person_id)` del backend evita duplicados). El mismo diálogo de alta se reutiliza para asociar desde la edición del paciente. Como no existe un listado general, la página `/guardians` parte de una persona y muestra sus pacientes (`GET /persons/{id}/patients`).
- **Consecuencias:** puede quedar registrada una persona nueva aunque se abandone el alta del paciente (mismo comportamiento que la persona del paciente); no se ofrece un listado global ni conteos de pacientes por apoderado; la sección de apoderados exige permisos `patient_guardian.*` además de los de pacientes.
