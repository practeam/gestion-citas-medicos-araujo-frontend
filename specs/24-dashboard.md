# SPEC — Implementación Frontend del Dashboard Odontológico

## 1. Objetivo

Implementar el módulo Dashboard del sistema de gestión odontológica, permitiendo visualizar rápidamente el estado general de la clínica mediante indicadores principales, gráficos estadísticos y filtros temporales.

La implementación debe realizarse exclusivamente en el frontend, consumiendo los endpoints disponibles en el backend y respetando estrictamente los contratos existentes.

El Dashboard debe integrarse con la arquitectura actual del proyecto, reutilizando schemas, tipos, servicios, hooks, queries, componentes y utilidades de los demás módulos cuando corresponda.

**No se debe modificar el backend ni inventar contratos para satisfacer necesidades del frontend.**

---

## 2. Revisión obligatoria antes de implementar

Antes de escribir código, es obligatorio analizar la arquitectura del proyecto y leer las skills correspondientes.

### 2.1. Skill de integración API

Ruta:

```text
C:\Users\braya\OneDrive - unc.edu.pe\TESIS\implementacion\frontend_gestion_citas\.agents\skills\frontend\frontend-integracion-api
```

Archivo prioritario:

```text
C:\Users\braya\OneDrive - unc.edu.pe\TESIS\implementacion\frontend_gestion_citas\.agents\skills\frontend\frontend-integracion-api\references\openapi.json
```

Este archivo constituye la fuente de verdad para la integración frontend-backend.

Se debe revisar completamente para identificar:

- Endpoints disponibles.
- Métodos HTTP.
- Parámetros de consulta.
- Parámetros de ruta.
- Schemas de entrada.
- Estructuras de respuesta.
- Tipos de datos.
- Códigos de respuesta.
- Requisitos de autenticación.
- Posibles endpoints relacionados con estadísticas.
- Endpoints existentes de pacientes y citas que puedan reutilizarse.

No asumir que existen endpoints específicos para estadísticas. Primero verificar los contratos disponibles.

### 2.2. Skill del catálogo de componentes

Ruta:

```text
C:\Users\braya\OneDrive - unc.edu.pe\TESIS\implementacion\frontend_gestion_citas\.agents\skills\frontend\frontend-catalogo-componentes
```

Leer completamente las instrucciones y referencias disponibles.

Esta skill establece los componentes disponibles para construir la interfaz.

Reglas obligatorias:

- Revisar el catálogo antes de crear componentes nuevos.
- Priorizar la reutilización de componentes existentes.
- Respetar sus propiedades, variantes y convenciones de uso.
- No duplicar componentes disponibles en el catálogo.
- No implementar componentes visuales personalizados cuando exista uno adecuado.
- Si un componente requerido no existe, seguir las convenciones arquitectónicas del proyecto para implementarlo.

### 2.3. Otras skills

Identificar y leer las demás skills frontend relacionadas con:

- Arquitectura del proyecto.
- Organización de módulos.
- Integración API.
- Gestión de schemas y tipos.
- Servicios y hooks.
- Gestión de estado.
- Manejo de formularios.
- Sistema de diseño.
- Componentes.
- Gráficos y visualización de datos.
- Testing.
- Documentación.

No limitarse únicamente a los nombres mencionados. Revisar las instrucciones de las skills disponibles y sus referencias relevantes.

### 2.4. Análisis de la arquitectura existente

Revisar especialmente los módulos de:

- Pacientes.
- Citas.
- Autenticación.
- Autorización y permisos.

Identificar cómo están implementados:

- Las páginas.
- Los servicios.
- Los hooks.
- Las queries.
- Los schemas.
- Los componentes.
- Los filtros.
- La gestión de fechas.
- La navegación.
- Los permisos de acceso.

El Dashboard debe seguir los mismos patrones establecidos en el proyecto.

---

## 3. Reglas obligatorias de integración

La integración debe respetar estrictamente los contratos existentes.

- No inventar endpoints.
- No inventar parámetros.
- No inventar estructuras de respuesta.
- No asumir propiedades que no existan en los schemas.
- No modificar los contratos OpenAPI.
- No implementar funcionalidades backend.
- No duplicar servicios ni hooks existentes.
- No crear schemas innecesarios.
- No utilizar datos simulados para representar información real.
- No calcular estadísticas globales utilizando listados paginados.
- No realizar múltiples solicitudes innecesarias para obtener la misma información.
- Reutilizar servicios, schemas, queries y utilidades de otros módulos cuando corresponda.

Si algún indicador o gráfico no puede construirse con los contratos disponibles, documentar la limitación y no inventar una solución.

El frontend debe adaptarse al backend existente.

---

## 4. Estructura general del Dashboard

Implementar una página de Dashboard que contenga:

1. Encabezado del módulo.
2. Selector de periodo.
3. Cuatro cards de indicadores principales.
4. Cinco gráficos estadísticos.
5. Estados de carga, error y ausencia de información.

### 4.1. Encabezado

Mostrar:

- Título: `Dashboard`.
- Descripción: `Resumen general de la actividad de la clínica`.
- Selector de periodo.

Mantener la identidad visual y las convenciones de diseño utilizadas en los demás módulos.

---

## 5. Cards principales

Implementar cuatro cards superiores.

### 5.1. Card: Total de pacientes

Mostrar la cantidad total de pacientes registrados.

Regla conceptual:

- Contabilizar pacientes existentes hasta la fecha final del periodo seleccionado.
- Fuente conceptual: `patient`.

### 5.2. Card: Nuevos pacientes

Mostrar la cantidad de pacientes registrados durante el periodo seleccionado.

Fuente conceptual:

- `patient.registered_at`.

### 5.3. Card: Total de citas

Mostrar la cantidad total de citas programadas dentro del periodo seleccionado.

Reglas:

- Considerar todos los estados de citas.
- Utilizar la fecha de inicio de la cita.

Fuente conceptual:

- `appointment.starts_at`.

### 5.4. Card: Citas de hoy

Mostrar la cantidad de citas correspondientes al día actual de la clínica.

Reglas:

- Considerar todos los estados.
- Determinar el día actual respetando la zona horaria de la clínica.
- Este indicador conserva su significado de citas del día actual, independientemente del periodo seleccionado.

Fuente conceptual:

- `appointment.starts_at`.

### 5.5. Consideraciones

- Los valores deben provenir de datos reales del backend.
- No calcular cantidades globales a partir de listados paginados.
- No utilizar valores hardcodeados.
- Actualizar los indicadores cuando cambie el periodo, respetando las particularidades de cada métrica.
- No mostrar valores de un periodo anterior como si correspondieran al nuevo filtro.

---

## 6. Gráficos estadísticos

Implementar cinco gráficos.

Utilizar la biblioteca de gráficos existente en el proyecto. Antes de instalar cualquier dependencia, revisar las dependencias actuales y las skills disponibles.

### 6.1. Gráfico: Evolución de citas

Tipo: gráfico de líneas.

Mostrar la cantidad de citas a lo largo del periodo seleccionado.

Fuente conceptual:

- `appointment.starts_at`.

Características:

- Agrupación temporal según el rango seleccionado.
- Mostrar la evolución de citas.
- Mantener continuidad temporal cuando los datos del backend lo permitan.
- Mostrar periodos vacíos con cero cuando corresponda.

### 6.2. Gráfico: Evolución de pacientes

Tipo: gráfico de líneas.

Mostrar la cantidad de nuevos pacientes registrados durante el periodo.

Fuente conceptual:

- `patient.registered_at`.

Características:

- Agrupación temporal según el rango seleccionado.
- Mostrar la evolución de nuevos registros.
- Mantener continuidad temporal cuando los datos lo permitan.

### 6.3. Gráfico: Citas por estado

Tipo: gráfico circular o Doughnut.

Mostrar la distribución de citas según su estado.

Estados:

| Estado | Etiqueta |
|---|---|
| `pending` | Pendiente |
| `confirmed` | Confirmada |
| `completed` | Completada |
| `cancelled` | Cancelada |

Fuente conceptual:

- `appointment.status`.

Características:

- Considerar únicamente las citas del periodo seleccionado.
- Mostrar cantidades.
- Mostrar porcentajes cuando la información disponible lo permita.
- Mantener colores y etiquetas consistentes.
- Evitar representar estados inexistentes como cantidades ficticias.

### 6.4. Gráfico: Pacientes registrados por mes

Tipo: gráfico de barras.

Mostrar la cantidad de nuevos pacientes registrados por mes.

Fuente conceptual:

- `patient.registered_at`.

Características:

- Visualizar la evolución mensual de registros.
- Mostrar etiquetas temporales legibles.
- Representar meses sin registros con cero cuando corresponda.

### 6.5. Gráfico: Citas por mes

Tipo: gráfico de barras.

Mostrar la cantidad de citas por mes.

Fuente conceptual:

- `appointment.starts_at`.

Características:

- Incluir todos los estados.
- Visualizar la evolución mensual de citas.
- Representar meses sin registros con cero cuando corresponda.

### 6.6. Consideraciones generales

Todos los gráficos deben:

- Utilizar datos reales del backend.
- Adaptar las respuestas a la estructura requerida por la biblioteca de gráficos.
- Mostrar tooltips informativos.
- Utilizar leyendas cuando aporten valor.
- Mantener consistencia visual.
- Ser responsive.
- Evitar gráficos saturados.
- Manejar correctamente los valores cero.
- No inventar datos cuando el backend no proporcione información suficiente.

Las transformaciones necesarias deben realizarse mediante adaptadores tipados y reutilizables cuando corresponda.

---

## 7. Filtros temporales

Implementar un selector de periodo con las siguientes opciones:

1. Mes actual.
2. Últimos 30 días.
3. Últimos 6 meses.
4. Año actual.
5. Rango personalizado.

### 7.1. Mes actual

Seleccionar el periodo correspondiente al mes calendario actual de la clínica.

### 7.2. Últimos 30 días

Seleccionar los últimos 30 días conforme a las reglas de fechas y zona horaria establecidas por el sistema.

### 7.3. Últimos 6 meses

Seleccionar los seis meses anteriores conforme a las reglas temporales del sistema.

### 7.4. Año actual

Seleccionar desde el inicio del año calendario hasta la fecha actual de la clínica.

### 7.5. Rango personalizado

Permitir seleccionar:

- Fecha inicial.
- Fecha final.

Validaciones:

- La fecha inicial no puede ser posterior a la fecha final.
- No permitir rangos inválidos.
- Utilizar el formato de fecha definido por los contratos de API.
- Respetar la zona horaria de la clínica.

### 7.6. Comportamiento del selector

Cuando cambie el periodo:

- Actualizar las cuatro cards.
- Actualizar los cinco gráficos.
- Enviar los parámetros correspondientes a los endpoints existentes.
- Evitar solicitudes duplicadas.
- Evitar mostrar información desactualizada.
- Mantener sincronizados los filtros y los resultados.
- Aprovechar la estrategia de caché existente.

No asumir nombres de parámetros como `start_date`, `end_date`, `from` o `to`. Utilizar exclusivamente los definidos en OpenAPI.

---

## 8. Integración con el backend

### 8.1. Mapeo de información

Antes de implementar, identificar cómo obtener cada indicador y gráfico.

| Componente | Información requerida | Fuente conceptual |
|---|---|---|
| Total de pacientes | Conteo acumulado hasta la fecha final | Pacientes |
| Nuevos pacientes | Conteo de registros del periodo | Pacientes |
| Total de citas | Conteo de citas del periodo | Citas |
| Citas de hoy | Conteo de citas del día actual | Citas |
| Evolución de citas | Serie temporal de citas | Citas |
| Evolución de pacientes | Serie temporal de registros | Pacientes |
| Citas por estado | Distribución por estado | Citas |
| Pacientes por mes | Agregación mensual | Pacientes |
| Citas por mes | Agregación mensual | Citas |

Esta tabla define necesidades funcionales, no endpoints.

Los endpoints concretos deben identificarse exclusivamente en el archivo OpenAPI.

### 8.2. Reutilización

- Reutilizar servicios de pacientes y citas.
- Reutilizar schemas y tipos existentes.
- Reutilizar hooks de consultas.
- Reutilizar clientes HTTP.
- Reutilizar mecanismos de autenticación.
- Reutilizar utilidades de fechas.
- Reutilizar componentes del catálogo.
- Crear adaptadores únicamente cuando sean necesarios.

### 8.3. Manejo de consultas

- Evitar solicitudes innecesarias.
- Aprovechar la caché existente.
- Evitar peticiones duplicadas.
- Evitar solicitar listados completos para calcular estadísticas.
- No reconstruir conteos globales mediante paginación.
- Evitar condiciones de carrera al cambiar rápidamente de periodo.
- Gestionar correctamente los errores de cada consulta.

### 8.4. Adaptación de respuestas

Si las respuestas existentes necesitan transformaciones para utilizarse en los gráficos:

- Crear adaptadores tipados.
- Mantener separados los datos originales y los datos transformados.
- Centralizar transformaciones reutilizables.
- Evitar conversiones innecesarias.
- No asumir propiedades inexistentes.
- Mantener el tipado estricto.

---

## 9. Diseño y experiencia de usuario

La interfaz debe mantener la identidad visual del sistema.

### 9.1. Cards

Cada card debe mostrar:

- Título.
- Valor principal.
- Icono representativo.
- Descripción breve cuando aporte contexto.

### 9.2. Gráficos

Cada gráfico debe incluir:

- Título.
- Descripción breve.
- Visualización.
- Leyenda cuando corresponda.
- Tooltip informativo.

### 9.3. Responsive

Adaptar la interfaz a:

- Escritorio.
- Tablet.
- Móvil.

Las cards y gráficos deben reorganizarse según el espacio disponible sin perder legibilidad.

### 9.4. Componentes

Utilizar obligatoriamente el catálogo existente:

```text
.agents/skills/frontend/frontend-catalogo-componentes
```

Priorizar los componentes disponibles para:

- Cards.
- Selectores.
- Date pickers.
- Gráficos, si están disponibles.
- Skeletons.
- Tooltips.
- Mensajes de error.
- Estados vacíos.
- Iconos.
- Contenedores y layouts.

No duplicar componentes existentes.

---

## 10. Estados de interfaz

### 10.1. Loading

- Mostrar skeletons o indicadores de carga.
- Evitar saltos visuales.
- No bloquear toda la página innecesariamente.
- Mantener una presentación consistente entre cards y gráficos.

### 10.2. Error

- Mostrar mensajes comprensibles.
- Permitir reintentar mediante los mecanismos existentes.
- Evitar presentar información desactualizada como actual.
- Gestionar errores individualmente cuando corresponda.

### 10.3. Sin información

- Mostrar estados vacíos adecuados.
- Representar correctamente los valores cero.
- No utilizar datos ficticios.
- Evitar gráficos visualmente confusos.

### 10.4. Actualización

Cuando cambie el periodo:

- Indicar visualmente que los datos están actualizándose.
- Evitar inconsistencias entre indicadores y gráficos.
- No mostrar resultados pertenecientes a otro periodo.

---

## 11. Seguridad y permisos

El módulo Dashboard tiene asociado obligatoriamente el permiso:

```text
dashboard.read
```

Este permiso controla el acceso al módulo completo.

### Reglas obligatorias

- Proteger la ruta del Dashboard mediante el mecanismo de autorización existente.
- Verificar exclusivamente el permiso `dashboard.read` para autorizar el acceso al módulo.
- Respetar la autenticación JWT.
- Integrarse con el sistema RBAC existente.
- No crear mecanismos de autorización paralelos.
- No asumir que disponer de permisos de pacientes o citas implica disponer de acceso al Dashboard.
- No mostrar el contenido del Dashboard a usuarios sin el permiso requerido.
- Aplicar el comportamiento establecido por el sistema ante usuarios no autorizados.
- Respetar el tratamiento existente de errores HTTP `401` y `403`.

### Restricción importante

No modificar la configuración global de permisos ni el sistema de autorización.

Utilizar las utilidades, guards, componentes o mecanismos existentes para comprobar permisos.

El permiso `dashboard.read` debe aplicarse tanto a la navegación como a la protección de la ruta, siguiendo los patrones establecidos en el proyecto.

---

## 12. Organización del código

Seguir estrictamente la arquitectura existente.

Antes de crear archivos, revisar la estructura actual de los módulos.

Identificar los patrones utilizados para:

- Páginas.
- Componentes.
- Hooks.
- Servicios.
- Queries.
- Schemas.
- Tipos.
- Adaptadores.
- Gestión de estado.
- Autorización.

El Dashboard debe mantener una separación adecuada entre:

- Página principal.
- Cards de indicadores.
- Componentes de gráficos.
- Selector de periodo.
- Hooks de consultas.
- Adaptadores de datos, cuando sean necesarios.

No crear carpetas, capas ni abstracciones innecesarias.

No duplicar implementaciones existentes.

---

## 13. Testing

Implementar pruebas utilizando las herramientas existentes en el proyecto.

### 13.1. Filtros

Verificar:

- Mes actual.
- Últimos 30 días.
- Últimos 6 meses.
- Año actual.
- Rango personalizado.
- Validación de fechas.
- Actualización de información al cambiar el periodo.

### 13.2. Cards

Verificar:

- Visualización correcta de cantidades.
- Valores cero.
- Respuestas vacías.
- Errores de API.
- Actualización según el periodo.

### 13.3. Gráficos

Verificar:

- Transformación correcta de datos.
- Distribución de estados.
- Series temporales.
- Periodos sin registros.
- Respuestas vacías.
- Datos incompletos.

### 13.4. Integración

Verificar:

- Uso correcto de endpoints.
- Parámetros conforme a OpenAPI.
- Manejo de errores HTTP.
- Autenticación.
- Autorización.
- Ausencia de solicitudes duplicadas.

### 13.5. Permisos

Verificar:

- Usuario con `dashboard.read`: acceso permitido.
- Usuario sin `dashboard.read`: acceso denegado.
- Usuario no autenticado: comportamiento establecido para `401`.
- Usuario autenticado sin autorización: comportamiento establecido para `403`.

---

## 14. Exclusiones

Todo lo no especificado queda fuera del MVP.

No implementar:

- Nuevos endpoints backend.
- Modificaciones de contratos OpenAPI.
- Nuevas funcionalidades de gestión de pacientes.
- Nuevas funcionalidades de gestión de citas.
- Exportación de estadísticas.
- Descarga de reportes.
- Comparaciones entre periodos.
- Predicciones.
- Inteligencia artificial.
- Indicadores adicionales.
- Gráficos adicionales.
- Filtros adicionales.
- Funcionalidades administrativas ajenas al Dashboard.

No modificar otros módulos fuera de lo estrictamente necesario para la integración.

---

## 15. Criterios de aceptación

### Documentación y arquitectura

- [ ] Se han leído las skills frontend relacionadas.
- [ ] Se ha leído completamente la skill `frontend-integracion-api`.
- [ ] Se ha revisado el archivo `openapi.json`.
- [ ] Se ha leído la skill `frontend-catalogo-componentes`.
- [ ] Se ha analizado la arquitectura existente.
- [ ] Se han identificado los endpoints reales.
- [ ] Se han identificado los schemas y estructuras de respuesta.
- [ ] Se han identificado los componentes reutilizables.

### Funcionalidad

- [ ] Se han implementado las cuatro cards.
- [ ] Se han implementado los cinco gráficos.
- [ ] Se han implementado los cinco filtros temporales.
- [ ] Funciona el rango personalizado.
- [ ] Todos los componentes se actualizan al cambiar el periodo.
- [ ] Los datos provienen de la API real.
- [ ] Se respetan las particularidades de cada indicador.

### Integración

- [ ] Se utilizan endpoints existentes.
- [ ] Se respetan los contratos OpenAPI.
- [ ] Se reutilizan servicios y hooks existentes.
- [ ] Se reutilizan schemas y tipos.
- [ ] No se utilizan listados paginados para reconstruir estadísticas globales.
- [ ] No existen solicitudes redundantes innecesarias.

### Seguridad

- [ ] La ruta está protegida.
- [ ] Se verifica el permiso `dashboard.read`.
- [ ] Se respeta JWT.
- [ ] Se respeta RBAC.
- [ ] Los usuarios sin permiso no pueden acceder.

### Interfaz

- [ ] Se reutilizan componentes del catálogo.
- [ ] Se implementan estados de carga.
- [ ] Se implementan estados de error.
- [ ] Se implementan estados vacíos.
- [ ] La interfaz es responsive.
- [ ] Se mantiene la identidad visual del sistema.

### Calidad

- [ ] Se implementan pruebas.
- [ ] Se verifica el tipado.
- [ ] No se duplican componentes ni servicios.
- [ ] No se modifican otros módulos innecesariamente.
- [ ] No se implementan funcionalidades fuera del MVP.

---

## 16. Instrucción final para el agente de implementación

**IMPORTANTE: No comenzar a programar directamente.**

Primero realizar un análisis completo del proyecto.

Orden obligatorio:

1. Leer las skills frontend relacionadas.
2. Leer completamente `frontend-integracion-api`.
3. Revisar obligatoriamente el archivo `references/openapi.json`.
4. Leer completamente `frontend-catalogo-componentes`.
5. Analizar los módulos de pacientes y citas.
6. Identificar endpoints, schemas, hooks y servicios reutilizables.
7. Identificar los componentes disponibles en el catálogo.
8. Verificar cómo se implementan actualmente los permisos y la protección de rutas.
9. Elaborar el mapeo entre los requisitos del Dashboard y los contratos existentes.
10. Implementar el Dashboard siguiendo esta SPEC.

**Prioridades absolutas:**

1. Respetar los contratos OpenAPI existentes.
2. Respetar la arquitectura frontend.
3. Reutilizar el catálogo de componentes.
4. Proteger el módulo mediante `dashboard.read`.
5. Evitar duplicaciones y funcionalidades innecesarias.
6. Mantener el alcance definido para el MVP.

Si durante el análisis se identifica que algún requisito no puede satisfacerse con los endpoints existentes, documentar exactamente qué información falta y continuar únicamente con las funcionalidades que sí puedan implementarse correctamente.

El resultado debe ser un Dashboard completamente integrado con el backend existente, consistente con el diseño del sistema y sin introducir cambios innecesarios en otros módulos.