---
name: frontend-arquitectura
description: Skill 01 del proyecto frontend (React + Vite + TypeScript). Define la arquitectura de referencia, la conservación de la estructura base de la plantilla, la incorporación progresiva de módulos funcionales, la organización interna de cada módulo, las responsabilidades de los componentes comunes, los servicios globales y específicos, la integración con la API, las reglas de dependencias y el procedimiento para cambios estructurales. Úsala SIEMPRE que se vaya a crear una funcionalidad, incorporar un módulo, crear o mover archivos o directorios, decidir dónde ubicar un componente, servicio, schema, tipo, hook, página, layout o utilidad, integrar una capacidad del backend o evaluar si una modificación respeta la arquitectura existente, aunque el usuario no mencione la palabra arquitectura. Se complementa con frontend-integracion-api (Skill 02), frontend-catalogo-componentes (Skill 03) y frontend-documentacion (Skill 04), si están disponibles.
---

# Skill 01: Arquitectura y diseño del frontend

## Relación con las demás skills del proyecto

Estas skills forman un conjunto para el mismo frontend y no deben contradecirse:

| Skill | Responsabilidad principal |
|---|---|
| Skill 01 — Arquitectura y diseño del frontend (esta skill) | Estructura general, conservación de la plantilla, organización de módulos, responsabilidades, dependencias y ubicación de archivos. |
| Skill 02 — Integración con la API | Cliente HTTP, contratos con FastAPI, servicios, DTO, autenticación, errores y comunicación con el backend. |
| Skill 03 — Catálogo de componentes y recursos | Inventario e identificación de componentes, layouts, hooks, contextos, iconos, utilidades y demás recursos existentes. |
| Skill 04 — Documentación técnica del frontend | Documentación arquitectónica, responsabilidades de módulos, convenciones y mantenimiento documental. |

Cuando una tarea afecte responsabilidades de otra skill, consultarla también.

Los nombres y números de las skills complementarias deberán ajustarse a los archivos que realmente existan en el repositorio. No asumir que una skill existe si todavía no ha sido creada.

---

# 1. Objetivo

Establecer las reglas arquitectónicas para desarrollar y ampliar el frontend del sistema de gestión de citas odontológicas utilizando React, Vite y TypeScript, respetando la plantilla existente y organizando las nuevas funcionalidades mediante módulos funcionales.

Esta arquitectura adopta una organización modular por dominio, con separación de responsabilidades inspirada en Clean Architecture, adaptada a las características de una aplicación frontend.

**La arquitectura existente de la plantilla es la base del proyecto. La incorporación de módulos no implica reemplazarla, reorganizarla ni trasladar indiscriminadamente sus directorios.**

La arquitectura debe permitir:

- Conservar los componentes, layouts, contextos, hooks, iconos, utilidades y páginas comunes existentes.
- Incorporar progresivamente los módulos funcionales del sistema.
- Centralizar dentro de cada módulo los elementos específicos de su funcionalidad.
- Compartir infraestructura y componentes verdaderamente globales.
- Mantener una separación clara entre presentación, operaciones, validación y comunicación con el backend.
- Evitar duplicaciones y dependencias innecesarias entre módulos.
- Mantener una correspondencia conceptual con los dominios del backend, sin obligar a replicar sus capas literalmente.

## 1.1. Aplicabilidad de la arquitectura

Antes de realizar cambios, el agente debe inspeccionar el repositorio y determinar si esta arquitectura es aplicable.

**Proyecto nuevo desde cero:**

Crear la estructura base definida por la plantilla o por las decisiones aprobadas del proyecto. Incorporar únicamente los directorios y archivos necesarios para la funcionalidad inicial.

**Proyecto existente basado en la plantilla actual:**

Conservar su organización, componentes y convenciones. Incorporar los módulos funcionales en los directorios correspondientes, sin reemplazar ni trasladar la estructura común.

**Proyecto existente con otra arquitectura:**

Identificar las diferencias y analizar su compatibilidad. No imponer esta estructura ni reorganizar el proyecto automáticamente.

**Proyecto con estructura parcialmente modular:**

Respetar la organización existente y utilizar esta skill para orientar nuevas funcionalidades. No migrar módulos antiguos únicamente para uniformarlos con un ejemplo.

Esta skill no autoriza por sí sola migraciones, eliminaciones, reemplazos de componentes ni cambios estructurales no solicitados.

## 1.2. Principio de conservación y extensión

El principio principal es:

**Conservar lo existente, reutilizar antes de crear y extender antes de reorganizar.**

La arquitectura debe evolucionar a partir de la plantilla real.

Por tanto:

- No reemplazar la estructura existente por una estructura idealizada.
- No mover `components/`, `contexts/`, `hooks/`, `icons/`, `i18n/`, `pages/` o `utils/` para adaptarlos a una arquitectura nueva.
- No trasladar todos los componentes existentes a `shared/`.
- No reemplazar el sistema de layouts, navegación, rutas o proveedores sin una necesidad demostrada.
- No duplicar componentes existentes.
- Incorporar `modules/` y otros directorios nuevos cuando corresponda.
- Mantener la compatibilidad con la configuración y las convenciones de la plantilla.
- Solicitar autorización antes de ejecutar una migración estructural que afecte archivos existentes.

---

# 2. Fuente de verdad

Antes de implementar cambios arquitectónicos, consultar la documentación y el código disponible.

Fuentes de referencia:

- `README.md`: información general, instalación, ejecución y características de la plantilla.
- `AGENTS.md`: instrucciones específicas del repositorio, si existe.
- `docs/architecture/frontend-architecture.md`: arquitectura general del frontend, si existe.
- `docs/architecture/module-responsibilities.md`: responsabilidades de los módulos, si existe.
- `docs/architecture/architecture-decisions.md`: decisiones arquitectónicas, si existe.
- `docs/frontend/component-catalog.md`: catálogo de componentes y recursos, si existe.
- `docs/modules/<modulo>.md`: documentación del módulo afectado, si existe.
- `docs/development/conventions.md`: convenciones de desarrollo, si existe.
- `package.json`: dependencias, scripts y herramientas instaladas.
- `tsconfig.json` y configuraciones relacionadas: reglas de TypeScript y resolución de módulos.
- `vite.config.ts`: configuración de Vite y alias.
- El código real de los componentes, páginas, layouts, hooks, contextos y servicios existentes.

La implementación real es la fuente de verdad sobre las APIs y capacidades de los componentes existentes. Un catálogo documental facilita su localización, pero no sustituye la inspección del código.

Si se detecta una contradicción entre la documentación y la implementación:

1. Identificar la discrepancia.
2. Comprobar qué comportamiento utiliza realmente la aplicación.
3. Evaluar si la documentación está desactualizada.
4. Justificar la solución.
5. Actualizar la documentación cuando corresponda.

No inventar convenciones nuevas cuando ya exista una definición aplicable.

---

# 3. Principios arquitectónicos obligatorios

## 3.1. Simplicidad primero

Aplicar el principio fundamental:

**Simplicidad primero, separación cuando exista una necesidad real.**

- Crear únicamente los componentes necesarios para implementar la funcionalidad.
- No añadir capas, archivos o directorios por motivos puramente teóricos.
- No crear carpetas vacías para una posible expansión futura.
- No dividir un archivo automáticamente por su número de líneas.
- Evitar tanto los componentes con responsabilidades excesivas como la fragmentación innecesaria.
- Reutilizar los componentes existentes cuando cumplan la misma responsabilidad.
- Evitar implementaciones duplicadas de una misma capacidad.
- No crear abstracciones genéricas para resolver un problema que pertenece a un único módulo.
- Cada componente nuevo debe tener una responsabilidad identificable y aportar claridad, reutilización o facilidad de mantenimiento.

## 3.2. Arquitectura modular por funcionalidades

El frontend se organiza en dos ámbitos complementarios:

**A. Estructura común de la aplicación**

Contiene los elementos que sirven a toda la aplicación, incluyendo la infraestructura y los recursos transversales de la plantilla.

Ejemplos:

- Componentes UI genéricos.
- Layouts y navegación general.
- Contextos globales.
- Hooks reutilizables.
- Internacionalización.
- Iconografía compartida.
- Utilidades generales.
- Cliente HTTP y configuración global de comunicación.
- Páginas generales de la aplicación.

**B. Módulos funcionales**

Contienen las capacidades propias de cada dominio del sistema.

Ejemplos:

- Pacientes.
- Personas.
- Citas.
- Disponibilidad.
- Clínicas.
- Procedimientos.
- Especialidades.
- Personal.
- Horarios.
- Roles.
- Permisos.
- Condiciones especiales.
- Conversaciones.

Cada módulo centraliza sus páginas, componentes, servicios, schemas, tipos, hooks y demás elementos específicos cuando sean necesarios.

Los módulos no deben convertirse en simples carpetas de páginas. Deben agrupar las responsabilidades relacionadas con su funcionalidad.

## 3.3. Correspondencia conceptual con el backend

El frontend debe mantener coherencia con los dominios funcionales del backend FastAPI.

Por ejemplo, si el backend tiene:

`src/app/modules/appointments/`

El frontend puede tener:

`src/modules/appointments/`

La correspondencia es conceptual, no una obligación de replicar exactamente las mismas capas o archivos.

El backend puede utilizar:

- Routers.
- Models.
- Repositories.
- Schemas.
- Services.
- Dependencies.
- Exceptions.

El frontend puede utilizar:

- Pages.
- Components.
- Services.
- Repositories, cuando se justifiquen.
- Schemas.
- Types.
- Hooks.
- Constants.
- Utils.

No crear equivalencias artificiales entre conceptos que tienen responsabilidades diferentes.

Por ejemplo, un modelo ORM de SQLAlchemy no equivale directamente a un tipo de presentación de React.

## 3.4. Separación de responsabilidades

Respetar las siguientes responsabilidades:

- `components/`: componentes visuales comunes existentes.
- `pages/`: páginas comunes o páginas de la plantilla que no pertenecen exclusivamente a un módulo funcional.
- `modules/`: funcionalidades organizadas por dominio.
- `services/`: infraestructura y servicios globales.
- `contexts/`: estado y contexto global compartido.
- `hooks/`: hooks globales reutilizables.
- `i18n/`: internacionalización.
- `icons/`: iconografía compartida.
- `utils/`: utilidades generales.
- `types/`: tipos globales, únicamente cuando exista una necesidad real.
- `styles/`: estilos globales, si la organización existente lo requiere.

No trasladar responsabilidades entre directorios únicamente para cumplir una estructura teórica.

---

# 4. Estructura de directorios del frontend

## 4.1. Estructura base existente

El proyecto utiliza una plantilla React + Vite + TypeScript que ya contiene una estructura común.

La siguiente estructura representa las ubicaciones conocidas de la plantilla y debe conservarse:

```text
frontend/
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    │
    ├── components/
    │   ├── layout/
    │   │   └── app-layout/
    │   ├── shared/
    │   └── ui/
    │
    ├── contexts/
    ├── hooks/
    ├── i18n/
    ├── icons/
    ├── pages/
    │   ├── main/
    │   │   ├── calendar/
    │   │   ├── dashboard/
    │   │   ├── forms/
    │   │   ├── pages/
    │   │   ├── profile/
    │   │   └── tables/
    │   └── others/
    │       ├── auth/
    │       ├── charts/
    │       └── ui-elements/
    │
    └── utils/
```

Este árbol es una referencia de la plantilla compartida por el proyecto. El agente debe verificar la ubicación real de los archivos antes de realizar cualquier modificación.

En particular, debe distinguir la raíz del repositorio, la raíz del proyecto Vite y el directorio que contiene el código fuente. No asumir que todos se encuentran en el mismo nivel.

Los nombres y subdirectorios pueden variar si la plantilla ha evolucionado. El código real tiene prioridad.

## 4.2. Estructura extendida de referencia

Los siguientes directorios representan una posible ampliación de la plantilla, no una sustitución de su estructura:

```text
frontend/
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    │
    ├── components/              # Existente: componentes comunes
    │   ├── layout/
    │   ├── shared/
    │   └── ui/
    │
    ├── contexts/                 # Existente
    ├── hooks/                    # Existente
    ├── i18n/                     # Existente
    ├── icons/                    # Existente
    ├── pages/                    # Existente
    ├── utils/                    # Existente
    │
    ├── services/                 # NUEVO: infraestructura global
    │   └── api/
    │       ├── client.ts
    │       └── ...
    │
    ├── modules/                  # NUEVO: funcionalidades del negocio
    │   ├── patients/
    │   ├── persons/
    │   ├── appointments/
    │   ├── availability/
    │   ├── clinics/
    │   ├── conversations/
    │   ├── permissions/
    │   ├── procedures/
    │   ├── roles/
    │   ├── schedules/
    │   ├── special-conditions/
    │   ├── specialties/
    │   └── staff-members/
    │
    └── types/                    # NUEVO: solo si existen tipos globales
```

No es obligatorio crear todos estos directorios desde el principio.

Los módulos se incorporan progresivamente cuando se desarrollan sus funcionalidades.

No se debe mover la estructura existente a otra ubicación para conseguir que coincida exactamente con este árbol.

## 4.3. Responsabilidades de los directorios principales

| Ubicación | Responsabilidad |
|---|---|
| `components/ui/` | Componentes visuales genéricos existentes, como botones, inputs, tablas, diálogos y otros controles. |
| `components/layout/` | Layouts generales, estructura visual y navegación de la aplicación. |
| `components/shared/` | Componentes visuales reutilizables entre diferentes páginas o módulos. |
| `contexts/` | Contextos y estado global compartido. |
| `hooks/` | Hooks personalizados de uso transversal. |
| `i18n/` | Configuración, traducciones y mecanismos de internacionalización. |
| `icons/` | Iconos compartidos por la aplicación. |
| `pages/` | Páginas generales, páginas de plantilla y páginas que no pertenecen exclusivamente a un módulo. |
| `utils/` | Funciones auxiliares verdaderamente globales. |
| `services/` | Servicios e infraestructura compartidos, especialmente comunicación HTTP. |
| `modules/` | Funcionalidades del sistema organizadas por dominio. |
| `types/` | Tipos compartidos por diferentes módulos, cuando no pertenezcan a un dominio específico. |
| `App.tsx` | Composición principal de la aplicación, respetando el mecanismo de navegación existente. |
| `main.tsx` | Punto de entrada de React y registro de proveedores globales. |
| `index.css` | Estilos globales existentes. |

La presencia de un directorio no obliga a introducir en él todos los elementos de una determinada categoría. La ubicación debe responder a la responsabilidad real del componente.

## 4.4. Convención de organización interna de los módulos

Cada módulo debe centralizar los elementos que pertenecen a su funcionalidad.

Por ejemplo:

```text
modules/
└── appointments/
    ├── components/
    │   ├── appointment-form.tsx
    │   ├── appointment-table.tsx
    │   └── appointment-detail.tsx
    │
    ├── pages/
    │   ├── appointments-page.tsx
    │   └── appointment-detail-page.tsx
    │
    ├── services/
    │   └── appointment-service.ts
    │
    ├── repositories/
    │   └── appointment-repository.ts
    │
    ├── schemas/
    │   ├── appointment-schema.ts
    │   └── appointment-detail-schema.ts
    │
    ├── types/
    │   ├── appointment.types.ts
    │   └── appointment-detail.types.ts
    │
    ├── hooks/
    │   └── use-appointments.ts
    │
    ├── constants/
    │   └── appointment.constants.ts
    │
    ├── utils/
    │   └── appointment.utils.ts
    │
    └── index.ts
```

Este árbol es ilustrativo. No obliga a crear todos los archivos ni todos los subdirectorios.

Las responsabilidades son las siguientes:

**components/**

Contiene componentes visuales exclusivos del módulo.

Ejemplos:

- Formulario de citas.
- Tabla de citas.
- Selector específico de estado de una cita.
- Panel de detalles de una cita.

Si un componente es genérico y puede utilizarse en cualquier módulo, debe evaluarse su ubicación en los componentes comunes existentes.

**pages/**

Contiene las páginas y vistas principales del módulo.

Una página debe coordinar los componentes, hooks y operaciones necesarias para presentar la funcionalidad.

No debe concentrar toda la lógica de negocio ni implementar directamente las llamadas HTTP.

**services/**

Contiene las operaciones y la coordinación de funcionalidades específicas del módulo.

Ejemplos:

- Crear una cita.
- Consultar citas.
- Actualizar una cita.
- Cancelar una cita.
- Obtener detalles de una cita.

Los servicios del módulo utilizan la infraestructura HTTP global cuando necesitan comunicarse con el backend.

No deben crear clientes HTTP independientes ni duplicar configuraciones globales.

**repositories/**

Contiene una capa de acceso a datos cuando exista una necesidad real de separar las operaciones de consulta o persistencia remota de la coordinación de los servicios.

En un frontend sencillo, los servicios pueden comunicarse directamente con el cliente HTTP global.

No crear repositories únicamente para imitar la arquitectura del backend.

**schemas/**

Contiene schemas de validación de datos propios del módulo.

Puede utilizar Zod u otra biblioteca únicamente si está instalada o si su incorporación ha sido justificada.

Ejemplos:

- Validación de formularios.
- Validación de parámetros.
- Validación de datos recibidos cuando el contrato lo requiera.

No confundir los schemas de validación frontend con los schemas Pydantic del backend.

**types/**

Contiene interfaces, tipos y definiciones TypeScript específicas del módulo.

Ejemplos:

- Tipos de citas.
- Datos de creación.
- Datos de actualización.
- Estados y filtros.
- Tipos de respuestas que el módulo necesita.

Evitar duplicar tipos globales o introducir tipos que contradigan el contrato real de la API.

**hooks/**

Contiene hooks personalizados relacionados exclusivamente con el módulo.

Ejemplos:

- `use-appointments.ts`
- `use-appointment-detail.ts`

Los hooks globales deben permanecer en el directorio `hooks/` existente.

**constants/**

Contiene constantes específicas del módulo.

Ejemplos:

- Estados de citas.
- Opciones de filtros.
- Configuraciones propias de una vista.

**utils/**

Contiene funciones auxiliares específicas del módulo que no justifican pertenecer a los servicios, hooks o componentes.

**index.ts**

Puede utilizarse como punto de exportación pública del módulo cuando facilite su consumo.

No debe convertirse en un archivo que exporte indiscriminadamente todos los detalles internos.

## 4.5. Organización flexible según la complejidad

No todos los módulos necesitan la misma estructura.

Un módulo pequeño puede organizarse directamente:

```text
modules/
└── specialties/
    ├── pages/
    │   └── specialties-page.tsx
    ├── services/
    │   └── specialty-service.ts
    ├── types/
    │   └── specialty.types.ts
    └── index.ts
```

Un módulo más complejo puede incorporar más responsabilidades:

```text
modules/
└── appointments/
    ├── components/
    ├── pages/
    ├── services/
    ├── repositories/
    ├── schemas/
    ├── types/
    ├── hooks/
    ├── constants/
    ├── utils/
    └── index.ts
```

Ambas organizaciones son válidas.

La decisión debe considerar:

- Complejidad funcional.
- Cantidad de componentes.
- Cantidad de operaciones.
- Necesidades de validación.
- Reutilización interna.
- Mantenibilidad.
- Convenciones existentes.

No crear subdirectorios vacíos ni mantener dos organizaciones paralelas para una misma responsabilidad.

Tampoco reorganizar un módulo existente únicamente para ajustarlo al ejemplo.

## 4.6. Relación entre módulos y funcionalidades del backend

Los módulos del frontend deben reflejar los dominios funcionales relevantes del sistema.

Como referencia, el backend actual contiene módulos como:

- appointments
- availability
- clinics
- conversations
- patients
- permissions
- persons
- procedures
- roles
- schedules
- special_conditions
- specialties
- staff_members

Estos dominios pueden tener representación en el frontend cuando exista una funcionalidad de usuario que lo requiera.

No todos los módulos del backend necesitan una página o módulo frontend independiente.

Tampoco se debe crear un módulo frontend por cada endpoint.

La organización debe responder a las funcionalidades de la aplicación.

**Relación entre persons y patients:**

No asumir que ambos dominios son equivalentes. Si el backend los mantiene separados, el frontend debe respetar sus responsabilidades. Se debe analizar qué operaciones pertenecen a cada uno antes de decidir dónde ubicarlas.

**Relación entre appointments y availability:**

Las citas y la disponibilidad están relacionadas, pero no son necesariamente el mismo dominio. La gestión de citas no debe absorber indiscriminadamente toda la lógica de disponibilidad.

Las relaciones entre módulos deben seguir las responsabilidades documentadas del backend y las necesidades de la interfaz.

## 4.7. Páginas comunes y dashboard

No todas las páginas deben pertenecer a un módulo funcional.

Las páginas generales pueden permanecer en `pages/`.

Ejemplos:

- Dashboard general.
- Página de inicio.
- Página 404.
- Página de acceso denegado.
- Página de mantenimiento.
- Páginas generales de la plantilla.

El dashboard general puede mostrar información procedente de varios módulos sin convertirse en propietario de esos dominios.

Por ejemplo, sus tarjetas pueden consultar servicios públicos de pacientes, citas o disponibilidad.

No crear un módulo independiente por cada tarjeta del dashboard.

Si en el futuro existe una funcionalidad de dashboard suficientemente compleja y con responsabilidades propias, se podrá evaluar una organización específica.

## 4.8. Componentes comunes y componentes de módulo

La decisión sobre dónde ubicar un componente debe basarse en su alcance funcional.

**Componente exclusivo de un módulo:**

```text
modules/patients/components/patient-form.tsx
```

**Componente genérico reutilizable:**

```text
components/ui/
```

o:

```text
components/shared/
```

según las convenciones existentes.

Reglas:

- No mover un componente existente solo porque ahora se utilizará desde un módulo.
- No duplicar un componente común para realizar pequeños cambios visuales.
- No colocar componentes exclusivos de un módulo en `components/shared/`.
- No convertir `components/shared/` en un directorio para cualquier componente que no se sepa dónde ubicar.
- Si un componente comienza a tener responsabilidades específicas de un dominio, evaluar si debe permanecer en su ubicación actual o si corresponde una migración autorizada.
- Antes de crear cualquier componente, inspeccionar la implementación y las propiedades de los componentes existentes.

La Skill 03 — Catálogo de componentes y recursos complementa estas reglas.

---

# 5. Servicios y comunicación con el backend

## 5.1. Servicios globales

El directorio global `services/` contiene la infraestructura de comunicación compartida.

Por ejemplo:

```text
services/
└── api/
    ├── client.ts
    ├── interceptors.ts
    └── ...
```

La estructura exacta dependerá de la biblioteca HTTP y las convenciones reales del proyecto.

Puede contener:

- Configuración del cliente HTTP.
- URL base.
- Interceptores.
- Autenticación.
- Gestión de tokens.
- Encabezados comunes.
- Tratamiento general de errores.
- Configuración de solicitudes.
- Mecanismos comunes de comunicación.

No crear estos componentes si ya existen en otra ubicación y cumplen correctamente esa responsabilidad.

## 5.2. Servicios específicos de cada módulo

Los servicios funcionales deben permanecer dentro de sus módulos.

Ejemplo:

```text
modules/
└── appointments/
    └── services/
        └── appointment-service.ts
```

Este servicio contiene las operaciones relacionadas con citas y utiliza el cliente HTTP global.

Otro ejemplo:

```text
modules/
└── patients/
    └── services/
        └── patient-service.ts
```

El servicio de pacientes no debe concentrar operaciones que pertenecen a citas, disponibilidad u otros dominios.

## 5.3. Separación de responsabilidades

La comunicación debe seguir una separación conceptual:

```text
Página o componente
        │
        ▼
Hook del módulo (cuando corresponda)
        │
        ▼
Servicio del módulo
        │
        ▼
Repositorio del módulo (si se justifica)
        │
        ▼
Cliente HTTP global
        │
        ▼
Backend FastAPI
```

Este flujo es una referencia, no una cadena obligatoria de capas.

Un módulo sencillo puede comunicarse directamente desde su servicio con el cliente HTTP global.

No introducir hooks, repositories o capas intermedias si no aportan una responsabilidad real.

Las reglas detalladas de comunicación, contratos, autenticación y tratamiento de errores corresponden a la Skill 02 — Integración con la API.

---

# 6. Reglas de dependencias y límites arquitectónicos

## 6.1. Dependencias entre presentación y operaciones

- Las páginas y componentes deben utilizar los servicios y hooks correspondientes para ejecutar operaciones.
- Los componentes visuales genéricos no deben contener llamadas HTTP específicas de un módulo.
- Evitar llamadas HTTP directamente dentro de componentes visuales.
- No concentrar la lógica de acceso a datos en páginas.
- Los servicios no deben depender de componentes React.
- Los servicios no deben importar layouts ni páginas.
- Los schemas no deben depender de componentes visuales.
- Los tipos deben estar disponibles para los elementos que los necesiten sin crear dependencias circulares.

## 6.2. Dependencias entre módulos

Evitar dependencias circulares entre módulos.

Un módulo no debe importar indiscriminadamente los archivos internos de otro.

Cuando un módulo necesite información u operaciones de otro:

1. Identificar qué responsabilidad necesita utilizar.
2. Comprobar si existe un servicio o una interfaz pública que resuelva la necesidad.
3. Preferir las exportaciones públicas del módulo cuando existan.
4. Evitar acceder a componentes, hooks o utilidades internas de otro módulo.
5. Si existe una responsabilidad realmente compartida, evaluar su ubicación común sin duplicarla.
6. Mantener explícitas y justificadas las dependencias.

Ejemplo:

El módulo de citas puede necesitar información de pacientes, pero no debe duplicar la gestión de pacientes ni implementar sus operaciones de administración.

La integración debe respetar los límites funcionales de ambos módulos.

## 6.3. Dependencias de componentes comunes

Los componentes comunes deben ser independientes de las particularidades de los módulos.

Por ejemplo:

- Un botón genérico no debe conocer el módulo de citas.
- Una tabla genérica no debe importar el servicio de pacientes.
- Un modal genérico no debe ejecutar operaciones específicas del dominio.
- Un layout general no debe contener reglas de negocio de un módulo.

Los módulos pueden consumir componentes comunes, pero los componentes comunes no deben depender de los módulos funcionales.

## 6.4. Estado y contextos

El estado debe ubicarse según su alcance.

**Estado local:**

Debe permanecer dentro del componente cuando solo afecta a su presentación.

**Estado del módulo:**

Debe gestionarse mediante hooks, servicios o mecanismos propios del módulo cuando corresponda.

**Estado global:**

Debe utilizar los mecanismos globales existentes, como contexts, cuando realmente se comparta entre distintas partes de la aplicación.

No utilizar un contexto global para cada funcionalidad.

No introducir una biblioteca de gestión de estado si los mecanismos existentes resuelven adecuadamente la necesidad.

## 6.5. Rutas y navegación

La navegación debe respetar el mecanismo que ya utiliza la plantilla.

Antes de incorporar o modificar rutas:

- Inspeccionar `App.tsx`.
- Inspeccionar `main.tsx`.
- Identificar si se utiliza React Router u otra solución.
- Revisar la configuración existente de navegación.
- Comprobar cómo se integran las páginas con el layout y el sidebar.
- Reutilizar las convenciones existentes.

Cada módulo puede exponer o registrar sus páginas y rutas cuando la arquitectura real del proyecto lo permita.

No crear automáticamente un router independiente para cada módulo.

No reemplazar el sistema de navegación existente por otro sin autorización y justificación.

La composición de rutas debe mantenerse centralizada según el mecanismo real del proyecto, evitando que las páginas funcionales implementen su propia navegación global.

## 6.6. Seguridad y autenticación

La autenticación y autorización visual deben respetar los mecanismos globales del proyecto y los contratos del backend.

- Reutilizar los mecanismos existentes de autenticación.
- No duplicar la gestión de tokens en cada módulo.
- No implementar mecanismos de autenticación independientes.
- No considerar que ocultar un botón o una página constituye autorización real.
- Respetar los permisos y roles recibidos del backend.
- No incluir secretos ni credenciales en el código frontend.
- No asumir que las validaciones del frontend sustituyen las validaciones del backend.

La autorización definitiva debe permanecer en el backend.

---

# 7. Integración con la plantilla existente

Antes de implementar una funcionalidad, inspeccionar los recursos que ofrece la plantilla.

Comprobar especialmente:

- Componentes UI.
- Componentes compartidos.
- Layouts.
- Sidebar y navegación.
- Header.
- Contextos.
- Hooks.
- Iconos.
- Internacionalización.
- Utilidades.
- Formularios.
- Tablas.
- Modales.
- Sistema de notificaciones.
- Componentes de calendario.
- Componentes de gráficos.

No asumir que un componente existe únicamente porque aparece en el árbol. Inspeccionar su código y su API.

## 7.1. Reutilización

Antes de crear un componente:

1. Buscar si existe uno con la misma responsabilidad.
2. Revisar sus propiedades.
3. Revisar cómo se utiliza en otras páginas.
4. Determinar si admite la nueva funcionalidad.
5. Evaluar si puede extenderse sin romper sus usos existentes.
6. Crear uno nuevo únicamente si no existe una solución apropiada.

No copiar componentes de la plantilla para realizar pequeñas variaciones cuando puedan resolverse mediante sus propiedades o composición.

## 7.2. Conservación visual

Las nuevas funcionalidades deben integrarse con el diseño existente.

Respetar:

- Sistema de colores.
- Tipografía.
- Espaciados.
- Bordes.
- Radios.
- Sombras.
- Temas.
- Diseño responsive.
- Componentes de formulario.
- Patrones de tablas.
- Patrones de navegación.

No introducir un sistema visual paralelo sin justificación.

## 7.3. Configuración y dependencias

Antes de incorporar una biblioteca:

- Revisar `package.json`.
- Comprobar si ya existe una dependencia que resuelva la necesidad.
- Evaluar la compatibilidad con la versión actual de React y TypeScript.
- Revisar el impacto en el tamaño y mantenimiento del proyecto.
- Evitar dependencias redundantes.

No instalar una biblioteca únicamente porque el agente esté acostumbrado a utilizarla.

---

# 8. Cambios estructurales

Un cambio estructural debe estar justificado por una necesidad concreta de la funcionalidad, un problema de mantenimiento o una mejora arquitectónica identificable.

Antes de realizarlo:

1. Identificar el problema que se pretende resolver.
2. Inspeccionar el árbol real del proyecto.
3. Revisar las alternativas que requieren menos cambios.
4. Identificar los módulos, imports, rutas y dependencias afectados.
5. Revisar la compatibilidad con los componentes existentes.
6. Evaluar el impacto en las pruebas.
7. Identificar la documentación que debe actualizarse.
8. Solicitar autorización cuando el cambio implique mover, eliminar o reemplazar elementos existentes fuera del alcance solicitado.

Después del cambio:

- Actualizar imports y referencias.
- Comprobar las rutas y la navegación.
- Comprobar que no se han introducido dependencias circulares.
- Ejecutar las verificaciones pertinentes.
- Actualizar la documentación afectada.
- Informar los archivos creados, modificados, movidos o eliminados.

**No reorganizar partes de la plantilla que no sean necesarias para completar la tarea.**

## 8.1. Incorporación de un nuevo módulo

Antes de crear un módulo:

1. Comprobar si la funcionalidad ya pertenece a un módulo existente.
2. Revisar los límites del dominio en el backend.
3. Determinar si la funcionalidad necesita un módulo independiente.
4. Identificar las páginas, servicios, schemas, tipos y componentes que realmente necesita.
5. Revisar si existen componentes comunes que puedan reutilizarse.
6. Crear únicamente la estructura necesaria.
7. Documentar el nuevo módulo cuando corresponda.

No crear un módulo independiente por cada pantalla, formulario, endpoint o entidad de datos.

## 8.2. Movimiento de un componente existente a un módulo

Si un componente que actualmente se encuentra en una ubicación común pasa a ser exclusivo de un módulo, no trasladarlo automáticamente.

Primero comprobar:

- Si otros módulos lo utilizan.
- Si su responsabilidad realmente pertenece a un único dominio.
- Si existen dependencias que se romperían.
- Si puede permanecer en su ubicación actual.
- Si el cambio aporta una mejora suficiente para justificar la migración.

Cuando el movimiento sea necesario, debe ser una modificación explícita, controlada y autorizada.

---

# 9. Documentación y consistencia

La documentación debe describir el comportamiento real y verificado del frontend.

Antes de modificar un módulo, consultar su documentación cuando exista.

Después de implementar cambios, actualizar los documentos afectados si la modificación altera la información que describen.

Según corresponda, revisar:

- `docs/architecture/frontend-architecture.md`
- `docs/architecture/module-responsibilities.md`
- `docs/architecture/architecture-decisions.md`
- `docs/frontend/component-catalog.md`
- `docs/modules/<modulo>.md`
- `docs/development/conventions.md`

También actualizar:

- README, si cambia la instalación, ejecución o configuración.
- Variables de entorno documentadas, si corresponde.
- Catálogo de componentes cuando se incorporen o modifiquen recursos reutilizables.
- Documentación de módulos cuando cambien sus responsabilidades.
- Documentación de integración cuando cambien los contratos con el backend.

No crear un documento por cada componente o función.

Mantener la documentación proporcional a la responsabilidad y complejidad.

La documentación debe actualizarse dentro de la misma tarea que modifica el código cuando cambie la información documentada.

Las reglas detalladas de documentación se complementan con la Skill 04 — Documentación técnica del frontend.

---

# 10. Flujo de trabajo obligatorio

## Antes de implementar una funcionalidad

1. Leer esta skill y determinar cómo se aplica al proyecto.
2. Inspeccionar la estructura real del repositorio.
3. Identificar la raíz del proyecto Vite y el directorio real del código fuente.
4. Consultar las instrucciones del repositorio, como `AGENTS.md`, si existen.
5. Consultar la documentación arquitectónica pertinente.
6. Revisar el módulo funcional afectado y sus responsabilidades.
7. Inspeccionar los componentes, layouts, hooks, contextos y utilidades existentes.
8. Revisar `package.json` y las dependencias disponibles cuando sea necesario.
9. Identificar qué elementos son comunes y cuáles pertenecen al módulo.
10. Buscar servicios, schemas y tipos existentes que puedan reutilizarse.
11. Determinar las capas que realmente necesitan modificarse.
12. Elegir la solución más sencilla que respete las responsabilidades arquitectónicas.

## Durante la implementación

1. Mantener la estructura común existente.
2. Incorporar los nuevos archivos dentro del módulo correspondiente.
3. Reutilizar los componentes existentes.
4. Mantener la infraestructura HTTP global centralizada.
5. Colocar los servicios funcionales dentro de sus respectivos módulos.
6. Mantener los schemas y tipos junto al dominio al que pertenecen.
7. Evitar dependencias circulares.
8. Respetar los mecanismos de navegación y layout existentes.
9. No introducir archivos, carpetas, capas ni abstracciones innecesarias.
10. Evitar cambios estructurales ajenos a la funcionalidad solicitada.

## Antes de finalizar

1. Revisar imports y dependencias.
2. Comprobar que las rutas y páginas estén correctamente integradas.
3. Ejecutar las verificaciones pertinentes, como TypeScript, lint y build, utilizando los scripts disponibles.
4. Ejecutar las pruebas relevantes si existen.
5. Comunicar cualquier verificación que no haya podido realizarse.
6. Actualizar la documentación afectada.
7. Informar los archivos creados, modificados o eliminados.
8. Justificar las decisiones arquitectónicas relevantes.
9. Confirmar que la plantilla y sus componentes comunes no fueron reorganizados innecesariamente.

Si el repositorio tiene una arquitectura incompatible con esta skill, detener la adaptación estructural y advertirlo antes de realizar cambios.

---

# 11. Criterio de aceptación

El trabajo respeta esta skill cuando:

- Conserva la estructura base existente de la plantilla.
- Incorpora nuevas funcionalidades sin reemplazar ni reorganizar innecesariamente los directorios existentes.
- Mantiene los componentes, layouts, contextos, hooks, iconos, utilidades e internacionalización comunes en sus ubicaciones actuales.
- Organiza las nuevas funcionalidades mediante módulos por dominio.
- Cada módulo centraliza sus propias responsabilidades.
- Los módulos contienen únicamente los directorios y archivos que necesitan.
- Los servicios globales permanecen separados de los servicios específicos de cada módulo.
- El cliente HTTP y la infraestructura de comunicación están centralizados.
- Los schemas y tipos corresponden al dominio que los utiliza.
- Los componentes comunes no dependen de módulos funcionales.
- Los módulos evitan dependencias circulares y accesos innecesarios a implementaciones internas de otros módulos.
- Las páginas comunes permanecen en la estructura general de páginas cuando corresponda.
- La navegación respeta el mecanismo existente en la plantilla.
- Se reutilizan los componentes existentes antes de crear otros.
- No se duplican capacidades técnicas ni componentes visuales.
- No se introducen dependencias innecesarias.
- Se mantiene la coherencia conceptual con los dominios del backend.
- Se actualizan las pruebas y la documentación afectadas.
- Se comunican las limitaciones de verificación sin presentar suposiciones como hechos.
- No se imponen migraciones estructurales no autorizadas.

Si existe una contradicción entre esta skill, la documentación arquitectónica del proyecto y el código real, se deberá identificar la discrepancia y resolverla explícitamente.

No se debe inventar una regla nueva para ocultar la contradicción.

**La arquitectura documentada y el código real deben mantenerse coherentes. La evolución del frontend debe realizarse mediante extensiones controladas, preservando la plantilla existente y centralizando las nuevas funcionalidades en módulos con responsabilidades claras.**
