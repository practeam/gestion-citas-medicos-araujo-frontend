# SPEC 09 — Asignación de roles al personal

## 1. Prioridad

**Prioridad:** 9

**Dependencias:**
- SPEC 01 — Roles.
- SPEC 08 — Módulo de personal.

Esta especificación define cómo gestionar las asignaciones de roles a los integrantes del personal desde los formularios y las pantallas existentes del módulo Personal.

La relación entre personal y roles pertenece funcionalmente al módulo `staff`, mientras que la administración del catálogo de roles pertenece al módulo `roles`.

## 2. Objetivo

Permitir asignar, consultar y retirar roles de los integrantes del personal.

La gestión de roles debe integrarse directamente en los flujos existentes de creación y edición de personal.

**No se deben crear páginas independientes para administrar las asignaciones de roles.**

El usuario debe poder:

- Seleccionar uno o varios roles al registrar personal.
- Consultar los roles asignados a un integrante.
- Agregar roles al editar un integrante.
- Retirar roles existentes.
- Identificar los roles activos e inactivos.
- Reintentar asignaciones que hayan fallado sin duplicar operaciones exitosas.

La asignación de roles no autentica usuarios ni implementa autorización efectiva. Estas funcionalidades corresponden a fases posteriores.

## 3. Alcance funcional

### 3.1. Funcionalidades incluidas

- Consultar los roles asignados a un integrante del personal.
- Consultar el catálogo de roles disponibles.
- Seleccionar roles durante la creación de personal.
- Asignar los roles seleccionados después de crear el registro de personal.
- Mostrar los roles asignados durante la edición.
- Agregar nuevos roles durante la edición.
- Retirar roles asignados.
- Mostrar roles inactivos que ya estén asignados, cuando la API permita consultarlos.
- Gestionar errores y fallos parciales.
- Mostrar los roles en el detalle del personal.

### 3.2. Funcionalidades excluidas

No implementar:

- Autenticación.
- Autorización efectiva.
- Protección de rutas basada en roles.
- Protección de endpoints basada en roles.
- Gestión de permisos de los roles.
- Asignación de permisos a roles.
- Creación o edición de roles desde el formulario de personal.
- Modificación de datos del catálogo de roles desde el módulo Personal.
- Asignación automática de roles.
- Páginas independientes para administrar relaciones entre personal y roles.

La administración del catálogo de roles continúa perteneciendo al módulo `roles`, definido en la SPEC 01.

## 4. Organización y responsabilidades

La funcionalidad de asignación debe integrarse en:

`frontend/src/modules/staff/`

El módulo `staff` será responsable de:

- Consultar los roles asignados a cada integrante.
- Gestionar las operaciones de asignación y retiro.
- Mantener el estado de selección de roles en los formularios.
- Mostrar los roles asociados al personal.
- Gestionar los errores de las operaciones.

El módulo `roles` será responsable de:

- Consultar el catálogo de roles.
- Proporcionar los tipos y servicios correspondientes al catálogo.
- Proporcionar los datos necesarios para seleccionar roles.

Mantener la separación de responsabilidades:

- `roles`: administración del catálogo.
- `staff`: administración de las asignaciones.

No duplicar servicios ni tipos del catálogo de roles dentro del módulo `staff` cuando ya existan recursos reutilizables.

## 5. Integración con la API

### 5.1. Prefijo

Las operaciones de asignación utilizan el recurso:

`/api/v1/staff-members/{staff_member_id}/roles`

Estas rutas son independientes de las rutas CRUD de personal, que continúan utilizando `/api/v1/staff`.

### 5.2. Endpoints de asignación

| Método | Endpoint | Propósito |
|---|---|---|
| GET | `/staff-members/{staff_member_id}/roles` | Consultar los roles asignados. |
| POST | `/staff-members/{staff_member_id}/roles` | Asignar un rol. |
| DELETE | `/staff-members/{staff_member_id}/roles/{role_id}` | Retirar una asignación. |

No asumir endpoints adicionales.

### 5.3. Asignar un rol

El endpoint recibe:

`POST /staff-members/{staff_member_id}/roles`

Contrato:

```json
{
  "role_id": 3
}
```

El frontend debe ejecutar una solicitud por cada rol que se quiera asignar.

No enviar un arreglo de roles ni asumir que existe una operación masiva.

### 5.4. Retirar un rol

Utilizar:

`DELETE /staff-members/{staff_member_id}/roles/{role_id}`

La operación elimina exclusivamente la relación entre el integrante y el rol.

No elimina al integrante del personal ni modifica el registro del rol.

### 5.5. Consultar roles asignados

Utilizar:

`GET /staff-members/{staff_member_id}/roles`

La respuesta proporciona el vínculo y los datos mínimos del rol, que pueden incluir:

- `id`
- `name`
- `description`
- `is_active`

El frontend debe utilizar el contrato real de respuesta del backend.

No asumir que el endpoint devuelve permisos expandidos.

No realizar consultas adicionales para obtener permisos de cada rol.

### 5.6. Consultar el catálogo de roles

Reutilizar el servicio del módulo `roles` y su endpoint de listado:

`GET /api/v1/roles`

Para seleccionar nuevos roles, consultar los roles activos utilizando los filtros admitidos por la SPEC 01.

El frontend debe respetar la paginación y los contratos del catálogo.

No implementar un catálogo independiente de roles dentro de `staff`.

## 6. Integración con el formulario de creación de personal

La asignación de roles debe formar parte del flujo de creación definido en la SPEC 08.

En el formulario de:

`/staff/create`

Incorporar una sección denominada, por ejemplo:

**Roles del personal**

Esta sección debe permitir seleccionar uno o varios roles activos antes de guardar el formulario.

### 6.1. Selección de roles

La interfaz debe:

- Mostrar los roles disponibles.
- Permitir seleccionar varios roles.
- Mostrar el nombre del rol.
- Mostrar su descripción cuando esté disponible.
- Permitir retirar una selección antes de guardar.
- Diferenciar visualmente los roles seleccionados.
- Permitir buscar roles si el catálogo es suficientemente amplio.

Solo deben ofrecerse para nuevas asignaciones los roles activos.

No permitir seleccionar roles inactivos.

No permitir crear ni modificar roles desde esta sección.

### 6.2. Secuencia de creación

La creación de personal y sus asignaciones son operaciones independientes.

El flujo debe respetar esta secuencia:

1. Registrar o seleccionar una persona utilizando el mecanismo definido en la SPEC 08.
2. Crear el registro de personal mediante `POST /staff`.
3. Obtener el `staff_id` del registro creado.
4. Ejecutar una solicitud `POST /staff-members/{staff_member_id}/roles` por cada rol seleccionado.
5. Mostrar el resultado de la creación y de las asignaciones.

Si el usuario selecciona varios roles, las solicitudes deben ejecutarse de forma controlada.

No asumir que existe una transacción única para crear el personal y asignar todos sus roles.

### 6.3. Manejo de fallos parciales

Si el registro de personal se crea correctamente, pero falla una o varias asignaciones:

- Mantener el registro de personal creado.
- Informar que el personal fue registrado, pero algunas asignaciones no pudieron completarse.
- Identificar los roles asignados correctamente.
- Identificar los roles pendientes o fallidos.
- Conservar el `staff_id`.
- Permitir reintentar únicamente las asignaciones pendientes.
- No volver a ejecutar la creación del personal.
- No repetir asignaciones que ya se completaron correctamente.

Si el registro de personal provino de una persona nueva, también deben conservarse las reglas de fallo parcial establecidas en la SPEC 08 y la SPEC 06.

No eliminar automáticamente la persona ni el registro de personal cuando falle una asignación.

## 7. Integración con el formulario de edición de personal

La asignación de roles también debe integrarse en:

`/staff/:staffId/edit`

Al cargar el formulario de edición:

1. Consultar la información del integrante.
2. Consultar sus roles asignados mediante `GET /staff-members/{staff_member_id}/roles`.
3. Consultar los roles activos disponibles mediante el servicio del módulo `roles`.
4. Mostrar los roles actuales y permitir modificar la selección.

No obligar al usuario a navegar a otra página para administrar los roles.

### 7.1. Mostrar roles actuales

El formulario debe mostrar los roles que actualmente tiene asignados el integrante.

Para cada rol mostrar, cuando esté disponible:

- Nombre.
- Descripción.
- Estado.

Los roles inactivos que ya estén asignados deben distinguirse visualmente.

No ofrecer roles inactivos para nuevas asignaciones.

Si el endpoint de asignaciones devuelve únicamente roles activos por defecto, se debe utilizar la capacidad administrativa que proporcione el backend para consultar las asignaciones inactivas cuando exista.

No inventar parámetros de consulta para obtener roles inactivos.

Si el backend no proporciona una forma de consultarlos, documentar la limitación y no simular información que la API no devuelve.

### 7.2. Agregar roles

Cuando el usuario seleccione un rol activo que no esté asignado:

- Identificarlo como una nueva asignación.
- Ejecutar `POST /staff-members/{staff_member_id}/roles`.
- Actualizar el estado de la interfaz después de confirmar el resultado.

No enviar nuevamente roles que ya estén asignados.

### 7.3. Retirar roles

Cuando el usuario retire un rol existente:

- Solicitar confirmación cuando corresponda.
- Ejecutar `DELETE /staff-members/{staff_member_id}/roles/{role_id}`.
- Actualizar la interfaz después de una respuesta exitosa.

La retirada de una asignación no debe eliminar ni modificar el rol del catálogo.

Un rol inactivo que ya esté asignado también debe poder retirarse si la API permite ejecutar esta operación.

### 7.4. Comparación de asignaciones

El frontend debe distinguir entre:

- Roles actualmente asignados.
- Roles nuevos seleccionados.
- Roles que se quieren retirar.

Al guardar, ejecutar únicamente las operaciones necesarias.

No ejecutar solicitudes innecesarias para roles cuya asignación no cambió.

No asumir que `PATCH /staff/{staff_id}` permite modificar asignaciones.

## 8. Integración en el detalle del personal

La página de detalle:

`/staff/:staffId`

Debe incluir una sección para consultar los roles asignados.

Mostrar:

- Nombre del rol.
- Descripción, si está disponible.
- Estado del rol, si está disponible.

La sección es informativa y debe permitir acceder a la edición del personal para modificar sus asignaciones.

No crear una ruta adicional para gestionar roles.

No mostrar permisos expandidos ni asumir que la asignación de un rol otorga autorización efectiva en esta fase.

## 9. Diseño y experiencia de usuario

La gestión de roles debe integrarse de manera natural en los formularios existentes de personal.

### 9.1. Formulario de creación

Organizar el formulario en secciones:

1. Información personal.
2. Información del registro de personal.
3. Roles asignados.

La información personal debe seguir utilizando `PersonForm` o `PersonSelector`, según la SPEC 08.

La sección de roles debe permitir seleccionar los roles antes de confirmar el registro.

### 9.2. Formulario de edición

Organizar el formulario en secciones:

1. Información personal asociada, de acuerdo con las reglas de la SPEC 08.
2. Información propia del registro de personal.
3. Roles asignados.

La sección de roles debe mostrar la asignación actual y permitir agregar o retirar roles.

### 9.3. Sin páginas adicionales

No crear:

- Página de asignación de roles.
- Página de edición de relaciones.
- Página de listado de asignaciones.
- Entrada independiente de asignaciones de personal en el sidebar.
- Rutas específicas para administrar roles de un integrante.

La gestión se realiza desde las pantallas existentes de personal.

El catálogo de roles conserva su propio módulo y sus propias páginas según la SPEC 01.

## 10. Estados de interfaz

Implementar estados adecuados para las operaciones:

- Carga de roles disponibles.
- Carga de roles asignados.
- Error al consultar roles.
- Catálogo sin roles disponibles.
- Selección de roles.
- Asignación en curso.
- Retiro en curso.
- Asignación exitosa.
- Retiro exitoso.
- Error al asignar un rol.
- Error al retirar un rol.
- Registro de personal exitoso con asignaciones pendientes.
- Reintento de asignaciones pendientes.
- Roles inactivos ya asignados.
- Sin roles asignados.

Evitar solicitudes duplicadas durante las operaciones.

Los estados de asignación deben mantenerse separados de los estados de creación o actualización de los datos propios del personal.

## 11. Manejo de errores

El frontend debe interpretar los errores devueltos por la API.

| Situación | Comportamiento esperado |
|---|---|
| Personal inexistente | Informar que no se encontró el integrante. |
| Rol inexistente | Informar que el rol seleccionado no existe o ya no está disponible. |
| Rol inactivo | Informar que no se puede asignar un rol inactivo. |
| Asignación duplicada (409) | Informar que el rol ya está asignado y actualizar el estado de la interfaz. |
| Error al retirar una asignación | Informar que no se pudo retirar el rol y conservar el estado anterior hasta confirmar el resultado. |
| Error de consulta | Informar que no se pudieron cargar las asignaciones. |
| Error de red o servidor | Informar que la operación no pudo completarse y permitir reintentar cuando corresponda. |

No asumir nombres específicos de excepciones del backend si no están definidos en su contrato.

No tratar una asignación duplicada como una operación exitosa silenciosa.

## 12. Navegación y rutas

Esta funcionalidad no requiere modificar el sidebar ni agregar rutas.

Se utilizarán las rutas existentes del módulo Personal:

| Ruta | Funcionalidad |
|---|---|
| `/staff/create` | Registrar personal y seleccionar roles. |
| `/staff/:staffId` | Consultar información y roles asignados. |
| `/staff/:staffId/edit` | Editar personal y administrar roles. |

No agregar una opción independiente para relaciones de roles en:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

No agregar rutas nuevas en:

`frontend/src/App.tsx`

La administración del catálogo de roles continúa disponible desde el módulo Roles según la SPEC 01.

## 13. Reutilización de recursos existentes

Antes de implementar, inspeccionar los recursos disponibles en los módulos `staff` y `roles`.

Reutilizar cuando corresponda:

- Servicios del catálogo de roles.
- Tipos TypeScript de roles.
- Componentes de selección múltiple.
- Componentes de formularios.
- Componentes de búsqueda.
- Alertas y notificaciones.
- Diálogos de confirmación.
- Estados de carga.
- Manejo centralizado de errores.
- Cliente HTTP existente.

Si no existe un componente adecuado para seleccionar múltiples roles, se podrá incorporar uno dentro del módulo `staff` o reutilizar uno compartido, siguiendo la arquitectura existente.

No duplicar el catálogo de roles ni sus servicios.

## 14. Pruebas

Implementar pruebas que cubran, como mínimo:

### 14.1. Selección de roles

- Carga correcta del catálogo.
- Visualización de roles activos.
- Selección de uno o varios roles.
- Retirada de una selección antes de guardar.
- Exclusión de roles inactivos para nuevas asignaciones.
- Manejo de errores al cargar el catálogo.

### 14.2. Creación de personal

- Creación de personal sin roles.
- Creación de personal con un rol.
- Creación de personal con varios roles.
- Verificación de la secuencia de creación y asignación.
- Conservación del `staff_id` después de crear el registro.
- Manejo de fallo parcial.
- Reintento de asignaciones pendientes.
- Verificación de que no se vuelva a crear el personal durante un reintento.
- Verificación de que no se repitan asignaciones exitosas.

### 14.3. Edición de personal

- Carga de los roles actuales.
- Visualización de roles inactivos ya asignados, cuando la API los proporcione.
- Agregar un rol.
- Retirar un rol.
- Agregar y retirar roles en una misma edición.
- Guardar sin modificar asignaciones.
- Evitar solicitudes innecesarias.
- Manejar asignaciones duplicadas.
- Manejar errores de consulta, asignación y retiro.

### 14.4. Detalle

- Visualización de roles asignados.
- Visualización de su estado.
- Estado vacío cuando no existen asignaciones.
- Manejo de errores de consulta.

### 14.5. Integración

- Verificar que las asignaciones utilicen exclusivamente los endpoints específicos.
- Verificar que no se envíen roles mediante `POST /staff`.
- Verificar que no se envíen roles mediante `PATCH /staff`.
- Verificar que no se eliminen registros de personal ni roles al retirar una asignación.
- Verificar que no se implementen rutas ni páginas adicionales.

## 15. Restricciones de negocio

Respetar las reglas establecidas por el backend:

1. El integrante del personal debe existir.
2. El rol debe existir.
3. No se pueden asignar roles inactivos.
4. Una combinación de personal y rol no puede duplicarse.
5. Una asignación repetida debe tratarse como conflicto.
6. Retirar una asignación elimina únicamente la relación.
7. Esta fase no debe bloquear asignaciones por `person.is_active` o `employment_status`.
8. No asignar ni retirar roles mediante los endpoints CRUD de personal.
9. No incluir permisos expandidos en la consulta de asignaciones.
10. No asumir que las asignaciones implementan autenticación o autorización.

## 16. Relación con la SPEC 08

Esta especificación amplía los formularios de la SPEC 08.

La exclusión de asignación de roles indicada en la SPEC 08 deja de aplicar para esta funcionalidad, porque ahora queda definida específicamente en la SPEC 09.

La implementación debe mantener:

- El módulo independiente `staff`.
- Las rutas existentes de personal.
- El registro de persona existente o nueva según la SPEC 06.
- Los campos propios de personal definidos en la SPEC 08.
- La asignación de roles integrada en los formularios.
- La separación entre datos del personal y relaciones con roles.

No modificar las responsabilidades del módulo `roles`.

## 17. Documentación

Toda documentación técnica relacionada con esta implementación debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Registrar cualquier decisión adicional sobre la integración de asignaciones en los formularios de personal.

## 18. Criterios de aceptación

La implementación se considerará conforme cuando:

1. Se puedan consultar los roles asignados a un integrante del personal.
2. Se puedan seleccionar uno o varios roles al crear personal.
3. Las asignaciones se realicen después de crear correctamente el registro de personal.
4. Se puedan agregar roles desde el formulario de edición.
5. Se puedan retirar roles desde el formulario de edición.
6. El detalle del personal muestre sus roles asignados.
7. Los roles inactivos no estén disponibles para nuevas asignaciones.
8. Los roles inactivos que ya estén asignados puedan visualizarse cuando la API lo permita.
9. Los fallos parciales se gestionen sin duplicar el personal ni las asignaciones exitosas.
10. Los reintentos ejecuten únicamente las operaciones pendientes.
11. Las asignaciones utilicen exclusivamente los endpoints específicos de `staff-members`.
12. No se modifiquen roles mediante los endpoints CRUD de personal.
13. No se creen páginas, rutas ni entradas de sidebar independientes para las relaciones.
14. Se reutilicen los servicios y tipos del catálogo de roles.
15. No se implementen permisos, autenticación ni autorización efectiva.
16. Se mantenga la arquitectura existente del frontend y la documentación en `docs/`.