# SPEC 05 — Módulo frontend de clínicas

## 1. Prioridad

5

## 2. Objetivo

Implementar en el frontend la administración del catálogo de clínicas o sedes donde se prestan los servicios de atención.

El módulo permitirá registrar, consultar, modificar, listar, activar y desactivar clínicas mediante la API existente.

La implementación debe respetar la arquitectura actual del frontend, reutilizar los componentes compartidos y mantener la separación entre la gestión de clínicas y los módulos que posteriormente utilizarán esta entidad.

## 3. Alcance funcional

El módulo debe proporcionar las siguientes funcionalidades:

- Listar clínicas registradas.
- Buscar clínicas por nombre.
- Filtrar clínicas por estado activo o inactivo.
- Ordenar los resultados según los campos admitidos por la API.
- Crear una clínica.
- Consultar el detalle de una clínica.
- Editar los datos permitidos de una clínica.
- Activar y desactivar clínicas.
- Mostrar los estados de carga, vacío, éxito y error correspondientes.

La interfaz debe permitir identificar claramente el estado operativo de cada clínica.

## 4. Organización del módulo

Crear el módulo en:

`frontend/src/modules/clinics/`

La organización interna debe responder a las necesidades reales de la funcionalidad y respetar las convenciones existentes en el proyecto.

Se podrán incorporar carpetas para:

- `pages/`: páginas del módulo.
- `components/`: componentes exclusivos de clínicas.
- `services/`: funciones de comunicación con la API.
- `types/`: tipos e interfaces propios del módulo.
- `hooks/`: hooks específicos, cuando sean necesarios.

No es obligatorio crear todas estas carpetas. Se deben evitar archivos, carpetas y abstracciones que no tengan una necesidad concreta.

Los componentes de uso general deben permanecer en las ubicaciones compartidas existentes. No duplicar componentes que ya estén disponibles en el proyecto.

## 5. Integración con la API

### 5.1. Configuración general

Integrar el módulo con la API de clínicas utilizando el cliente HTTP y los mecanismos de comunicación existentes en el frontend.

**Prefijo:**

`/api/v1/clinics`

No crear un cliente HTTP independiente ni duplicar la configuración de autenticación, encabezados, interceptores o manejo de errores.

Respetar el envoltorio común de respuestas definido por el proyecto y los contratos publicados por el backend.

### 5.2. Endpoints disponibles

| Método | Endpoint | Funcionalidad |
|---|---|---|
| POST | `/clinics` | Crear clínica |
| GET | `/clinics` | Listar clínicas |
| GET | `/clinics/{clinic_id}` | Consultar clínica |
| PATCH | `/clinics/{clinic_id}` | Actualizar clínica |
| PATCH | `/clinics/{clinic_id}/status` | Activar o desactivar clínica |

### 5.3. Parámetros del listado

Implementar los parámetros admitidos por la API:

| Parámetro | Descripción |
|---|---|
| `page` | Página solicitada |
| `page_size` | Cantidad de registros por página |
| `name` | Búsqueda por coincidencia de nombre |
| `is_active` | Filtro por estado |
| `sort_by` | Campo de ordenamiento: `id`, `name` o `created_at` |
| `order` | Dirección del ordenamiento admitida por la API |

La interfaz debe sincronizar los filtros, la ordenación y la paginación con los parámetros de consulta del endpoint.

No implementar ordenamientos locales que contradigan los resultados paginados del servidor.

La estructura de respuesta debe corresponder al contrato de paginación común del backend.

### 5.4. Creación

Utilizar `POST /clinics`.

El formulario debe permitir ingresar:

- `name`: nombre de la clínica. Obligatorio.
- `description`: descripción. Opcional.
- `address`: dirección física. Obligatoria.
- `phone`: teléfono de contacto. Opcional.
- `email`: correo electrónico de contacto. Opcional.

El campo `is_active` debe manejarse de acuerdo con el contrato de creación publicado por la API. No asumir que el cliente puede establecerlo si el esquema de creación no lo permite.

No enviar `id`, `created_at`, `updated_at` ni `time_zone`.

### 5.5. Consulta

Utilizar `GET /clinics/{clinic_id}`.

La página de detalle debe mostrar los datos disponibles de la clínica:

- Identificador.
- Nombre.
- Descripción.
- Dirección.
- Teléfono.
- Correo electrónico.
- Estado.
- Fecha de creación.
- Fecha de última actualización.

Los campos opcionales deben representarse adecuadamente cuando no tengan valor.

Los campos de auditoría deben mostrarse como información de solo lectura.

No mostrar `time_zone`, porque no forma parte del contrato de la API.

### 5.6. Actualización

Utilizar `PATCH /clinics/{clinic_id}`.

El formulario de edición debe permitir modificar parcialmente:

- `name`.
- `description`.
- `address`.
- `phone`.
- `email`.

Respetar las siguientes reglas:

- `name` y `address` son obligatorios y no admiten `null`.
- `description`, `phone` y `email` admiten `null` para eliminar sus valores.
- No enviar campos que el usuario no haya modificado, salvo que el mecanismo existente de formularios requiera otra estrategia compatible con el contrato.
- No permitir modificar `id`, `created_at`, `updated_at` ni `time_zone`.

### 5.7. Cambio de estado

Utilizar `PATCH /clinics/{clinic_id}/status`.

La interfaz debe permitir activar o desactivar una clínica mediante una acción explícita y confirmable.

El cuerpo de la solicitud debe respetar exactamente el esquema definido por la API para el cambio de estado.

La desactivación no debe eliminar el registro ni ocultarlo permanentemente del listado.

Las clínicas inactivas deben seguir siendo consultables.

## 6. Validaciones y reglas de negocio

La interfaz debe incorporar validaciones para mejorar la experiencia de uso, sin sustituir las validaciones definitivas del backend.

### 6.1. Nombre

- Es obligatorio.
- No debe estar vacío ni contener únicamente espacios.
- Debe eliminar los espacios externos antes de enviarse.
- Debe respetar la longitud máxima de 150 caracteres establecida por el modelo.
- La unicidad se valida definitivamente en el backend, sin distinguir mayúsculas y minúsculas.

Si la API devuelve un conflicto por nombre duplicado, mostrar un mensaje comprensible y asociado al campo correspondiente cuando sea posible.

### 6.2. Dirección

- Es obligatoria.
- No debe estar vacía ni contener únicamente espacios.
- Debe eliminar los espacios externos antes de enviarse.
- Respetar la longitud máxima de 255 caracteres.

### 6.3. Teléfono

- Es opcional.
- Si se proporciona, debe respetar el formato compartido por el backend.
- Admitir un signo `+` inicial opcional.
- Admitir dígitos y separadores como espacios, guiones, puntos y paréntesis.
- Debe contener entre 6 y 15 dígitos.
- No asumir un formato telefónico nacional único.

### 6.4. Correo electrónico

- Es opcional.
- Si se proporciona, debe tener un formato de correo electrónico válido.
- Permitir eliminar el valor durante la edición.
- No presentar la validación de formato como una comprobación de entrega o existencia del correo.

### 6.5. Estado

El estado debe tratarse como un valor booleano.

No implementar eliminación física de clínicas.

## 7. Interfaz y páginas

El módulo debe contemplar las siguientes páginas o vistas:

### 7.1. Listado de clínicas

Debe permitir:

- Visualizar las clínicas registradas.
- Buscar por nombre.
- Filtrar por estado activo o inactivo.
- Ordenar por identificador, nombre o fecha de creación.
- Navegar entre páginas.
- Acceder al detalle de una clínica.
- Acceder a la edición.
- Activar o desactivar una clínica.
- Acceder al formulario de creación.

La tabla debe mostrar, como mínimo, nombre, dirección, teléfono, correo electrónico y estado, siempre que la presentación resulte adecuada para los componentes existentes.

Los datos opcionales sin valor deben representarse de manera consistente.

### 7.2. Creación de clínica

Presentar un formulario con los campos definidos para la creación.

Los campos obligatorios deben identificarse visualmente.

Después de una creación exitosa, mostrar una confirmación y actualizar la navegación o el listado según el patrón establecido en el proyecto.

### 7.3. Detalle de clínica

Mostrar la información completa disponible, diferenciando los datos operativos de los campos de auditoría.

Incluir acceso a la edición y a la acción de cambio de estado cuando corresponda.

### 7.4. Edición de clínica

Permitir modificar los campos editables definidos por la API.

Los datos deben cargarse inicialmente desde el detalle de la clínica.

No permitir editar identificador ni campos de auditoría.

### 7.5. Activación y desactivación

Solicitar confirmación antes de ejecutar el cambio de estado.

Actualizar la información presentada una vez confirmada la operación por el backend.

No mostrar una operación como exitosa antes de recibir una respuesta satisfactoria.

## 8. Estados de interfaz y manejo de errores

Todas las vistas deben contemplar los estados necesarios:

- Carga inicial.
- Carga de operaciones.
- Listado con resultados.
- Listado vacío.
- Sin resultados para los filtros aplicados.
- Error de carga.
- Error de validación.
- Error de creación.
- Error de actualización.
- Error al cambiar el estado.
- Operación exitosa.

Manejar los códigos de respuesta previstos por el backend:

| Código | Tratamiento en el frontend |
|---|---|
| 201 | Confirmar creación exitosa |
| 200 | Mostrar los datos u operación exitosa |
| 404 | Informar que la clínica no existe o ya no está disponible |
| 409 | Informar conflicto por nombre duplicado |
| 422 | Mostrar errores de validación |
| Otros | Aplicar el manejo de errores común del proyecto |

Reutilizar el mecanismo compartido para interpretar errores HTTP y presentar notificaciones.

Evitar mensajes técnicos internos o trazas del backend en la interfaz.

## 9. Navegación y rutas

La integración debe cumplir con `specs/00-frontend-navigation-routing.md`.

### 9.1. Sidebar

Incorporar el acceso al módulo en:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

Ubicarlo dentro de un grupo funcional coherente. Puede considerarse el grupo **Administración** o **Gestión clínica**, según la organización existente y las demás funcionalidades registradas.

Si se utiliza un grupo, respetar la estructura `subItems` definida por `NavItem`.

No crear estructuras de navegación incompatibles con el componente actual.

Utilizar iconos disponibles en el proyecto y mantener las entradas existentes que no estén relacionadas con esta modificación.

### 9.2. Rutas

Registrar las rutas en:

`frontend/src/App.tsx`

Las rutas deben ser descriptivas y representar las funcionalidades del módulo. Como referencia:

- `/clinics`: listado.
- `/clinics/create`: creación.
- `/clinics/:clinicId`: detalle.
- `/clinics/:clinicId/edit`: edición.

Las rutas deben integrarse con el router y los layouts existentes.

Las páginas de creación, detalle y edición no necesitan aparecer como opciones independientes en el sidebar.

Evitar rutas duplicadas y mantener coherencia entre la navegación y las páginas registradas.

## 10. Componentes y recursos compartidos

Antes de implementar, inspeccionar el catálogo de componentes y recursos disponibles.

Reutilizar, cuando corresponda:

- Tablas y componentes de listado.
- Formularios y controles de entrada.
- Selectores y filtros.
- Componentes de paginación.
- Diálogos de confirmación.
- Indicadores de estado.
- Notificaciones.
- Componentes de carga y estados vacíos.
- Layouts y elementos de navegación.

No crear versiones exclusivas de componentes generales que ya existan.

Los componentes específicos de clínicas deben permanecer dentro de `frontend/src/modules/clinics/`.

## 11. Pruebas del frontend

Implementar pruebas de acuerdo con las herramientas y convenciones existentes en el proyecto.

Como mínimo, verificar:

- Visualización del listado de clínicas.
- Búsqueda por nombre.
- Filtrado por estado.
- Ordenamiento y paginación.
- Visualización del estado vacío.
- Creación con los campos obligatorios.
- Creación sin teléfono ni correo electrónico.
- Validación de nombre vacío.
- Validación de dirección vacía.
- Validación de longitud del nombre y dirección.
- Validación del formato del teléfono.
- Validación del formato del correo electrónico.
- Visualización de errores 409 y 422.
- Consulta de una clínica existente.
- Manejo de una clínica inexistente.
- Carga de datos en el formulario de edición.
- Actualización parcial de los campos permitidos.
- Eliminación de valores opcionales mediante `null`.
- Activación y desactivación.
- Actualización del estado visual después de una operación exitosa.
- Conservación de clínicas inactivas en el listado cuando se consultan sin filtro de estado.

Las pruebas de integración con la API deben utilizar mecanismos de aislamiento o simulación compatibles con la configuración existente.

## 12. Restricciones y fuera de alcance

Esta implementación no debe incluir:

- Asignación de personal a clínicas.
- Asociación de especialidades con clínicas.
- Gestión de horarios o disponibilidad.
- Creación o administración de citas.
- Asociación de pacientes con clínicas.
- Gestión de inventario, equipos o recursos físicos.
- Administración de permisos específicos por clínica.
- Gestión de usuarios ni acceso por clínica.
- Implementación de autorización efectiva, salvo integración con infraestructura común ya existente.
- Exposición o edición de `time_zone`.
- Creación automática de clínicas de ejemplo.

La existencia de una clínica no implica que tenga personal, horarios, pacientes o citas asociados.

No implementar anticipadamente relaciones o funcionalidades pertenecientes a otros módulos.

## 13. Documentación

La documentación técnica del módulo debe ubicarse en `docs/`, en la raíz del repositorio.

Actualizar la documentación general o el catálogo de módulos cuando corresponda, siguiendo las convenciones de `$frontend-documentacion`.

La presente especificación debe guardarse en:

`specs/05-clinics.md`

No crear `frontend/docs/` ni `frontend/specs/`.

## 14. Criterios de aceptación

La implementación se considera aceptada cuando:

1. Existe el módulo `frontend/src/modules/clinics/`, integrado con la arquitectura actual.
2. Se pueden listar, buscar, filtrar y ordenar clínicas mediante la API.
3. Se pueden crear clínicas con los campos obligatorios y opcionales definidos.
4. Se puede consultar el detalle de una clínica.
5. Se pueden modificar los campos permitidos mediante actualización parcial.
6. Se pueden activar y desactivar clínicas.
7. Se aplican las validaciones de interfaz correspondientes y se presentan correctamente los errores del backend.
8. Las clínicas inactivas siguen siendo consultables y no se eliminan físicamente.
9. El módulo está integrado en el sidebar y en las rutas, respetando la SPEC 00.
10. Se reutilizan los componentes y servicios compartidos existentes.
11. No se implementan relaciones ni funcionalidades excluidas del alcance.
12. Existen pruebas para los flujos principales, validaciones y manejo de errores.
13. La documentación técnica se mantiene en `docs/`, en la raíz del repositorio.