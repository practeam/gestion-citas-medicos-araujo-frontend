# SPEC 10 — Asignación de permisos a roles 

## 1. Prioridad y dependencias

Esta especificación define la integración de la asignación de permisos a roles dentro del frontend.

Depende de:

- SPEC 01 — Módulo de roles.
- SPEC 02 — Módulo de permisos.

La implementación debe respetar la arquitectura existente del frontend y las responsabilidades de ambos módulos.

Skills aplicables:
- `$frontend-arquitectura`: organización e integración dentro del módulo de roles.
- `$frontend-integracion-api`: comunicación con los endpoints de roles y permisos.
- `$frontend-catalogo-componentes`: reutilización de componentes existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

## 2. Objetivo

Permitir administrar los permisos asociados a cada rol directamente desde sus formularios de creación y edición.

El usuario debe poder:

- Consultar los permisos disponibles.
- Seleccionar los permisos que tendrá un rol al crearlo.
- Consultar los permisos actualmente asignados a un rol.
- Agregar permisos a un rol existente.
- Retirar permisos de un rol existente.
- Identificar permisos inactivos que permanezcan asociados históricamente.

**No se deben crear páginas independientes para administrar la relación entre roles y permisos.**

La gestión debe sentirse como parte natural del módulo de roles.

## 3. Alcance

Esta especificación comprende:

- Integración de permisos en el formulario de creación de roles.
- Integración de permisos en el formulario de edición de roles.
- Visualización de permisos asignados en el detalle del rol.
- Selección múltiple de permisos.
- Asignación y eliminación de relaciones mediante los endpoints específicos.
- Manejo de errores y estados de interfaz.

No comprende:

- Autorización efectiva de usuarios.
- Protección de rutas o componentes.
- Middleware de autenticación o autorización.
- Gestión de usuarios y credenciales.
- Asignación de roles al personal.
- Modificación de permisos mediante el formulario de roles.
- Modificación de la relación mediante los endpoints PATCH de roles o permisos.

## 4. Organización del módulo

La funcionalidad debe integrarse en el módulo existente:

`frontend/src/modules/roles/`

El módulo de roles será responsable de coordinar la asignación de permisos a cada rol.

El módulo de permisos conservará la responsabilidad de administrar el catálogo de permisos.

Se deben reutilizar los servicios y componentes existentes cuando corresponda. No duplicar la lógica de consulta y administración del catálogo de permisos.

La implementación puede incorporar componentes internos del módulo de roles, por ejemplo:

- `RolePermissionsSelector`: selección de permisos disponibles.
- `RolePermissionsSection`: visualización y administración de los permisos asociados.
- `RoleForm`: formulario de creación y edición del rol.

Estos nombres son orientativos. Antes de crearlos se debe inspeccionar la estructura y los componentes existentes.

## 5. Integración con la API

Prefijo:

`/api/v1`

### 5.1. Consultar permisos disponibles

Reutilizar el endpoint definido en la SPEC 02:

`GET /api/v1/permissions`

Utilizar los parámetros de paginación y filtros admitidos por el backend.

Para seleccionar nuevas asignaciones, consultar únicamente permisos activos mediante:

`is_active=true`

La interfaz debe permitir buscar y recorrer el catálogo respetando la paginación del backend.

No asumir que todos los permisos estarán disponibles en una sola respuesta.

### 5.2. Consultar permisos asignados a un rol

Endpoint:

`GET /api/v1/roles/{role_id}/permissions`

Debe utilizarse para recuperar las asignaciones actuales del rol.

La respuesta contiene los permisos asociados con los campos mínimos:

- `id`
- `name`
- `description`
- `is_active`

Los permisos inactivos que permanezcan asociados deben poder identificarse visualmente.

### 5.3. Asignar un permiso

Endpoint:

`POST /api/v1/roles/{role_id}/permissions`

Cuerpo:

```json
{
  "permission_id": 5
}
```

Cada asignación debe realizarse mediante una llamada individual.

No enviar permisos dentro de `POST /roles` ni de `PATCH /roles/{role_id}`.

### 5.4. Retirar un permiso

Endpoint:

`DELETE /api/v1/roles/{role_id}/permissions/{permission_id}`

La eliminación debe retirar únicamente la relación.

No debe eliminar el rol ni el permiso del catálogo.

### 5.5. Consulta inversa

El endpoint opcional:

`GET /api/v1/permissions/{permission_id}/roles`

No es necesario para implementar esta especificación. La interfaz debe consultar las asignaciones desde el rol seleccionado.

## 6. Formulario de creación de roles

La creación de un rol debe permitir definir sus datos y seleccionar sus permisos dentro del mismo flujo.

El formulario debe contener:

**Datos del rol**
- Nombre.
- Descripción.

**Permisos del rol**
- Catálogo de permisos activos.
- Búsqueda de permisos.
- Selección múltiple.
- Identificación de los permisos seleccionados.
- Información descriptiva de cada permiso cuando esté disponible.

La sección de permisos debe estar integrada visualmente en el formulario, no en una página independiente.

### 6.1. Secuencia de creación

Como el backend utiliza endpoints independientes para crear roles y asignar permisos, el frontend debe ejecutar las operaciones secuencialmente:

1. El usuario completa los datos del rol.
2. Selecciona los permisos que desea asignar.
3. El frontend ejecuta `POST /api/v1/roles`.
4. Obtiene el `role_id` de la respuesta.
5. Ejecuta un `POST /api/v1/roles/{role_id}/permissions` por cada permiso seleccionado.
6. Informa el resultado de la creación y de las asignaciones.

No asumir que la creación del rol y sus asignaciones constituyen una única transacción.

### 6.2. Fallos parciales

Si el rol se crea correctamente, pero falla alguna asignación:

- No volver a crear el rol.
- Conservar el `role_id` obtenido.
- Informar que el rol fue creado, pero que algunas asignaciones no pudieron completarse.
- Identificar los permisos pendientes.
- Permitir reintentar únicamente las asignaciones pendientes.
- No eliminar automáticamente el rol ni las asignaciones que sí se completaron.

La interfaz debe distinguir entre la creación del rol y el resultado de sus asignaciones.

## 7. Formulario de edición de roles

La edición debe permitir modificar los datos del rol y administrar sus permisos desde el mismo formulario.

Al abrir la edición:

1. Consultar los datos del rol mediante `GET /api/v1/roles/{role_id}`.
2. Consultar sus permisos mediante `GET /api/v1/roles/{role_id}/permissions`.
3. Consultar el catálogo de permisos activos mediante `GET /api/v1/permissions`.
4. Mostrar los datos y las asignaciones actuales.

### 7.1. Agregar permisos

El usuario debe poder seleccionar permisos activos que todavía no estén asignados.

Al guardar, el frontend debe identificar los nuevos permisos y ejecutar un `POST` individual por cada uno.

No volver a enviar las asignaciones que ya existen.

### 7.2. Retirar permisos

El usuario debe poder deseleccionar permisos que actualmente estén asignados.

Al guardar, el frontend debe identificar las relaciones que deben retirarse y ejecutar el endpoint `DELETE` correspondiente.

La eliminación de una relación no debe modificar el catálogo de permisos.

### 7.3. Permisos inactivos

Los permisos inactivos que ya estén asociados al rol deben mostrarse como tales.

Deben distinguirse visualmente de los permisos activos disponibles para nuevas asignaciones.

No deben ofrecerse como nuevas opciones de selección.

Si el backend permite retirar una asignación existente de un permiso inactivo, la interfaz debe permitir hacerlo.

No asumir que un permiso inactivo puede volver a asignarse.

### 7.4. Guardado y fallos parciales

El formulario debe coordinar las operaciones de actualización del rol y de sus relaciones.

- Los cambios de nombre y descripción se envían mediante `PATCH /api/v1/roles/{role_id}`.
- Las nuevas asignaciones se envían mediante `POST`.
- Las relaciones retiradas se eliminan mediante `DELETE`.

Si alguna operación falla:

- Conservar los cambios que el backend confirmó.
- Identificar las operaciones pendientes o fallidas.
- Informar claramente qué cambios se guardaron y cuáles no.
- Permitir reintentar las operaciones pendientes sin duplicar asignaciones ni repetir cambios innecesarios.

No asumir una transacción única entre los distintos endpoints.

## 8. Detalle del rol

La vista de detalle existente debe incorporar una sección de permisos asignados.

Debe mostrar:

- Nombre del permiso.
- Descripción, cuando exista.
- Estado activo o inactivo.

La sección es informativa. La administración de las asignaciones debe realizarse desde el formulario de edición.

No mostrar permisos efectivos de usuarios ni resultados de autorización, porque todavía no forman parte del alcance del backend.

## 9. Experiencia de usuario

La integración debe mantener una experiencia sencilla:

- No crear una página independiente para asignar permisos.
- No agregar nuevas rutas para la relación `role_permission`.
- No obligar al usuario a salir del formulario de roles.
- Utilizar una sección claramente identificada como **Permisos del rol**.
- Permitir seleccionar varios permisos sin repetir operaciones manuales innecesarias.
- Diferenciar permisos asignados, disponibles e inactivos.
- Mostrar indicadores de carga y resultados de las operaciones.
- Evitar perder los datos del formulario cuando falle una asignación.

La selección múltiple es una interacción de frontend. El backend continúa recibiendo una solicitud individual por cada relación.

## 10. Estados de interfaz

Contemplar como mínimo:

- Cargando catálogo de permisos.
- Cargando permisos asignados.
- Catálogo sin permisos disponibles.
- Rol sin permisos asignados.
- Permisos seleccionados.
- Guardando datos del rol.
- Asignando permisos.
- Retirando permisos.
- Operación completada.
- Operación parcialmente completada.
- Error de consulta.
- Error de asignación.
- Error al retirar una asignación.

Los estados de error deben permitir comprender qué operación falló y qué información se conservó.

## 11. Validaciones y reglas de negocio

El frontend debe respetar las reglas del backend:

1. El rol y el permiso deben existir.
2. No se pueden asignar permisos inactivos.
3. No se pueden asignar permisos a un rol inactivo.
4. No se deben repetir asignaciones.
5. La relación se administra exclusivamente mediante sus endpoints específicos.
6. Desactivar un rol o permiso no elimina sus relaciones.
7. Retirar una relación no elimina las entidades relacionadas.
8. No implementar lógica de autorización efectiva.

Si el rol está inactivo, la interfaz debe impedir nuevas asignaciones y comunicar que primero debe activarse.

Los errores definitivos del backend deben prevalecer sobre las validaciones preventivas del frontend.

## 12. Navegación y rutas

No se deben agregar opciones nuevas al sidebar ni rutas independientes para administrar permisos de roles.

Se reutilizan las rutas existentes del módulo de roles, definidas en:

- `frontend/src/components/layout/app-layout/sidebar/data.tsx`
- `frontend/src/App.tsx`

La funcionalidad se incorpora en:

- Creación: `/roles/create`
- Detalle: `/roles/:roleId`
- Edición: `/roles/:roleId/edit`

La navegación del catálogo de permisos continúa perteneciendo al módulo de permisos, conforme a la SPEC 02.

## 13. Reutilización de componentes

Antes de desarrollar componentes nuevos, inspeccionar los recursos existentes.

Reutilizar cuando corresponda:

- Componentes de formularios.
- Selectores múltiples.
- Campos de búsqueda.
- Tablas y listas.
- Diálogos de confirmación.
- Alertas y notificaciones.
- Estados de carga y error.
- Servicios del catálogo de permisos.

Los componentes específicos de asignación deben permanecer dentro del módulo de roles, salvo que se identifique una necesidad real de reutilización en otros módulos.

## 14. Pruebas

Verificar como mínimo:

### Creación
- Crear un rol sin permisos.
- Crear un rol con uno o varios permisos.
- Ejecutar las asignaciones después de crear el rol.
- Manejar un fallo parcial de asignaciones.
- Reintentar asignaciones pendientes sin duplicar el rol.

### Edición
- Consultar las asignaciones existentes.
- Agregar uno o varios permisos.
- Retirar uno o varios permisos.
- Guardar cambios del rol y de sus relaciones.
- Manejar fallos parciales.
- Reintentar operaciones pendientes.

### Validaciones
- No permitir nuevas asignaciones de permisos inactivos.
- No permitir asignaciones a roles inactivos.
- Identificar asignaciones duplicadas.
- Mostrar permisos inactivos que ya estén asociados.
- Conservar la información del formulario ante errores.

### Integración
- Verificar los endpoints y cuerpos de solicitud.
- Confirmar que `POST` y `PATCH` de roles no reciban permisos.
- Confirmar que `PATCH` de permisos no modifique relaciones.
- Verificar que retirar una relación no elimine el rol ni el permiso.

## 15. Exclusiones

Esta especificación no debe implementar:

- Middleware de autorización.
- Protección de rutas según permisos.
- Autorización de acciones en botones o componentes.
- Asignación de roles a personal.
- Administración de usuarios.
- Gestión de credenciales o tokens.
- Modificación del catálogo de permisos desde el formulario de roles.
- Páginas independientes para `role_permission`.

## 16. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar la integración de permisos en los formularios de roles, las operaciones secuenciales, el manejo de fallos parciales y las responsabilidades de los módulos involucrados.

## 17. Criterios de aceptación

La implementación se considera completa cuando:

1. El usuario puede seleccionar permisos al crear un rol, sin navegar a otra página.
2. El rol se crea antes de ejecutar las asignaciones.
3. El usuario puede consultar los permisos asociados desde el detalle del rol.
4. El usuario puede agregar y retirar permisos desde el formulario de edición.
5. Las relaciones se administran mediante los endpoints específicos.
6. Los permisos inactivos se identifican correctamente y no se ofrecen para nuevas asignaciones.
7. Los roles inactivos no permiten nuevas asignaciones.
8. Los fallos parciales se informan y pueden reintentarse sin duplicar operaciones exitosas.
9. No se crean páginas ni rutas adicionales para administrar `role_permission`.
10. Se conserva la separación de responsabilidades entre los módulos de roles y permisos.
11. No se implementa autorización efectiva.