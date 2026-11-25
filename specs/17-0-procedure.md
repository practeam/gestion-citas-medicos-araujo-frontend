# SPEC 17-0 — Gestión del catálogo de procedimientos odontológicos (Frontend)

## 1. Objetivo

Implementar el módulo frontend para administrar el catálogo de procedimientos odontológicos del sistema.

El módulo permitirá:

- Registrar procedimientos odontológicos.
- Consultar el catálogo de procedimientos.
- Buscar procedimientos por nombre o código.
- Consultar el detalle de un procedimiento.
- Editar información de procedimientos.
- Organizar procedimientos mediante relaciones jerárquicas.
- Activar y desactivar procedimientos.
- Filtrar procedimientos por estado, procedimiento padre y rango de precios.
- Visualizar la estructura jerárquica del catálogo.

El catálogo será la fuente de información para seleccionar procedimientos al crear o editar citas, según la especificación de gestión de detalles de citas.

**Importante:** esta especificación contempla exclusivamente la administración del catálogo. La asociación de procedimientos a citas pertenece al módulo `appointments` y a su especificación correspondiente.

## 2. Prioridad y dependencias

**Prioridad:** 2.

Dependencias:

- Estructura general del frontend existente.
- Backend: SPEC 02 — Entidad `procedure`.
- SPEC 18 — Integración de procedimientos en el formulario de citas, para mantener la compatibilidad con el catálogo que utilizará el módulo de citas.

El módulo `procedures` será responsable de administrar el catálogo.

El módulo `appointments` será responsable de consumir este catálogo para seleccionar procedimientos y asociarlos a las citas.

No se deben duplicar las funcionalidades de administración del catálogo dentro del módulo de citas.

## 3. Organización del módulo

Crear el módulo funcional en:

`frontend/src/modules/procedures/`

La organización interna debe respetar las convenciones existentes del repositorio.

Como referencia, puede contener:

- `pages/`: páginas de listado, creación, detalle y edición.
- `components/`: componentes exclusivos del catálogo de procedimientos.
- `services/`: servicios para consumir los endpoints del backend.
- `types/`: interfaces y tipos TypeScript.
- `hooks/`: hooks específicos, únicamente cuando sean necesarios.

No es obligatorio crear todas estas carpetas si la implementación no lo requiere.

Los componentes genéricos deben reutilizarse desde las carpetas compartidas existentes.

No reorganizar la arquitectura general del frontend ni mover componentes existentes.

## 4. Navegación y rutas

### 4.1. Sidebar

Agregar una opción independiente denominada **Procedimientos** en el archivo:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

Debe ubicarse dentro de una sección funcional apropiada, por ejemplo, Gestión de servicios o Catálogo.

La opción debe utilizar un icono existente en el proyecto.

Se debe respetar la estructura actual del sidebar y el comportamiento definido en `specs/00-frontend-navigation-routing.md`.

No eliminar ni modificar opciones de navegación que no pertenezcan a esta funcionalidad.

### 4.2. Rutas

Registrar las siguientes rutas en:

`frontend/src/App.tsx`

- `/procedures`: listado de procedimientos.
- `/procedures/create`: creación de procedimiento.
- `/procedures/:procedureId`: consulta del procedimiento.
- `/procedures/:procedureId/edit`: edición del procedimiento.

Las rutas deben utilizar el mecanismo de enrutamiento existente y los layouts correspondientes.

Las páginas de creación, detalle y edición no necesitan aparecer individualmente en el sidebar.

## 5. Pantalla de listado de procedimientos

La ruta `/procedures` debe mostrar el catálogo de procedimientos registrados.

### 5.1. Información del listado

Mostrar, como mínimo:

- Código.
- Nombre.
- Procedimiento padre, cuando exista.
- Precio base.
- Duración estimada en minutos.
- Estado.
- Acciones disponibles.

Las acciones deben permitir:

- Consultar.
- Editar.
- Activar o desactivar.

### 5.2. Búsqueda

Incorporar un campo de búsqueda que permita buscar por:

- Nombre.
- Código.

La búsqueda debe utilizar el parámetro `search` del backend.

No implementar una búsqueda exclusivamente local que ignore los filtros y la paginación del servidor.

### 5.3. Filtros

Incorporar filtros para:

- Estado: activos e inactivos.
- Procedimiento padre.
- Precio mínimo.
- Precio máximo.

Los filtros deben utilizar los parámetros definidos por el backend.

No inventar parámetros adicionales.

El usuario debe poder limpiar los filtros y recuperar el listado general.

### 5.4. Paginación y ordenamiento

El listado debe utilizar la paginación proporcionada por el backend.

Debe mostrar la información de navegación correspondiente:

- Página actual.
- Total de registros.
- Tamaño de página.
- Navegación entre páginas.

El ordenamiento debe utilizar únicamente los campos y parámetros que admita el contrato real del backend.

No asumir parámetros de ordenamiento que no estén definidos.

### 5.5. Estados del listado

Contemplar:

- Cargando.
- Resultados disponibles.
- Sin procedimientos registrados.
- Sin resultados para la búsqueda.
- Error al consultar el catálogo.

## 6. Creación de procedimientos

La ruta `/procedures/create` debe mostrar el formulario de registro.

### 6.1. Campos

El formulario debe incluir:

| Campo | Comportamiento |
|---|---|
| Nombre | Obligatorio. |
| Código | Opcional. |
| Precio base | Obligatorio, mayor o igual a cero. |
| Duración estimada | Obligatoria, entero mayor que cero. |
| Descripción | Opcional. |
| Procedimiento padre | Opcional. |

El estado no debe ser editable durante la creación. El backend crea los procedimientos activos por defecto.

### 6.2. Selección del procedimiento padre

El usuario podrá seleccionar un procedimiento existente como padre.

El selector debe:

- Mostrar procedimientos disponibles y activos.
- Permitir identificar claramente el procedimiento seleccionado.
- Excluir el procedimiento que se está creando, ya que todavía no existe.
- No permitir seleccionar procedimientos inactivos.
- Permitir dejar el campo vacío.

Cuando exista una jerarquía de procedimientos, el selector debe mostrar información suficiente para distinguir los elementos y comprender su ubicación.

### 6.3. Validaciones

El frontend debe validar:

- Nombre obligatorio.
- Nombre no vacío ni compuesto únicamente por espacios.
- Código opcional, pero no vacío si se proporciona.
- Precio base numérico mayor o igual a cero.
- Duración entera positiva.
- Descripción opcional.
- Procedimiento padre existente y activo.

La unicidad del nombre y del código debe validarse definitivamente en el backend.

El frontend debe presentar los errores devueltos por la API.

### 6.4. Envío

Consumir:

`POST /api/v1/procedures`

Enviar únicamente los campos permitidos:

- `parent_procedure_id`, cuando corresponda.
- `code`, cuando corresponda.
- `name`.
- `base_price`.
- `base_duration_minutes`.
- `description`, cuando corresponda.

No enviar:

- `id`.
- `is_active`.
- `created_at`.
- `updated_at`.

Después de una creación exitosa, redirigir al detalle del procedimiento o al listado, siguiendo los patrones existentes del proyecto.

## 7. Consulta de procedimiento

La ruta `/procedures/:procedureId` debe mostrar la información completa del procedimiento.

Mostrar:

- Identificador.
- Nombre.
- Código, cuando exista.
- Precio base.
- Duración estimada.
- Descripción.
- Procedimiento padre, cuando exista.
- Estado.
- Fecha de creación.
- Fecha de última actualización.

Los campos de auditoría deben ser de solo lectura.

Cuando exista un procedimiento padre, permitir navegar a su detalle.

Si el backend proporciona información adicional sobre la jerarquía, se puede utilizar para contextualizar el procedimiento.

No inventar endpoints para consultar los procedimientos hijos.

La consulta debe utilizar:

`GET /api/v1/procedures/{procedure_id}`

Si el procedimiento no existe, mostrar el estado correspondiente de recurso no encontrado.

## 8. Edición de procedimientos

La ruta `/procedures/:procedureId/edit` debe permitir modificar los datos editables.

Campos disponibles:

- `parent_procedure_id`.
- `code`.
- `name`.
- `base_price`.
- `base_duration_minutes`.
- `description`.

La actualización debe ser parcial mediante:

`PATCH /api/v1/procedures/{procedure_id}`

### 8.1. Reglas del formulario

- Recuperar los datos actuales antes de permitir la edición.
- Mantener los valores actuales de los campos no modificados.
- Permitir modificar el nombre.
- Permitir modificar el código.
- Permitir modificar el precio base.
- Permitir modificar la duración estimada.
- Permitir modificar la descripción.
- Permitir modificar el procedimiento padre.

El selector de procedimiento padre debe excluir:

- El procedimiento actual.
- Los procedimientos inactivos.

El frontend debe permitir seleccionar únicamente padres válidos según la información disponible, mientras que el backend debe validar definitivamente que la modificación no genere ciclos jerárquicos.

Si se selecciona un procedimiento padre inactivo, el backend rechazará la operación y el frontend debe presentar el error correspondiente.

No enviar identificadores ni campos de auditoría como parte de la actualización.

### 8.2. Conservación de información histórica

Modificar el precio base o la duración estimada de un procedimiento no debe alterar los detalles de citas existentes.

El frontend no debe ejecutar actualizaciones sobre citas o detalles de citas cuando se modifique el catálogo.

Los valores históricos pertenecen a `appointment_detail` y deben conservarse según las reglas de backend.

## 9. Organización jerárquica de procedimientos

El catálogo admite relaciones jerárquicas mediante `parent_procedure_id`.

El frontend debe representar esta relación de manera comprensible.

### 9.1. Visualización

Cuando el backend proporcione la información necesaria, permitir visualizar los procedimientos organizados por niveles:

- Procedimientos principales.
- Procedimientos hijos.
- Procedimientos pertenecientes a niveles inferiores.

La visualización puede utilizar una estructura de árbol o una representación jerárquica dentro del listado.

No asumir que el backend devuelve automáticamente todos los hijos de cada procedimiento. Si la respuesta no contiene esa información, utilizar únicamente los datos disponibles y los endpoints existentes.

### 9.2. Selección de padres

Al crear o editar un procedimiento:

- El padre es opcional.
- Debe existir.
- Debe estar activo.
- No puede ser el propio procedimiento.
- La relación no debe generar ciclos.

El frontend debe ayudar a evitar selecciones incorrectas, pero no sustituye las validaciones del backend.

### 9.3. Procedimientos hijos

Un procedimiento puede tener varios hijos, pero solamente un padre.

Si el procedimiento padre se desactiva, no se deben permitir nuevas asignaciones de procedimientos hijos a ese padre.

No implementar una operación automática para reasignar o eliminar hijos cuando se desactive un padre.

## 10. Activación y desactivación

El listado y el detalle deben permitir cambiar el estado del procedimiento.

Consumir:

`PATCH /api/v1/procedures/{procedure_id}/status`

El cuerpo debe respetar el contrato backend y enviar `is_active` como booleano.

Antes de ejecutar el cambio, solicitar confirmación utilizando el mecanismo existente del proyecto.

### 10.1. Desactivar

Cuando se desactive un procedimiento:

- Debe conservarse el registro.
- Debe continuar siendo consultable.
- Debe mostrarse como inactivo.
- No debe ofrecerse para nuevas asociaciones a citas.
- No debe modificar los detalles históricos existentes.

### 10.2. Activar

Cuando se active un procedimiento:

- Debe actualizarse su estado.
- Debe volver a estar disponible para nuevas asociaciones, siempre que cumpla las demás reglas del catálogo.
- Debe actualizarse el listado y el detalle.

Los errores deben comunicarse sin asumir que el cambio se realizó correctamente.

## 11. Integración con el módulo de citas

El módulo `procedures` es responsable exclusivamente de administrar el catálogo.

El módulo `appointments` debe consumir el catálogo mediante los endpoints correspondientes para seleccionar procedimientos dentro del formulario de citas.

La integración se rige por la SPEC 18 — Integración de procedimientos en el formulario de citas.

### 11.1. Consumo del catálogo

El formulario de citas debe consultar los procedimientos activos utilizando:

`GET /api/v1/procedures`

Debe permitir seleccionar procedimientos existentes y mostrar la información necesaria para asociarlos a una cita:

- Identificador.
- Nombre.
- Código, cuando exista.
- Precio base.
- Duración base.
- Estado.

Los filtros y parámetros utilizados deben respetar el contrato backend.

### 11.2. Separación de responsabilidades

- `procedures` administra el catálogo.
- `appointments` administra las citas.
- `appointments` coordina la asociación de procedimientos a través de `appointment_detail`.
- Los valores históricos de precio y duración pertenecen a los detalles de citas.

No implementar en este módulo los endpoints de `appointment_detail`.

No incorporar formularios de citas dentro del módulo `procedures`.

No duplicar el catálogo en el módulo de citas.

## 12. Integración con la API

Prefijo base:

`/api/v1`

Endpoints:

| Método | Endpoint | Uso frontend |
|---|---|---|
| POST | `/procedures` | Crear procedimiento. |
| GET | `/procedures` | Listar, buscar y filtrar procedimientos. |
| GET | `/procedures/{procedure_id}` | Consultar procedimiento. |
| PATCH | `/procedures/{procedure_id}` | Editar procedimiento. |
| PATCH | `/procedures/{procedure_id}/status` | Activar o desactivar. |

### 12.1. Parámetros de listado

Utilizar los filtros definidos por backend:

- `search`
- `is_active`
- `parent_procedure_id`
- `min_price`
- `max_price`

La paginación y el ordenamiento deben utilizar los parámetros reales definidos en el contrato de la API.

No inventar nombres de parámetros, estructuras de respuesta ni campos adicionales.

### 12.2. Cliente HTTP

Utilizar el cliente HTTP y los mecanismos de integración existentes.

No crear una segunda instancia de Axios o Fetch si el proyecto ya dispone de un cliente centralizado.

Respetar:

- Configuración de URL base.
- Manejo de errores.
- Interceptores existentes.
- Tipos de respuestas.
- Convenciones de servicios.
- Configuración de autenticación existente.

No implementar autenticación o autorización nueva en este módulo.

## 13. Tipos y modelos frontend

Definir tipos TypeScript coherentes con el contrato backend.

Como mínimo, contemplar:

**Procedure**

- `id`
- `parent_procedure_id`
- `code`
- `name`
- `base_price`
- `base_duration_minutes`
- `description`
- `is_active`
- `created_at`
- `updated_at`

Los tipos de creación, actualización, consulta y listado deben diferenciarse cuando sus contratos lo requieran.

Los campos opcionales y anulables deben reflejar exactamente el comportamiento del backend.

Los valores monetarios deben manejarse de acuerdo con la representación decimal entregada por la API. No convertirlos indiscriminadamente a `float` para operaciones financieras.

## 14. Componentes y reutilización

Antes de implementar componentes nuevos, inspeccionar el catálogo de componentes existente.

Se pueden desarrollar componentes específicos del módulo, por ejemplo:

- `ProcedureForm`: formulario de creación y edición.
- `ProcedureList`: listado de procedimientos.
- `ProcedureFilters`: filtros de búsqueda.
- `ProcedureStatusBadge`: indicador del estado.
- `ProcedureParentSelector`: selector de procedimiento padre.
- `ProcedureHierarchy`: visualización jerárquica.

Estos nombres son referenciales y deben adaptarse a las convenciones existentes.

Reutilizar los componentes compartidos de:

- Formularios.
- Inputs.
- Selectores.
- Tablas.
- Modales.
- Confirmaciones.
- Paginación.
- Alertas.
- Indicadores de carga.
- Manejo de errores.

No crear abstracciones genéricas innecesarias.

## 15. Estados de interfaz

El módulo debe contemplar:

- Cargando listado.
- Listado vacío.
- Sin resultados de búsqueda.
- Error al cargar procedimientos.
- Cargando detalle.
- Procedimiento inexistente.
- Cargando formulario.
- Guardando procedimiento.
- Error de validación.
- Nombre duplicado.
- Código duplicado.
- Procedimiento padre inexistente.
- Procedimiento padre inactivo.
- Error por jerarquía circular.
- Activando procedimiento.
- Desactivando procedimiento.
- Error al cambiar estado.

Los mensajes deben ser comprensibles y utilizar los mecanismos de notificación existentes.

## 16. Pruebas frontend

Implementar pruebas para verificar:

### Listado

- Visualización de procedimientos.
- Búsqueda por nombre.
- Búsqueda por código.
- Filtro por estado.
- Filtro por procedimiento padre.
- Filtro por rango de precios.
- Paginación.
- Estado sin resultados.
- Manejo de errores.

### Creación

- Creación con datos válidos.
- Nombre obligatorio.
- Código opcional.
- Precio igual a cero permitido.
- Rechazo de precio negativo.
- Duración entera positiva.
- Rechazo de duración decimal.
- Selección de procedimiento padre.
- Rechazo de selección de padre inactivo.
- Manejo de duplicidad de nombre y código.

### Consulta

- Visualización de datos completos.
- Visualización del procedimiento padre.
- Manejo de identificador inexistente.

### Edición

- Carga de datos actuales.
- Actualización parcial.
- Conservación de campos no modificados.
- Cambio de procedimiento padre.
- Manejo de errores de duplicidad.
- Manejo de jerarquías inválidas.

### Estado

- Activación de procedimiento.
- Desactivación de procedimiento.
- Confirmación de la operación.
- Conservación del registro después de desactivar.
- Actualización del estado en la interfaz.

### Integración con citas

- Visualización de procedimientos activos en el selector de citas.
- Exclusión de procedimientos inactivos para nuevas asociaciones.
- Conservación de procedimientos históricos en citas existentes.
- No modificación de detalles históricos al actualizar el catálogo.

## 17. Criterios de aceptación

La implementación se considerará correcta cuando:

1. Exista un módulo independiente `procedures` dentro de `frontend/src/modules/`.
2. Se pueda registrar, consultar, editar y activar o desactivar procedimientos.
3. Se pueda buscar por nombre y código.
4. Se puedan utilizar los filtros definidos por backend.
5. Se respete la paginación del servidor.
6. Se pueda establecer un procedimiento padre.
7. Se visualice correctamente la jerarquía cuando la información del backend lo permita.
8. Se impida seleccionar procedimientos inactivos como nuevos padres.
9. Se manejen correctamente los errores de unicidad y jerarquía.
10. Se conserven los registros y referencias históricas al desactivar.
11. Los cambios de precio y duración no modifiquen detalles históricos de citas.
12. El módulo de citas pueda consumir los procedimientos activos del catálogo.
13. No se implementen endpoints de asociación a citas dentro de este módulo.
14. Se respeten la arquitectura y los componentes existentes.
15. Se mantengan las rutas y navegación definidas en esta especificación.

## 18. Fuera de alcance

No implementar:

- Gestión de citas (`appointment`).
- Gestión de detalles de citas (`appointment_detail`).
- Asociación de procedimientos a citas desde este módulo.
- Facturación y pagos.
- Registro de tratamientos realizados.
- Historial clínico del paciente.
- Gestión de materiales e insumos.
- Asignación de procedimientos a odontólogos.
- Cálculo automático de precios según materiales, especialistas o condiciones del paciente.
- Eliminación física de procedimientos.
- Gestión de permisos o autorización por roles.

## 19. Ubicación de la especificación

Guardar este documento en la raíz del repositorio:

`specs/17-0-procedures.md`

No crear el documento dentro de `frontend/`.

El módulo frontend debe implementarse en:

`frontend/src/modules/procedures/`

La documentación técnica complementaria, si fuera necesaria, debe guardarse en `docs/` en la raíz del repositorio.

---

**Relación con las demás especificaciones:**

- Esta SPEC define la administración del catálogo de procedimientos.
- La SPEC 18 define la integración de los procedimientos en el mismo formulario de creación y edición de citas de la SPEC 17.
- La SPEC 17 continúa siendo responsable de la agenda y gestión principal de citas.

Las tres funcionalidades deben conservar sus responsabilidades y contratos independientes.