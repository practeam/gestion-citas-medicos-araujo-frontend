# Arquitectura del frontend

Frontend del sistema de gestión de citas odontológicas. SPA con React 19, Vite, TypeScript, Tailwind CSS v4, React Router 8, Base UI y react-i18next, construida sobre la plantilla TailAdmin React.

La plantilla es la base del proyecto y se conserva. Las funcionalidades propias se añaden de forma incremental en `src/modules/` y la infraestructura de comunicación con el backend en `src/services/`.

Reglas de diseño: skill `frontend-arquitectura` (`.agents/skills/frontend/`). Decisiones: [architecture-decisions.md](architecture-decisions.md).

## Estructura

Estado: **existente** salvo indicación.

```text
frontend_gestion_citas/
├── .agents/skills/frontend/        # Skills del proyecto
├── specs/                          # Especificaciones funcionales (00 rutas/navegación, 01 roles)
├── scripts/project-inventory.mjs   # Inventario estructural (skill de catálogo)
├── docs/                           # Esta documentación
└── frontend/                       # Proyecto Vite
    ├── .env.example                # Variables de entorno (nombres, sin secretos)
    └── src/
        ├── App.tsx                 # Único registro de rutas
        ├── main.tsx
        ├── index.css
        ├── components/             # Plantilla: ui/, shared/, layout/
        ├── contexts/  hooks/  i18n/  icons/  utils/
        ├── messages/               # Traducciones en, es, de, ar
        ├── pages/                  # Plantilla: main/, others/
        ├── services/
        │   └── api/                # Cliente HTTP global (client, errors, types)
        └── modules/
            ├── roles/              # components/ hooks/ pages/ schemas/ services/ types/ utils/
            ├── permissions/        # catálogo de permisos (API pública: permissionApi, Permission)
            ├── persons/            # misma organización que roles + componentes públicos (PersonForm, PersonSelector)
            ├── patients/           # consume persons (PersonForm, PersonSelector)
            ├── staff/              # consume persons (PersonForm, PersonSelector)
            ├── schedule-exceptions/ # bloqueos extraordinarios (consume clinics, staff, persons)
            ├── schedule-overrides/ # modificaciones puntuales de horario (consume clinics, staff, persons)
            ├── procedures/ # catálogo de procedimientos
            ├── conversations/ # chat: conversaciones, mensajes y asignaciones (consume persons, staff)
            ├── guardians/ # apoderados de pacientes (consume persons, auth)
            ├── appointments/ # agenda de citas con calendario (consume patients, staff, persons)
            ├── clinics/            # misma organización que roles
            ├── specialties/        # catálogo de especialidades (API pública: specialtyApi, Specialty)
            └── special-conditions/ # catálogo de condiciones (API pública: specialConditionApi, SpecialCondition)
```

Los módulos del backend restantes se incorporarán como `modules/<dominio>/` cuando exista su especificación. Hoy existen `appointments`, `conversations`, `guardians`, `procedures`, `roles`, `permissions`, `persons`, `schedule-exceptions`, `schedule-overrides`, `patients`, `staff`, `clinics`, `specialties` y `special-conditions`.

## Áreas y responsabilidades

| Área | Responsabilidad |
|---|---|
| `components/`, `pages/`, `contexts/`, `hooks/`, `i18n/`, `icons/`, `utils/` | Estructura común de la plantilla. No se reorganiza. |
| `services/api/` | Infraestructura HTTP compartida: cliente `fetch`, `ApiError`, tipos del envoltorio `ApiResponse` y `PageResult`. |
| `modules/<dominio>/` | Todo lo propio de un dominio: páginas, componentes, servicio API, schemas, tipos, hooks, utilidades. |
| `App.tsx` | Composición de rutas; los módulos exponen sus páginas desde su `index.ts`. |
| `components/layout/app-layout/sidebar/data.tsx` | Navegación lateral (`navItems`); cada `key` necesita `sidebar.items.<key>` en los cuatro `messages/*.json`. |

## Rutas y layouts

Las rutas de módulos se registran en `App.tsx` dentro del layout `AppLayout`. Rutas actuales: `/roles`, `/roles/create`, `/roles/:roleId`, `/roles/:roleId/edit`; `/permissions`, `/permissions/create`, `/permissions/:permissionId`, `/permissions/:permissionId/edit`. En el sidebar, Roles y Permisos se agrupan en `Administración` (`administration`); Especialidades va en `Gestión clínica` (`clinicalManagement`). Rutas de especialidades: `/specialties`, `/specialties/create`, `/specialties/:specialtyId`, `/specialties/:specialtyId/edit`. Personas (grupo `Gestión de personas`, clave `peopleManagement`): `/persons`, `/persons/create`, `/persons/:personId`, `/persons/:personId/edit`. Personal (grupo `Gestión de personal`, clave `staffManagement`): `/staff`, `/staff/create`, `/staff/:staffId`, `/staff/:staffId/edit`. Pacientes (grupo `Gestión de pacientes`, clave `patientManagement`): `/patients`, `/patients/create`, `/patients/:patientId`, `/patients/:patientId/edit`. Clínicas (en `Gestión clínica`): `/clinics`, `/clinics/create`, `/clinics/:clinicId`, `/clinics/:clinicId/edit`. Condiciones especiales (también en `Gestión clínica`): `/special-conditions`, `/special-conditions/create`, `/special-conditions/:specialConditionId`, `/special-conditions/:specialConditionId/edit`. Excepciones de horario (grupo `Gestión de agenda`, clave `scheduleManagement`): `/schedule-exceptions`, `/schedule-exceptions/create`, `/schedule-exceptions/:exceptionId`, `/schedule-exceptions/:exceptionId/edit`. Modificaciones puntuales (grupo `Gestión de agenda`): `/schedule-overrides`, `/schedule-overrides/create`, `/schedule-overrides/:overrideId`, `/schedule-overrides/:overrideId/edit`. Apoderados (grupo `Gestión de pacientes`): `/guardians` (consulta por persona; la gestión se hace desde el paciente). Conversaciones (grupo `Comunicación`, clave `communication`): `/conversations` (la conversación seleccionada va en `?conversation=`; mensajes y asignaciones son parte de la misma pantalla). Procedimientos (grupo `Gestión de servicios`, clave `serviceManagement`): `/procedures`, `/procedures/create`, `/procedures/:procedureId`, `/procedures/:procedureId/edit`. Agenda de citas (grupo `Gestión de citas`, clave `appointmentManagement`): `/appointments` (creación, detalle y edición con modales, sin rutas propias). No hay protección de rutas ni autenticación (fuera del alcance de las specs actuales).

## Reglas de dependencia

- Los módulos consumen `components/`, `services/api/`, `i18n/`, `icons/`; los componentes comunes no importan módulos.
- Las llamadas HTTP viven en `modules/<dominio>/services/` y usan `apiClient`; ningún componente visual llama a `fetch`.
- Un módulo no importa archivos internos de otro; usa su `index.ts`.
- `patients → persons` y `staff → persons`; `persons` nunca depende de `patients` ni de `staff`.

## Documentos relacionados

- [component-catalog.md](component-catalog.md) — recursos reutilizables
- [../modules/roles.md](../modules/roles.md) — módulo de roles
- [../integrations/backend-api.md](../integrations/backend-api.md) — integración con FastAPI
