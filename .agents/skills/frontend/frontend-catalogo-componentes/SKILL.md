---
name: frontend-catalogo-componentes
description: Descubre, inspecciona, cataloga y reutiliza los componentes y recursos existentes del frontend mediante un inventario estructural y lectura selectiva del código, evitando duplicaciones y consumo innecesario de contexto.
---

# Skill: Catálogo de componentes del Frontend

## 1. Objetivo

Establecer un procedimiento para descubrir, inspeccionar, catalogar y reutilizar los recursos existentes en el frontend antes de crear nuevos componentes o funcionalidades.

El agente debe conocer la estructura general del proyecto y localizar los recursos relevantes sin necesidad de leer indiscriminadamente todos los archivos.

Esta skill busca:

- Identificar los componentes existentes.
- Descubrir las funcionalidades que ofrece la plantilla.
- Localizar componentes compartidos y específicos.
- Identificar hooks, contextos, layouts, páginas y utilidades.
- Evitar componentes duplicados.
- Favorecer la reutilización de los recursos existentes.
- Mantener un catálogo útil de los recursos disponibles.
- Reducir el consumo de contexto mediante inspección selectiva.
- Facilitar el descubrimiento mediante nombres descriptivos y estructuras coherentes.

## 2. Principios generales

- Inspeccionar el proyecto real antes de crear componentes.
- Utilizar el inventario estructural como punto de partida.
- Leer únicamente los archivos relevantes para la funcionalidad.
- No asumir que un componente no existe porque se desconoce su ubicación.
- Reutilizar primero los recursos disponibles.
- No duplicar componentes compartidos.
- No modificar componentes existentes sin justificarlo.
- No reorganizar la plantilla original para construir el catálogo.
- Mantener diferenciados los componentes globales y los componentes propios de cada módulo funcional.
- Utilizar herramientas y dependencias que ya estén disponibles.
- No exigir Python ni instalaciones adicionales para generar el inventario.
- No crear abstracciones innecesarias.
- Considerar el código fuente como referencia definitiva del comportamiento de cada recurso.

## 3. Descubrimiento estructural del proyecto

Antes de implementar una nueva funcionalidad, el agente debe obtener una visión general de la estructura del frontend.

Para ello debe utilizar el script:

`frontend\scripts\project-inventory.mjs`

Este script permite generar un inventario estructural y localizar candidatos a componentes React.

### 3.1. Ejecución

Desde la raíz del frontend, donde se encuentra `package.json`, ejecutar:

```bash
node scripts/project-inventory.mjs
```

El script utiliza Node.js y módulos nativos, por lo que no requiere instalar dependencias adicionales.

Si el proyecto no dispone de Node.js o no permite ejecutar el script, el agente debe utilizar las herramientas de terminal disponibles para obtener una estructura equivalente.

No debe detener una tarea únicamente porque el script no esté disponible.

### 3.2. Información obtenida

El inventario debe ayudar a identificar:

- Estructura de directorios.
- Archivos del proyecto.
- Componentes React candidatos.
- Páginas existentes.
- Layouts.
- Hooks personalizados.
- Contextos y providers.
- Servicios.
- Utilidades.
- Tipos e interfaces.
- Organización de los módulos funcionales.

El inventario es una herramienta de descubrimiento, no sustituye la inspección del código fuente.

### 3.3. Exclusión de directorios

Durante la generación del inventario se deben excluir directorios que no aportan información relevante para descubrir la arquitectura del código.

Ejemplos:

- `node_modules`
- `.git`
- `.venv`
- `venv`
- `dist`
- `build`
- `coverage`
- `.next`
- `.turbo`
- `__pycache__`
- `.idea`
- `.vscode`

Las exclusiones pueden ajustarse según las características del proyecto.

No se deben excluir directorios que contengan código fuente propio de la aplicación.

## 4. Descubrimiento e inspección selectiva

El agente debe utilizar el inventario estructural como punto de partida para determinar qué archivos necesita inspeccionar.

El objetivo es obtener el contexto necesario para implementar una funcionalidad sin leer indiscriminadamente todo el código fuente.

### 4.1. Identificación por nombres y estructura

El agente debe analizar:

- Nombres de directorios.
- Nombres de archivos.
- Ubicación de los recursos.
- Extensiones.
- Convenciones de nomenclatura.
- Exportaciones detectadas.
- Relación estructural entre directorios.

Estos elementos permiten formular hipótesis sobre la responsabilidad de cada archivo y localizar candidatos relevantes.

Por ejemplo, si necesita implementar la gestión de citas, puede identificar inicialmente:

```text
components/
├── ui/
│   ├── table.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── shared/
│   └── page-breadcrumb.tsx
└── layout/
    └── app-layout/

pages/
└── main/
    └── calendar/

modules/
└── appointments/
```

A partir de esta información debe seleccionar los archivos que probablemente necesita.

**Importante:** los nombres y las ubicaciones permiten identificar candidatos, pero no garantizan el comportamiento real del recurso. El agente debe inspeccionar el código de los archivos seleccionados antes de utilizarlos.

### 4.2. Lectura bajo demanda

La inspección debe realizarse progresivamente:

1. Obtener el inventario general.
2. Identificar los recursos relacionados con la funcionalidad solicitada.
3. Seleccionar los archivos potencialmente necesarios.
4. Leer sus implementaciones.
5. Inspeccionar dependencias adicionales únicamente cuando sean relevantes.
6. Detener la exploración cuando exista suficiente contexto para implementar correctamente.

No se deben recorrer todos los componentes, páginas y módulos para construir un contexto innecesario.

### 4.3. Inspección progresiva de dependencias

Si un componente seleccionado importa otros componentes, hooks o utilidades, el agente debe evaluar si necesita inspeccionarlos.

Debe leer una dependencia cuando:

- Su comportamiento afecta directamente a la implementación.
- Necesita conocer sus props o tipos.
- Su utilización no resulta clara.
- Puede introducir restricciones o efectos secundarios.
- Es necesario verificar cómo debe integrarse.

No es necesario inspeccionar recursivamente todas las dependencias de un componente.

### 4.4. Criterio de suficiencia de contexto

El agente puede detener la exploración cuando conozca:

- Qué componentes existentes puede reutilizar.
- Qué props y tipos necesita.
- Qué dependencias son relevantes.
- Dónde debe implementar los nuevos recursos.
- Qué convenciones debe respetar.
- Qué limitaciones pueden afectar la implementación.

La prioridad es obtener contexto suficiente, no conocer exhaustivamente todo el proyecto.

## 5. Clasificación de los recursos

El agente debe distinguir las siguientes categorías:

| Categoría | Responsabilidad |
|---|---|
| `components/ui` | Elementos visuales reutilizables y primitivos de interfaz. |
| `components/shared` | Componentes compartidos por distintas partes de la aplicación. |
| `components/layout` | Estructura visual, navegación y distribución de páginas. |
| `pages` | Páginas y vistas existentes. |
| `hooks` | Hooks reutilizables. |
| `contexts` | Contextos y providers globales. |
| `services` | Servicios y comunicación con sistemas externos. |
| `utils` | Funciones auxiliares reutilizables. |
| `icons` | Iconografía del proyecto. |
| `modules` | Recursos específicos de las funcionalidades del sistema. |
| `types` | Tipos e interfaces compartidos o específicos. |

Esta clasificación es orientativa. Si el proyecto utiliza una organización diferente, el agente debe respetarla.

### 5.1. Recursos compartidos

Los recursos que pueden utilizarse en distintas funcionalidades deben permanecer en la estructura compartida existente.

Ejemplos:

- Botones.
- Inputs.
- Selectores.
- Modales.
- Tablas genéricas.
- Componentes de navegación.
- Elementos visuales reutilizables.
- Hooks globales.
- Utilidades generales.

No duplicar recursos globales dentro de los módulos funcionales.

### 5.2. Recursos específicos de módulos

Los componentes que pertenecen exclusivamente a una funcionalidad deben permanecer dentro del módulo correspondiente.

Ejemplos:

- Formulario específico de citas.
- Detalle de una cita.
- Selector especializado de procedimientos.
- Componentes particulares de pacientes.

No convertir automáticamente todos los componentes en recursos globales.

## 6. Convenciones de nomenclatura descriptiva

Los nombres de archivos, directorios, componentes, hooks y servicios deben facilitar el descubrimiento de responsabilidades mediante el inventario.

Se deben utilizar nombres descriptivos, específicos y coherentes con el dominio funcional.

### 6.1. Ejemplos

| Poco descriptivo | Descriptivo |
|---|---|
| `form.tsx` | `appointment-form.tsx` |
| `modal.tsx` | `appointment-detail-modal.tsx` |
| `table.tsx` | `patients-table.tsx` |
| `use-data.ts` | `use-appointments.ts` |
| `service.ts` | `appointment-api.ts` |
| `types.ts` | `appointment.types.ts` |
| `utils.ts` | `appointment.utils.ts` |

### 6.2. Reglas

- Utilizar nombres que expresen la responsabilidad del recurso.
- Evitar nombres excesivamente genéricos.
- Mantener una nomenclatura coherente dentro de cada módulo.
- Utilizar nombres relacionados con el dominio funcional.
- Evitar abreviaturas que dificulten identificar la finalidad del archivo.
- No introducir nombres excesivamente largos sin necesidad.
- Mantener coherencia entre el nombre del archivo y el componente exportado.
- Evitar que archivos diferentes tengan nombres ambiguos dentro de una misma responsabilidad.

### 6.3. Responsabilidad identificable

Un archivo debe tener una responsabilidad suficientemente clara para que otro desarrollador o agente pueda identificar su posible utilidad sin necesidad de abrirlo inmediatamente.

Ejemplo:

```text
modules/
└── appointments/
    ├── components/
    │   ├── appointment-form.tsx
    │   ├── appointment-detail.tsx
    │   ├── appointment-status-badge.tsx
    │   └── appointment-calendar.tsx
    ├── hooks/
    │   └── use-appointments.ts
    ├── services/
    │   └── appointment-api.ts
    └── types/
        └── appointment.types.ts
```

Esta convención facilita la búsqueda y selección de archivos durante la inspección del proyecto.

### 6.4. Responsabilidad de los cambios

Si durante una implementación se identifica que un nombre es ambiguo o dificulta el descubrimiento de un recurso, el agente puede proponer una mejora de nomenclatura.

No debe renombrar archivos existentes automáticamente cuando esto pueda afectar imports, rutas, referencias o integraciones.

Si el cambio está justificado y autorizado, debe actualizar todas las referencias afectadas.

## 7. Reglas de reutilización

Antes de crear un componente nuevo:

1. Buscar si existe un componente equivalente.
2. Inspeccionar su implementación.
3. Comprobar si permite cubrir la necesidad mediante sus props actuales.
4. Evaluar si puede ampliarse sin perjudicar sus usos existentes.
5. Determinar si su responsabilidad es global o específica de un módulo.

### 7.1. Componentes compartidos

Los componentes que pueden utilizarse en distintas funcionalidades deben permanecer en la estructura compartida existente.

No duplicar componentes globales dentro de módulos funcionales.

### 7.2. Componentes específicos de módulos

Los componentes que pertenecen exclusivamente a una funcionalidad deben permanecer dentro del módulo correspondiente.

No trasladar componentes específicos de una funcionalidad a la estructura compartida sin una justificación real de reutilización.

### 7.3. Ampliación de componentes existentes

Si un componente existente puede ampliarse para cubrir una necesidad nueva, evaluar primero esa alternativa.

Antes de modificarlo:

- Identificar dónde se utiliza.
- Revisar sus props.
- Evaluar el impacto del cambio.
- Evitar romper implementaciones existentes.
- Mantener compatibilidad cuando sea razonable.

No convertir un componente sencillo en una abstracción compleja únicamente para evitar crear otro componente.

## 8. Catálogo documental

El catálogo debe servir como índice para localizar recursos, no como sustituto del código fuente.

Si se necesita mantener documentación persistente, utilizar una ubicación coherente con la documentación existente, por ejemplo:

`docs/frontend/component-catalog.md`

El catálogo puede registrar:

- Nombre del recurso.
- Categoría.
- Ubicación.
- Responsabilidad.
- Descripción breve.
- Observaciones de reutilización.

No es necesario documentar exhaustivamente cada componente del proyecto.

Se debe priorizar la documentación de:

- Componentes compartidos importantes.
- Layouts principales.
- Hooks globales.
- Contextos y providers.
- Sistemas de formularios y tablas.
- Componentes complejos.
- Decisiones relevantes de reutilización.

No duplicar en el catálogo toda la implementación ni mantener información que pueda obtenerse fácilmente del código.

## 9. Actualización del inventario

El inventario generado por el script representa una fotografía de la estructura del proyecto en el momento de su ejecución.

El agente debe volver a generarlo cuando:

- Se incorpore una funcionalidad importante.
- Se agreguen nuevos módulos.
- Se creen componentes compartidos.
- Se modifique significativamente la estructura.
- Necesite localizar recursos que no aparecían en un inventario anterior.

No es necesario regenerarlo después de cada pequeño cambio de código.

El catálogo documental debe actualizarse cuando existan cambios relevantes en los recursos compartidos o en su organización.

## 10. Procedimiento de trabajo

Antes de implementar una nueva funcionalidad, seguir este procedimiento:

### Paso 1. Obtener la estructura

Ejecutar:

```bash
node scripts/project-inventory.mjs
```

Si el script no está disponible, obtener una estructura equivalente utilizando las herramientas disponibles.

### Paso 2. Identificar recursos relacionados

Localizar los componentes, páginas, layouts, hooks y utilidades que puedan intervenir.

### Paso 3. Seleccionar archivos

Utilizar los nombres, ubicaciones, categorías y exportaciones para determinar qué archivos son relevantes.

### Paso 4. Inspeccionar el código necesario

Leer únicamente los archivos seleccionados para comprender su comportamiento, props, dependencias y posibilidades de reutilización.

### Paso 5. Evaluar la reutilización

Determinar qué elementos existentes pueden utilizarse directamente, ampliarse o componerse.

### Paso 6. Determinar la ubicación

Aplicar las convenciones de `frontend-arquitectura` para decidir si el nuevo recurso pertenece a la estructura compartida o a un módulo funcional.

### Paso 7. Implementar

Crear únicamente los componentes y recursos que realmente sean necesarios.

### Paso 8. Verificar

Comprobar que los cambios no rompan los usos existentes de los componentes compartidos.

### Paso 9. Documentar

Actualizar el catálogo cuando se incorporen recursos compartidos importantes o se produzcan cambios relevantes.

## 11. Optimización del contexto

El agente debe priorizar la información de mayor utilidad para la tarea actual.

Orden recomendado:

1. Inventario estructural general.
2. Archivos directamente relacionados con la funcionalidad.
3. Tipos, props e interfaces de los componentes seleccionados.
4. Dependencias relevantes.
5. Implementaciones adicionales solo cuando sean necesarias.

No debe:

- Leer indiscriminadamente todos los archivos del proyecto.
- Abrir todos los archivos de un módulo por defecto.
- Leer componentes que no intervienen en la funcionalidad.
- Inspeccionar dependencias que no afectan a la implementación.
- Recorrer recursivamente todas las importaciones sin justificación.
- Volver a leer archivos cuyo contenido ya está disponible y sigue vigente.
- Generar documentación extensa sin una necesidad concreta.

El inventario permite descubrir; la lectura selectiva permite comprender; el código fuente sigue siendo la referencia definitiva.

## 12. Relación con otras skills

Esta skill trabaja conjuntamente con:

### frontend-arquitectura

Determina dónde ubicar los recursos, cómo organizar los módulos y qué responsabilidades corresponden a cada elemento.

### frontend-integracion-api

Determina cómo implementar la comunicación con el backend, consultar los contratos HTTP y consumir los endpoints.

Cada skill mantiene su propia responsabilidad.

Esta skill identifica y ayuda a reutilizar los recursos existentes, pero no sustituye las decisiones arquitectónicas ni define la integración con el backend.

## 13. Restricciones

El agente NO debe:

- Leer indiscriminadamente todos los archivos del proyecto para conocer su estructura.
- Crear componentes sin buscar primero alternativas existentes.
- Duplicar componentes globales.
- Mover componentes de la plantilla sin justificación.
- Convertir todos los componentes en módulos funcionales.
- Crear directorios vacíos.
- Crear abstracciones innecesarias.
- Confiar únicamente en el nombre de un archivo para determinar su comportamiento.
- Considerar el inventario automático como sustituto de la inspección del código.
- Mantener documentación duplicada o desactualizada.
- Exigir Python o dependencias adicionales para ejecutar el inventario.
- Renombrar recursos existentes sin evaluar el impacto de los cambios.

## 14. Criterio final

El agente debe conocer primero qué recursos existen, localizar los elementos relacionados con la funcionalidad que va a implementar y estudiar únicamente el código necesario.

La prioridad es reutilizar correctamente la plantilla existente, mantener una estructura coherente y evitar duplicaciones, sin introducir complejidad ni reorganizaciones innecesarias.

**Principio fundamental: inventario global, identificación mediante nomenclatura descriptiva e inspección selectiva del código bajo demanda.**