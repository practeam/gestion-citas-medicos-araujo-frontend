# SPEC 01 — Módulo `roles` (Frontend)

**Prioridad:** 1

## Objetivo

Implementar la interfaz para administrar los roles disponibles en el sistema, permitiendo crear, consultar, editar, activar y desactivar roles.

El frontend debe consumir los endpoints existentes del backend, respetando sus contratos, validaciones y reglas de negocio.

No implementar autenticación, autorización efectiva ni asignación de roles al personal.

## Alcance funcional

1. Listar los roles registrados.
2. Crear nuevos roles.
3. Consultar los detalles de un rol.
4. Editar el nombre y la descripción de un rol.
5. Activar y desactivar roles.
6. Buscar y filtrar roles.
7. Navegar entre páginas de resultados.

## Organización del módulo

- El módulo debe ubicarse en `frontend/src/modules/roles/`.
- Los componentes exclusivos de roles deben permanecer dentro del módulo.
- Los componentes genéricos deben reutilizarse desde las carpetas compartidas existentes.
- No modificar ni reorganizar innecesariamente la estructura de la plantilla.
- Inspeccionar previamente los componentes, layouts, formularios, tablas, modales, hooks e iconos disponibles para evitar duplicaciones.

## Pantallas y funcionalidades

### 1. Listado de roles

Debe mostrar:

- Nombre del rol.
- Descripción.
- Estado (activo o inactivo).
- Acciones disponibles.

Debe permitir:

- Buscar roles por nombre.
- Filtrar por estado activo o inactivo.
- Paginar los resultados.
- Acceder a la creación de un rol.
- Acceder a la edición de un rol.
- Activar o desactivar un rol.

El listado debe respetar la paginación y los filtros proporcionados por el backend.

### 2. Creación de roles

El formulario debe contener:

- `name`: obligatorio.
- `description`: opcional.

Validaciones:

- El nombre no puede estar vacío.
- No puede contener únicamente espacios.
- Deben eliminarse los espacios externos antes de enviarlo.
- No se permiten nombres duplicados sin distinguir mayúsculas y minúsculas.
- La descripción admite texto extenso.
- Los errores de validación deben mostrarse junto al campo correspondiente cuando sea posible.

La creación no debe asignar permisos automáticamente.

### 3. Edición de roles

Debe permitir modificar:

- Nombre.
- Descripción.

Reglas:

- La actualización es parcial.
- Debe enviarse únicamente la información modificada.
- El nombre no admite valores nulos ni vacíos.
- La descripción puede enviarse como `null` para eliminar su contenido.
- No se deben enviar `id` ni campos de auditoría.
- Deben mostrarse los errores devueltos por el backend.

### 4. Activación y desactivación

Debe permitir cambiar el estado del rol mediante la acción correspondiente.

Reglas:

- Utilizar `PATCH /roles/{role_id}/status`.
- Enviar únicamente `is_active` como booleano.
- Mostrar claramente el estado actual.
- Solicitar confirmación antes de realizar el cambio.
- Actualizar el listado después de una operación exitosa.
- Mostrar los errores si la operación falla.

Desactivar un rol no debe eliminarlo ni modificar sus permisos asociados.

## Integración con el backend

Prefijo: `/api/v1/roles`.

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/roles` | Crear rol. |
| GET | `/roles` | Listar roles. |
| GET | `/roles/{role_id}` | Consultar detalle. |
| PATCH | `/roles/{role_id}` | Actualizar rol. |
| PATCH | `/roles/{role_id}/status` | Cambiar estado. |

### Parámetros del listado

- `page`: página actual, mínimo 1, por defecto 1.
- `page_size`: cantidad de resultados, entre 1 y 100, por defecto 20.
- `name`: búsqueda por nombre, sin distinguir mayúsculas.
- `is_active`: filtro por estado.

La respuesta paginada contiene `items`, `total`, `page` y `page_size` dentro de `data.result`.

El frontend debe respetar el formato de respuesta común definido por el backend. No debe inventar estructuras de respuesta ni duplicar la lógica del servidor.

## Estados de interfaz

La interfaz debe contemplar:

- Carga inicial.
- Carga durante operaciones.
- Listado vacío.
- Búsqueda sin resultados.
- Error al consultar.
- Error al crear.
- Error al actualizar.
- Error al cambiar el estado.
- Operación exitosa.

Las operaciones deben evitar envíos duplicados mientras exista una petición en curso.

Los mensajes deben ser claros y comprensibles para el usuario.

## Reglas de negocio

1. Los roles iniciales previstos son `admin`, `receptionist`, `dentist` y `assistant`.
2. El frontend no debe crearlos automáticamente.
3. La creación de roles no concede permisos.
4. La desactivación no elimina permisos asociados.
5. Los roles inactivos deben seguir siendo consultables.
6. La unicidad del nombre debe validarse definitivamente en el backend.
7. El frontend no debe implementar reglas de autorización propias ni asumir que un rol activo concede acceso a funcionalidades.

## Pruebas particulares

- Visualización del listado.
- Búsqueda por nombre.
- Filtrado por estado.
- Navegación entre páginas.
- Creación de un rol válido.
- Validación de nombre vacío.
- Validación de nombre compuesto únicamente por espacios.
- Manejo de nombre duplicado.
- Consulta de un rol inexistente.
- Actualización parcial.
- Eliminación de descripción.
- Activación de un rol.
- Desactivación de un rol.
- Manejo de errores del backend.
- Prevención de envíos duplicados.

## Exclusiones

No implementar en esta especificación:

- Autenticación y cierre de sesión.
- Protección de rutas.
- Autorización efectiva.
- Asignación de roles al personal (`staff_role`).
- Asignación o administración de permisos.
- Middleware de autorización.
- Creación automática de roles iniciales.
- Gestión de usuarios o personal.

## Criterios de aceptación

- El usuario puede consultar los roles registrados.
- Puede buscar, filtrar y paginar los resultados.
- Puede crear un rol respetando las validaciones.
- Puede consultar y editar un rol.
- Puede activar y desactivar un rol.
- La interfaz respeta los contratos del backend.
- Los errores y estados de carga se muestran correctamente.
- Se reutilizan los componentes existentes de la plantilla.
- El módulo mantiene una organización independiente y coherente.
- No se implementan funcionalidades excluidas de esta especificación.