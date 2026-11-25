# Módulo `persons`

Spec: `specs/06-person-registration.md`. Código: `frontend/src/modules/persons/`.

## Propósito y límites

Administrar los datos personales básicos (base común de pacientes y personal): listar, registrar, consultar, actualizar y activar/desactivar. Registrar una persona **no** crea paciente, personal ni cuenta de acceso. No se muestra ni solicita `password_hash`.

## Rutas

| Ruta | Página | En el menú |
|---|---|---|
| `/persons` | `PersonsPage` | Sí (grupo Gestión de personas) |
| `/persons/create` | `PersonCreatePage` | No |
| `/persons/:personId` | `PersonDetailPage` (datos personales + información del registro; incluye inactivas) | No |
| `/persons/:personId/edit` | `PersonEditPage` | No |

## Funcionamiento

- **Listado:** búsqueda por nombre/apellidos (`name`, cada palabra), tipo de documento, número de documento (**coincidencia exacta**, normalizado), estado, ordenamiento en servidor (`id`, `last_name`, `first_name`, `created_at` + `order`) y paginación de 20. La tabla muestra solo nombre completo, documento y estado; teléfono, WhatsApp, correo y dirección solo aparecen en el detalle.
- **Campos:** `first_name`, `last_name` (obligatorios, máx. 100), `maternal_last_name`, `document_type`, `document_number`, `birth_date`, `phone`, `phone_whatsapp`, `email`, `address` (opcionales). `maternal_last_name` no aparece en la spec pero sí en el contrato OpenAPI y en la descripción de la búsqueda.
- **Normalización:** nombres recortados; tipo de documento en mayúsculas (`^[A-Za-z0-9_]+$`, máx. 30); número sin espacios y en mayúsculas.
- **Reglas de interfaz:** documento completo o ausente; fecha de nacimiento válida y no futura (hoy permitido); **teléfonos** (`phone`, de contacto/llamadas, y `phone_whatsapp`, número del módulo de WhatsApp; independientes y opcionales): campo de tipo teléfono (`tel`) que solo admite **dígitos y se escribe sin código de país** (sin `+51`; un valor con `+` se rechaza), de 6 a 15 dígitos, y se envía al backend solo con dígitos (la comparación al editar es por dígitos); el backend usa `phone_whatsapp` y, si falta, `phone` para WhatsApp; correo con formato válido; dirección máx. 255. La unicidad del documento (409) la decide el backend y se muestra en el campo número de documento.
- **Editar:** solo se envían los campos modificados; opcionales vaciados → `null`; si cambia el tipo o el número de documento se envían ambos juntos.
- **Estado:** diálogo de confirmación → `PATCH /persons/{id}/status`; no altera pacientes ni personal asociados.
- **Privacidad:** no se usa almacenamiento del navegador ni se registran datos personales en consola; los avisos de éxito no incluyen datos personales.

## API pública para otros módulos

Exportada desde `modules/persons/index.ts` (ADR-006):

| Recurso | Uso |
|---|---|
| `PersonForm` | Formulario de alta/edición. Props: `defaultValues`, `submitLabel`, `onSubmit(values)`, `onCancel?`, `children?` (contenido del consumidor dentro del formulario, antes de las acciones). No registra entidades dependientes. |
| `PersonSelector` | Busca por nombre o documento exacto y selecciona. Props: `value?` (id), `onSelect(person)`, `activeOnly?` (deshabilita inactivas). No lista a nadie sin criterio de búsqueda. |
| `personApi`, `toCreatePayload`, `EMPTY_PERSON_FORM_VALUES` | Crear la persona desde un flujo ajeno y obtener su `id` (`person_id`). |
| `getPersonFullName`, `getPersonDocument`, tipos `Person`, `PersonFormValues`… | Presentación y tipado. |

Dirección de dependencia: `patients → persons`, `staff → persons`.

## Organización interna

`pages/`, `components/` (`person-form`, `person-selector`, `persons-table`, `persons-filters`, `persons-pagination`, `person-status-dialog`, `person-status-badge`), `hooks/`, `services/person-api.ts`, `schemas/`, `types/`, `utils/`. Contrato: [../integrations/backend-api.md](../integrations/backend-api.md).

## No implementado (pendiente de otras specs)

- Flujo combinado (spec §8): implementado en [patients](patients.md) y [staff](staff.md).
- Pruebas (spec §12): el proyecto no tiene herramienta de pruebas y `frontend/AGENTS.md` exige consultar antes de instalar paquetes.
- Formato de `details` en 422 sin confirmar; solo se ejecutaron `npm run build` y `npm run lint`.

## Pendiente de verificar (teléfonos)

- `phone_whatsapp` está en el backend (spec de personas, migración `0007`) pero **todavía no en el `openapi.json` del repositorio**; el contrato se tomó del código del backend (`PhoneNumber`: `^+?(?[0-9][0-9s().-]*$`, 6–15 dígitos). El frontend es más estricto que el backend a propósito: no admite `+` ni separadores nuevos. Si el envío por WhatsApp requiere código de país, el backend debe completarlo (el frontend no lo pide).
- Las personas con teléfonos heredados con `+` o separadores deben corregirse al editarlas (el formulario los marca como inválidos si empiezan por `+`).
