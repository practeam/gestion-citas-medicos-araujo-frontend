# SPEC 03 — Módulo `special_conditions` (Frontend)

**Prioridad:** 3

## Objetivo

Implementar la interfaz para administrar el catálogo de condiciones especiales del sistema, permitiendo crear, consultar, listar, editar, activar y desactivar condiciones especiales.

Estas condiciones representan situaciones que requieren consideración durante la atención y que posteriormente podrán asociarse a personas o pacientes.

El frontend debe consumir los endpoints existentes del backend y respetar sus contratos, validaciones y reglas de negocio.

No implementar todavía la asociación de condiciones especiales con personas o pacientes ni funcionalidades clínicas.

## Organización del módulo

- Ubicar el módulo en `frontend/src/modules/special_conditions/`.
- Mantener dentro del módulo los componentes exclusivos de condiciones especiales.
- Reutilizar los componentes compartidos y recursos existentes de la plantilla.
- Evitar duplicar formularios, tablas, modales, hooks y utilidades existentes.
- Mantener las responsabilidades del módulo independientes de otros módulos funcionales.

## Pantallas y funcionalidades

### 1. Listado de condiciones especiales

Debe mostrar:

- Nombre de la condición especial.
- Descripción.
- Estado (activo o inactivo).
- Fecha de creación.
- Fecha de última actualización.
- Acciones disponibles.

Debe permitir:

- Buscar condiciones especiales por nombre.
- Filtrar por estado activo o inactivo.
- Ordenar por los campos admitidos por el backend.
- Paginar los resultados.
- Acceder a la creación de una condición especial.
- Consultar y editar una condición especial.
- Activar o desactivar una condición especial.

Las condiciones inactivas deben seguir siendo consultables.

### 2. Creación de condiciones especiales

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

### 3. Consulta de condiciones especiales

Debe permitir consultar individualmente una condición especial y mostrar:

- Identificador.
- Nombre.
- Descripción.
- Estado.
- Fecha de creación.
- Fecha de última actualización.

Debe ser posible consultar condiciones activas e inactivas.

Los campos de identificación y auditoría deben mostrarse como información de solo lectura.

### 4. Edición de condiciones especiales

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

Debe permitir cambiar el estado de una condición especial.

Reglas:

- Utilizar `PATCH /special-conditions/{special_condition_id}/status`.
- Enviar `is_active` como booleano.
- Mostrar claramente el estado actual.
- Solicitar confirmación antes de realizar el cambio.
- Actualizar el listado después de una operación exitosa.
- Mostrar los errores si la operación falla.

Desactivar una condición especial no debe eliminarla ni alterar asociaciones históricas.

## Integración con el backend

**Prefijo:** `/api/v1/special-conditions`.

| Método | Endpoint | Función |
|---|---|---|
| POST | `/special-conditions` | Crear condición especial. |
| GET | `/special-conditions` | Listar condiciones especiales. |
| GET | `/special-conditions/{special_condition_id}` | Consultar condición especial. |
| PATCH | `/special-conditions/{special_condition_id}` | Actualizar condición especial. |
| PATCH | `/special-conditions/{special_condition_id}/status` | Cambiar estado. |

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

1. Una condición especial es un elemento del catálogo, no una condición asignada directamente a una persona.
2. Las condiciones podrán asociarse posteriormente a personas o pacientes.
3. Desactivar una condición especial no elimina físicamente el registro.
4. Las condiciones inactivas deben seguir siendo consultables.
5. No modificar asociaciones ni registros históricos al desactivar una condición.
6. No implementar diagnósticos, tratamientos ni evaluaciones médicas.
7. No asumir que todas las personas o pacientes tienen condiciones especiales.
8. No crear condiciones especiales de ejemplo automáticamente.
9. Las asociaciones se definirán en una especificación posterior.

## Integración con la navegación y rutas

### Barra lateral

**Archivo:** `frontend/src/components/layout/app-layout/sidebar/data.tsx`.

- Incorporar el acceso al módulo de condiciones especiales.
- Ubicarlo dentro de una sección funcional adecuada, por ejemplo, `Gestión clínica` o `Administración`, según la organización general de la aplicación.
- Respetar la estructura `NavItem` y `subItems`.
- Reutilizar los iconos existentes.
- No modificar opciones ajenas al módulo.

### Rutas

**Archivo:** `frontend/src/App.tsx`.

Registrar las rutas necesarias para:

- Listar condiciones especiales.
- Crear una condición especial.
- Consultar una condición especial.
- Editar una condición especial.

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
- Creación de una condición especial válida.
- Rechazo de nombre vacío.
- Rechazo de nombre compuesto únicamente por espacios.
- Verificación de normalización de espacios externos.
- Rechazo de nombres duplicados.
- Consulta de una condición especial existente.
- Consulta de una condición especial inexistente.
- Actualización parcial del nombre.
- Actualización parcial de la descripción.
- Eliminación de descripción.
- Activación y desactivación.
- Consulta de condiciones especiales inactivas.
- Manejo de errores del backend.
- Prevención de envíos duplicados.

## Fuera de alcance

- Asociación de condiciones especiales con personas o pacientes.
- Relación entre condiciones especiales y personas.
- Creación y administración de historias clínicas.
- Diagnósticos y tratamientos.
- Protocolos clínicos para alergias.
- Gestión de citas.
- Evaluaciones o decisiones médicas.
- Creación automática de condiciones especiales iniciales.
- Autorización efectiva basada en permisos.

## Criterios de aceptación

- El usuario puede listar, buscar, filtrar, ordenar y paginar condiciones especiales.
- Puede crear una condición especial respetando las validaciones.
- Puede consultar individualmente una condición especial.
- Puede modificar su nombre y descripción.
- Puede activar y desactivar condiciones especiales.
- Las condiciones inactivas siguen siendo consultables.
- Se conserva la trazabilidad de los registros desactivados.
- Se respetan los contratos y respuestas del backend.
- Se muestran correctamente los estados de carga, errores y confirmaciones.
- El módulo está integrado en las rutas y navegación existentes.
- Los nombres de las rutas son descriptivos y representativos.
- Se reutilizan los componentes disponibles de la plantilla.
- Se mantiene una organización independiente y coherente del módulo.
- No se implementan funcionalidades excluidas de esta especificación.