# Integración con el backend FastAPI

Contrato de referencia: `.agents/skills/frontend/frontend-integracion-api/references/openapi.json` (puede estar desactualizado; regenerable desde `/openapi.json` del backend). Reglas de integración: skill `frontend-integracion-api`.

## Configuración

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del API, incluido `/api/v1` | `http://127.0.0.1:8000/api/v1` |
| `VITE_APP_TIMEZONE` | Zona horaria de la aplicación (`APP_TIMEZONE`) con la que se interpretan y muestran las citas; debe coincidir con la del backend | `America/Lima` |

Ejemplo en `frontend/.env.example`. No colocar secretos en variables `VITE_*` (son públicas).

## Flujo

```text
Página → hook del módulo → modules/<dominio>/services/<x>-api.ts → services/api/client.ts → FastAPI
```

- `apiClient` devuelve `data.result` del envoltorio `ApiResponse` (`error`, `message`, `data.{result,details}`, `code`).
- Cualquier fallo lanza `ApiError` con `kind` (`network` | `http` | `invalid-response`), `status` y `details`.
- Las respuestas paginadas usan `PageResult<T>` (`items`, `total`, `page`, `page_size`).
- Los mensajes mostrados al usuario son los del backend para errores 4xx; los errores de red y 5xx usan textos propios traducidos (no se exponen detalles técnicos).

## Límites actuales

- Autenticación JWT (spec 23): el cliente adjunta `Authorization: Bearer` y centraliza el 401; ver [auth](../modules/auth.md). `references/openapi.json` del skill no incluye `/auth` (desactualizado): el contrato se tomó del backend (`docs/modules/auth.md`, `auth_router.py`).
- Métodos soportados por el cliente: GET, POST, PUT, PATCH y DELETE (los usados hasta ahora).
- CORS debe estar habilitado en el backend para el origen del frontend.

## Endpoints consumidos

| Módulo | Endpoints |
|---|---|
| `roles` | `POST/GET /roles`, `GET/PATCH /roles/{role_id}`, `PATCH /roles/{role_id}/status` |
| `permissions` | `POST/GET /permissions`, `GET/PATCH /permissions/{permission_id}`, `PATCH /permissions/{permission_id}/status` |
| `specialties` | `POST/GET /specialties` (con `sort_by`, `order`), `GET/PATCH /specialties/{specialty_id}`, `PATCH /specialties/{specialty_id}/status` |
| `special-conditions` | `POST/GET /special-conditions` (con `sort_by`, `order`), `GET/PATCH /special-conditions/{special_condition_id}`, `PATCH /special-conditions/{special_condition_id}/status` |
| `clinics` | `POST/GET /clinics` (con `sort_by`, `order`), `GET/PATCH /clinics/{clinic_id}`, `PATCH /clinics/{clinic_id}/status` |
| `persons` | `POST/GET /persons` (filtros `name`, `document_type`, `document_number`, `is_active`; `sort_by`, `order`), `GET/PATCH /persons/{person_id}`, `PATCH /persons/{person_id}/status` |
| `patients` | `POST/GET /patients` (filtros `name`, `document_number`, `patient_number`, `is_active`; `sort_by`, `order`), `GET/PATCH /patients/{patient_id}`, `PATCH /patients/{patient_id}/status`. El alta combinada hace `POST /persons` y después `POST /patients` |
| `staff` | `POST/GET /staff` (filtros `name`, `document_number`, `employee_number`, `is_active`; `sort_by`, `order`), `GET/PATCH /staff/{staff_id}`, `PATCH /staff/{staff_id}/status`. El alta combinada hace `POST /persons` y después `POST /staff` |
| `staff` (roles) | `GET/POST /staff-members/{staff_member_id}/roles` (`include_inactive`), `DELETE /staff-members/{staff_member_id}/roles/{role_id}`; catálogo vía `GET /roles?is_active=true` |
| `roles` (permisos) | `GET/POST /roles/{role_id}/permissions`, `DELETE /roles/{role_id}/permissions/{permission_id}`; catálogo vía `GET /permissions?is_active=true` |
| `patients` (condiciones especiales) | `GET /patients/{patient_id}/special-conditions`; `PUT|PATCH|DELETE /patients/{patient_id}/special-conditions/{special_condition_id}`; catálogo vía `GET /special-conditions?is_active=true` |
| `staff` (especialidades) | `GET /staff-members/{staff_member_id}/specialties`, `PUT|DELETE /staff-members/{staff_member_id}/specialties/{specialty_id}`; catálogo vía `GET /specialties?is_active=true` |
| `clinics` (horarios) | `GET|POST /clinics/{clinic_id}/schedules`, `PATCH /clinics/{clinic_id}/schedules/{schedule_id}`, `PATCH …/{schedule_id}/status` (el `DELETE` no se usa) |
| `staff` (horarios) | `GET|POST /staff-members/{staff_member_id}/schedules`, `PATCH …/schedules/{schedule_id}`, `PATCH …/schedules/{schedule_id}/status` (sin `DELETE`) |
| `schedule-exceptions` | `POST/GET /schedule-exceptions` (filtros `clinic_id`, `staff_member_id`, `exception_type`, `range_start`, `range_end`), `GET/PATCH /schedule-exceptions/{exception_id}` (sin `DELETE`) |
| `schedule-overrides` | `POST/GET /schedule-overrides` (filtros `clinic_id`, `staff_member_id`, `is_active`, `range_start`, `range_end`), `GET/PATCH /schedule-overrides/{override_id}` (solo intervalo y motivo), `PATCH …/{override_id}/status` (sin `DELETE`) |
| `appointments` | `POST/GET /appointments` (filtros `patient_id`, `staff_member_id`, `status`, `starts_from`, `starts_to`, `sort_by`, `order`), `GET/PATCH /appointments/{appointment_id}` (PATCH parcial: personal, intervalo y motivo), `PATCH …/{appointment_id}/status`, `GET /patients/{patient_id}/appointments`, `GET /staff-members/{staff_member_id}/appointments` (sin `DELETE` de citas), `GET|POST /appointments/{appointment_id}/details`, `PATCH|DELETE /appointments/{appointment_id}/details/{detail_id}` (spec 18) |
| `procedures` | `POST/GET /procedures` (filtros `search`, `is_active`, `parent_procedure_id`, `min_price`, `max_price`, `sort_by`, `order`), `GET/PATCH /procedures/{procedure_id}`, `PATCH …/{procedure_id}/status` (sin `DELETE`) |
| `conversations` | `POST/GET /conversations` (filtros `person_id`, `channel`, `status`, `started_from`, `started_to`, `sort_by`, `order`), `GET /conversations/{id}`, `PATCH …/{id}/status` (abrir/cerrar), `GET /persons/{id}/conversations`, `GET /staff-members/{id}/conversations` (sin `DELETE`) |
| `conversations` (mensajes) | `GET/POST /conversations/{id}/messages` (paginado: `page`, `page_size`, `order`; filtros `direction`, `sender_type`, `delivery_status`), `GET …/messages/{message_id}`. `PATCH /messages/{id}/delivery-status` no se usa desde la interfaz (proveedor/webhooks) |
| `conversations` (asignaciones) | `GET/POST /conversations/{id}/assignments` (asignar o transferir en una sola llamada), `PATCH /conversation-assignments/{id}/end` |
| `guardians` | `POST/GET /patients/{patient_id}/guardians` (filtros `name`, `document_number`, `is_active`, `sort_by`, `order`), `GET/PATCH/DELETE /patients/{patient_id}/guardians/{guardian_id}` (`relationship` es el único campo editable; `DELETE` solo quita la asociación), `GET /persons/{person_id}/patients`. Verificado contra el OpenAPI (11-nov). Permisos `patient_guardian.create/read/update/delete` |
