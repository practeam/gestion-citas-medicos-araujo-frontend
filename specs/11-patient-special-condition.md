# SPEC 11 — Asociación de condiciones especiales a pacientes

## 1. Prioridad y dependencias

Esta especificación define la integración de condiciones especiales en los formularios del módulo de pacientes.

Depende de:

- SPEC 03 — Catálogo de condiciones especiales.
- SPEC 07 — Módulo de pacientes.

Skills aplicables:

- `$frontend-arquitectura`: organización e integración dentro del módulo de pacientes.
- `$frontend-integracion-api`: comunicación con los endpoints de pacientes y condiciones especiales.
- `$frontend-catalogo-componentes`: reutilización de componentes existentes.
- `$frontend-documentacion`: documentación técnica en `docs/`.

La implementación debe respetar la arquitectura existente del frontend y las responsabilidades de cada módulo.

## 2. Objetivo

Permitir asociar condiciones especiales a un paciente directamente desde sus formularios de creación y edición.

El usuario debe poder:

- Consultar las condiciones especiales disponibles en el catálogo.
- Seleccionar una o varias condiciones al registrar un paciente.
- Registrar notas específicas para cada condición asociada.
- Consultar las condiciones actualmente asociadas a un paciente.
- Agregar nuevas condiciones al editar un paciente.
- Modificar las notas de una condición asociada.
- Retirar condiciones de un paciente.
- Identificar las condiciones inactivas que permanezcan asociadas, si el backend contempla esa posibilidad.

**No se deben crear páginas independientes para administrar las relaciones entre pacientes y condiciones especiales.**

Toda la gestión debe estar integrada en el flujo habitual de creación, edición y consulta del paciente.

## 3. Alcance

Esta especificación comprende:

- Integración de condiciones especiales en el formulario de creación de pacientes.
- Integración de condiciones especiales en el formulario de edición de pacientes.
- Visualización de condiciones asociadas en el detalle del paciente.
- Selección múltiple de condiciones.
- Registro y edición de notas específicas de cada asociación.
- Asignación, actualización y eliminación de relaciones.
- Manejo de errores y operaciones parcialmente completadas.

No comprende:

- Historia clínica.
- Diagnósticos médicos.
- Tratamientos o prescripciones.
- Inferencia automática de riesgos o tratamientos.
- Gestión del catálogo de condiciones especiales desde el formulario del paciente.
- Listados globales de pacientes con sus condiciones clínicas.
- Modificación de los datos personales de la persona desde este módulo.

Las notas pertenecen a la relación entre paciente y condición especial. No representan una historia clínica ni sustituyen los registros médicos.

## 4. Organización del módulo

La funcionalidad debe integrarse en el módulo existente:

`frontend/src/modules/patients/`

El módulo de pacientes será responsable de coordinar las asociaciones entre pacientes y condiciones especiales.

El módulo de condiciones especiales conservará la responsabilidad de administrar el catálogo.

Se deben reutilizar los servicios y componentes existentes cuando corresponda.

Se pueden incorporar componentes internos del módulo de pacientes, por ejemplo:

- `PatientSpecialConditionsSection`: sección integrada para visualizar y administrar las condiciones.
- `SpecialConditionSelector`: selector de condiciones disponibles.
- `PatientSpecialConditionItem`: representación de una condición asociada y sus notas.

Estos nombres son orientativos. Antes de crear componentes nuevos se debe inspeccionar la estructura existente.

Los componentes deben mantener separadas las responsabilidades del catálogo y de las asociaciones.

## 5. Integración con la API

Prefijo:

`/api/v1`

### 5.1. Consultar condiciones disponibles

Reutilizar el endpoint del catálogo definido en la SPEC 03:

`GET /api/v1/special-conditions`

Utilizar los parámetros de paginación, búsqueda y filtros admitidos por el backend.

Para nuevas asociaciones se deben mostrar únicamente condiciones activas, siempre que el backend exponga el campo `is_active`.

El selector debe permitir:

- Buscar condiciones por nombre.
- Consultar su descripción cuando esté disponible.
- Seleccionar varias condiciones.
- Identificar las condiciones ya seleccionadas.
- Recorrer el catálogo respetando la paginación del backend.

No asumir que todo el catálogo estará disponible en una sola respuesta.

### 5.2. Consultar condiciones asociadas al paciente

Endpoint:

`GET /api/v1/patients/{patient_id}/special-conditions`

Debe utilizarse para recuperar las condiciones especiales actualmente asociadas al paciente.

La interfaz debe mostrar la información de cada condición y las notas de su relación, de acuerdo con la respuesta real del backend.

No inventar campos adicionales en la respuesta.

### 5.3. Asignar una condición o reemplazar sus notas

Endpoint recomendado:

`PUT /api/v1/patients/{patient_id}/special-conditions/{special_condition_id}`

Cuerpo:

```json
{
  "notes": "Informado por el paciente en la admisión."
}
```

La operación debe utilizarse para crear la asociación o reemplazar sus notas.

La asignación debe ser idempotente: repetir la misma operación no debe crear relaciones duplicadas.

El backend puede aceptar `{}` para una asignación sin notas o exigir el objeto con `notes`. El frontend debe ajustarse al contrato definitivo, sin asumir ambas posibilidades.

### 5.4. Actualizar notas

Endpoint:

`PATCH /api/v1/patients/{patient_id}/special-conditions/{special_condition_id}`

Se utilizará para modificar únicamente las notas de una relación existente, si el backend implementa esta operación según la estrategia recomendada.

Si el contrato definitivo establece que `PUT` es la única operación de escritura, utilizarlo también para reemplazar las notas.

No implementar ambas estrategias de manera contradictoria.

### 5.5. Retirar una condición

Endpoint:

`DELETE /api/v1/patients/{patient_id}/special-conditions/{special_condition_id}`

Debe utilizarse para retirar exclusivamente la asociación entre el paciente y la condición especial.

No debe eliminar:

- El paciente.
- La persona relacionada con el paciente.
- La condición del catálogo.

## 6. Formulario de creación de pacientes

La creación del paciente debe permitir registrar sus datos propios y seleccionar sus condiciones especiales dentro del mismo flujo.

El formulario debe contener:

**Datos del paciente**

Los campos definidos en la SPEC 07, respetando el contrato de creación del backend.

**Condiciones especiales**

- Catálogo de condiciones activas.
- Búsqueda de condiciones.
- Selección múltiple.
- Notas específicas para cada condición seleccionada.
- Posibilidad de retirar una condición antes de guardar el paciente.

La sección debe aparecer integrada en el formulario de creación, bajo un título claro como **Condiciones especiales del paciente**.

No debe abrir una página independiente ni obligar al usuario a navegar al módulo del catálogo.

### 6.1. Secuencia de creación

El backend utiliza endpoints independientes para crear pacientes y asociar condiciones especiales.

Por ello, el frontend debe ejecutar las operaciones secuencialmente:

1. El usuario selecciona una persona existente o registra una nueva mediante los componentes definidos en la SPEC 06.
2. Completa los datos propios del paciente.
3. Selecciona las condiciones especiales que desea asociar.
4. Registra las notas correspondientes a cada condición.
5. El frontend ejecuta `POST /api/v1/patients`.
6. Obtiene el `patient_id` de la respuesta.
7. Ejecuta un `PUT /api/v1/patients/{patient_id}/special-conditions/{special_condition_id}` por cada condición seleccionada.
8. Informa el resultado de la creación del paciente y de sus asociaciones.

No enviar las condiciones especiales dentro de `POST /api/v1/patients`.

No asumir que la creación del paciente y sus asociaciones constituyen una única transacción.

### 6.2. Fallos parciales

Si el paciente se crea correctamente, pero alguna asociación falla:

- No volver a crear el paciente.
- Conservar el `patient_id` obtenido.
- Informar que el paciente fue creado, pero que algunas condiciones no pudieron asociarse.
- Identificar las condiciones pendientes.
- Conservar las notas introducidas para cada condición.
- Permitir reintentar únicamente las asociaciones pendientes.
- No eliminar automáticamente el paciente ni las asociaciones que sí se completaron.

Si la creación de una persona nueva también forma parte del flujo, aplicar adicionalmente las reglas de fallos parciales de la SPEC 06 y conservar el identificador obtenido para evitar duplicar personas.

## 7. Formulario de edición de pacientes

La edición debe permitir modificar los datos propios del paciente y administrar sus condiciones especiales desde el mismo formulario.

Al abrir la edición:

1. Consultar el paciente mediante `GET /api/v1/patients/{patient_id}`.
2. Consultar las condiciones asociadas mediante `GET /api/v1/patients/{patient_id}/special-conditions`.
3. Consultar el catálogo de condiciones disponibles mediante `GET /api/v1/special-conditions`.
4. Mostrar los datos del paciente y sus condiciones actuales.

### 7.1. Agregar condiciones

El usuario debe poder seleccionar condiciones activas que todavía no estén asociadas.

Al guardar, el frontend debe identificar las nuevas condiciones y ejecutar un `PUT` individual por cada una.

No volver a enviar las asociaciones que ya existen y no han cambiado.

### 7.2. Modificar notas

Cada condición asociada debe permitir consultar y editar sus notas.

Cuando el usuario modifique las notas:

- Utilizar `PATCH` si el backend lo implementa para actualizar exclusivamente `notes`.
- Si el contrato definitivo utiliza `PUT` para reemplazar las notas, utilizar esa operación.
- No enviar cambios innecesarios para las demás condiciones.

Las notas pueden quedar vacías o en `null`, según el contrato definitivo del backend.

### 7.3. Retirar condiciones

El usuario debe poder retirar una condición del paciente desde el mismo formulario.

Al guardar, el frontend debe identificar las relaciones que deben eliminarse y ejecutar el endpoint `DELETE` correspondiente.

La eliminación de la asociación no debe modificar el catálogo de condiciones ni los datos del paciente.

### 7.4. Condiciones inactivas

La definición de la tabla `special_condition` debe contemplar la decisión pendiente de la SPEC 11 backend respecto al campo `is_active`.

Si se incorpora `is_active`:

- Mostrar las condiciones inactivas que ya estén asociadas, identificándolas visualmente.
- No ofrecerlas para nuevas asociaciones.
- No asumir que pueden asignarse nuevamente.
- Permitir retirar una asociación existente si el backend lo permite.

Si el modelo definitivo no incluye `is_active`:

- No implementar filtros ni validaciones de inactividad.
- No inventar estados que el backend no expone.

La interfaz debe ajustarse a la decisión definitiva del modelo.

### 7.5. Guardado y fallos parciales

La actualización del paciente y la administración de sus condiciones son operaciones independientes.

- Los cambios propios del paciente se envían mediante `PATCH /api/v1/patients/{patient_id}`.
- Las nuevas asociaciones se registran mediante `PUT`.
- Las notas se actualizan mediante la operación admitida por el backend.
- Las asociaciones retiradas se eliminan mediante `DELETE`.

Si alguna operación falla:

- Conservar los cambios que el backend confirmó.
- Identificar las operaciones pendientes o fallidas.
- Informar qué cambios se guardaron y cuáles no.
- Permitir reintentar las operaciones pendientes sin duplicar asociaciones ni repetir cambios innecesarios.

No asumir una transacción única entre los distintos endpoints.

## 8. Detalle del paciente

La vista de detalle existente debe incorporar una sección de condiciones especiales.

Debe mostrar:

- Nombre de la condición.
- Descripción, cuando esté disponible.
- Notas específicas de la asociación.
- Estado activo o inactivo, si el backend expone `is_active`.

La sección debe permitir consultar la información sin navegar al catálogo.

La administración de asociaciones debe realizarse desde el formulario de edición, sin crear una página independiente.

No presentar las condiciones como diagnósticos confirmados ni inferir tratamientos a partir de ellas.

## 9. Experiencia de usuario

La integración debe mantener una experiencia sencilla:

- No crear páginas independientes para las asociaciones.
- No agregar nuevas rutas para `patient_special_condition`.
- No obligar al usuario a salir del formulario del paciente.
- Utilizar una sección claramente identificada como **Condiciones especiales**.
- Permitir seleccionar varias condiciones.
- Permitir registrar notas para cada condición seleccionada.
- Permitir modificar o retirar asociaciones existentes.
- Diferenciar condiciones disponibles, asociadas e inactivas.
- Mostrar confirmaciones y resultados de las operaciones.
- Evitar perder los datos del formulario cuando falle una asociación.

La selección múltiple es una interacción del frontend. El backend continúa recibiendo una solicitud individual por cada relación.

## 10. Estados de interfaz

Contemplar como mínimo:

- Cargando catálogo de condiciones.
- Cargando condiciones asociadas.
- Catálogo sin condiciones disponibles.
- Paciente sin condiciones asociadas.
- Condiciones seleccionadas.
- Editando notas.
- Guardando datos del paciente.
- Asociando condiciones.
- Actualizando notas.
- Retirando condiciones.
- Operación completada.
- Operación parcialmente completada.
- Error de consulta.
- Error de asociación.
- Error al actualizar notas.
- Error al retirar una asociación.

Los estados de error deben permitir comprender qué operación falló y qué información se conservó.

## 11. Validaciones y reglas de negocio

El frontend debe respetar las reglas del backend:

1. El paciente y la condición deben existir.
2. No se deben crear asociaciones duplicadas.
3. La asignación repetida mediante `PUT` debe actualizar las notas o dejar la relación sin cambios.
4. Las notas pueden ser `null`.
5. Las notas deben respetar las limitaciones de entrada definidas por el backend.
6. Retirar una asociación no debe eliminar las entidades base.
7. No se deben asignar condiciones inactivas si el modelo definitivo contempla `is_active`.
8. No se deben inferir diagnósticos ni tratamientos.
9. No se deben exponer datos clínicos de pacientes en listados globales del catálogo.

Los errores definitivos del backend deben prevalecer sobre las validaciones preventivas del frontend.

## 12. Navegación y rutas

No se deben agregar opciones nuevas al sidebar ni rutas independientes para administrar condiciones especiales de pacientes.

Se reutilizan las rutas existentes del módulo de pacientes, definidas en:

- `frontend/src/components/layout/app-layout/sidebar/data.tsx`
- `frontend/src/App.tsx`

La funcionalidad se incorpora en:

- Creación: `/patients/create`
- Detalle: `/patients/:patientId`
- Edición: `/patients/:patientId/edit`

La navegación del catálogo de condiciones especiales continúa perteneciendo al módulo correspondiente, conforme a la SPEC 03.

## 13. Reutilización de componentes

Antes de desarrollar componentes nuevos, inspeccionar los recursos existentes.

Reutilizar cuando corresponda:

- Componentes de formularios.
- Selectores múltiples.
- Campos de búsqueda.
- Listas y tablas.
- Campos de texto para notas.
- Diálogos de confirmación.
- Alertas y notificaciones.
- Estados de carga y error.
- Servicios del catálogo de condiciones especiales.

Los componentes específicos de las asociaciones deben permanecer dentro del módulo de pacientes, salvo que se identifique una necesidad real de reutilización en otros módulos.

## 14. Pruebas

Verificar como mínimo:

### Creación
- Crear un paciente sin condiciones especiales.
- Crear un paciente con una o varias condiciones.
- Registrar notas diferentes para cada condición.
- Ejecutar las asociaciones después de crear el paciente.
- Manejar fallos parciales de asociación.
- Reintentar asociaciones pendientes sin duplicar el paciente.

### Edición
- Consultar las condiciones asociadas.
- Agregar una o varias condiciones.
- Modificar notas.
- Limpiar notas.
- Retirar una o varias condiciones.
- Manejar fallos parciales.
- Reintentar operaciones pendientes.

### Validaciones
- Rechazar asociaciones con identificadores inexistentes.
- Evitar asignaciones duplicadas.
- Comprobar el comportamiento idempotente de `PUT`.
- Identificar condiciones inactivas si el modelo las contempla.
- No permitir nuevas asociaciones de condiciones inactivas.
- Conservar la información del formulario ante errores.

### Integración
- Verificar los endpoints y cuerpos de solicitud.
- Confirmar que `POST` y `PATCH` de pacientes no reciban condiciones especiales.
- Confirmar que retirar una asociación no elimine el paciente ni la condición del catálogo.
- Verificar que las notas pertenezcan a la relación y no a los datos propios del paciente.

## 15. Exclusiones

Esta especificación no debe implementar:

- Historia clínica.
- Diagnósticos confirmados.
- Tratamientos o prescripciones.
- Reglas clínicas automáticas.
- Alertas médicas basadas en inferencias.
- Administración del catálogo de condiciones especiales desde el paciente.
- Listados globales de pacientes con sus condiciones.
- Páginas independientes para `patient_special_condition`.
- Modificaciones del contrato de creación o actualización de pacientes para incluir relaciones.

## 16. Documentación

La documentación técnica debe guardarse en `docs/`, en la raíz del repositorio.

No crear `frontend/docs/`.

Documentar la integración de condiciones especiales en los formularios de pacientes, las operaciones secuenciales, el manejo de fallos parciales y las responsabilidades de los módulos involucrados.

## 17. Criterios de aceptación

La implementación se considera completa cuando:

1. El usuario puede seleccionar condiciones especiales al crear un paciente, sin navegar a otra página.
2. El paciente se crea antes de ejecutar las asociaciones.
3. Se pueden registrar notas específicas para cada condición.
4. El usuario puede consultar las condiciones asociadas desde el detalle del paciente.
5. El usuario puede agregar condiciones, modificar notas y retirar asociaciones desde el formulario de edición.
6. Las relaciones se administran mediante los endpoints específicos.
7. Se respeta la decisión definitiva del backend sobre `is_active`.
8. Los fallos parciales se informan y pueden reintentarse sin duplicar operaciones exitosas.
9. No se crean páginas ni rutas adicionales para administrar `patient_special_condition`.
10. Se conserva la separación de responsabilidades entre los módulos de pacientes y condiciones especiales.
11. Las condiciones no se presentan como diagnósticos ni generan decisiones clínicas automáticas.