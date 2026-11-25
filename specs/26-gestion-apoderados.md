# SPEC 26: Registro y gestión de apoderados

## 1. Objetivo

Implementar la funcionalidad de **Apoderados** en el frontend del sistema de gestión de citas, permitiendo registrar, consultar y asociar personas como apoderados de uno o varios pacientes.

El módulo debe integrarse con los módulos existentes:

- `persons`: administra los datos personales.
- `patients`: administra la información específica del paciente.
- `guardians`: administra la funcionalidad de apoderados y su asociación con pacientes.

La implementación debe respetar la arquitectura, convenciones, componentes, servicios, hooks y patrones establecidos por el proyecto y su skill de desarrollo frontend, obligatorio leer las skill.

## 2. Consideraciones funcionales

### 2.1. Relación entre persona, apoderado y paciente

Un apoderado no constituye una persona diferente dentro del sistema. Sus datos personales corresponden a un registro existente en `persons`.

La relación funcional es:

- Una persona puede desempeñar el rol de apoderado.
- Un paciente puede tener uno o varios apoderados, según las reglas permitidas por el backend.
- Una persona que ya existe puede asociarse como apoderado sin registrar nuevamente sus datos.
- Una persona puede estar asociada a más de un paciente, siempre que el backend lo permita.

La asociación entre apoderado y paciente se realiza mediante la tabla intermedia definida en el backend.

**Importante:** el frontend no debe duplicar información personal ni implementar una relación independiente que contradiga el modelo de datos del backend.

### 2.2. Reutilización del módulo Persons

El módulo `persons` es el responsable de los datos personales.

Por lo tanto:

- No crear un nuevo formulario que replique `PersonForm`.
- No duplicar las validaciones de personas.
- No implementar una segunda lógica para buscar personas.
- Reutilizar `PersonSelector` si permite cubrir el flujo requerido.
- Si se necesita una adaptación visual o funcional, extender el componente existente sin afectar los demás módulos que lo utilizan.

### 2.3. Reutilización del módulo Patients

El módulo `patients` debe incorporar la posibilidad de gestionar apoderados durante el registro de un paciente.

El formulario de pacientes debe permitir:

1. Registrar los datos del paciente.
2. Buscar una persona existente para asociarla como apoderado.
3. Registrar una nueva persona si todavía no existe.
4. Asociar la persona seleccionada o creada con el paciente.
5. Visualizar los apoderados asociados antes de finalizar el registro, cuando el flujo del backend lo permita.

## 3. Alcance del módulo

### Incluido

- Consulta de apoderados.
- Búsqueda de personas para seleccionar como apoderados.
- Asociación de personas existentes con pacientes.
- Registro de una nueva persona para utilizarla como apoderado.
- Visualización de los apoderados asociados a un paciente.
- Desasociación de un apoderado, si el backend dispone de esa operación.
- Integración con el formulario de creación de pacientes.

### No incluido

- Crear una entidad de persona independiente para apoderados.
- Duplicar formularios, servicios o validaciones del módulo `persons`.
- Modificar los datos personales desde una pantalla exclusiva de apoderados.
- Implementar reglas de negocio que no estén definidas por el backend.
- Crear endpoints o modificar el modelo de base de datos desde el frontend.
- Incorporar funcionalidades adicionales de representación legal que no estén contempladas en el backend.

## 4. Vistas propuestas

Se propone una implementación pequeña, centrada en la asociación de apoderados con pacientes.

### 4.1. Vista de listado de apoderados

**Objetivo:** permitir consultar las personas que tienen el rol de apoderado mediante sus asociaciones registradas.

La vista debe utilizar el diseño y los componentes de listado que ya existen en el proyecto.

Información sugerida:

- Nombre completo.
- Tipo y número de documento.
- Información de contacto disponible.
- Cantidad de pacientes asociados, si el backend proporciona ese dato.
- Acciones disponibles.

Acciones:

- Consultar información del apoderado.
- Consultar los pacientes asociados.
- Acceder al paciente relacionado, si existe una ruta disponible.

La información debe proceder del backend. No se deben calcular ni mostrar datos que no estén disponibles o no puedan obtenerse mediante los servicios existentes.

**No se requiere crear un formulario independiente de edición de apoderados.** Los datos personales continúan administrándose desde `persons`.

### 4.2. Vista de detalle de apoderado

No se considera necesario implementar inicialmente una página independiente de detalle.

La información del apoderado puede visualizarse mediante un modal, panel o componente reutilizable, siguiendo los patrones existentes.

Debe permitir consultar:

- Datos personales.
- Datos de contacto.
- Pacientes asociados, si el backend proporciona esa información.

Esta vista es secundaria y no debe retrasar la integración con pacientes.

### 4.3. Componente de selección y asociación de apoderados

Este componente constituye la parte principal de la funcionalidad.

Debe integrarse dentro del formulario de pacientes.

Funciones:

- Buscar personas existentes.
- Seleccionar una persona.
- Mostrar los datos de la persona seleccionada.
- Permitir registrar una nueva persona utilizando el formulario existente.
- Incorporar la persona seleccionada a la lista de apoderados del paciente.
- Permitir retirar una selección antes de guardar el paciente.
- Evitar selecciones duplicadas.

El componente debe diferenciar claramente entre buscar una persona existente y registrar una persona nueva.

No debe crear registros de personas automáticamente al seleccionar un resultado de búsqueda.

## 5. Integración con el registro de pacientes

La integración con el módulo `patients` es la prioridad principal.

### 5.1. Flujo de creación

El formulario de creación de pacientes debe incorporar una sección denominada:

**Apoderados**

Dentro de esta sección se debe mostrar una opción para agregar uno o varios apoderados.

Flujo:

1. El usuario ingresa los datos personales del paciente.
2. Completa la información específica del paciente.
3. Accede a la sección de apoderados.
4. Busca una persona mediante el mecanismo existente de búsqueda de personas.
5. Si encuentra a la persona, la selecciona.
6. Si no encuentra a la persona, puede registrarla utilizando `PersonForm`.
7. La persona seleccionada se agrega a la lista de apoderados del formulario.
8. El usuario puede agregar más apoderados si el backend lo permite.
9. El usuario revisa la información.
10. Se ejecuta el proceso de creación y asociación utilizando los servicios correspondientes.

### 5.2. Persona existente

Cuando la persona ya existe:

- Se utiliza su identificador `person_id`.
- No se realiza una nueva creación en `persons`.
- Se utiliza el identificador para establecer la relación con el paciente.
- Se evita duplicar personas por una selección repetida.

### 5.3. Persona nueva

Cuando la persona no existe:

- Se utiliza el formulario existente de personas.
- Se registra la persona mediante el servicio de `persons`.
- Se obtiene el identificador generado.
- Se utiliza ese identificador para establecer la relación con el paciente.

No se debe implementar una segunda versión del formulario de registro de personas.

### 5.4. Persistencia de la asociación

La asociación debe realizarse mediante la operación definida por el backend.

El frontend debe respetar el orden de operaciones requerido por los endpoints existentes.

Si el backend requiere crear primero el paciente y posteriormente registrar las asociaciones, el frontend debe:

1. Registrar o recuperar las personas seleccionadas.
2. Crear el paciente.
3. Obtener el identificador del paciente.
4. Ejecutar las operaciones de asociación de apoderados.
5. Mostrar el resultado del proceso.

Si el backend dispone de una operación que permite crear el paciente y sus asociaciones en una sola solicitud, se debe utilizar ese contrato en lugar de implementar operaciones redundantes.

**Manejo de errores:**

Si el paciente se crea correctamente, pero falla la asociación de un apoderado, no se debe volver a crear el paciente ni duplicar las personas.

Se debe informar al usuario del estado de la operación y permitir reintentar la asociación pendiente utilizando los identificadores existentes.

## 6. Gestión de apoderados de un paciente

Cuando se consulta o edita un paciente, debe existir una sección para visualizar los apoderados asociados.

Información sugerida:

- Nombre completo.
- Documento de identidad.
- Teléfono o correo disponible.
- Acciones permitidas.

Acciones:

- Consultar información.
- Asociar una persona existente, si el backend permite modificar asociaciones.
- Desasociar un apoderado, si existe el endpoint correspondiente.

La modificación de los datos personales del apoderado debe realizarse mediante el módulo `persons`.

La desasociación debe eliminar únicamente la relación entre el paciente y el apoderado, nunca el registro de la persona.

## 7. Organización funcional

La implementación debe seguir la estructura de módulos establecida por la skill del proyecto.

Como referencia funcional, las responsabilidades deben distribuirse así:

### Persons

Responsable de:

- Datos personales.
- Registro de personas.
- Consulta y búsqueda de personas.
- Validaciones de datos personales.
- Componentes reutilizables de personas.

### Patients

Responsable de:

- Registro de pacientes.
- Edición de información del paciente.
- Integración del selector de apoderados.
- Visualización de las asociaciones del paciente.

### Guardians

Responsable de:

- Consulta de personas que desempeñan el rol de apoderados.
- Visualización de sus asociaciones.
- Funcionalidades propias de gestión de apoderados que estén soportadas por el backend.

No se debe duplicar la responsabilidad de `persons` dentro de `guardians`.

La ubicación física de archivos, servicios, componentes, páginas, hooks y rutas debe definirse exclusivamente según la skill y las convenciones existentes del frontend.

## 8. Integración con el backend

El frontend debe consumir los endpoints disponibles en el backend.

Se deben revisar los contratos reales antes de implementar los servicios.

### Operaciones requeridas

| Operación | Descripción |
|---|---|
| Buscar personas | Obtener personas existentes para seleccionar un apoderado. |
| Crear persona | Registrar una persona nueva cuando no existe. |
| Crear paciente | Registrar la información del paciente. |
| Asociar apoderado | Crear la relación entre la persona y el paciente. |
| Consultar apoderados | Obtener las asociaciones de apoderados. |
| Desasociar apoderado | Eliminar la relación, si está implementada. |

### Identificadores

El frontend debe manejar los identificadores reales proporcionados por el backend.

La asociación debe utilizar los identificadores de persona y paciente que correspondan al modelo de datos existente.

No se deben inventar nombres de campos, rutas o estructuras de respuesta.

### Contratos pendientes de verificar

Antes de implementar, confirmar:

- Nombre de la tabla intermedia.
- Campos de identificación de persona y paciente.
- Endpoint de creación de asociaciones.
- Endpoint de consulta de apoderados por paciente.
- Endpoint de consulta de pacientes por apoderado.
- Endpoint de eliminación de asociaciones.
- Restricciones de cardinalidad.
- Posibles campos adicionales de la relación, si existen.

## 9. Estados de interfaz

Los componentes deben contemplar los estados habituales del proyecto.

### Estado de carga

Mostrar el indicador de carga existente mientras se consultan personas o asociaciones.

### Estado vacío

Cuando no existan apoderados asociados, mostrar un mensaje informativo y una opción para agregar uno.

### Estado de búsqueda sin resultados

Mostrar un mensaje indicando que no se encontraron personas y ofrecer la posibilidad de registrar una nueva persona.

### Estado de error

Mostrar los mensajes de error utilizando el mecanismo centralizado del proyecto.

### Estado de éxito

Informar cuando la asociación se haya realizado correctamente.

### Estado de duplicidad

Evitar que una misma persona se agregue dos veces a la lista de apoderados del mismo paciente.

## 10. Validaciones

Las validaciones deben respetar las reglas existentes de `persons`, `patients` y del backend.

Validaciones mínimas:

- No permitir seleccionar una persona sin identificador válido.
- No permitir agregar dos veces la misma persona.
- No permitir guardar asociaciones incompletas.
- Validar que el paciente exista antes de registrar asociaciones que dependan de su identificador.
- Respetar las restricciones de asociación definidas por el backend.
- No eliminar una persona cuando se desasocia de un paciente.

No duplicar validaciones que ya estén implementadas en los módulos existentes.

## 11. Rutas y navegación

La navegación debe integrarse utilizando el mecanismo actual del proyecto.

Se propone incorporar una opción de acceso a **Apoderados** dentro de la navegación relacionada con pacientes, si la organización actual del menú lo permite.

La ruta del listado debe seguir el patrón de rutas existente.

La sección de apoderados dentro del formulario de pacientes no debe requerir navegar a otra página para completar la asociación.

No implementar un sistema de rutas nuevo ni modificar innecesariamente la navegación existente.

## 12. Componentes reutilizables

Priorizar los componentes existentes:

- `PersonForm`.
- `PersonSelector`.
- Componentes de búsqueda.
- Componentes de listado.
- Componentes de selección.
- Modales.
- Alertas y notificaciones.
- Componentes de formularios.
- Componentes de carga y estados vacíos.

Si se requiere un componente nuevo, debe responder a una responsabilidad específica de la relación entre apoderados y pacientes.

Evitar crear componentes que simplemente envuelvan otros componentes sin aportar funcionalidad.

## 13. Pruebas

Verificar los siguientes escenarios:

### Búsqueda y selección

- Buscar una persona existente.
- Seleccionar una persona.
- Evitar seleccionar dos veces la misma persona.
- Mostrar correctamente los datos de la persona seleccionada.

### Registro de persona nueva

- Registrar una persona desde el flujo de apoderados.
- Recuperar su identificador.
- Asociarla al paciente.
- Verificar que no se cree una persona duplicada.

### Creación del paciente

- Crear un paciente sin apoderados, si está permitido.
- Crear un paciente con un apoderado existente.
- Crear un paciente con una persona nueva como apoderado.
- Crear un paciente con varios apoderados, si está permitido.

### Consulta y mantenimiento

- Consultar los apoderados de un paciente.
- Consultar los pacientes asociados a un apoderado, si está disponible.
- Desasociar un apoderado, si está permitido.
- Verificar que la persona continúe existiendo después de desasociarla.

### Manejo de errores

- Error al buscar personas.
- Error al crear una persona.
- Error al crear un paciente.
- Error al asociar un apoderado.
- Reintento de asociación sin duplicar registros.

## 14. Documentación

La documentación debe ubicarse siguiendo la organización existente del proyecto.

Actualizar la documentación funcional o técnica únicamente cuando sea necesario.

No duplicar documentación que ya esté descrita en las especificaciones de `persons` y `patients`.

## 15. Restricciones de implementación

- No modificar innecesariamente el módulo `persons`.
- No duplicar `PersonForm` ni `PersonSelector`.
- No crear una entidad personal independiente para apoderados.
- No duplicar información de personas.
- No inventar endpoints ni campos del backend.
- No implementar reglas de negocio que no estén soportadas por el backend.
- No crear páginas de edición de datos personales dentro de apoderados.
- No alterar los flujos existentes de creación y edición de pacientes.
- Respetar las instrucciones de la skill del frontend.
- Reutilizar los componentes y patrones existentes.

## 16. Criterios de aceptación

La implementación se considera completa cuando:

1. Existe una funcionalidad para consultar apoderados.
2. Es posible buscar personas existentes para utilizarlas como apoderados.
3. Es posible registrar una persona nueva reutilizando `PersonForm`.
4. La creación de pacientes permite agregar apoderados.
5. Las personas existentes no se duplican.
6. Las asociaciones se registran mediante los endpoints reales del backend.
7. Se pueden visualizar los apoderados asociados a un paciente.
8. La desasociación, si está soportada por el backend, no elimina la persona.
9. Se manejan correctamente los estados de carga, vacío, error y éxito.
10. No se rompe la funcionalidad existente de `persons` ni de `patients`.
11. La implementación respeta la arquitectura y las convenciones definidas por la skill del frontend.

## 17. Prioridad de implementación

| Prioridad | Funcionalidad |
|---|---|
| P1 | Integración de apoderados en la creación de pacientes. |
| P1 | Búsqueda y selección de personas existentes. |
| P1 | Registro de una persona nueva mediante `PersonForm`. |
| P1 | Asociación de personas con pacientes. |
| P1 | Visualización de apoderados asociados a un paciente. |
| P2 | Listado general de apoderados. |
| P2 | Consulta de pacientes asociados a un apoderado. |
| P3 | Desasociación desde la gestión de apoderados, si el backend lo permite. |
| P3 | Mejoras adicionales de consulta y navegación. |

**Resultado esperado:** un módulo de apoderados integrado con pacientes que permita reutilizar personas existentes, registrar nuevas personas cuando sea necesario y administrar sus asociaciones sin duplicar información ni lógica del sistema.