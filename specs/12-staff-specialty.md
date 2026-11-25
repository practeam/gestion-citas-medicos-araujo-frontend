# SPEC 12 — Asociación de especialidades al personal 

## 1. Prioridad y dependencias

Esta especificación define la integración de especialidades en los formularios del módulo de personal.

Depende de:

- SPEC 04 — Catálogo de especialidades.
- SPEC 08 — Módulo de personal.

Skills aplicables:

- `$frontend-arquitectura`: organización e integración dentro del módulo de personal.
- `$frontend-integracion-api`: comunicación con los endpoints de personal y especialidades.
- `$frontend-catalogo-componentes`: reutilización de componentes existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

La implementación debe respetar la arquitectura existente y las responsabilidades de cada módulo.

## 2. Objetivo

Permitir asociar una o varias especialidades a cada miembro del personal directamente desde los formularios de creación y edición.

La asignación de especialidades es **opcional**. El usuario puede registrar un trabajador sin seleccionar ninguna especialidad y completar esta información posteriormente.

El usuario debe poder:

- Consultar las especialidades disponibles.
- Seleccionar cero, una o varias especialidades al registrar personal.
- Consultar las especialidades actualmente asociadas.
- Agregar especialidades al editar personal.
- Retirar especialidades existentes.
- Identificar especialidades inactivas que permanezcan asociadas, si corresponde.

**No se deben crear páginas independientes para administrar las relaciones entre personal y especialidades.**

La gestión debe estar integrada en el flujo habitual del módulo de personal.

## 3. Alcance

Esta especificación comprende:

- Integración de especialidades en el formulario de creación de personal.
- Integración de especialidades en el formulario de edición de personal.
- Visualización de especialidades en el detalle del personal.
- Selección múltiple de especialidades.
- Asignación y eliminación de relaciones.
- Manejo de errores y operaciones parcialmente completadas.

No comprende:

- Certificación profesional.
- Validación de títulos o credenciales.
- Autorización para realizar procedimientos.
- Validaciones de elegibilidad clínica.
- Asignación automática de especialidades.
- Modificación del catálogo de especialidades desde el formulario de personal.
- Asignación de especialidades a personas que todavía no tienen un registro de personal.

Una especialidad asociada representa una relación declarada en el sistema. No constituye por sí sola una certificación ni una autorización profesional.

## 4. Organización del módulo

La funcionalidad debe integrarse en el módulo existente:

`frontend/src/modules/staff/`

El módulo de personal será responsable de coordinar las asociaciones entre miembros del personal y especialidades.

El módulo de especialidades conservará la responsabilidad de administrar el catálogo.

Se deben reutilizar los servicios y componentes existentes cuando corresponda.

Se pueden incorporar componentes internos del módulo de personal, por ejemplo:

- `StaffSpecialtiesSection`: sección integrada para visualizar y administrar especialidades.
- `SpecialtySelector`: selector de especialidades disponibles.
- `StaffSpecialtyItem`: representación de una especialidad asociada.

Estos nombres son orientativos. Antes de crear componentes nuevos se debe inspeccionar la estructura existente.

Los componentes deben mantener separadas las responsabilidades del catálogo y de las asociaciones.

## 5. Integración con la API

Prefijo:

`/api/v1`

### 5.1. Consultar especialidades disponibles

Reutilizar el endpoint del catálogo definido en la SPEC 04:

`GET /api/v1/specialties`

Utilizar los parámetros de paginación, búsqueda, ordenamiento y filtros admitidos por el backend.

Para nuevas asociaciones se deben mostrar únicamente especialidades activas mediante:

`is_active=true`

El selector debe permitir:

- Buscar especialidades por nombre.
- Consultar su descripción cuando esté disponible.
- Seleccionar varias especialidades.
- Identificar las especialidades seleccionadas.
- Recorrer el catálogo respetando la paginación del backend.

No asumir que todo el catálogo estará disponible en una sola respuesta.

### 5.2. Consultar especialidades asociadas al personal

Endpoint:

`GET /api/v1/staff-members/{staff_member_id}/specialties`

Debe utilizarse para recuperar las especialidades actualmente asociadas al miembro del personal.

La respuesta contiene los datos mínimos definidos por el backend:

- `id`
- `name`
- `description`
- `is_active`

No inventar campos adicionales en la respuesta.

### 5.3. Asignar una especialidad

Endpoint:

`PUT /api/v1/staff-members/{staff_member_id}/specialties/{specialty_id}`

La operación debe asignar la especialidad al miembro del personal.

El endpoint es idempotente: repetir la misma solicitud no debe crear asociaciones duplicadas.

No enviar las especialidades dentro de `POST /api/v1/staff` ni de `PATCH /api/v1/staff/{staff_id}`.

### 5.4. Retirar una especialidad

Endpoint:

`DELETE /api/v1/staff-members/{staff_member_id}/specialties/{specialty_id}`

Debe utilizarse para retirar exclusivamente la asociación entre el miembro del personal y la especialidad.

No debe eliminar:

- El miembro del personal.
- La persona relacionada con el miembro del personal.
- La especialidad del catálogo.

## 6. Formulario de creación de personal

El formulario de creación debe permitir registrar los datos del personal y, opcionalmente, seleccionar sus especialidades dentro del mismo flujo.

Debe contener:

**Datos del personal**

Los campos definidos en la SPEC 08, respetando el contrato de creación del backend.

**Roles del personal**

La asignación integrada definida en la SPEC 09.

**Especialidades**

- Catálogo de especialidades activas.
- Búsqueda de especialidades.
- Selección múltiple.
- Posibilidad de no seleccionar ninguna especialidad.

La sección debe aparecer integrada en el formulario, bajo un título como **Especialidades del personal**.

La selección de especialidades no debe ser obligatoria para guardar el registro.

### 6.1. Secuencia de creación

El backend utiliza endpoints independientes para crear personal y asociar especialidades.

Por ello, el frontend debe ejecutar las operaciones secuencialmente:

1. El usuario selecciona una persona existente o registra una nueva mediante los componentes definidos en la SPEC 06.
2. Completa los datos propios del personal.
3. Selecciona opcionalmente los roles, conforme a la SPEC 09.
4. Selecciona opcionalmente las especialidades.
5. El frontend ejecuta `POST /api/v1/staff`.
6. Obtiene el `staff_member_id` de la respuesta.
7. Ejecuta las asignaciones de roles definidas en la SPEC 09.
8. Ejecuta un `PUT /api/v1/staff-members/{staff_member_id}/specialties/{specialty_id}` por cada especialidad seleccionada.
9. Informa el resultado del registro y de las relaciones.

Si el usuario no selecciona especialidades, no se debe ejecutar ninguna solicitud de asignación de especialidades.

No enviar las especialidades dentro del cuerpo de creación del personal.

No asumir que la creación del personal y sus relaciones constituyen una única transacción.

### 6.2. Fallos parciales

Si el personal se crea correctamente, pero alguna asociación de especialidades falla:

- No volver a crear el registro de personal.
- Conservar el `staff_member_id` obtenido.
- Informar que el personal fue creado, pero que algunas especialidades no pudieron asociarse.
- Identificar las especialidades pendientes.
- Permitir reintentar únicamente las asignaciones pendientes.
- No eliminar automáticamente el personal ni las asociaciones que sí se completaron.

Si también falla alguna asignación de roles, identificar por separado los resultados de roles y especialidades.

Los reintentos deben evitar duplicar operaciones que ya fueron confirmadas por el backend.

## 7. Formulario de edición de personal

La edición debe permitir modificar los datos propios del personal y administrar sus roles y especialidades desde el mismo formulario.

Al abrir la edición:

1. Consultar los datos del personal mediante `GET /api/v1/staff/{staff_id}`.
2. Consultar sus roles mediante el endpoint definido en la SPEC 09.
3. Consultar sus especialidades mediante `GET /api/v1/staff-members/{staff_member_id}/specialties`.
4. Consultar el catálogo de especialidades activas mediante `GET /api/v1/specialties`.
5. Mostrar los datos y las relaciones actuales.

### 7.1. Agregar especialidades

El usuario debe poder seleccionar especialidades activas que todavía no estén asociadas.

Al guardar, el frontend debe identificar las nuevas especialidades y ejecutar un `PUT` individual por cada una.

No volver a enviar las asociaciones que ya existen y no han cambiado.

### 7.2. Retirar especialidades

El usuario debe poder deseleccionar especialidades actualmente asociadas.

Al guardar, el frontend debe identificar las relaciones que deben retirarse y ejecutar el endpoint `DELETE` correspondiente.

La eliminación de la asociación no debe modificar el catálogo de especialidades.

### 7.3. Especialidades inactivas

Las especialidades inactivas que ya estén asociadas deben mostrarse identificadas visualmente.

- No ofrecerlas como nuevas opciones de selección.
- No intentar asignarlas nuevamente.
- Permitir consultar las asociaciones existentes.
- Permitir retirarlas si el backend lo admite.

La interfaz debe respetar el comportamiento real del backend.

### 7.4. Guardado y fallos parciales

Los cambios de personal, roles y especialidades son operaciones independientes.

- Los datos propios del personal se actualizan mediante `PATCH /api/v1/staff/{staff_id}`.
- Las asignaciones de roles se administran conforme a la SPEC 09.
- Las nuevas especialidades se asignan mediante `PUT`.
- Las especialidades retiradas se eliminan mediante `DELETE`.

Si alguna operación falla:

- Conservar los cambios que el backend confirmó.
- Identificar las operaciones pendientes o fallidas.
- Informar qué cambios se guardaron y cuáles no.
- Permitir reintentar las operaciones pendientes.
- No repetir innecesariamente operaciones exitosas.

No asumir una transacción única entre los distintos endpoints.

## 8. Detalle del personal

La vista de detalle existente debe incorporar una sección de especialidades asociadas.

Debe mostrar:

- Nombre de la especialidad.
- Descripción, cuando esté disponible.
- Estado activo o inactivo, cuando corresponda.

La sección debe permitir consultar las especialidades sin navegar al catálogo.

La administración de asociaciones debe realizarse desde el formulario de edición, sin crear una página independiente.

No presentar las especialidades como certificaciones verificadas ni como autorizaciones para realizar procedimientos.

## 9. Experiencia de usuario

La integración debe mantener una experiencia sencilla:

- No crear páginas independientes para las asociaciones.
- No agregar rutas nuevas para `staff_specialty`.
- No obligar al usuario a salir del formulario de personal.
- Utilizar una sección claramente identificada como **Especialidades del personal**.
- Permitir seleccionar varias especialidades.
- Permitir guardar el registro sin seleccionar especialidades.
- Diferenciar especialidades disponibles, asociadas e inactivas.
- Mostrar confirmaciones y resultados de las operaciones.
- Evitar perder los datos del formulario cuando falle una asociación.

Las especialidades deben ser una sección opcional, no un requisito para registrar personal.

## 10. Estados de interfaz

Contemplar como mínimo:

- Cargando catálogo de especialidades.
- Cargando especialidades asociadas.
- Catálogo sin especialidades disponibles.
- Personal sin especialidades asociadas.
- Especialidades seleccionadas.
- Guardando datos del personal.
- Asignando especialidades.
- Retirando especialidades.
- Operación completada.
- Operación parcialmente completada.
- Error de consulta.
- Error de asignación.
- Error al retirar una asociación.

Los estados de error deben permitir comprender qué operación falló y qué información se conservó.

## 11. Validaciones y reglas de negocio

El frontend debe respetar las reglas del backend:

1. El miembro del personal y la especialidad deben existir.
2. No se deben asignar especialidades inactivas.
3. No se deben crear asociaciones duplicadas.
4. Una asignación repetida mediante `PUT` debe ser idempotente.
5. Retirar una asociación no debe eliminar las entidades base.
6. No bloquear la asignación por estado laboral, salvo que el backend incorpore expresamente esa regla.
7. No asignar especialidades automáticamente.
8. La selección de especialidades no es obligatoria.
9. Una asociación no constituye una certificación ni una autorización profesional.

Los errores definitivos del backend deben prevalecer sobre las validaciones preventivas del frontend.

## 12. Navegación y rutas

No se deben agregar opciones nuevas al sidebar ni rutas independientes para administrar especialidades del personal.

Se reutilizan las rutas existentes del módulo de personal, definidas en:

- `frontend/src/components/layout/app-layout/sidebar/data.tsx`
- `frontend/src/App.tsx`

La funcionalidad se incorpora en:

- Creación: `/staff/create`
- Detalle: `/staff/:staffId`
- Edición: `/staff/:staffId/edit`

La navegación del catálogo de especialidades continúa perteneciendo al módulo correspondiente, conforme a la SPEC 04.

## 13. Reutilización de componentes

Antes de desarrollar componentes nuevos, inspeccionar los recursos existentes.

Reutilizar cuando corresponda:

- Componentes de formularios.
- Selectores múltiples.
- Campos de búsqueda.
- Listas y tablas.
- Diálogos de confirmación.
- Alertas y notificaciones.
- Estados de carga y error.
- Servicios del catálogo de especialidades.
- Componentes de asignación de roles definidos en la SPEC 09, manteniendo separadas ambas relaciones.

Los componentes específicos de las asociaciones deben permanecer dentro del módulo de personal, salvo que se identifique una necesidad real de reutilización en otros módulos.

## 14. Pruebas

Verificar como mínimo:

### Creación
- Crear personal sin especialidades.
- Crear personal con una especialidad.
- Crear personal con varias especialidades.
- Confirmar que no se ejecutan solicitudes de asignación cuando no se seleccionan especialidades.
- Ejecutar las asignaciones después de crear el registro de personal.
- Manejar fallos parciales de asociación.
- Reintentar asociaciones pendientes sin duplicar el registro de personal.

### Edición
- Consultar las especialidades asociadas.
- Agregar una o varias especialidades.
- Retirar una o varias especialidades.
- Guardar cambios del personal y sus relaciones.
- Manejar fallos parciales.
- Reintentar operaciones pendientes.

### Validaciones
- Rechazar identificadores inexistentes.
- No permitir nuevas asignaciones de especialidades inactivas.
- Comprobar la idempotencia de `PUT`.
- Identificar especialidades inactivas que ya estén asociadas.
- Confirmar que no se exige seleccionar especialidades para guardar el formulario.
- Conservar la información del formulario ante errores.

### Integración
- Verificar los endpoints y cuerpos de solicitud.
- Confirmar que `POST` y `PATCH` de personal no reciban especialidades.
- Confirmar que retirar una asociación no elimine al personal ni la especialidad del catálogo.
- Confirmar que el registro de personal no genere asignaciones automáticas.

## 15. Exclusiones

Esta especificación no debe implementar:

- Certificación profesional.
- Validación de títulos.
- Autorización para realizar procedimientos.
- Elegibilidad clínica.
- Asignación automática de especialidades.
- Gestión del catálogo de especialidades desde el formulario de personal.
- Páginas independientes para `staff_specialty`.
- Modificaciones del contrato de creación o actualización de personal para incluir relaciones.

## 16. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar la integración de especialidades en los formularios de personal, el carácter opcional de las asignaciones, las operaciones secuenciales, el manejo de fallos parciales y las responsabilidades de los módulos involucrados.

## 17. Criterios de aceptación

La implementación se considera completa cuando:

1. El usuario puede registrar personal sin seleccionar especialidades.
2. El usuario puede seleccionar una o varias especialidades durante la creación.
3. Las asignaciones se ejecutan después de crear el registro de personal.
4. El usuario puede consultar las especialidades asociadas desde el detalle.
5. El usuario puede agregar y retirar especialidades desde el formulario de edición.
6. Las relaciones se administran mediante los endpoints específicos.
7. Las especialidades inactivas no se ofrecen para nuevas asignaciones.
8. Los fallos parciales se informan y pueden reintentarse sin duplicar operaciones exitosas.
9. No se crean páginas ni rutas adicionales para administrar `staff_specialty`.
10. Se conserva la separación de responsabilidades entre los módulos de personal y especialidades.
11. La asociación de especialidades no se interpreta como certificación ni autorización profesional.
12. La integración de especialidades no interfiere con la asignación de roles definida en la SPEC 09.