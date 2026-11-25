# SPEC 13 — Gestión de horarios de clínicas (Frontend)

## 1. Prioridad y dependencias

Esta especificación define la integración de horarios semanales recurrentes en los formularios del módulo de clínicas.

Depende de:

- SPEC 05 — Módulo de clínicas.

Skills aplicables:

- `$frontend-arquitectura`: organización e integración dentro del módulo de clínicas.
- `$frontend-integracion-api`: comunicación con los endpoints de clínicas y horarios.
- `$frontend-catalogo-componentes`: reutilización de componentes existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

La implementación debe respetar la arquitectura existente y las responsabilidades del módulo de clínicas.

## 2. Objetivo

Permitir administrar los horarios semanales recurrentes de apertura de una clínica directamente desde sus formularios de creación y edición.

El usuario debe poder:

- Consultar los horarios registrados para una clínica.
- Agregar horarios para los días de la semana.
- Registrar varios intervalos en un mismo día.
- Definir la fecha desde la cual un horario tiene vigencia.
- Definir opcionalmente una fecha de finalización.
- Modificar horarios existentes.
- Activar o desactivar horarios.
- Consultar los horarios desde el detalle de la clínica.

**No se deben crear páginas independientes para administrar los horarios de las clínicas.**

La gestión debe estar integrada en el flujo habitual de creación, edición y consulta de una clínica.

La configuración de horarios es opcional. Se debe poder registrar una clínica sin definir horarios y agregarlos posteriormente.

## 3. Alcance

Esta especificación comprende:

- Integración de horarios en el formulario de creación de clínicas.
- Integración de horarios en el formulario de edición de clínicas.
- Visualización de horarios en el detalle de la clínica.
- Administración de intervalos semanales.
- Configuración de periodos de vigencia.
- Modificación y desactivación de horarios.
- Validaciones preventivas de los intervalos.
- Manejo de errores y operaciones parcialmente completadas.

No comprende:

- Creación de citas.
- Gestión de horarios de profesionales.
- Cálculo de disponibilidad de pacientes o profesionales.
- Excepciones de cierre.
- Modificaciones puntuales de horarios.
- Gestión de `schedule_exception`.
- Gestión de `schedule_override`.
- Resolución de conflictos de citas.
- Cálculo de disponibilidad unificada.

Los horarios representan patrones recurrentes de apertura de una clínica, no citas ni cierres excepcionales.

## 4. Organización del módulo

La funcionalidad debe integrarse en el módulo existente:

`frontend/src/modules/clinics/`

El módulo de clínicas será responsable de coordinar la administración de sus horarios.

Se pueden incorporar componentes internos del módulo, por ejemplo:

- `ClinicSchedulesSection`: sección integrada para administrar horarios.
- `ClinicScheduleForm`: formulario para crear o editar un intervalo.
- `ClinicScheduleList`: listado de intervalos registrados.
- `ClinicScheduleItem`: representación de un horario individual.

Estos nombres son orientativos. Antes de crear componentes nuevos se debe inspeccionar la estructura existente.

Los componentes deben permanecer dentro del módulo de clínicas, salvo que exista una necesidad real de reutilización.

La implementación no debe reorganizar la estructura general del frontend ni crear un módulo independiente para horarios de clínicas.

## 5. Integración con la API

Prefijo:

`/api/v1`

Todos los endpoints de horarios pertenecen a una clínica específica.

### 5.1. Crear un horario

Endpoint:

`POST /api/v1/clinics/{clinic_id}/schedules`

Cuerpo:

```json
{
  "day_of_week": 1,
  "starts_at": "09:00",
  "ends_at": "13:00",
  "valid_from": "2026-11-01",
  "valid_until": null
}
```

La operación crea un intervalo semanal recurrente asociado a la clínica.

### 5.2. Consultar horarios

Endpoint:

`GET /api/v1/clinics/{clinic_id}/schedules`

Debe utilizarse para recuperar los horarios de la clínica.

La interfaz debe permitir visualizar los intervalos por día de la semana y distinguir los horarios activos e inactivos.

No asumir filtros, paginación ni parámetros que no estén definidos por el backend.

### 5.3. Consultar un horario específico

Endpoint:

`GET /api/v1/clinics/{clinic_id}/schedules/{schedule_id}`

Se utilizará cuando sea necesario recuperar individualmente un horario para su edición o consulta.

### 5.4. Actualizar un horario

Endpoint:

`PATCH /api/v1/clinics/{clinic_id}/schedules/{schedule_id}`

Debe utilizarse para modificar los campos que el backend permita actualizar.

La interfaz debe respetar el contrato real de actualización.

No enviar campos de auditoría ni identificadores como datos modificables.

### 5.5. Activar o desactivar un horario

Endpoint:

`PATCH /api/v1/clinics/{clinic_id}/schedules/{schedule_id}/status`

Debe utilizarse para cambiar el estado del horario.

La interfaz debe ofrecer acciones para activar o desactivar un intervalo, respetando las reglas del backend.

La desactivación debe conservar el registro y su información histórica.

### 5.6. Eliminar un horario

Endpoint:

`DELETE /api/v1/clinics/{clinic_id}/schedules/{schedule_id}`

El backend contempla este endpoint únicamente si se decide que no es necesario conservar historial.

La interfaz debe priorizar la desactivación mediante el endpoint de estado.

No ofrecer eliminación física como acción habitual mientras la política definitiva del backend recomiende conservar los registros históricos.

## 6. Formulario de creación de clínicas

El formulario de creación debe permitir registrar los datos de la clínica y, opcionalmente, configurar sus horarios semanales dentro del mismo flujo.

Debe contener:

**Datos de la clínica**

Los campos definidos en la SPEC 05, respetando el contrato de creación del backend.

**Horarios de atención**

- Selección del día de la semana.
- Hora de inicio.
- Hora de finalización.
- Fecha inicial de vigencia.
- Fecha final de vigencia opcional.
- Posibilidad de agregar varios intervalos.

La sección debe aparecer integrada en el formulario, bajo un título como **Horarios de atención**.

La configuración de horarios no debe ser obligatoria para crear la clínica.

### 6.1. Organización visual de los horarios

La interfaz debe organizar los intervalos por día:

| Día | Intervalos |
|---|---|
| Lunes | 09:00–13:00 / 14:00–18:00 |
| Martes | 09:00–13:00 |
| Miércoles | Sin horarios configurados |
| Jueves | 09:00–13:00 / 14:00–18:00 |
| Viernes | 09:00–17:00 |
| Sábado | 09:00–13:00 |
| Domingo | Sin horarios configurados |

Los valores anteriores son ilustrativos y no representan horarios predeterminados.

El usuario debe poder agregar tantos intervalos como necesite, siempre que no incumplan las validaciones del backend.

### 6.2. Secuencia de creación

El backend utiliza endpoints independientes para crear clínicas y sus horarios.

Por ello, el frontend debe ejecutar las operaciones secuencialmente:

1. El usuario completa los datos de la clínica.
2. Agrega opcionalmente uno o varios horarios.
3. El frontend ejecuta `POST /api/v1/clinics`.
4. Obtiene el `clinic_id` de la respuesta.
5. Ejecuta un `POST /api/v1/clinics/{clinic_id}/schedules` por cada intervalo configurado.
6. Informa el resultado de la creación y de los horarios.

Si el usuario no configura horarios, no se debe ejecutar ninguna solicitud de creación de horarios.

No enviar los horarios dentro de `POST /api/v1/clinics`.

No asumir que la creación de la clínica y sus horarios constituyen una única transacción.

### 6.3. Fallos parciales

Si la clínica se crea correctamente, pero falla la creación de uno o varios horarios:

- No volver a crear la clínica.
- Conservar el `clinic_id` obtenido.
- Informar que la clínica fue creada, pero que algunos horarios no pudieron registrarse.
- Identificar los intervalos pendientes.
- Conservar los valores introducidos para cada intervalo.
- Permitir reintentar únicamente las operaciones pendientes.
- No eliminar automáticamente la clínica ni los horarios que sí se crearon.

## 7. Formulario de edición de clínicas

La edición debe permitir modificar los datos de la clínica y administrar sus horarios desde el mismo formulario.

Al abrir la edición:

1. Consultar los datos de la clínica mediante `GET /api/v1/clinics/{clinic_id}`.
2. Consultar sus horarios mediante `GET /api/v1/clinics/{clinic_id}/schedules`.
3. Mostrar los datos y los intervalos existentes.
4. Permitir agregar, modificar y desactivar horarios.

### 7.1. Agregar horarios

El usuario debe poder agregar nuevos intervalos desde la misma sección.

Cada nuevo intervalo debe contener:

- Día de la semana.
- Hora de inicio.
- Hora de finalización.
- Fecha inicial de vigencia.
- Fecha final de vigencia opcional.

Al guardar, ejecutar un `POST` individual por cada nuevo intervalo.

### 7.2. Modificar horarios

Los intervalos existentes deben poder editarse desde la sección de horarios.

Al guardar los cambios, utilizar:

`PATCH /api/v1/clinics/{clinic_id}/schedules/{schedule_id}`

La interfaz debe identificar qué intervalos fueron modificados para evitar enviar actualizaciones innecesarias.

### 7.3. Desactivar horarios

El usuario debe poder desactivar un intervalo sin eliminarlo físicamente.

Utilizar:

`PATCH /api/v1/clinics/{clinic_id}/schedules/{schedule_id}/status`

Los horarios inactivos deben permanecer visibles en la interfaz, identificados como inactivos cuando corresponda.

No deben considerarse horarios vigentes para la futura disponibilidad.

### 7.4. Reactivar horarios

Si el backend permite cambiar el estado de un horario inactivo a activo mediante el mismo endpoint, la interfaz debe permitir reactivarlo.

Antes de reactivarlo, deben validarse las restricciones de solapamiento aplicables.

Si el backend rechaza la operación, mostrar el error correspondiente sin alterar el estado visual confirmado.

### 7.5. Guardado y fallos parciales

Los cambios de la clínica y de sus horarios son operaciones independientes.

- Los datos propios de la clínica se actualizan mediante `PATCH /api/v1/clinics/{clinic_id}`.
- Los horarios nuevos se registran mediante `POST`.
- Los horarios existentes se modifican mediante `PATCH`.
- Los horarios que deben desactivarse utilizan el endpoint de estado.

Si alguna operación falla:

- Conservar los cambios que el backend confirmó.
- Identificar los horarios pendientes o fallidos.
- Informar qué cambios se guardaron y cuáles no.
- Permitir reintentar las operaciones pendientes.
- No repetir innecesariamente operaciones exitosas.

No asumir una transacción única entre la clínica y todos sus horarios.

## 8. Validaciones de horarios

La interfaz debe implementar validaciones preventivas de acuerdo con las reglas del backend.

### 8.1. Día de la semana

`day_of_week` debe ser un entero entre 1 y 7:

- 1: lunes.
- 2: martes.
- 3: miércoles.
- 4: jueves.
- 5: viernes.
- 6: sábado.
- 7: domingo.

La interfaz puede mostrar los nombres de los días, pero debe enviar los valores numéricos definidos por el backend.

### 8.2. Horas

- La hora de inicio debe ser anterior a la hora de finalización.
- No se permiten intervalos de duración cero.
- No se permiten intervalos que crucen la medianoche.
- Para un horario que atraviese medianoche se deben registrar dos intervalos en días consecutivos.

Ejemplo válido:

- Lunes: 22:00–23:59.
- Martes: 00:00–02:00.

Los valores deben ajustarse al formato admitido por el backend.

### 8.3. Vigencia

- `valid_from` es obligatorio.
- `valid_until` es opcional y puede ser `null`.
- Si existe `valid_until`, debe ser mayor o igual a `valid_from`.

La interfaz debe validar la coherencia de las fechas antes de enviar los datos.

### 8.4. Solapamientos

El backend es la autoridad definitiva para determinar si existe un solapamiento.

El frontend debe realizar validaciones preventivas cuando disponga de información suficiente sobre los intervalos y sus periodos de vigencia.

Se deben considerar conjuntamente:

- La clínica.
- El día de la semana.
- La hora de inicio y finalización.
- La fecha inicial de vigencia.
- La fecha final de vigencia.
- El estado activo del horario.

No basta comparar únicamente las horas.

Se deben permitir varios intervalos para el mismo día cuando no exista solapamiento temporal y sus periodos de vigencia sean compatibles.

Los intervalos inactivos no deben tratarse como horarios vigentes para disponibilidad.

Si el backend rechaza un horario por solapamiento, mostrar el error y conservar los datos introducidos.

## 9. Zona horaria

La clínica tiene una zona horaria configurada en su modelo.

La SPEC 05 establece que `time_zone` no está expuesto en la API de clínicas.

Por lo tanto:

- No agregar un campo editable de zona horaria en el formulario.
- No inventar un valor de zona horaria.
- No convertir los campos `TIME` a UTC.
- Enviar las horas locales en el formato esperado por el backend.
- Respetar la interpretación de fechas y horas que realice el backend usando la zona horaria configurada para la clínica.

Los horarios representan horas locales de apertura y no instantes UTC.

## 10. Detalle de la clínica

La vista de detalle existente debe incorporar una sección de horarios.

Debe mostrar:

- Día de la semana.
- Hora de inicio.
- Hora de finalización.
- Fecha inicial de vigencia.
- Fecha final de vigencia, cuando exista.
- Estado activo o inactivo.

La presentación debe organizar los intervalos por día y permitir distinguir visualmente los horarios activos de los inactivos.

La administración debe realizarse desde el formulario de edición, sin crear una página independiente.

## 11. Experiencia de usuario

La integración debe mantener una experiencia sencilla:

- No crear páginas independientes para horarios.
- No agregar rutas nuevas para `clinic_schedule`.
- No obligar al usuario a salir del formulario de clínicas.
- Utilizar una sección claramente identificada como **Horarios de atención**.
- Permitir agregar varios intervalos en un mismo día.
- Permitir registrar una clínica sin horarios.
- Facilitar la edición y desactivación de intervalos existentes.
- Mostrar claramente la vigencia de cada intervalo.
- Evitar perder los datos del formulario cuando falle una operación.
- Solicitar confirmación antes de desactivar un horario, cuando corresponda.

La interfaz debe permitir gestionar los horarios sin convertir el formulario de clínica en una pantalla excesivamente compleja.

## 12. Estados de interfaz

Contemplar como mínimo:

- Cargando horarios.
- Clínica sin horarios configurados.
- Agregando intervalo.
- Editando intervalo.
- Guardando datos de clínica.
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

## 13. Navegación y rutas

No se deben agregar opciones nuevas al sidebar ni rutas independientes para administrar horarios de clínicas.

Se reutilizan las rutas existentes del módulo de clínicas, definidas en:

- `frontend/src/components/layout/app-layout/sidebar/data.tsx`
- `frontend/src/App.tsx`

La funcionalidad se incorpora en:

- Creación: `/clinics/create`
- Detalle: `/clinics/:clinicId`
- Edición: `/clinics/:clinicId/edit`

## 14. Reutilización de componentes

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

Los componentes específicos de horarios deben permanecer dentro del módulo de clínicas, salvo que se identifique una necesidad real de reutilización en otros módulos.

## 15. Pruebas

Verificar como mínimo:

### Creación

- Crear una clínica sin horarios.
- Crear una clínica con un intervalo.
- Crear una clínica con varios intervalos en un mismo día.
- Crear horarios para distintos días.
- Registrar fechas de vigencia.
- Crear una clínica con horarios y manejar fallos parciales.
- Reintentar horarios pendientes sin duplicar la clínica.

### Edición

- Consultar los horarios de una clínica.
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
- Confirmar que `POST` y `PATCH` de clínicas no reciban horarios.
- Confirmar que las operaciones de horarios utilicen el `clinic_id` correspondiente.
- Confirmar que desactivar un horario no elimine físicamente el registro.
- Confirmar que las horas se envíen como horas locales, sin conversiones UTC en el frontend.

## 16. Exclusiones

Esta especificación no debe implementar:

- Citas.
- Horarios individuales de profesionales.
- Disponibilidad de profesionales.
- Excepciones de cierre.
- Modificaciones puntuales de horarios.
- `schedule_exception`.
- `schedule_override`.
- Cálculo unificado de disponibilidad.
- Páginas independientes para `clinic_schedule`.
- Modificaciones del contrato de creación o actualización de clínicas para incluir horarios.

## 17. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar la integración de horarios en los formularios de clínicas, la administración de intervalos, las fechas de vigencia, las validaciones de solapamiento y el manejo de operaciones parcialmente completadas.

## 18. Criterios de aceptación

La implementación se considera completa cuando:

1. El usuario puede registrar una clínica sin configurar horarios.
2. El usuario puede agregar uno o varios intervalos durante la creación de la clínica.
3. Los horarios se registran después de crear la clínica.
4. El usuario puede consultar los horarios desde el detalle de la clínica.
5. El usuario puede agregar, modificar y desactivar horarios desde el formulario de edición.
6. Se permiten varios intervalos no solapados para un mismo día.
7. Se respetan las fechas de vigencia de cada intervalo.
8. Los horarios inactivos se conservan y no participan en disponibilidad.
9. Los fallos parciales se informan y pueden reintentarse sin duplicar operaciones exitosas.
10. No se crean páginas ni rutas adicionales para administrar `clinic_schedule`.
11. Se conserva la separación de responsabilidades entre clínicas y horarios.
12. No se implementa el cálculo de disponibilidad ni la gestión de citas.