---
name: frontend-documentacion
description: Skill 04 del proyecto frontend. Define cómo crear, organizar, mantener y validar la documentación técnica del frontend, centralizada en docs/ en la raíz del repositorio frontend_gestion_citas/, al mismo nivel que frontend/, .agent/ y scripts/. Establece las responsabilidades de frontend-architecture.md, component-catalog.md, architecture-decisions.md, docs/modules/, docs/integrations/ y development/conventions.md, manteniendo una única fuente de verdad por tema, sin duplicar reglas de las otras skills y sin documentar como existente lo que no está implementado. Úsala SIEMPRE que se vaya a escribir o actualizar documentación, registrar una decisión arquitectónica, documentar un módulo o una integración, actualizar el árbol de carpetas tras crear, mover o eliminar archivos, o revisar si la documentación coincide con el código, aunque el usuario solo diga "documenta esto", "actualiza el README" o "agrega un módulo nuevo". Se complementa con frontend-arquitectura (Skill 01), frontend-integracion-api (Skill 02) y frontend-catalogo-componentes (Skill 03).
---

# Skill 04: Documentación técnica del frontend

## 1. Objetivo

Establecer cómo crear, organizar, mantener y validar la documentación técnica del frontend para que describa fielmente el sistema, facilite su desarrollo y evite contradicciones entre documentos.

La documentación debe permitir comprender:

- La arquitectura general del frontend.
- La organización de carpetas y la ubicación adecuada de los archivos.
- Las responsabilidades de los componentes, capas y módulos funcionales.
- Los recursos reutilizables disponibles en la aplicación.
- Las decisiones técnicas y sus motivos.
- El funcionamiento y los límites de las integraciones con el backend y otros servicios externos.
- Las convenciones de desarrollo.
- Los cambios que deben reflejarse en la documentación cuando evoluciona el código.

La documentación es parte del mantenimiento del sistema. Debe actualizarse junto con los cambios que afecten a lo que describe.

## 2. Principios generales

### 2.1. La documentación debe describir el sistema real

Documentar el comportamiento y la estructura existentes, no una implementación imaginada ni una estructura futura presentada como si ya estuviera implementada.

Antes de modificar documentación:

1. Inspeccionar los archivos y directorios existentes.
2. Revisar el código relacionado con el cambio.
3. Consultar la documentación técnica vigente.
4. Identificar las diferencias entre lo documentado y lo implementado.
5. Actualizar únicamente el contenido afectado, manteniendo la coherencia del conjunto.

Si no es posible verificar un comportamiento, una dependencia o una estructura, indicarlo explícitamente como pendiente de confirmar.

### 2.2. Una única fuente de verdad por responsabilidad

Cada tema debe tener un documento principal que sea su fuente de verdad.

Las demás partes de la documentación deben enlazarlo o resumirlo únicamente cuando sea necesario para comprender su propio contenido.

No copiar extensamente las mismas reglas en varios documentos, porque las copias pueden quedar desactualizadas y generar contradicciones.

### 2.3. Centralización obligatoria de la documentación

Toda la documentación técnica del proyecto debe centralizarse en el directorio `docs/`, ubicado en la raíz del repositorio `frontend_gestion_citas/`.

La estructura de referencia es:

```text
frontend_gestion_citas/
├── .agent/
├── frontend/
├── docs/
│   ├── architecture/
│   ├── modules/
│   ├── integrations/
│   └── development/
├── scripts/
└── main.py
```

Reglas obligatorias:

1. `docs/` debe estar al mismo nivel que `frontend/`, `.agent/` y `scripts/`.
2. No crear `frontend/docs/`.
3. No dispersar documentación técnica en carpetas de la aplicación.
4. No crear archivos Markdown en ubicaciones arbitrarias cuando su contenido corresponda a una responsabilidad documental definida.
5. Los documentos técnicos deben guardarse en la ubicación establecida por esta skill.
6. Las rutas documentales se interpretan desde la raíz del repositorio, no desde `frontend/`.
7. Antes de crear, mover o eliminar documentación, comprobar la estructura real del repositorio.

El código de la aplicación se encuentra en `frontend/`. La documentación que describe ese código permanece fuera de esa carpeta.

### 2.4. Simplicidad primero

Crear documentación cuando aporte valor real.

No generar archivos vacíos, documentos redundantes ni estructuras documentales excesivamente complejas para un proyecto pequeño.

Cuando un documento existente pueda ampliarse de forma clara, hacerlo antes de crear otro documento para el mismo propósito.

### 2.5. Cambios documentales verificables

Cuando una modificación del código afecte a la arquitectura, las responsabilidades de los módulos, los componentes reutilizables, las integraciones, las convenciones o la estructura del repositorio, actualizar los documentos correspondientes dentro del mismo cambio de desarrollo.

Un cambio estructural no está completamente documentado hasta que el árbol de carpetas y las explicaciones afectadas reflejen el estado actualizado.

### 2.6. Respetar las convenciones existentes

Antes de introducir una nueva organización, comprobar si el repositorio ya tiene una convención establecida.

No reorganizar archivos ni renombrar directorios únicamente para que coincidan con un ejemplo documental.

La plantilla React + Vite + TypeScript existente constituye la base del frontend. Debe conservarse su estructura compartida y ampliarse progresivamente según las necesidades funcionales del sistema.

Cualquier reorganización relevante debe estar justificada y autorizada cuando exceda el alcance del cambio solicitado.

## 3. Fuentes de verdad y relación con las demás skills

Esta skill define cómo organizar, redactar, mantener y validar la documentación técnica. No sustituye las reglas especializadas de las demás skills.

| Documento o skill | Responsabilidad principal |
|---|---|
| **Skill 01 — Arquitectura del frontend** | Define la organización de la aplicación, las responsabilidades, la estructura, las dependencias y los criterios arquitectónicos. |
| **Skill 02 — Integración con API** | Define la comunicación con el backend, el cliente HTTP, los contratos, los tipos, la autenticación y el tratamiento de respuestas. |
| **Skill 03 — Catálogo de componentes** | Define cómo descubrir, inspeccionar e inventariar los componentes y recursos existentes y reutilizables. |
| **Skill 04 — Documentación técnica del frontend** (esta skill) | Define dónde documentar esos temas, cómo mantener su documentación y cómo comprobar su coherencia. |

Reglas de aplicación:

1. No redefinir en esta skill las decisiones arquitectónicas que corresponden a la Skill 01.
2. No crear contratos de API alternativos ni volver a especificar sus convenciones.
3. No duplicar las reglas de integración que corresponden a la Skill 02.
4. No sustituir el inventario y la inspección de recursos definidos en la Skill 03.
5. Si se detecta una contradicción entre documentos, identificar qué fuente de verdad corresponde al tema y corregir los documentos dependientes.
6. Si una decisión técnica cambia, actualizar primero la fuente de verdad afectada y después los documentos que dependen de ella.
7. No considerar que una regla está aprobada únicamente porque aparezca en un ejemplo o en un documento secundario.

## 4. Estructura documental del frontend

### 4.1. Ubicación de la documentación

La documentación técnica se organiza obligatoriamente bajo `docs/`, en la raíz del repositorio.

La estructura documental acordada es:

```text
frontend_gestion_citas/
├── .agent/
│   └── skills/
│       └── frontend/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── docs/
│   ├── architecture/
│   │   ├── frontend-architecture.md
│   │   ├── component-catalog.md
│   │   └── architecture-decisions.md
│   ├── modules/
│   ├── integrations/
│   └── development/
│       └── conventions.md
├── scripts/
└── main.py
```

Este árbol es la referencia documental acordada para el proyecto. Debe contrastarse con el repositorio real antes de crear, mover o eliminar archivos.

No se debe asumir que todos los documentos o directorios están implementados simplemente porque aparezcan en este árbol. Se debe verificar su existencia.

No crear todos los directorios y documentos anticipadamente. Incorporar únicamente los que sean necesarios para el trabajo solicitado.

### 4.2. Responsabilidad de cada ubicación

#### `docs/architecture/frontend-architecture.md`

Es la fuente de verdad para la arquitectura general del frontend.

Debe describir, según corresponda:

- El propósito y alcance del frontend.
- Las tecnologías principales y su función.
- La organización de carpetas y archivos estructuralmente relevantes.
- La estructura compartida heredada de la plantilla.
- La organización de los módulos funcionales propios del sistema.
- Las responsabilidades de las principales áreas de la aplicación.
- La organización de rutas y layouts.
- Los componentes y mecanismos transversales.
- Las reglas de dependencia entre las áreas.
- Los criterios arquitectónicos para incorporar funcionalidades.
- Los enlaces a documentos especializados.

El árbol general de carpetas debe mantenerse en este documento para evitar que existan varias copias completas que evolucionen de forma independiente.

El árbol debe mostrar las áreas principales y los archivos estructuralmente relevantes. No debe convertirse en un inventario exhaustivo de componentes, hooks, páginas, iconos o archivos individuales.

Para consultar los recursos reutilizables debe utilizarse `component-catalog.md`.

La estructura debe reflejar el repositorio real y distinguir los componentes existentes de los previstos o propuestos cuando sea necesario.

#### `docs/architecture/component-catalog.md`

Es la fuente de verdad documental para consultar los componentes y recursos reutilizables disponibles en el frontend.

Debe organizar información relevante sobre:

- Componentes UI.
- Componentes compartidos.
- Layouts.
- Hooks.
- Contextos y providers.
- Utilidades.
- Iconos.
- Componentes de formularios.
- Componentes de navegación.
- Otros recursos reutilizables relevantes.

Para cada recurso documentado, incluir según corresponda:

- Nombre.
- Ubicación real.
- Responsabilidad.
- Propósito.
- Forma de reutilización.
- Restricciones o particularidades relevantes.

El catálogo no debe convertirse en una copia del código ni en un listado exhaustivo de cada archivo del repositorio.

Debe priorizar los recursos que realmente pueden reutilizarse y que son importantes para el desarrollo.

La Skill 03 determina cómo descubrir, inspeccionar e inventariar los recursos. Esta skill determina dónde documentar y cómo mantener el catálogo.

No crear una segunda fuente de verdad de los componentes dentro de la arquitectura general.

#### `docs/architecture/architecture-decisions.md`

Registra las decisiones arquitectónicas relevantes que afectan al diseño o a la evolución del frontend.

Cada decisión importante debe indicar, cuando corresponda:

- El contexto o problema.
- La decisión adoptada.
- Las alternativas consideradas, si fueron relevantes.
- Las consecuencias y limitaciones.
- El estado de la decisión: propuesta, aceptada, sustituida o rechazada.
- La fecha, si se conoce y aporta valor.

No registrar cada detalle de implementación como una decisión arquitectónica.

Utilizar este documento para decisiones con consecuencias relevantes para la estructura, las dependencias, la reutilización o la evolución del sistema.

Cuando una decisión sea sustituida, conservar su historial y enlazar la decisión que la reemplaza en lugar de eliminar silenciosamente el registro anterior.

#### `docs/modules/`

Contiene la documentación específica de los módulos funcionales del frontend.

Crear un documento cuando el módulo tenga suficiente complejidad, reglas de interacción o comportamiento que convenga explicar de forma independiente.

Como convención, utilizar el mismo nombre que el directorio del módulo en el código.

Por ejemplo:

```text
docs/modules/
├── appointments.md
└── patients.md
```

Los nombres son ejemplos y no obligan a crear documentos para módulos que todavía no existen.

La documentación de cada módulo debe explicar su propósito, sus responsabilidades, las interacciones con el usuario, sus dependencias y sus particularidades de implementación cuando aporten valor.

No repetir en cada documento las reglas globales de arquitectura, integración con API o convenciones. Enlazar las fuentes de verdad correspondientes.

#### `docs/integrations/`

Contiene documentación sobre integraciones con el backend y sistemas externos que formen parte del proyecto.

Puede incluir, según corresponda:

- Integración con el backend FastAPI.
- Proveedores de autenticación.
- Servicios de almacenamiento.
- Servicios de notificaciones.
- Proveedores externos.
- Bibliotecas o servicios que requieran una integración específica.

La documentación de cada integración debe explicar:

- El propósito de la integración.
- El sistema involucrado.
- El módulo o componente responsable de utilizarla.
- Los límites entre el frontend y el sistema externo.
- El flujo de comunicación.
- La configuración necesaria.
- El tratamiento de errores.
- Las limitaciones relevantes.
- Los requisitos de seguridad.
- Las pruebas y los procedimientos de diagnóstico.

No incluir credenciales, tokens, contraseñas, claves privadas ni valores sensibles reales.

No crear documentos para integraciones hipotéticas que no estén implementadas o aprobadas. Si se documenta una integración futura, marcarla explícitamente como propuesta o planificada.

#### `docs/development/conventions.md`

Es la fuente de verdad para las convenciones generales de desarrollo que no estén definidas de forma más específica en otra skill o documento.

Puede incluir:

- Convenciones de nombres y estilo.
- Organización general del código.
- Criterios para introducir archivos y módulos.
- Convenciones de componentes React.
- Convenciones de hooks.
- Uso de TypeScript.
- Uso de herramientas de desarrollo.
- Convenciones de pruebas.
- Procedimientos de revisión.
- Reglas para actualizar la documentación.

No debe reproducir íntegramente las reglas arquitectónicas ni las convenciones especializadas de integración con API.

Cuando una convención pertenezca claramente a otra área, enlazar su fuente de verdad.

### 4.3. Responsabilidad del README

El README debe funcionar como punto de entrada al proyecto, no como una fuente de verdad alternativa para toda la documentación técnica.

En el repositorio actual existe un `frontend/README.md`, perteneciente a la plantilla de la aplicación. Debe inspeccionarse antes de modificarlo.

No asumir que ese README representa la raíz del repositorio completo.

Si se necesita documentar el repositorio completo, puede existir un `README.md` en la raíz `frontend_gestion_citas/`.

El README correspondiente puede incluir:

- Descripción breve del proyecto.
- Propósito del repositorio.
- Tecnologías principales.
- Requisitos previos.
- Instrucciones de instalación y ejecución.
- Referencias a la aplicación ubicada en `frontend/`.
- Enlaces a la documentación técnica ubicada en `docs/`.

No duplicar en el README:

- La arquitectura completa.
- El árbol técnico detallado.
- El catálogo de componentes.
- Las responsabilidades de los módulos.
- Las convenciones de desarrollo.
- Los detalles completos de las integraciones.

El contenido técnico detallado debe permanecer en su documento correspondiente dentro de `docs/`.

Si el README existente de la plantilla sigue siendo útil para ejecutar la aplicación, conservarlo y actualizarlo únicamente cuando el cambio lo afecte.

No crear automáticamente un README raíz ni mover el README de la plantilla sin una necesidad justificada.

### 4.4. Relación entre el árbol de carpetas y el repositorio real

El árbol documentado es una referencia para comprender la estructura y decidir dónde ubicar componentes nuevos. No reemplaza la inspección del repositorio.

Antes de crear un archivo o directorio:

1. Consultar el árbol documentado.
2. Inspeccionar la estructura real del repositorio.
3. Revisar la documentación arquitectónica y las responsabilidades de los módulos.
4. Buscar si ya existe un archivo o componente que cumpla esa función.
5. Confirmar que la ubicación propuesta respeta las convenciones vigentes.
6. Crear únicamente los elementos necesarios para el cambio solicitado.
7. Actualizar el árbol y los documentos relacionados si el cambio modifica la estructura documentada.

Si el repositorio y la documentación difieren, comprobar cuál refleja el estado actual.

No modificar el código automáticamente para ajustarlo a una representación desactualizada.

Si la diferencia revela que la arquitectura necesita cambiar, tratarlo como una decisión explícita y actualizar la documentación correspondiente.

### 4.5. Cómo representar componentes existentes, previstos y opcionales

No presentar como existente un archivo que únicamente se ha propuesto.

Cuando sea necesario mostrar componentes todavía no implementados, distinguir claramente entre:

- **Existente:** verificado en el repositorio.
- **Previsto:** aprobado como parte de la estructura objetivo, pero aún no implementado.
- **Opcional:** se crea únicamente si aparece una necesidad concreta.
- **Propuesto:** alternativa pendiente de evaluación o aprobación.

Los ejemplos de código y los árboles de referencia no deben interpretarse como una orden de crear todos los archivos mencionados.

No crear archivos vacíos ni directorios vacíos para completar visualmente un árbol.

### 4.6. Actualización obligatoria del árbol

Actualizar el árbol de `docs/architecture/frontend-architecture.md` cuando un cambio aprobado o implementado afecte a la estructura que el árbol representa.

Esto incluye, entre otros casos:

- Crear, eliminar, mover o renombrar archivos o directorios estructuralmente relevantes.
- Incorporar o retirar un módulo funcional.
- Introducir una nueva capa o un componente transversal.
- Cambiar la ubicación de componentes compartidos.
- Modificar la organización de rutas o layouts.
- Modificar la organización de servicios o integración con API.
- Cambiar la organización de la documentación.

Los cambios internos que no afecten a la estructura documentada no requieren modificar el árbol.

Cuando corresponda, actualizar también las referencias a rutas de archivos en los documentos de arquitectura, módulos, integraciones y convenciones.

La actualización debe describir el estado real después del cambio, no mantener ubicaciones antiguas por inercia.

## 5. Documentación de la arquitectura general

La arquitectura general debe estar documentada en `docs/architecture/frontend-architecture.md`.

El documento debe permitir comprender el sistema sin tener que deducir su diseño únicamente a partir del código.

Debe describir, según corresponda:

- El propósito del frontend.
- El estilo arquitectónico adoptado.
- Las tecnologías principales.
- La organización de directorios.
- La estructura de la plantilla conservada.
- La organización de módulos funcionales.
- Las responsabilidades de las áreas principales.
- La organización de componentes compartidos.
- La organización de rutas y layouts.
- La relación con el backend.
- Las reglas de dependencia.
- Los enlaces a los documentos especializados.

La arquitectura documentada debe coincidir con las decisiones vigentes.

No incluir capas, patrones o componentes por preferencia personal si no responden a una necesidad real del proyecto.

Las explicaciones de alto nivel deben permanecer concisas. Los detalles particulares de un módulo o una integración pertenecen a sus documentos específicos.

## 6. Documentación del catálogo de componentes

El archivo `docs/architecture/component-catalog.md` debe permitir conocer los recursos existentes antes de crear otros nuevos.

Debe servir para identificar:

- Qué componentes pueden reutilizarse.
- Qué componentes pertenecen a la plantilla.
- Qué componentes son compartidos por el sistema.
- Qué componentes son exclusivos de una funcionalidad.
- Qué hooks y contextos ya existen.
- Qué utilidades pueden aprovecharse.
- Qué recursos requieren adaptación antes de reutilizarse.

El catálogo debe mantenerse alineado con el código.

No documentar un componente como disponible si no existe o no se ha verificado.

No asumir que todos los componentes de la plantilla son adecuados para cualquier funcionalidad.

La inspección del código es obligatoria antes de afirmar que un recurso cumple determinada responsabilidad.

La Skill 03 establece el procedimiento de descubrimiento e inventario. Esta skill establece cómo mantener la documentación del catálogo.

## 7. Documentación de decisiones arquitectónicas

Registrar en `docs/architecture/architecture-decisions.md` las decisiones que tengan consecuencias importantes para el diseño o mantenimiento del frontend.

Son ejemplos de decisiones que pueden justificar un registro:

- Conservar la estructura original de la plantilla.
- Incorporar módulos funcionales progresivamente.
- Establecer límites entre componentes compartidos y componentes de módulos.
- Adoptar una estrategia de gestión de estado.
- Introducir una nueva capa o mecanismo transversal.
- Cambiar la estrategia de navegación o rutas.
- Adoptar una estrategia de integración con el backend.
- Modificar una convención estructural que afecte a varias partes del sistema.

No es necesario registrar cada decisión menor ni cada cambio rutinario.

Al registrar una decisión:

1. Explicar el problema que motivó el cambio.
2. Documentar la decisión adoptada.
3. Indicar las consecuencias relevantes.
4. Identificar las restricciones o compromisos asumidos.
5. Enlazar los documentos que deban actualizarse como consecuencia.

Si una decisión cambia, revisar sus efectos sobre la arquitectura, el catálogo, los módulos y las convenciones.

## 8. Documentación específica de módulos

Cada documento de `docs/modules/` debe explicar el módulo desde la perspectiva de su funcionalidad y su implementación real.

Utilizar, según la complejidad del módulo, una estructura como la siguiente:

1. Propósito.
2. Responsabilidades y límites.
3. Funcionalidades principales.
4. Flujo de interacción del usuario.
5. Páginas y componentes principales.
6. Dependencias internas y externas.
7. Integración con el backend, cuando corresponda.
8. Estado y gestión de datos, cuando corresponda.
9. Validaciones y errores específicos del módulo.
10. Pruebas relevantes.
11. Referencias a otros documentos.

No es obligatorio utilizar todos los apartados. Omitir los que no aporten valor.

No convertir la documentación en un inventario exhaustivo de cada componente, hook, función o archivo.

Describir los elementos cuya comprensión sea importante para desarrollar, mantener o extender el módulo.

Los detalles de comunicación con el backend deben seguir la fuente de verdad de la **Skill 02 — Integración con API**.

Los componentes reutilizables deben referenciarse en `component-catalog.md` cuando corresponda.

No duplicar las convenciones globales en cada documento de módulo.

## 9. Documentación de integraciones

Cada integración relevante debe documentarse en `docs/integrations/` con suficiente información para entender su propósito y mantenerla de forma segura.

Identificar claramente:

- Qué funcionalidad del frontend requiere la integración.
- Qué módulo o componente la utiliza.
- Qué sistema externo está involucrado.
- Qué información intercambia.
- Cómo se configura.
- Cómo se gestiona la autenticación.
- Qué errores pueden producirse.
- Qué ocurre cuando el servicio no está disponible.
- Qué limitaciones son relevantes.
- Cómo se prueba sin depender innecesariamente del servicio real.
- Qué precauciones de seguridad deben aplicarse.

Para la integración con el backend FastAPI, documentar el flujo general y las particularidades relevantes.

Los detalles técnicos del cliente HTTP, los tipos, los contratos, las respuestas, la autenticación y el manejo de errores de comunicación corresponden a la Skill 02.

No mantener una segunda definición independiente de esas reglas en la documentación de integración.

Documentar los nombres de las variables de entorno y los mecanismos de configuración, no sus secretos reales.

Actualizar el documento cuando cambien el backend, el mecanismo de autenticación, la configuración, el flujo de comunicación o el tratamiento de errores.

## 10. Convenciones generales de desarrollo

El archivo `docs/development/conventions.md` debe reunir las convenciones generales necesarias para mantener un estilo de desarrollo coherente.

Debe incluir únicamente convenciones vigentes y útiles para el proyecto.

Puede cubrir:

- Nombres de archivos, componentes, funciones y variables.
- Convenciones de React y TypeScript.
- Organización del código.
- Criterios para crear componentes compartidos.
- Criterios para crear módulos funcionales.
- Uso de herramientas de formato y análisis estático.
- Organización de las pruebas.
- Gestión de configuración.
- Procedimientos de revisión.
- Reglas de actualización de la documentación.

Las convenciones deben ser compatibles con la arquitectura real y no deben imponer una estructura más compleja de la necesaria.

Cuando una regla pertenezca a una skill especializada, referenciarla en lugar de duplicarla.

## 11. Documentación de integración con el backend

Esta skill no define los contratos de API, la estructura del cliente HTTP, los tipos de respuesta ni las convenciones de comunicación con el backend.

Esas reglas corresponden a la **Skill 02 — Integración con API**.

Cuando un documento de módulo necesite describir una comunicación con el backend:

- Identificar el recurso o funcionalidad utilizada.
- Explicar su propósito dentro del módulo.
- Referenciar los servicios y tipos correspondientes.
- Mantener los ejemplos coherentes con la implementación vigente.
- Actualizar la documentación cuando cambie el flujo de comunicación.

No mantener una segunda definición independiente de los contratos en los documentos de módulos.

La documentación de integración debe explicar cómo participa el frontend en la comunicación, sin duplicar las reglas técnicas definidas por la Skill 02.

## 12. Documentación de autenticación, permisos y estado

La autenticación, los permisos y la gestión del estado deben documentarse cuando estén implementados y su funcionamiento sea relevante para comprender el sistema.

La documentación puede describir:

- El mecanismo de autenticación utilizado.
- La ubicación de los componentes responsables.
- La gestión de sesión.
- La protección de rutas.
- La gestión de permisos.
- El estado global y local.
- La persistencia de información en el navegador, cuando corresponda.
- El comportamiento ante una sesión expirada.
- La relación entre el estado del frontend y las respuestas del backend.

No inventar mecanismos de autenticación, autorización o gestión de estado.

No asumir que existe un contexto, provider, store o mecanismo de persistencia sin verificarlo en el código.

Las reglas técnicas de comunicación y autenticación con el backend deben respetar la Skill 02.

Si cambia la implementación, actualizar los documentos afectados y el catálogo cuando se incorporen recursos reutilizables nuevos.

## 13. Calidad, precisión y seguridad documental

Toda documentación debe cumplir los siguientes criterios.

### 13.1. Precisión

- Los nombres de archivos y directorios deben coincidir con los reales.
- Los ejemplos deben ser compatibles con las tecnologías y convenciones del proyecto.
- Las afirmaciones sobre comportamientos deben estar respaldadas por el código, las pruebas o una decisión aprobada.
- Los componentes previstos deben identificarse como tales.
- Las rutas mencionadas deben existir o estar claramente identificadas como propuestas.
- La ubicación de `docs/` debe corresponder a la raíz real del repositorio.

### 13.2. Consistencia

- Utilizar los mismos nombres para módulos y componentes en todos los documentos.
- Evitar que varios documentos definan reglas incompatibles.
- Actualizar enlaces y referencias cuando cambien las rutas.
- Mantener el árbol general en su documento principal.
- Evitar copias completas del árbol en documentos secundarios.
- Conservar el historial de decisiones relevantes cuando una decisión sea sustituida.
- Mantener separadas las responsabilidades de arquitectura, catálogo, módulos e integraciones.

### 13.3. Seguridad

No incluir en la documentación:

- Contraseñas o tokens reales.
- Claves privadas o credenciales.
- Datos personales reales que no sean necesarios.
- Contenido sensible de logs o entornos de producción.
- Valores reales de secretos almacenados en archivos de configuración.
- Información sensible obtenida de respuestas del backend.

Utilizar nombres de variables, ejemplos ficticios y valores de muestra seguros.

### 13.4. Legibilidad

- Utilizar títulos claros y jerarquía coherente.
- Mantener los párrafos enfocados en una idea.
- Preferir ejemplos breves y relevantes.
- Usar tablas cuando faciliten comparar responsabilidades.
- Evitar duplicaciones, explicaciones obvias y listas sin utilidad práctica.
- Enlazar documentos relacionados cuando el detalle pertenezca a otra fuente de verdad.

## 14. Procedimiento para crear o actualizar documentación

Ante una tarea que requiera documentación nueva o cambios documentales, seguir este procedimiento.

### Paso 1. Identificar el alcance

Determinar qué parte del sistema cambia y qué información debe comprender el lector.

No modificar documentos no relacionados solo para uniformar su redacción.

### Paso 2. Inspeccionar la raíz del repositorio

Comprobar la estructura real del repositorio y localizar:

- La carpeta `frontend/`.
- La carpeta `.agent/`.
- La carpeta `scripts/`.
- La carpeta `docs/`, si existe.
- Los documentos existentes.
- El código relacionado con el cambio.

La documentación debe permanecer en `docs/` en la raíz del repositorio.

No asumir que `docs/` está dentro de `frontend/`.

Si el repositorio no está disponible, no afirmar que se han inspeccionado archivos. Trabajar con la información proporcionada y señalar qué aspectos necesitan verificación.

### Paso 3. Consultar las fuentes de verdad

Identificar el documento principal correspondiente al tema:

- Arquitectura general: `docs/architecture/frontend-architecture.md`.
- Catálogo de recursos: `docs/architecture/component-catalog.md`.
- Decisiones arquitectónicas: `docs/architecture/architecture-decisions.md`.
- Detalles de un módulo: `docs/modules/`.
- Integraciones: `docs/integrations/`.
- Convenciones generales: `docs/development/conventions.md`.

Aplicar también las skills especializadas (01, 02 y 03) cuando el cambio afecte a sus responsabilidades.

### Paso 4. Determinar qué documentos deben cambiar

Actualizar únicamente los documentos afectados por el cambio.

Revisar, según corresponda:

- Arquitectura.
- Catálogo de componentes.
- Decisiones arquitectónicas.
- Documentación de módulos.
- Documentación de integraciones.
- Convenciones de desarrollo.
- README correspondiente.
- Árbol de carpetas y referencias a rutas.

No modificar todos los documentos de manera rutinaria si el cambio no los afecta.

### Paso 5. Comprobar la ubicación documental

Antes de crear un documento:

1. Verificar si ya existe `docs/` en la raíz.
2. Comprobar si existe el documento que corresponde a la responsabilidad.
3. Identificar si el contenido pertenece a arquitectura, catálogo, módulos, integraciones o desarrollo.
4. Confirmar que no existe otro documento que cumpla la misma función.
5. Crear el documento únicamente en su ubicación establecida.

No crear documentación técnica dentro de `frontend/`.

### Paso 6. Comprobar el árbol de carpetas

Antes de proponer o documentar una nueva ubicación:

1. Verificar si el archivo o directorio existe.
2. Comprobar si ya existe un componente que cumpla la misma responsabilidad.
3. Consultar la arquitectura y las convenciones.
4. Determinar si la nueva ubicación es necesaria.
5. Evitar duplicar responsabilidades o crear estructuras paralelas.

Si el cambio altera la estructura documentada, actualizar el árbol general en `docs/architecture/frontend-architecture.md` y las referencias específicas afectadas.

### Paso 7. Redactar con una única fuente de verdad

Actualizar el documento principal del tema y utilizar referencias desde los demás documentos.

No introducir nuevas convenciones ni decisiones como si estuvieran aprobadas sin la autorización correspondiente.

### Paso 8. Validar las referencias

Comprobar que:

- Las rutas documentadas son correctas.
- Los enlaces internos apuntan a documentos existentes.
- Los nombres coinciden con el código.
- Los ejemplos son coherentes con la implementación.
- No se han introducido contradicciones con otras skills.
- No se han incluido secretos ni información sensible.
- La documentación permanece centralizada en la raíz del repositorio.

### Paso 9. Revisar el impacto del cambio

Si el cambio afecta a la arquitectura o a las responsabilidades, revisar los documentos relacionados.

Si solo cambia un detalle local de un módulo, no actualizar documentos generales que sigan siendo correctos.

### Paso 10. Confirmar el resultado

Antes de dar por finalizado el trabajo, verificar que los documentos describen el estado resultante y que el árbol de carpetas está actualizado cuando corresponde.

Si algún aspecto no pudo comprobarse, dejarlo indicado en lugar de presentar una suposición como un hecho.

## 15. Cuándo crear un documento nuevo

Crear un documento nuevo únicamente cuando se cumpla alguna de estas condiciones:

- Existe una responsabilidad documental diferenciada.
- El contenido tiene suficiente complejidad para justificar un documento propio.
- El documento mejora de forma concreta la comprensión o el mantenimiento del sistema.
- La estructura acordada contempla esa ubicación y la necesidad está justificada.
- No existe ya otro documento que cubra el mismo propósito.

Antes de crearlo, comprobar si es suficiente ampliar un documento existente.

No crear un documento por cada archivo, componente, hook, función o endpoint.

No crear directorios ni archivos vacíos para anticipar necesidades futuras.

No añadir documentos al árbol como si ya existieran cuando solo se está proponiendo su creación.

Toda documentación técnica nueva debe guardarse bajo `docs/` en la raíz del repositorio.

## 16. Cuándo actualizar, conservar o eliminar documentación

### Actualizar

Actualizar un documento cuando cambien los hechos que describe, las responsabilidades, las decisiones, las rutas, los flujos o las convenciones.

### Conservar

Conservar la documentación vigente que siga siendo correcta. No reescribir documentos completos por cambios menores que puedan resolverse de forma localizada.

### Eliminar

Eliminar documentación únicamente cuando esté obsoleta, duplicada o haya dejado de tener una finalidad válida.

Antes de eliminarla:

1. Comprobar si otros documentos la referencian.
2. Trasladar la información que siga siendo relevante a su fuente de verdad.
3. Corregir los enlaces afectados.
4. Actualizar el árbol de carpetas.
5. Conservar el historial de decisiones cuando corresponda.

No eliminar un registro histórico de decisiones solo porque haya sido sustituido.

No mover documentos a `frontend/` ni mantener copias documentales dentro de la aplicación.

## 17. Criterios de aceptación

Una tarea de documentación se considera completa cuando se cumplen los criterios aplicables:

- El contenido describe la implementación real o identifica claramente lo que está previsto y pendiente de confirmar.
- Se ha inspeccionado el repositorio cuando estaba disponible.
- Se ha utilizado la fuente de verdad adecuada para cada tema.
- La documentación técnica está centralizada en `docs/` en la raíz del repositorio.
- No se ha creado `frontend/docs/`.
- No se han duplicado contratos, convenciones o responsabilidades ya definidos en otras skills.
- Los documentos afectados están actualizados.
- Las rutas, los nombres de archivos y los enlaces son correctos.
- El árbol de carpetas está actualizado si el cambio altera la estructura que representa.
- Los documentos relacionados mantienen la coherencia con el cambio.
- No se han creado archivos o directorios innecesarios o vacíos.
- No se han incluido secretos ni datos sensibles.
- Los ejemplos y las afirmaciones son verificables o están identificados como ilustrativos.
- Las decisiones no aprobadas están identificadas como propuestas y no como reglas vigentes.

No todos los cambios requieren modificar el árbol. Este criterio se aplica cuando el cambio afecta a la estructura representada.

## 18. Restricciones

Durante el trabajo documental:

- No inventar archivos, directorios, módulos, dependencias o comportamientos.
- No asumir que un elemento del árbol de referencia existe sin verificarlo.
- No crear todos los archivos mencionados en ejemplos.
- No reorganizar el repositorio para que coincida con un árbol documental desactualizado.
- No crear documentación duplicada para la misma responsabilidad.
- No introducir nuevas capas o patrones únicamente para hacer la documentación más uniforme.
- No modificar los contratos de API desde esta skill.
- No duplicar las reglas de integración definidas en la Skill 02.
- No sustituir el procedimiento de inventario definido en la Skill 03.
- No crear `frontend/docs/`.
- No dispersar documentación técnica dentro de la aplicación.
- No registrar secretos, credenciales ni información sensible.
- No eliminar decisiones históricas relevantes sin preservar su contexto.
- No declarar una tarea completamente validada cuando no se pudieron comprobar los aspectos necesarios.
