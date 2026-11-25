# SPEC 07 — Módulo de pacientes (Frontend)

## 1. Prioridad

**Prioridad:** 7

**Dependencia:** SPEC 06 — Registro de personas.

Esta especificación define los requisitos funcionales y técnicos para implementar el módulo de pacientes en el frontend, respetando los contratos y las responsabilidades establecidos por el backend.

## 2. Objetivo

Implementar un módulo independiente para gestionar pacientes del sistema.

El módulo permitirá:

- Consultar el listado de pacientes.
- Buscar y filtrar pacientes.
- Registrar un paciente asociándolo a una persona existente.
- Registrar una persona nueva durante el mismo flujo de creación del paciente.
- Consultar los datos de un paciente.
- Modificar los datos propios del paciente.
- Activar o desactivar un paciente.

Los datos personales pertenecen al módulo `persons`. El módulo `patients` no debe duplicarlos ni asumir su administración.

## 3. Alcance funcional

El módulo debe permitir gestionar exclusivamente la entidad paciente y sus campos propios.

La entidad paciente contiene:

- `id`
- `person_id`
- `patient_number`
- `notes`
- `is_active`
- `created_at`
- `updated_at`

Las respuestas de la API incluyen un objeto `person` con información resumida de la persona asociada.

Los datos personales deben mostrarse utilizando la información devuelta por ese objeto, sin almacenarlos como datos propios del paciente.

### 3.1. Funcionalidades incluidas

- Listado y consulta de pacientes.
- Búsqueda por nombre.
- Búsqueda por número de documento.
- Búsqueda por número de paciente.
- Filtro por estado.
- Ordenamiento y paginación.
- Registro de pacientes.
- Selección de una persona existente.
- Registro de una persona nueva desde el flujo de pacientes.
- Edición de los campos propios del paciente.
- Activación y desactivación.

### 3.2. Funcionalidades excluidas

No implementar en esta especificación:

- Historia clínica.
- Diagnósticos o tratamientos.
- Gestión de citas.
- Asignación de condiciones especiales.
- Gestión de recordatorios.
- Gestión de permisos o roles.
- Gestión de personal.
- Edición de datos personales mediante la API de pacientes.

La asociación de condiciones especiales se desarrollará según la SPEC correspondiente.

## 4. Organización del módulo

Crear el módulo dentro de:

`frontend/src/modules/patients/`

La organización debe respetar la arquitectura existente y evitar crear abstracciones innecesarias.

Como referencia, el módulo podrá contener:

- `pages/`: páginas del módulo.
- `components/`: componentes exclusivos de pacientes.
- `services/`: operaciones de integración con la API de pacientes.
- `types/`: tipos y contratos TypeScript propios del módulo.
- `hooks/`: hooks específicos, si son necesarios.

La estructura definitiva debe ajustarse a los patrones existentes en el repositorio.

No mover ni reorganizar componentes existentes de la plantilla.

### 4.1. Dependencia del módulo persons

El módulo `patients` depende funcionalmente de `persons`.

Debe reutilizar los componentes y servicios correspondientes para gestionar la selección y el registro de datos personales.

Se deben reutilizar:

- `PersonSelector`: búsqueda y selección de personas existentes.
- `PersonForm`: registro de una persona nueva y captura de sus datos personales.

Estos componentes deben pertenecer al ámbito de responsabilidad del módulo `persons` o a una ubicación compartida coherente con la arquitectura existente.

No duplicar sus implementaciones dentro de `patients`.

La dependencia debe mantener esta dirección:

`patients → persons`

El módulo `persons` no debe depender de `patients`.

## 5. Integración con la API

### 5.1. Prefijo

`/api/v1/patients`

El frontend debe utilizar el cliente HTTP y los mecanismos de integración existentes en el proyecto.

No crear un cliente HTTP independiente para este módulo.

### 5.2. Endpoints disponibles

| Método | Endpoint | Propósito |
|---|---|---|
| POST | `/patients` | Registrar un paciente. |
| GET | `/patients` | Listar pacientes. |
| GET | `/patients/{patient_id}` | Consultar un paciente. |
| PATCH | `/patients/{patient_id}` | Actualizar datos propios del paciente. |
| PATCH | `/patients/{patient_id}/status` | Cambiar el estado del paciente. |

No asumir endpoints adicionales.

### 5.3. Registro

El endpoint de creación recibe los campos propios del paciente y la referencia a una persona:

- `person_id`
- `patient_number`, opcional.
- `notes`, opcional.

El frontend debe enviar únicamente los campos admitidos por el contrato del backend.

No enviar nombres, apellidos, documento, fecha de nacimiento, teléfono, correo electrónico ni dirección como campos del paciente.

La persona debe existir y estar activa para poder registrarse como paciente.

### 5.4. Listado y filtros

El listado debe soportar los parámetros disponibles:

| Parámetro | Descripción |
|---|---|
| `page` | Número de página. |
| `page_size` | Cantidad de registros por página. |
| `name` | Búsqueda por nombre. |
| `document_number` | Número de documento exacto. |
| `patient_number` | Número de paciente exacto. |
| `is_active` | Filtro por estado. |
| `sort_by` | Campo de ordenamiento. |
| `order` | Dirección del ordenamiento. |

Campos permitidos para `sort_by`:

- `id`
- `created_at`
- `patient_number`
- `last_name`

El frontend debe respetar los valores admitidos por el backend.

No implementar filtros locales que sustituyan los filtros del servidor cuando la API proporciona los parámetros correspondientes.

La búsqueda por nombre debe aprovechar el comportamiento del backend, que reutiliza el filtro de nombres de personas.

### 5.5. Paginación

Implementar paginación utilizando los parámetros `page` y `page_size`.

Respetar los límites establecidos por el backend:

- Tamaño mínimo: 1.
- Tamaño máximo: 100.

El frontend debe interpretar la estructura de respuesta definida por la API y mostrar el total de registros y la información de paginación disponible.

### 5.6. Consulta individual

La consulta de un paciente debe mostrar:

**Información del paciente:**
- Identificador.
- Número de paciente.
- Notas.
- Estado.
- Fecha de creación.
- Fecha de actualización.

**Información de la persona asociada:**
- Nombres.
- Apellidos.
- Tipo de documento.
- Número de documento.
- Estado de la persona, cuando esté incluido en la respuesta.

La información personal debe proceder del objeto `person` incluido en la respuesta de la API.

No realizar consultas adicionales innecesarias para reconstruir los datos que ya entrega el backend.

## 6. Registro de pacientes

La página de creación debe permitir asociar una persona al nuevo paciente.

El usuario podrá elegir entre dos alternativas:

1. Seleccionar una persona existente.
2. Registrar una persona nueva sin abandonar el flujo de creación del paciente.

No debe ser obligatorio navegar al módulo Personas para completar el registro.

### 6.1. Seleccionar una persona existente

Utilizar el componente `PersonSelector`.

El selector debe permitir:

- Buscar personas.
- Mostrar información suficiente para distinguirlas.
- Identificar a cada persona mediante sus datos personales.
- Seleccionar una persona existente.
- Mostrar claramente la persona seleccionada.

Solo deben poder seleccionarse personas activas.

El selector debe reutilizar los servicios y contratos del módulo `persons`.

Si la persona seleccionada ya tiene un paciente asociado, el backend rechazará el registro. El frontend debe presentar el error de forma comprensible.

No implementar una validación local como sustituto de la validación del backend.

### 6.2. Registrar una persona nueva

El flujo debe permitir registrar una persona nueva utilizando `PersonForm`.

El formulario debe reutilizar las validaciones y reglas definidas en la SPEC 06.

Una vez registrada correctamente la persona:

1. Obtener el `person_id` devuelto por la API.
2. Conservar esa referencia en el estado del formulario de pacientes.
3. Continuar con el registro del paciente.
4. Enviar el `person_id` junto con los campos propios del paciente.
5. Mostrar el resultado de la operación.

El registro debe realizar dos operaciones secuenciales:

- POST `/persons`
- POST `/patients`

No asumir que existe un endpoint único que registre ambas entidades.

### 6.3. Manejo de fallos parciales

La creación de la persona y la creación del paciente son operaciones independientes.

Si la persona se registra correctamente, pero falla la creación del paciente:

- Informar que la persona fue registrada correctamente, pero el paciente no pudo crearse.
- Conservar el `person_id` obtenido.
- Permitir reintentar la creación del paciente sin volver a registrar la persona.
- Mantener los datos propios del paciente introducidos por el usuario.
- Evitar duplicar la persona.
- No eliminar automáticamente la persona creada.

El usuario debe poder completar el registro del paciente posteriormente.

No asumir transacciones distribuidas ni rollback automático.

## 7. Edición de pacientes

La edición debe permitir modificar exclusivamente:

- `patient_number`
- `notes`

No permitir modificar `person_id` mediante el formulario de edición.

Tampoco permitir modificar datos personales desde esta pantalla.

Para actualizar nombres, apellidos, documentos, fecha de nacimiento, teléfono, correo o dirección se debe utilizar el módulo `persons` y su endpoint correspondiente.

### 7.1. Número de paciente

El número de paciente es opcional y lo proporciona el usuario.

El frontend debe respetar las reglas de normalización del backend:

- Eliminar espacios externos.
- Convertir letras a mayúsculas.
- Admitir letras y números.
- Admitir los caracteres `.`, `_`, `/` y `-`.

No generar automáticamente números de paciente.

Si el número ya está registrado, mostrar el error devuelto por la API.

### 7.2. Notas

El campo `notes` es opcional.

- Permitir guardar notas administrativas.
- Respetar el límite de 1000 caracteres.
- Permitir eliminar las notas enviando `null`, según el contrato de la API.

Las notas no deben presentarse como historia clínica ni como espacio para diagnósticos o tratamientos.

## 8. Activación y desactivación

Implementar el cambio de estado mediante:

`PATCH /patients/{patient_id}/status`

El frontend debe enviar el valor booleano requerido por el backend.

La interfaz debe:

- Mostrar el estado actual.
- Permitir activar un paciente inactivo.
- Permitir desactivar un paciente activo.
- Solicitar confirmación antes de ejecutar la acción.
- Actualizar el estado mostrado después de una respuesta exitosa.

La desactivación no elimina el registro.

La desactivación de un paciente no debe desactivar a la persona asociada.

Tampoco debe asumirse que desactivar una persona modifica automáticamente el estado de sus pacientes.

## 9. Pantallas del módulo

### 9.1. Listado de pacientes

Ruta: `/patients`

Debe incluir:

- Tabla o listado de pacientes.
- Nombre completo.
- Tipo y número de documento.
- Número de paciente.
- Estado.
- Fecha de registro, si resulta útil y está disponible.
- Acción para consultar.
- Acción para editar.
- Acción para activar o desactivar.
- Búsqueda.
- Filtros.
- Ordenamiento.
- Paginación.
- Acción para registrar un paciente.

La información personal debe obtenerse del objeto `person` de la respuesta.

### 9.2. Registro de paciente

Ruta: `/patients/create`

Debe incluir:

- Selección de persona existente.
- Alternativa para registrar una persona nueva.
- Reutilización de `PersonSelector`.
- Reutilización de `PersonForm`.
- Campo de número de paciente.
- Campo de notas.
- Acción para guardar.
- Acción para cancelar.

La interfaz debe hacer evidente qué información corresponde a la persona y cuál corresponde al paciente.

### 9.3. Detalle de paciente

Ruta: `/patients/:patientId`

Debe mostrar:

- Información propia del paciente.
- Información personal de la persona asociada.
- Estado del paciente.
- Fechas de auditoría disponibles.
- Acciones permitidas.

Los datos personales deben presentarse como información de la persona asociada, no como campos editables del paciente.

### 9.4. Edición de paciente

Ruta: `/patients/:patientId/edit`

Debe permitir modificar:

- Número de paciente.
- Notas.

No incluir campos personales editables ni permitir cambiar la persona asociada.

## 10. Estados de interfaz

Implementar estados adecuados para las operaciones del módulo:

- Carga inicial.
- Carga del listado.
- Búsqueda en curso.
- Sin resultados.
- Error de carga.
- Error de consulta individual.
- Guardado en curso.
- Registro exitoso.
- Error de registro.
- Error de actualización.
- Cambio de estado en curso.
- Error al cambiar el estado.
- Persona seleccionada.
- Búsqueda de personas en curso.
- Registro de persona en curso.
- Registro de persona exitoso con paciente pendiente.
- Reintento de creación de paciente.

Evitar enviar solicitudes duplicadas durante operaciones en curso.

Los errores deben mostrarse de manera comprensible y sin exponer detalles internos del backend.

## 11. Manejo de errores de negocio

El frontend debe interpretar y presentar adecuadamente los errores de la API.

| Error | Comportamiento esperado |
|---|---|
| `PatientNotFoundError` (404) | Informar que el paciente no existe o no está disponible. |
| `PatientPersonNotFoundError` (422) | Informar que la persona seleccionada no existe. |
| `PatientPersonInactiveError` (409) | Informar que no se puede registrar un paciente con una persona inactiva. |
| `PatientAlreadyExistsError` (409) | Informar que la persona ya tiene un paciente registrado. |
| `PatientNumberAlreadyExistsError` (409) | Informar que el número de paciente ya está registrado. |
| Error de validación (422) | Mostrar los errores de validación correspondientes a los campos. |
| Error de red o servidor | Informar que la operación no pudo completarse y permitir reintentar cuando corresponda. |

Los mensajes deben integrarse con el mecanismo de manejo de errores existente en el frontend.

No implementar mensajes basados en supuestos sobre códigos o estructuras que no estén definidos por la API.

## 12. Navegación y rutas

La navegación del módulo debe integrarse siguiendo la SPEC 00 — Navegación y enrutamiento del frontend.

### 12.1. Sidebar

Incorporar una opción independiente para Pacientes en:

`frontend/src/components/layout/app-layout/sidebar/data.tsx`

La opción debe utilizar los tipos, estructuras e iconos existentes.

Pacientes debe tener una entrada propia en el sidebar y no debe quedar subordinado visualmente al módulo Personas.

Puede ubicarse dentro del grupo funcional correspondiente a Gestión de pacientes, de acuerdo con la organización general de navegación.

La entrada debe dirigir al listado de pacientes.

No agregar al sidebar las pantallas secundarias de creación, detalle o edición.

### 12.2. Rutas

Registrar las siguientes rutas en:

`frontend/src/App.tsx`

| Ruta | Pantalla |
|---|---|
| `/patients` | Listado de pacientes. |
| `/patients/create` | Registro de paciente. |
| `/patients/:patientId` | Detalle de paciente. |
| `/patients/:patientId/edit` | Edición de paciente. |

Los nombres de rutas deben ser descriptivos y coherentes con la funcionalidad.

Respetar el router y los layouts existentes.

No crear un sistema de enrutamiento paralelo.

Las rutas secundarias deben ser accesibles aunque no aparezcan como opciones independientes en el sidebar.

## 13. Reutilización de recursos existentes

Antes de implementar, inspeccionar los componentes, servicios y utilidades existentes.

Reutilizar cuando corresponda:

- Componentes de formularios.
- Tablas y componentes de listado.
- Componentes de búsqueda y filtros.
- Componentes de paginación.
- Diálogos de confirmación.
- Alertas y notificaciones.
- Componentes de carga y estados vacíos.
- Cliente HTTP.
- Manejo centralizado de errores.
- Componentes `PersonForm` y `PersonSelector`.

No duplicar componentes compartidos ni introducir dependencias innecesarias.

## 14. Pruebas

Implementar pruebas que cubran, como mínimo:

### 14.1. Listado

- Carga correcta de pacientes.
- Búsqueda por nombre.
- Búsqueda por documento.
- Búsqueda por número de paciente.
- Filtro por estado.
- Ordenamiento.
- Paginación.
- Estado sin resultados.
- Manejo de errores.

### 14.2. Registro

- Registro con una persona existente.
- Registro con una persona nueva.
- Selección exclusiva de personas activas.
- Envío correcto de `person_id`.
- Envío de los campos propios del paciente.
- Manejo de persona inexistente.
- Manejo de persona inactiva.
- Manejo de persona que ya tiene paciente.
- Manejo de número de paciente duplicado.

### 14.3. Registro combinado

- Registro exitoso de persona y paciente.
- Error al registrar la persona.
- Error al registrar el paciente después de crear la persona.
- Conservación del `person_id` después de un fallo parcial.
- Reintento de creación del paciente sin duplicar la persona.
- Conservación de los datos propios del paciente durante el reintento.

### 14.4. Edición

- Actualización del número de paciente.
- Actualización de notas.
- Eliminación de notas.
- Manejo de errores de validación.
- Verificación de que no se envíen campos personales ni `person_id`.

### 14.5. Estado

- Desactivación de paciente.
- Activación de paciente.
- Confirmación de la operación.
- Actualización de la interfaz después de la respuesta.
- Manejo de errores.

### 14.6. Navegación

- Acceso desde el sidebar.
- Acceso a las rutas de listado, creación, detalle y edición.
- Estado activo correcto de la navegación.
- Conservación del layout existente.

## 15. Fuera de alcance y restricciones

Esta especificación no autoriza implementar:

- Relaciones entre pacientes y condiciones especiales.
- Historia clínica.
- Diagnósticos.
- Tratamientos.
- Prescripciones.
- Citas.
- Recordatorios.
- Gestión de personal.
- Gestión de roles y permisos.
- Edición de datos personales mediante endpoints de pacientes.
- Eliminación física de pacientes.
- Creación automática de personas durante operaciones distintas al flujo expresamente definido.
- Generación automática de números de paciente.

Las relaciones entre pacientes y condiciones especiales corresponden a su especificación particular y no deben adelantarse en este módulo.

## 16. Documentación

Toda documentación técnica relacionada con la implementación debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Actualizar la documentación del módulo cuando se incorporen decisiones arquitectónicas, componentes reutilizables o integraciones relevantes.

## 17. Criterios de aceptación

La implementación se considerará conforme cuando:

1. Exista un módulo independiente de pacientes dentro de `frontend/src/modules/patients/`.
2. El módulo permita listar, buscar, filtrar, ordenar y paginar pacientes.
3. Se pueda registrar un paciente seleccionando una persona existente.
4. Se pueda registrar una persona nueva desde el mismo flujo de creación del paciente.
5. Se reutilicen `PersonForm` y `PersonSelector` sin duplicar su implementación.
6. El registro combinado ejecute primero la creación de la persona y después la del paciente.
7. Los fallos parciales se gestionen sin duplicar ni eliminar automáticamente la persona.
8. Los datos personales se obtengan del objeto `person` proporcionado por la API.
9. La edición permita modificar únicamente `patient_number` y `notes`.
10. Se pueda consultar y cambiar el estado del paciente.
11. La integración respete los endpoints, parámetros y contratos del backend.
12. La desactivación del paciente no modifique el estado de la persona asociada.
13. El módulo esté integrado en el sidebar y en las rutas existentes conforme a la SPEC 00.
14. No se implementen funcionalidades correspondientes a otras especificaciones.
15. Se reutilicen los recursos existentes de la plantilla y se mantenga su arquitectura.
16. La documentación técnica se mantenga en `docs/`, en la raíz del repositorio.