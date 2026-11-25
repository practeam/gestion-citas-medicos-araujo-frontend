# Módulo `auth`

Spec: `specs/23-auth.md`. Código: `frontend/src/modules/auth/`. Backend: `/api/v1/auth` (`POST /login` público, `GET /me`, `POST /logout`).

## Rutas

| Ruta | Acceso |
|---|---|
| `/login` | Pública (`PublicOnlyRoute`: con sesión redirige a la app o a la ruta que se intentaba abrir). `/signin` redirige aquí. |
| Todas las demás | Privadas (`ProtectedRoute` envuelve `AppLayout`). Sin sesión → `/login` conservando la ruta (salvo tras cerrar sesión voluntariamente). |

## Sesión

`AuthProvider` (`context/auth-context.tsx`) es la única fuente de verdad: token, usuario (con `roles` y `permissions` efectivos), estado (`loading` / `authenticated` / `unauthenticated` / `error`) y motivo del último cierre. Al iniciar la app lee el token guardado, valida `exp`, llama a `GET /auth/me` y solo entonces decide; mientras tanto se muestra una pantalla de carga. Un fallo de conexión en esa comprobación **no** destruye el token: muestra "reintentar".

- **Almacenamiento:** `sessionStorage` (clave `auth.session`: token + desfase de reloj). Dura lo que la pestaña. No es inmune a XSS; el backend solo espera `Authorization: Bearer` (no hay cookie HttpOnly ni refresh tokens).
- **Expiración:** se calcula desde `exp` del JWT (segundos Unix) corregido por el desfase servidor−cliente medido con `iat` al iniciar sesión. Un único temporizador por token; se recalcula al volver a la pestaña (`visibilitychange`, `focus`) para cubrir suspensión. A 60 s se muestra `SessionExpiryAlert` (una vez por token, con botón de cerrar); al expirar se limpia todo y se redirige a `/login` con el aviso de sesión expirada.
- **401:** `apiClient` adjunta el token y, ante un 401 con token, llama a `onUnauthorized(token)`; la sesión solo se cierra si ese token sigue siendo el vigente (varias respuestas 401 simultáneas = un solo cierre). El 401 del login no cierra nada. **403** no toca la sesión.
- **Logout:** llama a `POST /auth/logout` (best-effort; el JWT es stateless y no se revoca) y limpia token, usuario y permisos.

## Permisos

Los permisos son los que devuelve el backend (`<entidad>.<acción>`, p. ej. `patient.read`); no hay listas por rol. `useAuth()` expone `can`, `canAny`, `canAll`. Componentes: `<RequirePermission>` (rutas; sin permiso muestra "Acceso denegado"), `<Can>` (botones/acciones). El sidebar filtra por `permission` en cada subitem (`sidebar/data.tsx`). Ocultar UI no sustituye la autorización del backend.

## Límites conocidos

- No hay tests automatizados (el proyecto no tiene test runner).
- Las acciones internas de formularios (asignar/quitar permisos de un rol, roles/especialidades/horarios del personal, condiciones del paciente) quedan protegidas por la ruta de edición, no por permisos propios (`role.assign_permission`, etc.).
- Las plantillas demo (calendar, charts, ui-elements…) solo exigen sesión.
