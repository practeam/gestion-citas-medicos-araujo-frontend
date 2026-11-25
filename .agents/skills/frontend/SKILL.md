## Selección de skills del frontend

Antes de implementar, modificar, crear o eliminar cualquier cosa en el frontend:

1. Analiza qué se pide y qué partes del proyecto afecta.
2. Elige la skill o skills que correspondan según esta tabla:

| Si la tarea implica... | Usa |
|---|---|
| Crear el proyecto, crear/mover archivos o carpetas, añadir módulos funcionales, decidir dónde ubicar componentes, definir responsabilidades, dependencias, rutas o layouts. | `$frontend-arquitectura` |
| Conectar con el backend, crear o modificar servicios API, cliente HTTP, tipos TypeScript, autenticación, respuestas, errores HTTP o paginación. | `$frontend-integracion-api` |
| Buscar, inspeccionar o reutilizar componentes UI, layouts, hooks, contextos, providers, utilidades, iconos y recursos existentes. | `$frontend-catalogo-componentes` |
| Escribir o actualizar documentación, registrar decisiones, documentar módulos o integraciones, actualizar el catálogo o el árbol de carpetas en `docs/`. | `$frontend-documentacion` |

3. Antes de escribir código, indica en una línea qué skill(s) vas a usar y por qué.
4. Si no está claro qué hacer o qué skill aplica, pregunta antes de implementar.
5. Una tarea puede requerir varias skills (por ejemplo, crear un módulo que consume el backend usa arquitectura, integración API y documentación). Si se contradicen, cada skill es la fuente de verdad de su tema:

   arquitectura → estructura y organización; integración API → comunicación con el backend; catálogo → componentes y recursos existentes; documentación → `docs/`.

**Regla:** toda la documentación técnica debe guardarse en `docs/`, en la raíz del repositorio, al mismo nivel que `frontend/`. Nunca crear `frontend/docs/`.

