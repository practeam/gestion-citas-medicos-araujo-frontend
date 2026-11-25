# Módulo `guardians`

Spec: `specs/26-gestion-apoderados.md`. Código: `frontend/src/modules/guardians/`. Gestiona la asociación de **personas existentes** como apoderados de pacientes. No crea ni edita datos personales: reutiliza `persons` (`PersonSelector`, `PersonForm`, `personApi`) y se integra en `patients`.

> **Contrato:** verificado contra el `openapi.json` actualizado (11-nov): rutas, filtros, `GuardianRelationship` y esquemas coinciden con lo implementado. El contrato proviene de la spec 27 del backend.

## Rutas y navegación

| Ruta | Página | Permiso | En el menú |
|---|---|---|---|
| `/guardians` | `GuardiansPage` | `patient_guardian.read` | Sí (grupo **Gestión de pacientes** → **Apoderados**) |

No hay páginas de alta ni edición de apoderados: se gestionan desde el paciente.

## Contrato (backend)

| Método | Ruta | Permiso |
|---|---|---|
| `POST` | `/patients/{patient_id}/guardians` `{ person_id, relationship }` | `patient_guardian.create` |
| `GET` | `/patients/{patient_id}/guardians` (`name`, `document_number`, `is_active`, `sort_by`, `order`, paginación) | `patient_guardian.read` |
| `GET` | `/patients/{patient_id}/guardians/{guardian_id}` | `patient_guardian.read` |
| `PATCH` | `/patients/{patient_id}/guardians/{guardian_id}` `{ relationship }` | `patient_guardian.update` |
| `DELETE` | `/patients/{patient_id}/guardians/{guardian_id}` | `patient_guardian.delete` |
| `GET` | `/persons/{person_id}/patients` (`is_active`, `sort_by`, `order`, paginación) | `patient_guardian.read` |

- `guardian_id` es el id de la **asociación**, no el de la persona. Los datos personales llegan en `person` (`PersonSummary`); el contacto (teléfono, correo) se consulta con `GET /persons/{id}`.
- `relationship` (obligatorio, sin valor por defecto): `mother`, `father`, `brother`, `sister`, `grandfather`, `grandmother`, `uncle`, `aunt`, `husband`, `wife`, `son`, `daughter`, `legal_guardian`, `other`. Las etiquetas se traducen; al API siempre va el valor.
- Reglas del backend: el paciente y la persona deben estar **activos** (409), una persona no puede repetirse en el mismo paciente (409, aunque cambie el parentesco), la persona debe existir (422). Los apoderados son **opcionales**. `DELETE` solo elimina la asociación. Desactivar a la persona o al paciente no elimina la asociación. El backend no valida que la persona sea apoderada de sí misma (pendiente de confirmar).

## Funcionamiento

- **Visibilidad según permisos:** los botones dependen de los permisos de la sesión (`patient_guardian.read/create/update/delete`). Si falta `read`, la sección muestra un aviso en lugar de ocultarse; si falta `create` en el alta, se indica en la sección. Para que aparezcan, el permiso debe existir en el backend (`sync_permissions`/`seed_security`), estar asignado al rol del usuario y haber iniciado sesión de nuevo.
- **Accesos:** listado de pacientes → botón **Apoderados** (lleva a la sección del detalle); detalle y edición del paciente → sección **Apoderados** con agregar, cambiar parentesco y desasociar (cada acción con su permiso); alta → sección **Apoderados**.

- **Alta de paciente (P1):** el formulario de `/patients/create` (con persona existente o nueva) incluye la sección **Apoderados** (solo si el usuario tiene `patient_guardian.create`). `GuardiansPicker` mantiene la lista en pantalla: cada apoderado es una persona **ya registrada** + parentesco; no admite duplicados y se puede quitar antes de guardar.
- **Agregar apoderado (`GuardianAddDialog`):** diálogo con dos modos. *Persona existente*: búsqueda con `PersonSelector` (solo activas); seleccionar nunca crea una persona. *Persona nueva* (solo con `person.create`): `PersonForm` existente; se registra con `personApi.create` y pasa a ser la persona elegida, de modo que si lo siguiente falla se reintenta sin volver a registrarla. El diálogo se usa tanto en el alta (agrega a la lista) como en la gestión (asocia de inmediato con `POST`). Detiene el evento `submit` porque React lo propaga a través del portal y se abre dentro de otro formulario.
- **Orden de operaciones al guardar el paciente:** (1) si la persona del paciente es nueva se registra con `persons`; (2) `POST /patients`; (3) condiciones especiales (spec 11); (4) un `POST /patients/{id}/guardians` por apoderado, de forma secuencial (`runGuardianAssociations`). No hay endpoint que cree paciente y apoderados en una sola solicitud, y la persona del apoderado ya existe antes del paso (4).
- **Fallos parciales:** si el paciente se crea y alguna asociación falla, **no se vuelve a crear el paciente ni se duplican personas**: se informa, se listan los apoderados asociados y los pendientes con su error, y "Reintentar asociaciones pendientes" reenvía solo lo pendiente junto con las condiciones pendientes. El `UNIQUE (patient_id, person_id)` del backend impide duplicar una asociación al reintentar.
- **Detalle y edición del paciente:** la sección `GuardiansSection` lista los apoderados (nombre, documento, parentesco, persona inactiva) con **Consultar** (modal con datos personales y de contacto y los pacientes asociados). En la edición (`manage`) permite **Agregar apoderado** (`create`), **Cambiar parentesco** (`update`) y **Desasociar** (`delete`, con confirmación y aviso de que la persona se conserva). Cada acción se gestiona con su permiso (`Can`) y se confirma con la respuesta de la API antes de recargar la lista. La sección completa requiere `patient_guardian.read`.
- **Página `/guardians` (P2):** el backend **no tiene un listado general de apoderados** (solo apoderados por paciente y pacientes por persona), por lo que no se puede mostrar una tabla de todos los apoderados ni su cantidad de pacientes. La página parte de una **persona** (búsqueda con `PersonSelector`), muestra sus datos y de contacto y los pacientes de los que es apoderada (paginados, con parentesco, estado y enlace al paciente si tiene `patient.read`). Los datos personales se editan en `persons`.
- **Desasociación desde la gestión de apoderados (P3):** se hace desde el paciente (la operación `DELETE` pertenece a un paciente concreto).

## API pública para otros módulos

`guardians/index.ts` exporta `GuardiansPicker`, `GuardiansSection`, `GuardianRelationshipSelect`, `runGuardianAssociations`, `getGuardianErrorMessage`, `guardianApi` y los tipos `Guardian`, `GuardianRelationship`, `StagedGuardian`. Consume `persons` y `auth` (`Can`); no depende de `patients` (las rutas a pacientes son URLs). `patients` consume `guardians` (alta, detalle y edición).

## Organización interna

`pages/guardians-page`, `components/` (`guardians-picker`, `guardians-section`, `guardian-add-dialog`, `guardian-detail-dialog`, `guardian-person-card`, `guarded-patients-list`, `guardian-relationship-select`), `hooks/` (`use-patient-guardians`, `use-guarded-patients`), `services/guardian-api.ts`, `types/`, `utils/` (errores, asociaciones). Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## Pendiente de verificar

- Pruebas (spec §13): el proyecto no tiene herramienta de pruebas; solo se ejecutaron `npm run build` y `npm run lint`, sin comprobación visual ni contra el backend.
- Listado general de apoderados y "cantidad de pacientes asociados": no hay endpoint; no se calculan en el frontend.
- Formato de `details` en 422 y distinción entre 409 (inactivo / duplicado): se muestra el mensaje del backend.
- El backend no impide que una persona sea apoderada de su propio registro de paciente; el frontend tampoco lo valida.
- El modal de detalle usa `GET /persons/{id}` para el contacto: requiere `person.read`; si falla, se informa y se conservan los datos de la asociación.
