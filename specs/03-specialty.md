# SPEC 04 — Módulo `specialties` 

**Prioridad:** 4

## Objetivo

Implementar la interfaz para administrar el catálogo de especialidades profesionales del sistema, permitiendo crear, consultar, listar, editar, activar y desactivar especialidades.

Las especialidades representan elementos de un catálogo que posteriormente podrán asignarse al personal.

El frontend debe consumir los endpoints existentes del backend y respetar sus contratos, validaciones y reglas de negocio.

No implementar todavía la asignación de especialidades al personal.

## Organización del módulo

- Ubicar el módulo en `frontend/src/modules/specialties/`.
- Mantener dentro del módulo los componentes exclusivos de especialidades.
- Reutilizar los componentes compartidos y recursos existentes de la plantilla.
- Evitar duplicar formularios, tablas, modales, hooks y utilidades existentes.
- Mantener las responsabilidades del módulo independientes de otros módulos funcionales.

## Pantallas y funcionalidades

### 1. Listado de especialidades

Debe mostrar:

- Nombre de la especialidad.
- Descripción.
- Estado (activo o inactivo).
- Fecha de creación.
- Fecha de última actualización.
- Acciones disponibles.

Debe permitir:

- Buscar especialidades por nombre.
- Filtrar por estado activo o inactivo.
- Ordenar por los campos admitidos por el backend.
- Cambiar entre páginas de resultados.
- Acceder a la creación de una especialidad.
- Consultar y editar una especialidad.
- Activar o desactivar una especialidad.

Las especialidades inactivas deben seguir siendo consultables.

### 2. Creación de especialidades

El formulario debe contener:

- `name`: obligatorio.
- `description`: opcional.

Validaciones:

- El nombre no puede estar vacío ni contener únicamente espacios.
- Eliminar los espacios externos antes de enviarlo.
- Respetar una longitud máxima de 120 caracteres.
- No permitir nombres duplicados, considerando una comparación que no distinga mayúsculas y minúsculas.
- La descripción es opcional.

El frontend debe mostrar los errores de validación devueltos por el backend, especialmente cuando el nombre ya existe.

### 3. Consulta de especialidades

Debe permitir consultar individualmente una especialidad y mostrar:

- Identificador.
- Nombre.
- Descripción.
- Estado.
- Fecha de creación.
- Fecha de última actualización.

Debe ser posible consultar especialidades activas e inactivas.

Los campos de identificación y auditoría deben mostrarse como información de solo lectura.

### 4. Edición de especialidades

Debe permitir modificar:

- Nombre.
- Descripción.

Reglas:

- La actualización es parcial.
- Debe enviarse únicamente la información modificada.
- El nombre no admite valores nulos ni vacíos.
- La descripción puede enviarse como `null` para eliminar su contenido.
- No enviar `id`, `created_at` ni `updated_at`.
- Mostrar los errores devueltos por el backend.
- Actualizar la información mostrada después de una operación exitosa.

### 5. Activación y desactivación

Debe permitir cambiar el estado de una especialidad.

Reglas:

- Utilizar `PATCH /specialties/{specialty_id}/status`.
- Enviar `is_active` como booleano.
- Mostrar claramente el estado actual.
- Solicitar confirmación antes de realizar el cambio.
- Actualizar el listado después de una operación exitosa.
- Mostrar los errores si la operación falla.

Desactivar una especialidad no debe eliminarla ni alterar registros históricos.

## Integración con el backend

**Prefijo:** `/api/v1/specialties`.

| Método | Endpoint | Función |
|---|---|---|
| POST | `/specialties` | Crear especialidad. |
| GET | `/specialties` | Listar especialidades. |
| GET | `/specialties/{specialty_id}` | Consultar especialidad. |
| PATCH | `/specialties/{specialty_id}` | Actualizar especialidad. |
| PATCH | `/specialties/{specialty_id}/status` | Cambiar estado. |

### Parámetros del listado

- `page`: página actual.
- `page_size`: cantidad de resultados, entre 1 y 100.
- `name`: búsqueda por nombre, sin distinguir mayúsculas.
- `is_active`: filtro por estado.
- `sort_by`: campo de ordenamiento (`id`, `name` o `created_at`).
- `order`: dirección del ordenamiento (`asc` o `desc`).

El ordenamiento predeterminado es por `id` ascendente.

El frontend debe respetar la estructura de paginación y el envoltorio común de respuestas definido por el backend.

No duplicar la lógica de filtros, paginación ni unicidad que corresponde al servidor.

## Reglas de negocio

1. Una especialidad es un elemento del catálogo, no representa a un profesional.
2. No todos los miembros del personal tienen que tener una especialidad.
3. No asumir que cada profesional tendrá una única especialidad.
4. No implementar la asignación de especialidades al personal.
5. Desactivar una especialidad no elimina físicamente el registro.
6. Las especialidades inactivas deben seguir siendo consultables.
7. No modificar registros históricos por desactivar una especialidad.
8. No crear especialidades de ejemplo automáticamente.
9. La asignación y las cardinalidades entre personal y especialidades se definirán posteriormente.

## Integración con la navegación y rutas

### Barra lateral

**Archivo:** `frontend/src/components/layout/app-layout/sidebar/data.tsx`.

- Incorporar el acceso al módulo de especialidades.
- Ubicarlo dentro de una sección funcional adecuada, por ejemplo, `Administración` o `Gestión clínica`, según la organización general de la aplicación.
- Respetar la estructura `NavItem` y `subItems`.
- Reutilizar los iconos existentes.
- No modificar opciones ajenas al módulo.

### Rutas

**Archivo:** `frontend/src/App.tsx`.

Registrar las rutas necesarias para:

- Listar especialidades.
- Crear una especialidad.
- Consultar una especialidad.
- Editar una especialidad.

Los nombres de las rutas deben ser descriptivos, representativos de su funcionalidad y coherentes con el módulo.

Respetar las reglas generales de la SPEC 00 — Navegación y enrutamiento del frontend.

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
- Ordenamiento.
- Paginación.
- Creación de una especialidad válida.
- Rechazo de nombre vacío.
- Rechazo de nombre compuesto únicamente por espacios.
- Verificación de normalización de espacios externos.
- Rechazo de nombres duplicados.
- Consulta de una especialidad existente.
- Consulta de una especialidad inexistente.
- Actualización parcial del nombre.
- Actualización parcial de la descripción.
- Eliminación de descripción.
- Activación y desactivación.
- Consulta de especialidades inactivas.
- Manejo de errores del backend.
- Prevención de envíos duplicados.

## Fuera de alcance

- Asignación de especialidades al personal.
- Relación `staff_specialty`.
- Registro y administración de profesionales.
- Registro y administración de pacientes.
- Gestión de horarios y disponibilidad.
- Gestión de citas.
- Gestión de sedes o clínicas.
- Autorización efectiva basada en permisos.
- Creación automática de especialidades iniciales.

## Criterios de aceptación

- El usuario puede listar, buscar, filtrar, ordenar y paginar especialidades.
- Puede crear una especialidad respetando las validaciones.
- Puede consultar individualmente una especialidad.
- Puede modificar su nombre y descripción.
- Puede activar y desactivar especialidades.
- Las especialidades inactivas siguen siendo consultables.
- Se conserva la trazabilidad de los registros desactivados.
- Se respetan los contratos y respuestas del backend.
- Se muestran correctamente los estados de carga, errores y confirmaciones.
- El módulo está integrado en las rutas y navegación existentes.
- Los nombres de las rutas son descriptivos y representativos.
- Se reutilizan los componentes disponibles de la plantilla.
- Se mantiene una organización independiente y coherente del módulo.
- No se implementan funcionalidades excluidas de esta especificación.