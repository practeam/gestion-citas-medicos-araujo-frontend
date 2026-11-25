# Módulo `dashboard`

Spec: `specs/24-dashboard.md`. Código: `frontend/src/modules/dashboard/`. Backend: `GET /api/v1/dashboard` (permiso `dashboard.read`).

## Ruta y permisos

`/` (índice de la app) → `DashboardPage`, protegida con `guard("dashboard.read", …)` en `App.tsx`. La entrada "Dashboard" del sidebar exige el mismo permiso (`permission` en `sidebar/data.tsx`; `NavItem` admite ahora `permission` en opciones sin subitems). Sin permiso se muestra "Acceso denegado". La plantilla `pages/main/dashboard/ecommerce` ya no tiene ruta (no se borró).

## Contrato

Un solo endpoint devuelve las 4 tarjetas y los 5 gráficos, calculados en el backend (nada se reconstruye con listados paginados). Parámetros: `period` (`current_month`, `last_30_days`, `last_6_months`, `current_year`, `custom`), `start_date` / `end_date` (solo `custom`, formato `date`), `group_by` (no se usa: el backend elige la granularidad). Respuesta: `period` (incluye `time_zone`, `today`, `granularity`), `cards`, `appointments_evolution`, `patients_evolution`, `appointments_by_status`, `patients_by_month`, `appointments_by_month`. La zona horaria y los cortes de día/mes los resuelve el backend.

## Funcionamiento

- `useDashboard(params)`: una petición por combinación de parámetros; cancela la anterior (sin carreras) y asocia el resultado a su clave, de modo que al cambiar de periodo se muestran skeletons y nunca datos del periodo previo. `params = null` (rango personalizado incompleto o con inicio > fin) no lanza petición.
- Rango personalizado: dos `<input type="date">` con validación local (obligatorias, inicio ≤ fin); el backend valida además el máximo de puntos (422).
- Gráficos con ApexCharts (ya instalado): líneas (evolución), barras (por mes), donut (estados, con cantidad y porcentaje del backend). `period_start` se formatea en UTC para que el huso del navegador no mueva el día. Series sin datos y donut con total 0 muestran estado vacío; los errores permiten reintentar.
- Las etiquetas de estado se traducen con i18n (`dashboard.status.*`).

## Límites

- `last_6_months` es una decisión provisional del backend (6 meses calendario hasta el actual).
- Sin pruebas automatizadas (el proyecto no tiene test runner).
- Un usuario sin `dashboard.read` que inicia sesión aterriza en `/` y ve "Acceso denegado", porque la redirección tras el login va a `/`.
