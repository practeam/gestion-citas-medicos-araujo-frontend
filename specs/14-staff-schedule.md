# SPEC 14 — Gestión de horarios del personal&#x20;

## 1. Prioridad y dependencias

Esta especificación define la integración de horarios semanales recurrentes en el módulo de personal.

Depende de:

- SPEC 05 — Módulo de clínicas.
- SPEC 08 — Módulo de personal.
- SPEC 13 — Horarios de clínicas.

Skills aplicables:

- `$frontend-arquitectura`: organización e integración dentro del módulo de personal.
- `$frontend-integracion-api`: comunicación con los endpoints de personal y horarios.
- `$frontend-catalogo-componentes`: reutilización de componentes existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

La implementación debe respetar la arquitectura existente y las responsabilidades de cada módulo.

## 2. Objetivo

Permitir administrar la disponibilidad semanal recurrente de cada miembro del personal desde sus formularios de creación y edición.

La configuración de horarios es opcional. El usuario puede registrar un trabajador sin definir horarios y configurarlos posteriormente.

El usuario debe poder:

- Consultar los horarios registrados de un trabajador.
- Agregar intervalos para distintos días de la semana.
- Registrar varios intervalos no solapados en un mismo día.
- Definir fechas de vigencia.
- Modificar horarios existentes.
- Activar o desactivar horarios.
- Consultar la disponibilidad semanal configurada desde el detalle del trabajador.

**No se deben crear páginas independientes para administrar los horarios del personal.**

La gestión debe integrarse en el flujo habitual del módulo de personal.

## 3. Alcance

Esta especificación comprende:

- Integración de horarios en el formulario de creación de personal.
- Integración de horarios en el formulario de edición de personal.
- Visualización de horarios en el detalle del personal.
- Administración de intervalos semanales.
- Configuración de periodos de vigencia.
- Modificación y desactivación de horarios.
- Validaciones preventivas.
- Manejo de errores y operaciones parcialmente completadas.

No comprende:

- Registro de horas efectivamente trabajadas.
- Control de asistencia.
- Ausencias puntuales.
- Licencias y vacaciones.
- Creación de citas.
- Gestión de excepciones de horarios.
- Modificaciones puntuales de disponibilidad.
- Cálculo completo de disponibilidad para agendamiento.
- Asignación automática de horarios de clínicas a trabajadores.

Los horarios representan patrones recurrentes de disponibilidad declarada por cada trabajador.

## 4. Organización del módulo

La funcionalidad debe integrarse en el módulo existente:

`frontend/src/modules/staff/`

El módulo de personal será responsable de coordinar la administración de horarios de cada trabajador.

Se pueden incorporar componentes internos del módulo, por ejemplo:

- `StaffSchedulesSection`: sección integrada para administrar horarios.
- `StaffScheduleForm`: formulario para crear o editar un intervalo.
- `StaffScheduleList`: listado de intervalos registrados.
- `StaffScheduleItem`: representación de un horario individual.

Estos nombres son orientativos. Antes de crear componentes nuevos se debe inspeccionar la estructura existente.

Los componentes deben permanecer dentro del módulo de personal, salvo que exista una necesidad real de reutilización.

No crear un módulo independiente de horarios ni reorganizar la estructura general del frontend.

## 5. Integración con la API

Prefijo:

`/api/v1`

Todos los endpoints de horarios pertenecen a un miembro del personal específico.

### 5.1. Crear un horario

Endpoint:

`POST /api/v1/staff-members/{staff_member_id}/schedules`

Cuerpo:

```json
{
  "day_of_week": 1,
  "starts_at": "09:00",
  "ends_at": "12:00",
  "valid_from": "2026-11-01",
  "valid_until": null
}
```

La operación crea un intervalo semanal recurrente asociado exclusivamente al trabajador indicado.

### 5.2. Consultar horarios

Endpoint:

`GET /api/v1/staff-members/{staff_member_id}/schedules`

Debe utilizarse para recuperar los horarios registrados del trabajador.

La interfaz debe permitir visualizar los intervalos organizados por día de la semana y distinguir los horarios activos e inactivos.

No asumir filtros, paginación ni parámetros que no estén definidos por el backend.

### 5.3. Consultar un horario específico

Endpoint:

`GET /api/v1/staff-members/{staff_member_id}/schedules/{schedule_id}`

Se utilizará cuando sea necesario recuperar individualmente un horario para su consulta o edición.

### 5.4. Actualizar un horario

Endpoint:

`PATCH /api/v1/staff-members/{staff_member_id}/schedules/{schedule_id}`

Debe utilizarse para modificar los campos que el backend permita actualizar.

La interfaz debe respetar el contrato real de actualización.

No enviar identificadores ni campos de auditoría como datos modificables.

### 5.5. Activar o desactivar un horario

Endpoint:

`PATCH /api/v1/staff-members/{staff_member_id}/schedules/{schedule_id}/status`

Debe utilizarse para cambiar el estado del horario.

La interfaz debe ofrecer acciones para activar o desactivar un intervalo, respetando las reglas del backend.

La desactivación conserva el registro y su información histórica.

No asumir que existe un endpoint DELETE, ya que no está definido en esta especificación del backend.

## 6. Formulario de creación de personal

El formulario de creación debe permitir registrar los datos del trabajador y, opcionalmente, configurar su disponibilidad semanal.

Debe mantener como prioridad los datos personales y laborales definidos en la SPEC 08.

La sección de horarios debe aparecer después de los datos principales y de las secciones de roles y especialidades.

### 6.1. Sección de disponibilidad semanal

Incorporar una sección claramente identificada como:

**Disponibilidad semanal**

Debe contener:

- Día de la semana.
- Hora de inicio.
- Hora de finalización.
- Fecha inicial de vigencia.
- Fecha final de vigencia opcional.
- Posibilidad de agregar varios intervalos.

La interfaz debe organizar los horarios por día y permitir agregar más de un intervalo en el mismo día.

La sección debe ser opcional y no debe bloquear el registro del trabajador cuando no se configuren horarios.

### 6.2. Secuencia de creación

El backend utiliza endpoints independientes para crear personal y sus horarios.

El frontend debe ejecutar las operaciones secuencialmente:

1. El usuario selecciona una persona existente o registra una nueva mediante los componentes definidos en la SPEC 06.
2. Completa los datos propios del personal.
3. Selecciona opcionalmente los roles definidos en la SPEC 09.
4. Selecciona opcionalmente las especialidades definidas en la SPEC 12.
5. Configura opcionalmente los horarios semanales.
6. El frontend ejecuta `POST /api/v1/staff`.
7. Obtiene el `staff_member_id` de la respuesta.
8. Ejecuta las asignaciones de roles conforme a la SPEC 09.
9. Ejecuta las asignaciones de especialidades conforme a la SPEC 12.
10. Ejecuta un `POST /api/v1/staff-members/{staff_member_id}/schedules` por cada intervalo configurado.
11. Informa el resultado del registro y de las relaciones.

Si el usuario no configura horarios, no se debe ejecutar ninguna solicitud de creación de horarios.

No enviar los horarios dentro de `POST /api/v1/staff`.

No asumir que la creación del trabajador y sus relaciones constituyen una única transacción.

### 6.3. Fallos parciales

Si el trabajador se crea correctamente, pero falla la creación de uno o varios horarios:

- No volver a crear el trabajador.
- Conservar el `staff_member_id` obtenido.
- Informar que el trabajador fue creado, pero que algunos horarios no pudieron registrarse.
- Identificar los intervalos pendientes.
- Conservar los valores introducidos para cada intervalo.
- Permitir reintentar únicamente las operaciones pendientes.
- No eliminar automáticamente al trabajador ni los horarios que sí se crearon.

Los resultados de las operaciones de roles, especialidades y horarios deben identificarse por separado.

No repetir operaciones que el backend ya confirmó.

## 7. Formulario de edición de personal

La edición debe permitir modificar los datos del trabajador y administrar sus horarios desde el mismo formulario.

Al abrir la edición:

1. Consultar los datos del trabajador mediante `GET /api/v1/staff/{staff_id}`.
2. Consultar sus roles conforme a la SPEC 09.
3. Consultar sus especialidades conforme a la SPEC 12.
4. Consultar sus horarios mediante `GET /api/v1/staff-members/{staff_member_id}/schedules`.
5. Mostrar los datos y las relaciones existentes.

### 7.1. Agregar horarios

El usuario debe poder agregar nuevos intervalos desde la sección de disponibilidad semanal.

Cada intervalo debe contener:

- Día de la semana.
- Hora de inicio.
- Hora de finalización.
- Fecha inicial de vigencia.
- Fecha final de vigencia opcional.

Al guardar, ejecutar un `POST` individual por cada nuevo intervalo.

### 7.2. Modificar horarios

Los intervalos existentes deben poder editarse desde la misma sección.

Al guardar los cambios, utilizar:

`PATCH /api/v1/staff-members/{staff_member_id}/schedules/{schedule_id}`

La interfaz debe identificar los intervalos modificados para evitar actualizaciones innecesarias.

### 7.3. Desactivar horarios

El usuario debe poder desactivar un intervalo sin eliminarlo físicamente.

Utilizar:

`PATCH /api/v1/staff-members/{staff_member_id}/schedules/{schedule_id}/status`

Los horarios inactivos deben permanecer visibles e identificados como tales.

No deben considerarse para la disponibilidad futura.

### 7.4. Reactivar horarios

Si el backend permite cambiar el estado de un horario inactivo a activo mediante el mismo endpoint, la interfaz debe permitir reactivarlo.

Antes de reactivarlo, deben validarse las restricciones de solapamiento aplicables.

Si el backend rechaza la operación, mostrar el error correspondiente sin alterar el estado confirmado.

### 7.5. Guardado y fallos parciales

Los cambios del trabajador y de sus horarios son operaciones independientes.

- Los datos propios del trabajador se actualizan mediante `PATCH /api/v1/staff/{staff_id}`.
- Las nuevas asignaciones de roles se administran conforme a la SPEC 09.
- Las especialidades se administran conforme a la SPEC 12.
- Los horarios nuevos se registran mediante `POST`.
- Los horarios existentes se modifican mediante `PATCH`.
- Los horarios que deben desactivarse utilizan el endpoint de estado.

Si alguna operación falla:

- Conservar los cambios que el backend confirmó.
- Identificar los horarios pendientes o fallidos.
- Informar qué cambios se guardaron y cuáles no.
- Permitir reintentar las operaciones pendientes.
- No repetir innecesariamente operaciones exitosas.

No asumir una transacción única entre los datos del trabajador y sus relaciones.

## 8. Detalle del personal

La vista de detalle existente debe incorporar una sección de disponibilidad semanal.

Debe mostrar:

- Día de la semana.
- Hora de inicio.
- Hora de finalización.
- Fecha inicial de vigencia.
- Fecha final de vigencia, cuando exista.
- Estado activo o inactivo.

La presentación debe organizar los intervalos por día y permitir distinguir los horarios activos de los inactivos.

La administración debe realizarse desde el formulario de edición, sin crear una página independiente.

No presentar esta información como horas efectivamente trabajadas ni como registros de asistencia.

## 9. Relación con los horarios de las clínicas

Los horarios del personal y los horarios de las clínicas son configuraciones independientes.

- La SPEC 13 administra los horarios generales de apertura de cada clínica.
- La SPEC 14 administra los horarios recurrentes de cada trabajador.

No existe en el modelo definido una relación muchos a muchos para compartir intervalos de horarios entre clínicas y trabajadores.

Por lo tanto:

1. No reutilizar ni copiar automáticamente los registros de `clinic_schedule` dentro de `staff_schedule`.
2. No asignar automáticamente los horarios de una clínica al personal.
3. No asumir que el trabajador está disponible durante todo el horario de apertura de la clínica.
4. No permitir interpretar la disponibilidad individual como una ampliación del horario de apertura.

La disponibilidad efectiva será la intersección de:

- Horarios activos de la clínica.
- Horarios activos del trabajador.
- Periodos de vigencia de ambos.

Después se deben considerar las excepciones y las citas existentes, conforme a las especificaciones de disponibilidad.

Esta especificación no debe implementar ese cálculo.

## 10. Validaciones de horarios

La interfaz debe implementar validaciones preventivas de acuerdo con las reglas del backend.

### 10.1. Día de la semana

`day_of_week` debe ser un entero entre 1 y 7:

- 1: lunes.
- 2: martes.
- 3: miércoles.
- 4: jueves.
- 5: viernes.
- 6: sábado.
- 7: domingo.

La interfaz puede mostrar los nombres de los días, pero debe enviar los valores numéricos definidos por el backend.

### 10.2. Horas

- La hora de inicio debe ser anterior a la hora de finalización.
- No se permiten intervalos de duración cero.
- No se permiten intervalos que crucen la medianoche.
- Los horarios que atraviesen medianoche deben dividirse en dos registros en días consecutivos.

### 10.3. Vigencia

- `valid_from` es obligatorio.
- `valid_until` es opcional y puede ser `null`.
- Si existe `valid_until`, debe ser mayor o igual a `valid_from`.

### 10.4. Solapamientos

El frontend debe realizar validaciones preventivas cuando disponga de información suficiente.

Se deben considerar:

- El trabajador.
- El día de la semana.
- La hora de inicio y finalización.
- La fecha inicial de vigencia.
- La fecha final de vigencia.
- El estado activo del horario.

No basta comparar únicamente las horas.

Se deben permitir varios intervalos para el mismo día cuando no exista solapamiento y sus periodos de vigencia sean compatibles.

El backend es la autoridad definitiva para determinar si existe un solapamiento.

Si el backend rechaza un horario, mostrar el error y conservar los datos introducidos.

## 11. Estado laboral y disponibilidad

La interfaz debe mostrar el estado del personal conforme a la SPEC 08.

No debe implementar por su cuenta el cálculo de disponibilidad basándose únicamente en `staff_schedule`.

El backend establece que:

- El personal terminado no debe recibir nuevas citas.
- El personal inactivo no debe recibir nuevas citas.
- El personal de licencia (`on_leave`) debe excluirse de la disponibilidad mientras dure esa situación.
- La persona relacionada también debe estar activa para que el trabajador participe en la disponibilidad.

Estas reglas pertenecen al cálculo de disponibilidad y no modifican automáticamente los registros de horarios.

No desactivar ni eliminar horarios automáticamente por cambios de estado laboral, salvo que otra especificación del backend lo establezca.

## 12. Experiencia de usuario

La integración debe mantener una experiencia sencilla:

- No crear páginas independientes para horarios.
- No agregar rutas nuevas para `staff_schedule`.
- No obligar al usuario a salir del formulario de personal.
- Mantener los datos personales y laborales como prioridad.
- Presentar la disponibilidad semanal en una sección secundaria y opcional.
- Permitir registrar personal sin horarios.
- Permitir varios intervalos por día.
- Facilitar la modificación y desactivación de intervalos existentes.
- Mostrar claramente las fechas de vigencia.
- Evitar perder los datos del formulario cuando falle una operación.

La configuración de disponibilidad no debe hacer excesivamente complejo el registro inicial del trabajador.

## 13. Estados de interfaz

Contemplar como mínimo:

- Cargando horarios.
- Personal sin horarios configurados.
- Agregando intervalo.
- Editando intervalo.
- Guardando datos del personal.
- Registrando horarios.
- Actualizando horarios.
- Desactivando horario.
- Reactivando horario.
- Operación completada.
- Operación parcialmente completada.
- Error de consulta.
- Error de creación.
- Error de actualización.
- Error de estado.
- Error por solapamiento o vigencia inválida.

Los estados de error deben permitir comprender qué operación falló y qué información se conservó.

## 14. Navegación y rutas

No se deben agregar opciones nuevas al sidebar ni rutas independientes para administrar horarios del personal.

Se reutilizan las rutas existentes del módulo de personal:

- Creación: `/staff/create`
- Detalle: `/staff/:staffId`
- Edición: `/staff/:staffId/edit`

La navegación se mantiene conforme a la SPEC 00.

## 15. Reutilización de componentes

Antes de desarrollar componentes nuevos, inspeccionar los recursos existentes.

Reutilizar cuando corresponda:

- Componentes de formularios.
- Selectores de días.
- Campos de fecha.
- Campos de hora.
- Listas y tablas.
- Diálogos de confirmación.
- Alertas y notificaciones.
- Estados de carga y error.
- Componentes de roles de la SPEC 09.
- Componentes de especialidades de la SPEC 12.

Los componentes específicos de horarios deben permanecer dentro del módulo de personal, salvo que exista una necesidad real de reutilización.

## 16. Pruebas

Verificar como mínimo:

### Creación

- Crear personal sin horarios.
- Crear personal con un intervalo.
- Crear personal con varios intervalos en un mismo día.
- Crear horarios para distintos días.
- Registrar fechas de vigencia.
- Crear personal con horarios y manejar fallos parciales.
- Reintentar horarios pendientes sin duplicar el registro de personal.

### Edición

- Consultar los horarios de un trabajador.
- Agregar nuevos intervalos.
- Modificar intervalos existentes.
- Desactivar horarios.
- Reactivar horarios cuando el backend lo permita.
- Conservar los horarios inactivos.
- Manejar fallos parciales.

### Validaciones

- Rechazar días fuera del rango 1–7.
- Rechazar horas iguales.
- Rechazar horas de inicio posteriores a las de finalización.
- Rechazar vigencias invertidas.
- Permitir intervalos no solapados en un mismo día.
- Detectar solapamientos cuando sea posible.
- Mostrar errores definitivos del backend.
- Confirmar que los horarios inactivos no participan en disponibilidad.

### Integración

- Verificar los endpoints y cuerpos de solicitud.
- Confirmar que `POST` y `PATCH` de personal no reciban horarios.
- Confirmar que las operaciones utilicen el `staff_member_id` correspondiente.
- Confirmar que no se creen horarios automáticamente.
- Confirmar que los horarios de clínicas no se copien al trabajador.
- Confirmar que la interfaz no calcule disponibilidad efectiva.

## 17. Exclusiones

Esta especificación no debe implementar:

- Control de asistencia.
- Horas trabajadas.
- Ausencias puntuales.
- Licencias.
- Excepciones de horarios.
- Citas.
- Disponibilidad efectiva.
- Intersección automática de horarios de clínicas y trabajadores.
- Copia o sincronización automática de horarios.
- Páginas independientes para `staff_schedule`.
- Modificaciones del contrato de creación o actualización de personal para incluir horarios.

## 18. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar la integración de horarios en los formularios de personal, el carácter opcional de la configuración, las operaciones secuenciales, las validaciones de intervalos y la relación conceptual con los horarios de las clínicas.

## 19. Criterios de aceptación

La implementación se considera completa cuando:

1. El usuario puede registrar personal sin configurar horarios.
2. El usuario puede agregar uno o varios intervalos durante la creación.
3. Los horarios se registran después de crear el trabajador.
4. El usuario puede consultar los horarios desde el detalle del personal.
5. El usuario puede agregar, modificar y desactivar horarios desde el formulario de edición.
6. Se permiten varios intervalos no solapados para un mismo día.
7. Se respetan las fechas de vigencia.
8. Los horarios inactivos se conservan y no participan en disponibilidad.
9. Los fallos parciales se informan y pueden reintentarse sin duplicar operaciones exitosas.
10. No se crean páginas ni rutas adicionales para administrar `staff_schedule`.
11. No se copian automáticamente los horarios de las clínicas.
12. Se conserva la separación de responsabilidades entre personal, clínicas y sus respectivos horarios.
13. No se implementa el cálculo de disponibilidad efectiva.
