# SPEC 02 — Módulo `permissions` (Frontend)

**Prioridad:** 2

## Objetivo

Implementar la interfaz para administrar el catálogo de permisos del sistema, permitiendo crear, consultar, listar, modificar la descripción y activar o desactivar permisos.

Cada permiso representa una acción concreta del sistema que posteriormente podrá asignarse a roles.

El frontend debe consumir los endpoints existentes del backend y respetar sus contratos, validaciones y reglas de negocio.

No implementar todavía la relación entre roles y permisos ni la autorización efectiva.

## Organización del módulo

- Ubicar el módulo en `frontend/src/modules/permissions/`.
- Mantener dentro del módulo los componentes exclusivos de la administración de permisos.
- Reutilizar los componentes compartidos y recursos existentes de la plantilla.
- No duplicar componentes, formularios, tablas, modales ni utilidades que ya existan.
- Mantener las responsabilidades del módulo independientes de otros módulos funcionales.

## Pantallas y funcionalidades

### 1. Listado de permisos

Debe mostrar:

- Nombre del permiso.
- Descripción.
- Estado (activo o inactivo).
- Acciones disponibles.

Debe permitir:

- Buscar permisos por nombre.
- Filtrar por estado activo o inactivo.
- Paginar los resultados.
- Acceder a la creación de un permiso.
- Consultar el detalle de un permiso.
- Modificar su descripción.
- Activar o desactivar un permiso.

Los permisos inactivos deben seguir apareciendo en el listado, salvo que se aplique un filtro que los excluya.

### 2. Creación de permisos

El formulario debe contener:

- `name`: obligatorio.
- `description`: opcional.

Validaciones del nombre:

- No puede estar vacío ni contener únicamente espacios.
- Debe eliminar los espacios externos antes de validarlo.
- Debe cumplir la convención de nombres de permisos.
- Debe respetar la expresión regular:

  `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$`

- Debe respetar una longitud máxima de 120 caracteres.
- No se permiten nombres duplicados.
- El nombre debe representar una acción concreta del sistema.

Ejemplos válidos:

- `person.create`
- `appointment.cancel`
- `schedule.manage`
- `permission.read`

La descripción es opcional y permite explicar la finalidad del permiso.

El frontend debe mostrar los errores de validación devueltos por el backend.

### 3. Consulta de permisos

Debe permitir consultar individualmente un permiso y mostrar:

- Nombre.
- Descripción.
- Estado.

La consulta debe permitir visualizar también permisos inactivos.

El nombre debe tratarse como un identificador funcional estable.

### 4. Edición de permisos

Solo se permite modificar la descripción.

Reglas:

- El nombre debe mostrarse como información no editable.
- No debe existir una opción para renombrar permisos.
- La actualización debe enviar únicamente `description`.
- La descripción puede enviarse como `null` para eliminar su contenido.
- No enviar identificadores ni campos adicionales que no formen parte del contrato.
- Mostrar los errores devueltos por el backend.

### 5. Activación y desactivación

Debe permitir cambiar el estado del permiso.

Reglas:

- Utilizar `PATCH /permissions/{permission_id}/status`.
- Enviar `is_active` como booleano.
- Mostrar claramente el estado actual.
- Solicitar confirmación antes de realizar el cambio.
- Actualizar la información después de una operación exitosa.
- Mostrar los errores si la operación falla.

Desactivar un permiso no debe eliminar físicamente el registro.

## Integración con el backend

**Prefijo:** `/api/v1/permissions`.

| Método | Endpoint | Función |
|---|---|---|
| POST | `/permissions` | Crear permiso. |
| GET | `/permissions` | Listar permisos. |
| GET | `/permissions/{permission_id}` | Consultar permiso. |
| PATCH | `/permissions/{permission_id}` | Modificar descripción. |
| PATCH | `/permissions/{permission_id}/status` | Cambiar estado. |

### Parámetros del listado

- `page`: página actual.
- `page_size`: cantidad de resultados, entre 1 y 100.
- `name`: búsqueda por nombre.
- `is_active`: filtro por estado.

El frontend debe respetar la estructura de paginación y el envoltorio común de respuestas definido por el backend.

No duplicar la lógica de paginación, filtros ni validación de unicidad que corresponde al servidor.

## Reglas de negocio

1. Un permiso representa una acción concreta del sistema, no un rol ni un usuario.
2. Crear un permiso no concede autorización automáticamente.
3. El nombre es un identificador funcional y no puede modificarse después de su creación.
4. La descripción sí puede modificarse.
5. Los permisos inactivos deben seguir siendo consultables.
6. Desactivar un permiso no elimina físicamente el registro.
7. El frontend no debe asignar permisos directamente a usuarios.
8. No implementar la relación `role_permission`.
9. No implementar autorización efectiva basada en permisos.
10. El catálogo inicial recomendado por el backend no debe crearse automáticamente desde el frontend.

## Catálogo inicial recomendado

El backend propone los siguientes nombres como referencia:

- `person.create`
- `person.read`
- `person.update`
- `person.deactivate`
- `patient.read`
- `patient.create`
- `appointment.create`
- `appointment.update`
- `appointment.cancel`
- `schedule.read`
- `schedule.manage`
- `conversation.read`
- `message.send`
- `role.manage`
- `permission.read`

Estos nombres no deben crearse automáticamente ni implican que sus respectivos módulos deban implementarse en esta etapa.

El catálogo podrá ampliarse conforme se definan nuevas funcionalidades y acciones concretas.

## Integración con la navegación y rutas

### Barra lateral

**Archivo:** `frontend/src/components/layout/app-layout/sidebar/data.tsx`.

- Incorporar el acceso al módulo de permisos.
- Agruparlo dentro de la sección `Administración`, junto con `Roles`, siguiendo la organización definida en la SPEC 00.
- Respetar la estructura `NavItem` y `subItems`.
- Reutilizar los iconos existentes.
- No modificar opciones de navegación ajenas al módulo.

### Rutas

**Archivo:** `frontend/src/App.tsx`.

Registrar las rutas necesarias para:

- Listar permisos.
- Crear permisos.
- Consultar un permiso.
- Editar la descripción de un permiso.

Los nombres de las rutas deben ser descriptivos, representativos de su funcionalidad y coherentes con el módulo.

Las rutas y la navegación deben respetar las reglas generales de la SPEC 00 — Navegación y enrutamiento del frontend.

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

Evitar envíos duplicados mientras exista una petición en curso.

Los mensajes deben ser claros y comprensibles.

## Pruebas particulares

- Visualización del listado.
- Búsqueda por nombre.
- Filtrado por estado.
- Paginación.
- Creación de un permiso válido.
- Rechazo de nombre vacío.
- Rechazo de nombre compuesto únicamente por espacios.
- Rechazo de formato inválido.
- Rechazo de nombre duplicado.
- Consulta de un permiso inexistente.
- Edición de la descripción.
- Eliminación de la descripción.
- Verificación de que el nombre no sea editable.
- Activación y desactivación.
- Consulta de permisos inactivos.
- Manejo de errores del backend.
- Prevención de envíos duplicados.

## Fuera de alcance

- Relación entre roles y permisos (`role_permission`).
- Asignación de permisos a usuarios.
- Asignación de permisos a roles.
- Middleware, guards o políticas de autorización.
- Protección de rutas según permisos.
- Autorización efectiva de operaciones.
- Implementación de los módulos de personas, pacientes, citas, horarios, conversaciones o mensajes.
- Creación automática del catálogo inicial de permisos.

## Criterios de aceptación

- El usuario puede listar, buscar, filtrar y paginar permisos.
- Puede crear permisos respetando la convención de nombres.
- Puede consultar individualmente un permiso.
- Puede modificar su descripción sin modificar su nombre.
- Puede activar y desactivar permisos.
- Los permisos inactivos siguen siendo consultables.
- Se respetan los contratos y respuestas del backend.
- Se muestran correctamente los estados de carga, errores y confirmaciones.
- El módulo está integrado en la navegación y rutas existentes.
- Se reutilizan los componentes disponibles de la plantilla.
- Se mantiene una organización coherente e independiente del módulo.
- No se implementan funcionalidades excluidas de esta especificación.