# SPEC 06 — Módulo frontend de registro de personas (`persons`)

## 1. Prioridad

6

## 2. Objetivo

Implementar en el frontend el registro y la administración de los datos personales básicos de las personas que interactúan con el sistema.

La entidad `person` constituye la base común de las entidades `patient` y `staff`. Por tanto, los datos personales deben administrarse de manera centralizada y reutilizarse en los módulos que dependan de ellos.

El módulo debe permitir registrar, consultar, listar, actualizar, activar y desactivar personas.

Además, debe proporcionar los componentes y servicios reutilizables necesarios para que los módulos de pacientes y personal puedan seleccionar personas existentes o registrar personas nuevas desde sus propios flujos de creación.

La implementación debe evitar la duplicación de formularios, validaciones, tipos y lógica relacionada con los datos personales.

## 3. Alcance funcional

El módulo debe permitir:

- Listar personas registradas.
- Buscar personas por nombre y apellidos.
- Buscar personas por tipo y número de documento.
- Filtrar por estado activo o inactivo.
- Ordenar los resultados según los campos admitidos por la API.
- Registrar una persona.
- Consultar el detalle de una persona.
- Actualizar sus datos personales.
- Activar y desactivar una persona.
- Proporcionar componentes reutilizables para los módulos de pacientes y personal.

La administración de personas debe ser independiente de la administración de pacientes y personal.

Registrar una persona desde este módulo no debe crear automáticamente un paciente ni un miembro del personal.

## 4. Organización del módulo

Crear el módulo en:

`frontend/src/modules/persons/`

La organización interna debe responder a las necesidades reales de la funcionalidad y respetar las convenciones existentes.

Se podrán incorporar las siguientes responsabilidades:

- `pages/`: páginas propias del módulo de personas.
- `components/`: componentes personales reutilizables.
- `services/`: comunicación con la API de personas.
- `types/`: tipos e interfaces de personas.
- `hooks/`: hooks específicos, cuando sean necesarios.
- `utils/`: normalización y validaciones personales reutilizables, si corresponde.

No es obligatorio crear todas estas carpetas. Evitar estructuras vacías y abstracciones anticipadas.

### 4.1. Componentes personales reutilizables

El módulo debe proporcionar los componentes necesarios para que otros módulos puedan reutilizar los datos personales.

Como referencia, se contemplan:

**PersonForm**

Formulario reutilizable para registrar o editar datos personales.

Debe contemplar los siguientes campos:

- `first_name`.
- `last_name`.
- `document_type`.
- `document_number`.
- `birth_date`.
- `phone`.
- `email`.
- `address`.

Debe admitir los modos de creación y edición, utilizando las reglas correspondientes a cada operación.

El componente debe permitir recibir valores iniciales, gestionar validaciones y comunicar los datos mediante una interfaz tipada.

No debe encargarse de registrar pacientes ni personal.

**PersonSelector**

Componente para buscar y seleccionar una persona existente.

Debe permitir:

- Buscar personas mediante los filtros admitidos por la API.
- Mostrar información suficiente para identificar a la persona.
- Diferenciar personas activas e inactivas.
- Seleccionar una persona existente.
- Informar cuando no existan resultados.
- Comunicar la persona seleccionada, especialmente su identificador `person_id`.

La selección debe respetar las restricciones de cada módulo consumidor. Por ejemplo, para registrar un paciente o trabajador solo deben poder seleccionarse personas activas.

Estos componentes son referencias funcionales, no una obligación de implementar dos componentes independientes si la arquitectura existente permite resolver la misma responsabilidad mediante una composición más adecuada.

### 4.2. Reutilización por otros módulos

Los componentes y servicios personales deben poder ser utilizados desde:

- `frontend/src/modules/patients/`
- `frontend/src/modules/staff/`

Los módulos consumidores deben importar los recursos públicos necesarios de `persons`, sin duplicar su implementación.

Los componentes personales no deben depender de los módulos de pacientes ni de personal.

La dependencia debe mantener una dirección clara:

`patients → persons`

`staff → persons`

`persons` no debe depender de `patients` ni de `staff`.

## 5. Integración con la API

### 5.1. Configuración general

Utilizar el cliente HTTP y los mecanismos de comunicación existentes en el frontend.

**Prefijo:**

`/api/v1/persons`

Respetar el envoltorio común de respuestas del backend y los contratos publicados en OpenAPI.

No crear un cliente HTTP independiente ni duplicar la configuración de autenticación, encabezados, interceptores o manejo de errores.

### 5.2. Endpoints disponibles

| Método | Endpoint | Funcionalidad |
|---|---|---|
| POST | `/persons` | Registrar persona |
| GET | `/persons` | Listar personas |
| GET | `/persons/{person_id}` | Consultar persona |
| PATCH | `/persons/{person_id}` | Actualizar datos personales |
| PATCH | `/persons/{person_id}/status` | Activar o desactivar persona |

### 5.3. Parámetros del listado

Implementar los filtros y parámetros admitidos por el backend:

| Parámetro | Descripción |
|---|---|
| `page` | Página solicitada |
| `page_size` | Cantidad de registros por página |
| `name` | Búsqueda por palabras en nombres y apellidos |
| `document_type` | Tipo de documento |
| `document_number` | Número de documento con coincidencia exacta |
| `is_active` | Filtro por estado |
| `sort_by` | Campo de ordenamiento: `id`, `last_name`, `first_name` o `created_at` |
| `order` | Dirección del ordenamiento admitida por la API |

La búsqueda por `name` debe respetar el comportamiento del backend: cada palabra de búsqueda debe aparecer en alguno de los campos de nombre, apellido paterno o apellido materno.

La búsqueda por `document_number` debe ser exacta, no parcial.

La interfaz debe sincronizar filtros, ordenamiento y paginación con los parámetros de consulta del servidor.

No implementar búsquedas locales que contradigan los resultados paginados del backend.

### 5.4. Registro

Utilizar `POST /persons`.

El formulario debe permitir ingresar:

- `first_name`: obligatorio.
- `last_name`: obligatorio.
- `document_type`: opcional.
- `document_number`: opcional.
- `birth_date`: opcional.
- `phone`: opcional.
- `email`: opcional.
- `address`: opcional.

No enviar `id`, `created_at`, `updated_at` ni `password_hash`.

Los campos de documento deben enviarse juntos o ambos omitirse, según las reglas del backend.

La creación de una persona no debe desencadenar automáticamente la creación de un paciente, personal, usuario o cuenta de acceso.

### 5.5. Consulta

Utilizar `GET /persons/{person_id}`.

Mostrar los datos personales disponibles y el estado de la persona.

Los campos de auditoría deben presentarse como información de solo lectura.

Nunca mostrar ni solicitar `password_hash`, aunque exista en la tabla de persistencia.

### 5.6. Actualización

Utilizar `PATCH /persons/{person_id}`.

Permitir la actualización parcial de los datos personales.

Respetar las siguientes reglas:

- `first_name` y `last_name` no admiten `null`.
- Los demás campos editables admiten `null` para eliminar sus valores.
- El tipo y número de documento deben mantenerse completos o ambos quedar omitidos.
- No enviar campos que el usuario no haya modificado, salvo que el mecanismo existente de formularios requiera otra estrategia compatible con el contrato.
- No permitir modificar `id`, `created_at`, `updated_at` ni `password_hash`.

La actualización debe realizarse exclusivamente mediante el módulo de personas, incluso cuando se origine desde un flujo de otro módulo.

### 5.7. Cambio de estado

Utilizar `PATCH /persons/{person_id}/status`.

Permitir activar o desactivar una persona mediante una acción explícita y confirmable.

La desactivación no debe eliminar el registro ni modificar automáticamente el estado de pacientes o personal asociados.

Las personas inactivas deben seguir siendo consultables.

## 6. Validaciones y reglas de negocio

### 6.1. Nombres y apellidos

- `first_name` es obligatorio.
- `last_name` es obligatorio.
- No deben estar vacíos ni contener únicamente espacios.
- Eliminar los espacios externos antes de enviar los datos.
- Respetar las longitudes establecidas por los esquemas del backend.

### 6.2. Documento de identidad

- `document_type` y `document_number` son opcionales.
- Deben proporcionarse juntos o ambos omitirse.
- No asumir un formato nacional único.
- El tipo se normaliza en mayúsculas.
- El número se normaliza eliminando espacios y convirtiendo las letras a mayúsculas.
- Respetar los caracteres permitidos por el backend.
- La unicidad se garantiza mediante la API para la combinación normalizada de tipo y número.

No implementar una validación de unicidad exclusivamente en el frontend como sustituto de la validación del servidor.

Si el backend devuelve un conflicto por documento duplicado, mostrar un mensaje comprensible.

### 6.3. Fecha de nacimiento

- Es opcional.
- Debe ser una fecha válida.
- No puede ser posterior a la fecha actual.
- Se permite la fecha actual.

### 6.4. Teléfono

- Es opcional.
- Debe respetar el esquema compartido del backend.
- No asumir un formato telefónico nacional único.
- No utilizarlo como identificador único.

### 6.5. Correo electrónico

- Es opcional.
- Debe cumplir el formato establecido por el backend.
- No utilizarlo como identificador único.
- No presentar la validación de formato como comprobación de entrega o existencia del correo.

### 6.6. Dirección

- Es opcional.
- Respetar los límites y reglas definidos por el backend.

### 6.7. Privacidad

Los datos personales deben tratarse como información sensible.

La interfaz debe:

- Mostrar únicamente los datos necesarios para la funcionalidad.
- Evitar incluir documentos, teléfonos, correos o nombres completos en logs técnicos.
- No almacenar datos personales en mecanismos de persistencia del navegador sin una necesidad y política explícitamente definidas.
- Evitar mostrar datos personales completos en notificaciones innecesarias.
- Respetar las políticas de acceso que se implementen en la infraestructura común.

## 7. Interfaz y páginas

### 7.1. Listado de personas

Implementar una página independiente para administrar personas.

Debe permitir:

- Visualizar las personas registradas.
- Buscar por nombre y apellidos.
- Buscar por tipo y número de documento.
- Filtrar por estado activo o inactivo.
- Ordenar por los campos admitidos.
- Navegar entre páginas.
- Acceder al detalle.
- Acceder a la edición.
- Activar o desactivar personas.
- Acceder al formulario de registro.

La tabla debe mostrar información suficiente para identificar a una persona, sin exponer datos innecesarios.

### 7.2. Registro de persona

Presentar un formulario con los campos personales definidos en esta especificación.

Identificar claramente los campos obligatorios y opcionales.

Después de registrar una persona correctamente, mostrar una confirmación y actualizar la navegación o el listado según los patrones existentes.

### 7.3. Detalle de persona

Mostrar la información personal disponible, diferenciando los datos editables de los campos de auditoría.

Incluir acceso a la edición y al cambio de estado cuando corresponda.

No incorporar dentro de esta vista la administración de pacientes o personal.

### 7.4. Edición de persona

Permitir modificar los datos personales mediante `PATCH /persons/{person_id}`.

Cargar inicialmente la información mediante el endpoint de detalle.

Respetar las reglas de actualización parcial y la posibilidad de eliminar valores opcionales.

### 7.5. Activación y desactivación

Solicitar confirmación antes de ejecutar el cambio de estado.

Actualizar la información visual después de recibir una respuesta satisfactoria del backend.

No presentar la operación como exitosa antes de que el servidor confirme el cambio.

## 8. Integración con pacientes y personal

Esta sección establece una regla importante para mantener una experiencia sencilla y evitar la duplicación de datos personales.

### 8.1. Principio general

Los módulos de pacientes y personal deben funcionar como páginas independientes.

El usuario no debe estar obligado a registrar primero una persona desde el módulo Personas para luego navegar a otro módulo y crear un paciente o trabajador.

Los módulos consumidores deben ofrecer dos alternativas al registrar sus entidades:

1. Seleccionar una persona existente.
2. Registrar una persona nueva desde el mismo flujo de creación.

Ambas alternativas deben utilizar los componentes y servicios compartidos del módulo `persons`.

### 8.2. Seleccionar una persona existente

Cuando el usuario elija una persona existente:

- Mostrar un mecanismo de búsqueda reutilizable.
- Permitir buscar por nombre o documento, respetando los filtros de la API.
- Mostrar información suficiente para identificar a la persona.
- Permitir seleccionar una persona activa.
- Obtener y conservar su identificador `person_id`.
- Utilizar ese identificador al registrar el paciente o miembro del personal.

No copiar los datos personales al formulario específico del paciente o trabajador como si fueran campos propios de esas entidades.

### 8.3. Registrar una persona nueva desde otro módulo

Cuando el usuario seleccione la opción de registrar una persona nueva:

- Mostrar el formulario personal reutilizable.
- Permitir ingresar los datos personales sin abandonar el flujo de creación del módulo consumidor.
- Registrar primero la persona mediante `POST /persons`.
- Obtener el identificador de la persona creada.
- Continuar con el formulario específico de paciente o personal.
- Registrar la entidad correspondiente utilizando el `person_id` devuelto.

El flujo debe permitir que el usuario complete la operación desde una misma experiencia, aunque internamente se realicen dos solicitudes independientes.

No crear una segunda implementación del formulario personal dentro de `patients` o `staff`.

### 8.4. Manejo de fallos parciales

La creación de la persona y la creación del paciente o personal son operaciones independientes de la API.

Por tanto:

- Si falla la creación de la persona, no continuar con el registro de la entidad dependiente.
- Si la persona se crea correctamente, pero falla la creación del paciente o personal, informar claramente al usuario que la persona quedó registrada, pero que la segunda operación no se completó.
- Conservar el identificador de la persona creada durante el flujo para permitir reintentar el registro dependiente sin crear otra persona.
- No afirmar que ambas operaciones fueron exitosas cuando solo una se completó.
- No intentar eliminar automáticamente la persona creada para compensar el fallo, ya que la API no define una operación transaccional conjunta ni una política de eliminación física.

### 8.5. Actualización de datos personales

Los datos personales de pacientes y trabajadores deben actualizarse mediante el módulo de personas.

Los formularios específicos de pacientes y personal no deben implementar campos duplicados para modificar nombres, apellidos, documentos o datos de contacto.

Cuando se requiera modificar esos datos desde una pantalla de paciente o personal, se debe reutilizar el formulario personal y enviar la actualización a `PATCH /persons/{person_id}`.

La actualización de los datos específicos de pacientes o personal debe seguir realizándose mediante sus respectivos endpoints.

### 8.6. Independencia de los módulos

La integración anterior no convierte a `persons` en un submódulo de pacientes o personal.

Se deben mantener:

- Página y rutas propias para Personas.
- Página y rutas propias para Pacientes.
- Página y rutas propias para Personal.
- Servicios independientes para cada API.
- Tipos específicos para cada entidad.
- Componentes personales compartidos desde `persons`.

No crear una página adicional únicamente para relacionar manualmente personas con pacientes o personal. La selección y el registro de la persona deben formar parte de los flujos de creación de las entidades dependientes.

## 9. Estados de interfaz y manejo de errores

Contemplar los siguientes estados:

- Carga inicial.
- Carga de listado.
- Listado con resultados.
- Listado vacío.
- Sin resultados para los filtros aplicados.
- Error de carga.
- Error de validación.
- Error de creación.
- Error de actualización.
- Error al cambiar el estado.
- Operación exitosa.
- Error al buscar o seleccionar una persona.
- Error parcial durante el registro combinado de una persona y su entidad dependiente.

Manejar los códigos previstos por el backend:

| Código | Tratamiento |
|---|---|
| 201 | Confirmar registro exitoso |
| 200 | Mostrar los datos u operación exitosa |
| 404 | Informar que la persona no existe |
| 409 | Informar conflicto por documento duplicado |
| 422 | Mostrar errores de validación |

Reutilizar el mecanismo común de manejo de errores HTTP y notificaciones.

No mostrar trazas ni detalles técnicos internos del backend.

## 10. Navegación y rutas

La integración debe cumplir con `specs/00-frontend-navigation-routing.md`.

### 10.1. Sidebar

Incorporar la opción de Personas en:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

Ubicarla en un grupo funcional coherente con la organización existente.

La navegación de Personas, Pacientes y Personal debe mantener opciones diferenciadas y comprensibles para el usuario.

No incorporar las páginas de detalle, creación o edición como opciones independientes del sidebar.

Respetar la estructura actual de `NavItem`, `subItems`, iconos y traducciones.

### 10.2. Rutas

Registrar las rutas en:

`frontend/src/App.tsx`

Como referencia:

- `/persons`: listado.
- `/persons/create`: registro.
- `/persons/:personId`: detalle.
- `/persons/:personId/edit`: edición.

Las rutas deben ser descriptivas y seguir las convenciones de la SPEC 00.

No registrar en este módulo rutas de pacientes o personal.

## 11. Componentes y recursos compartidos

Antes de implementar, inspeccionar el catálogo de componentes existentes.

Reutilizar los componentes generales disponibles para:

- Formularios.
- Entradas de texto.
- Selectores.
- Tablas.
- Paginación.
- Búsqueda.
- Filtros.
- Diálogos de confirmación.
- Notificaciones.
- Estados de carga.
- Estados vacíos.

Los componentes propios de personas deben permanecer dentro de `frontend/src/modules/persons/`, salvo que se determine que son recursos generales de toda la aplicación.

No mover ni reorganizar componentes existentes para implementar este módulo.

## 12. Pruebas del frontend

Implementar pruebas de acuerdo con las herramientas y convenciones existentes.

Como mínimo, verificar:

- Visualización del listado de personas.
- Búsqueda por nombre y apellidos.
- Búsqueda exacta por documento.
- Filtrado por estado.
- Ordenamiento y paginación.
- Registro con los campos obligatorios.
- Registro sin documento ni datos de contacto.
- Rechazo de nombres y apellidos vacíos.
- Normalización de espacios externos.
- Validación del documento completo o ausente.
- Manejo de documento duplicado.
- Validación de fecha de nacimiento.
- Validación de correo y teléfono.
- Consulta de persona existente.
- Manejo de identificador inexistente.
- Actualización parcial.
- Eliminación de valores opcionales mediante `null`.
- Activación y desactivación.
- Conservación de personas inactivas.
- Reutilización del formulario personal.
- Búsqueda y selección de personas existentes.
- Registro de una persona nueva desde el flujo de pacientes.
- Registro de una persona nueva desde el flujo de personal.
- Manejo de fallos cuando se crea la persona, pero falla la operación dependiente.
- Reintento de la operación dependiente sin duplicar la persona.

Las pruebas de integración deben utilizar mecanismos de aislamiento o simulación compatibles con la configuración existente.

## 13. Restricciones y fuera de alcance

Este módulo no debe implementar:

- Registro específico de pacientes.
- Registro específico de personal.
- Asignación de roles o permisos.
- Asignación de especialidades.
- Asociación de condiciones especiales.
- Gestión de clínicas.
- Gestión de citas, horarios o atención clínica.
- Creación de cuentas de usuario o credenciales.
- Autenticación y autorización efectiva, salvo integración con infraestructura común existente.
- Administración de relaciones entre personas y sus entidades derivadas.
- Exposición o modificación de `password_hash`.

No crear automáticamente pacientes ni personal al registrar una persona.

No duplicar datos personales en las entidades derivadas.

## 14. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

Actualizar el catálogo de módulos y la documentación general cuando corresponda, siguiendo las convenciones de `$frontend-documentacion`.

Guardar esta especificación en:

`specs/06-person-registration.md`

No crear `frontend/docs/` ni `frontend/specs/`.

## 15. Criterios de aceptación

La implementación se considera aceptada cuando:

1. Existe el módulo `frontend/src/modules/persons/`, integrado con la arquitectura actual.
2. Se pueden registrar, consultar, listar, actualizar, activar y desactivar personas.
3. Se implementan correctamente la búsqueda, los filtros, el ordenamiento y la paginación.
4. Se respetan los contratos y validaciones de la API.
5. Se proporciona un formulario personal reutilizable para los módulos de pacientes y personal.
6. Se proporciona un mecanismo reutilizable para buscar y seleccionar personas existentes.
7. Los módulos de pacientes y personal pueden registrar personas nuevas desde sus propios flujos de creación, sin obligar al usuario a navegar al módulo Personas.
8. El registro combinado realiza primero la creación de la persona y después la creación de la entidad dependiente, conservando el `person_id`.
9. Los fallos parciales se comunican correctamente y no provocan la duplicación de personas al reintentar.
10. Los datos personales se actualizan mediante los endpoints de personas y no mediante los endpoints de pacientes o personal.
11. Se mantiene la independencia funcional y de navegación de los tres módulos.
12. No se duplican componentes, validaciones ni servicios personales.
13. Se respeta la privacidad de los datos personales y no se expone `password_hash`.
14. Existen pruebas para los flujos principales, las validaciones y los escenarios de integración.
15. La documentación técnica se mantiene en `docs/`, en la raíz del repositorio.