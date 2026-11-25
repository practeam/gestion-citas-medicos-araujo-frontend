# SPEC: Corrección de errores de formato de fecha y zona horaria en Schedule Exceptions y Schedule Overrides

## 1. Descripción del problema

Actualmente, el frontend presenta un error en dos módulos relacionados con la gestión de excepciones y modificaciones de horarios.

Ambos módulos presentan el mismo problema al intentar formatear fechas y horas mediante `Intl.DateTimeFormat`.

### 1.1. Módulo Schedule Exceptions

**Ubicación:**

```text
frontend/src/modules/schedule-exceptions/
```

**Error reportado:**

```text
Uncaught TypeError: Invalid option : option
    at new DateTimeFormat (<anonymous>)
    at formatDateTimeWithZone (schedule-exception-datetime.utils.ts:40:10)
    at t17 (schedule-exceptions-table.tsx:94:18)
    at Array.map (<anonymous>)
    at ScheduleExceptionsTable (schedule-exceptions-table.tsx:65:22)
    at Object.react_stack_bottom_frame (react-dom-client.development.js:25904:20)
```

### 1.2. Módulo Schedule Overrides

**Ubicación:**

```text
frontend/src/modules/schedule-overrides/
```

**Error reportado:**

```text
Uncaught TypeError: Invalid option : option
    at new DateTimeFormat (<anonymous>)
    at formatDateTimeWithZone (schedule-override-datetime.utils.ts:40:10)
    at t17 (schedule-overrides-table.tsx:89:18)
    at Array.map (<anonymous>)
    at ScheduleOverridesTable (schedule-overrides-table.tsx:70:21)
    at Object.react_stack_bottom_frame (react-dom-client.development.js:25904:20)
```

## 2. Objetivo

Identificar y corregir la causa raíz del error `Invalid option : option` en ambos módulos.

La solución debe garantizar que:

- Las tablas puedan renderizarse correctamente.
- Las fechas se visualicen sin errores.
- Las horas respeten la zona horaria correspondiente.
- Los datos recibidos desde el backend se procesen correctamente.
- Los valores nulos o inválidos tengan un tratamiento controlado.
- Ambos módulos mantengan un comportamiento consistente.
- No se introduzcan regresiones en otras funcionalidades.

## 3. Investigación del problema

Antes de modificar el código, inspeccionar las implementaciones reales de ambos módulos.

### 3.1. Schedule Exceptions

Revisar especialmente:

```text
schedule-exception-datetime.utils.ts
schedule-exceptions-table.tsx
```

### 3.2. Schedule Overrides

Revisar especialmente:

```text
schedule-override-datetime.utils.ts
schedule-overrides-table.tsx
```

Localizar los archivos en sus rutas reales, aunque su organización interna sea diferente.

### 3.3. Aspectos que deben analizarse

1. Implementación de `formatDateTimeWithZone`.
2. Configuración enviada a `Intl.DateTimeFormat`.
3. Construcción del objeto de opciones de internacionalización.
4. Valores recibidos para la zona horaria.
5. Formatos de fechas recibidos desde el backend.
6. Transformaciones realizadas antes de mostrar las fechas.
7. Datos utilizados por las tablas mediante `.map()`.
8. Posibles diferencias entre las implementaciones de ambos módulos.
9. Existencia de utilidades compartidas que puedan reutilizarse.

## 4. Posible causa raíz

El mensaje:

```text
Uncaught TypeError: Invalid option : option
```

indica que `Intl.DateTimeFormat` está recibiendo una opción no reconocida.

Investigar especialmente si se está enviando una estructura incorrecta.

Ejemplo de una configuración incorrecta:

```typescript
new Intl.DateTimeFormat("es-PE", {
  timeZone: timezone,
  option: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
});
```

La propiedad `option` no es una opción válida de `Intl.DateTimeFormat`.

Una configuración válida tendría esta estructura:

```typescript
new Intl.DateTimeFormat("es-PE", {
  timeZone: timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
```

**IMPORTANTE:** Este ejemplo es únicamente una hipótesis para orientar la investigación. Debes identificar la implementación real y determinar la causa exacta antes de corregirla.

No asumir que el problema está necesariamente en esa propiedad.

## 5. Requerimientos de corrección

### 5.1. Corregir `formatDateTimeWithZone`

Revisar y corregir la función en ambos módulos.

La implementación debe:

- Utilizar correctamente `Intl.DateTimeFormat`.
- Recibir y procesar fechas válidas.
- Recibir y procesar zonas horarias válidas.
- Evitar opciones de internacionalización incorrectas.
- Mantener el formato actual esperado por la interfaz.
- Respetar las zonas horarias correspondientes.
- Manejar valores nulos o indefinidos.
- Evitar que un dato inválido rompa el renderizado completo de la tabla.

### 5.2. Validación de zonas horarias

Contemplar:

- `America/Lima`.
- Zona horaria nula.
- Zona horaria indefinida.
- Cadena vacía.
- Identificador de zona horaria inválido.

Cuando la zona horaria no sea válida, utilizar un fallback seguro y coherente con la configuración existente del proyecto.

No eliminar la conversión de zonas horarias para ocultar el problema.

### 5.3. Validación de fechas

Contemplar:

- Fechas válidas.
- Valores `null`.
- Valores `undefined`.
- Cadenas vacías.
- Fechas inválidas.
- Fechas ISO con indicador UTC (`Z`).
- Fechas ISO con desplazamiento horario explícito.

El tratamiento de valores inválidos debe ser consistente con el diseño actual de la interfaz.

### 5.4. Consistencia entre módulos

Comparar ambas implementaciones.

Si las funciones tienen exactamente la misma responsabilidad, evaluar si corresponde reutilizar una utilidad compartida.

No realizar refactorizaciones innecesarias ni crear nuevas abstracciones sin justificación.

### 5.5. Renderizado de las tablas

Verificar las llamadas a `formatDateTimeWithZone` en ambos componentes.

Garantizar que:

- Los registros válidos se visualicen correctamente.
- Los valores faltantes tengan una representación adecuada.
- Un registro con una fecha inválida no provoque que toda la tabla deje de renderizarse.
- No se oculten errores reales mediante bloques `try/catch` indiscriminados.

## 6. Consulta de Skills del proyecto

Durante la resolución de esta tarea, debes apoyarte en las Skills existentes del proyecto cuando sea necesario.

**Directorio de Skills:**

```text
C:\Users\braya\OneDrive - unc.edu.pe\TESIS\implementacion\frontend_gestion_citas\.agents\skills\
```

Consultar las Skills correspondientes según las necesidades de implementación.

### 6.1. Arquitectura frontend

Cuando necesites:

- Crear archivos nuevos.
- Modificar la estructura de un módulo.
- Reutilizar componentes o utilidades.
- Crear hooks, servicios o componentes.
- Definir responsabilidades entre capas.
- Introducir abstracciones.
- Determinar dónde debe ubicarse una implementación.

Consultar:

```text
.agents/skills/frontend/frontend-arquitectura
```

Respetar las convenciones de estructura, nomenclatura, organización y responsabilidades establecidas por esta Skill.

### 6.2. Integración con el backend

Cuando necesites:

- Revisar los endpoints utilizados.
- Analizar las respuestas del backend.
- Verificar los tipos de datos.
- Comprobar formatos de fechas.
- Revisar campos de zonas horarias.
- Modificar o comprender la integración API.

Consultar:

```text
.agents/skills/frontend/frontend-integracion-api
```

Leer también los archivos de referencia indicados por esta Skill y consultar la documentación OpenAPI a la que haga referencia.

### 6.3. Schemas y contratos

Este proyecto utiliza Schemas en su arquitectura frontend, no DTO.

Por tanto:

- Respetar los Schemas existentes.
- No introducir estructuras DTO innecesarias.
- No inventar propiedades.
- No modificar contratos sin justificación.
- Verificar los tipos de datos contra OpenAPI.
- Mantener las convenciones actuales de validación y transformación.

### 6.4. Otras necesidades

Si durante la implementación necesitas documentar, crear pruebas, modificar componentes o trabajar con otras áreas del frontend, identificar y consultar las Skills correspondientes antes de implementar.

**Regla general:** No asumir cómo funciona la arquitectura del proyecto. Las Skills son la referencia para determinar cómo realizar correctamente cada tarea.

No es necesario consultar todas las Skills indiscriminadamente; consulta las pertinentes según el trabajo que realmente necesites realizar.

## 7. Restricciones

La solución debe cumplir las siguientes restricciones:

1. No modificar endpoints existentes sin justificación.
2. No inventar estructuras de respuestas del backend.
3. No alterar los Schemas para ocultar el problema.
4. No introducir DTO.
5. No modificar la lógica de negocio de Schedule Exceptions.
6. No modificar la lógica de negocio de Schedule Overrides.
7. No eliminar campos de fecha ni de zona horaria.
8. No reemplazar fechas originales por fechas generadas artificialmente.
9. No eliminar funcionalidades existentes.
10. No realizar refactorizaciones ajenas al problema.
11. No crear archivos sin respetar la Skill de arquitectura.
12. Mantener las convenciones actuales del frontend.

## 8. Pruebas y validaciones

### 8.1. Schedule Exceptions

- [ ] La tabla carga correctamente.
- [ ] Los registros se muestran correctamente.
- [ ] Las fechas se formatean correctamente.
- [ ] Las horas respetan la zona horaria.
- [ ] Los valores nulos no rompen el renderizado.
- [ ] Las fechas inválidas tienen un tratamiento controlado.
- [ ] No aparece `Invalid option : option`.

### 8.2. Schedule Overrides

- [ ] La tabla carga correctamente.
- [ ] Los registros se muestran correctamente.
- [ ] Las fechas se formatean correctamente.
- [ ] Las horas respetan la zona horaria.
- [ ] Los valores nulos no rompen el renderizado.
- [ ] Las fechas inválidas tienen un tratamiento controlado.
- [ ] No aparece `Invalid option : option`.

### 8.3. Validación general

- [ ] Ejecutar los tests existentes.
- [ ] Agregar o actualizar pruebas unitarias de la utilidad de fechas.
- [ ] Verificar errores de TypeScript.
- [ ] Ejecutar la compilación del frontend.
- [ ] Comprobar que no existan regresiones.
- [ ] Verificar que la integración con el backend continúe funcionando.

### 8.4. Escenarios de pruebas unitarias

| Escenario | Entrada | Resultado esperado |
|---|---|---|
| Fecha válida | Fecha ISO + `America/Lima` | Fecha correctamente formateada |
| Zona horaria válida | `America/Lima` | Formato correcto |
| Zona horaria inválida | Identificador inexistente | Fallback seguro |
| Fecha nula | `null` | Resultado controlado |
| Fecha indefinida | `undefined` | Resultado controlado |
| Fecha inválida | Cadena incorrecta | Resultado controlado |
| Fecha UTC | Fecha ISO con `Z` | Conversión correcta |
| Fecha con offset | Fecha ISO con desplazamiento | Conversión correcta |

## 9. Criterios de aceptación

La tarea se considerará completada cuando:

1. Se haya identificado la causa raíz.
2. Se haya corregido Schedule Exceptions.
3. Se haya corregido Schedule Overrides.
4. Ambas tablas rendericen correctamente.
5. Las fechas y horas respeten las zonas horarias correspondientes.
6. No existan errores de `Intl.DateTimeFormat`.
7. Se mantengan los Schemas y contratos existentes.
8. Se respeten las convenciones arquitectónicas del proyecto.
9. La compilación del frontend sea exitosa.
10. Las pruebas correspondientes se hayan ejecutado correctamente.

## 10. Informe final obligatorio

Al terminar, presentar un resumen técnico que incluya:

### Causa raíz
Explicar exactamente qué provocaba el error.

### Archivos modificados
Enumerar los archivos afectados y justificar cada modificación.

### Solución aplicada
Explicar qué se corrigió en cada módulo.

### Skills consultadas
Indicar qué Skills fueron necesarias y por qué.

### Validaciones
Indicar qué pruebas y compilaciones se ejecutaron y sus resultados reales.

### Pendientes
Informar cualquier problema que no haya podido resolverse.

No afirmar que una prueba fue exitosa si no se ejecutó.

## 11. Instrucción final

Analiza el código real del repositorio antes de implementar cualquier cambio.

El problema debe solucionarse en ambos módulos:

```text
frontend/src/modules/schedule-exceptions/
frontend/src/modules/schedule-overrides/
```

Prioriza una solución limpia, mantenible y coherente con la arquitectura actual.

Apóyate en las Skills del proyecto cuando necesites comprender la arquitectura, crear archivos, documentar, implementar componentes o integrar funcionalidades con el backend.

No inventes archivos, funciones, endpoints ni estructuras.

No modifiques funcionalidades ajenas al problema.

**El objetivo no es simplemente eliminar el error de consola, sino corregir su causa raíz y garantizar que ambos módulos funcionen correctamente sin afectar el resto del sistema.**