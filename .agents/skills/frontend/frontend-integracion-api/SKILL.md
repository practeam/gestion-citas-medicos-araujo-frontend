---
name: frontend-integracion-api
description: Define cómo integrar el frontend React con el backend FastAPI, consultar los contratos HTTP, implementar clientes API, tipar las solicitudes y respuestas, manejar errores y mantener la separación de responsabilidades.
---

# Skill: Integración API del Frontend

## 1. Objetivo

Establecer las convenciones para integrar el frontend con el backend mediante su API HTTP, garantizando que las solicitudes, respuestas, tipos, errores y procesos de autenticación respeten los contratos existentes.

Esta skill debe permitir que el agente implemente integraciones API sin inventar estructuras de datos, duplicar lógica de comunicación HTTP ni acoplar los componentes visuales directamente a los detalles del backend.

La integración debe respetar la arquitectura existente del frontend y del backend.

## 2. Principios generales

- El backend es responsable de implementar las reglas de negocio y exponer los contratos HTTP.
- El frontend consume esos contratos y adapta los datos para su presentación cuando sea necesario.
- No inventar endpoints, parámetros, campos, tipos ni estructuras de respuesta.
- No asumir que todos los endpoints devuelven exactamente los mismos datos.
- Mantener separada la comunicación HTTP de los componentes visuales.
- Reutilizar el cliente HTTP y las utilidades existentes antes de crear nuevas implementaciones.
- Mantener los tipos TypeScript sincronizados con los contratos reales del backend.
- Evitar duplicar lógica de autenticación, manejo de errores y configuración HTTP.
- No modificar contratos del backend desde el frontend.
- No reorganizar la estructura existente del frontend para implementar una integración.

## 3. Fuentes de información del contrato API

Antes de implementar una integración, el agente debe identificar las fuentes que describen el contrato del backend.

### 3.1. Skill general de contrato HTTP

Consultar la skill `backend-contrato-http` del backend.

Esta skill define las convenciones generales de comunicación HTTP, incluyendo:

- Métodos y rutas HTTP.
- Estructura general de las respuestas.
- Envoltorio común de respuesta.
- Convenciones de errores.
- Validación.
- Paginación.
- Códigos HTTP.
- Documentación OpenAPI.

Esta referencia define las convenciones generales, pero no contiene necesariamente los campos específicos de cada endpoint.

### 3.2. Archivo OpenAPI

Consultar el archivo de referencia:

`references/openapi.json`

Este archivo contiene la especificación OpenAPI generada por FastAPI y permite identificar:

- Rutas disponibles.
- Métodos HTTP.
- Parámetros de ruta.
- Parámetros de consulta.
- Cuerpos de solicitud.
- Schemas de entrada.
- Schemas de respuesta.
- Códigos de estado HTTP.
- Respuestas de error documentadas.

El agente debe utilizarlo para localizar los endpoints y conocer sus contratos publicados.

**Consideraciones:**

- El archivo puede quedar desactualizado respecto al backend.
- No todos los errores o comportamientos funcionales necesariamente estarán documentados.
- La documentación OpenAPI no reemplaza la lectura del código backend cuando exista una duda.
- No asumir que Swagger UI y una colección de Postman son el mismo documento.

Cuando sea necesario, el archivo OpenAPI puede regenerarse desde FastAPI utilizando el esquema publicado por el backend, normalmente disponible en `/openapi.json`.

Swagger UI, normalmente disponible en `/docs`, permite visualizar esa especificación.

### 3.3. Specs funcionales del backend

Consultar únicamente la spec del módulo relacionado con la funcionalidad que se está implementando.

Las specs permiten conocer:

- Objetivo funcional.
- Reglas de negocio.
- Flujos de trabajo.
- Restricciones.
- Validaciones funcionales.
- Relaciones entre entidades.
- Comportamientos esperados.

No es necesario leer todas las specs del backend para implementar una funcionalidad concreta.

### 3.4. Código real del backend

Cuando exista alguna duda o discrepancia, verificar el código correspondiente:

- Router del módulo.
- Schemas Pydantic.
- Servicios.
- Repositorios, cuando sea necesario comprender el comportamiento.
- Excepciones.
- Dependencias.

El código permite comprobar qué comportamiento está implementado realmente.

### 3.5. Jerarquía y discrepancias

Las fuentes tienen responsabilidades diferentes:

| Fuente | Responsabilidad |
|---|---|
| `backend-contrato-http` | Convenciones generales HTTP |
| `openapi.json` | Contratos HTTP publicados |
| Specs funcionales | Comportamiento esperado |
| Código backend | Comportamiento implementado |

Si las fuentes presentan diferencias:

1. Identificar exactamente qué campos, rutas o comportamientos no coinciden.
2. Verificar el código real del backend.
3. Revisar la spec funcional correspondiente.
4. Informar la discrepancia.
5. No inventar una solución ni modificar silenciosamente los contratos.

Si el comportamiento esperado y el implementado son diferentes, se debe señalar la diferencia antes de asumir cuál debe consumir el frontend.

## 4. Arquitectura de integración en el frontend

La integración debe respetar la estructura existente.

No se deben mover los componentes compartidos de la plantilla ni convertir todas las páginas existentes en módulos funcionales.

La organización será incremental y podrá incorporar una estructura compartida para la comunicación HTTP y servicios específicos dentro de cada módulo.

Ejemplo orientativo:

```text
src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── contexts/
├── hooks/
├── i18n/
├── pages/
├── services/
│   └── api/
│       ├── client.ts
│       ├── errors.ts
│       └── types.ts
├── modules/
│   ├── appointments/
│   │   ├── services/
│   │   │   └── appointment-api.ts
│   │   ├── types/
│   │   │   └── appointment.types.ts
│   │   └── ...
│   └── patients/
└── utils/
```

Esta estructura es una referencia, no una estructura obligatoria.

Reglas:

- `services/api/` contiene la infraestructura HTTP compartida cuando sea necesaria.
- Cada módulo mantiene sus servicios específicos de API.
- Los tipos específicos de una funcionalidad permanecen en su módulo.
- Los tipos genéricos de comunicación pueden permanecer en una ubicación compartida.
- No crear directorios vacíos.
- No crear archivos innecesarios.
- No duplicar clientes HTTP por módulo.

Si el proyecto ya cuenta con una implementación equivalente, reutilizarla.

## 5. Cliente HTTP centralizado

La comunicación HTTP debe centralizarse en un cliente compartido.

Antes de crearlo, inspeccionar si el proyecto ya utiliza:

- Axios.
- Fetch API.
- Algún cliente HTTP existente.
- Interceptores.
- Configuración de autenticación.
- Variables de entorno.

No instalar dependencias adicionales si la infraestructura existente permite resolver la necesidad.

El cliente HTTP debe centralizar, según corresponda:

- URL base del backend.
- Configuración de solicitudes.
- Headers comunes.
- Autenticación.
- Serialización de parámetros.
- Manejo de respuestas.
- Manejo de errores HTTP.
- Cancelación de solicitudes.
- Configuración de credenciales.

La URL base debe obtenerse de la configuración del proyecto o de variables de entorno.

No escribir URLs del backend directamente en los componentes.

## 6. Servicios API por módulo

Cada módulo funcional debe encapsular sus operaciones HTTP específicas.

Ejemplo:

```typescript
// modules/appointments/services/appointment-api.ts

export const appointmentApi = {
  // Operaciones específicas de citas.
};
```

Las funciones deben representar operaciones concretas del backend.

Ejemplos orientativos:

- `getAppointments`
- `getAppointmentById`
- `createAppointment`
- `updateAppointment`
- `cancelAppointment`

Los nombres y operaciones definitivos deben corresponder con los endpoints existentes.

Reglas:

- No implementar solicitudes HTTP directamente en componentes.
- No duplicar URLs o configuración HTTP.
- No colocar reglas de negocio del backend en los servicios frontend.
- No crear servicios genéricos innecesarios.
- Mantener las operaciones relacionadas dentro del módulo correspondiente.

## 7. Tipado TypeScript de los contratos

Los contratos del backend deben representarse mediante tipos o interfaces TypeScript.

Se deben identificar por separado:

- Tipos de solicitud.
- Tipos de respuesta.
- Tipos de entidades.
- Tipos de filtros.
- Tipos de paginación.
- Tipos de errores, cuando corresponda.

Ejemplo conceptual:

```typescript
export interface CreateAppointmentRequest {
  // Campos definidos por el contrato real.
}

export interface AppointmentResponse {
  // Campos definidos por el contrato real.
}

export interface AppointmentListResult {
  // Estructura real de la respuesta de listado.
}
```

Los campos definitivos deben obtenerse del OpenAPI y verificarse con los schemas del backend cuando sea necesario.

### 7.1. Envoltorio genérico de respuesta

Si el backend utiliza un envoltorio común, se puede representar mediante tipos genéricos compartidos:

```typescript
export interface ApiData<T> {
  result: T;
  details: unknown | null;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: ApiData<T>;
  code: number;
}
```

Este ejemplo debe ajustarse al contrato real.

No asumir que `details` siempre tiene la misma estructura ni que `result` siempre contiene una entidad individual.

Cada endpoint debe especificar su propio tipo de resultado.

Ejemplos conceptuales:

```typescript
ApiResponse<AppointmentResponse>
ApiResponse<AppointmentListResult>
ApiResponse<PatientResponse>
```

No duplicar la definición del envoltorio genérico en cada módulo.

### 7.2. Reglas de tipado

- Evitar `any`.
- Utilizar `unknown` cuando el contenido no esté definido.
- No convertir propiedades opcionales en obligatorias sin respaldo contractual.
- Respetar valores nullable.
- Diferenciar entre campos opcionales y campos que admiten `null`.
- No asumir que los datos de creación son iguales a los datos de respuesta.
- No utilizar directamente modelos ORM como referencia de tipos frontend.
- No inventar campos por conveniencia visual.

## 8. Manejo de errores

El manejo de errores debe estar centralizado siempre que sea posible.

El frontend debe contemplar:

- Errores de conexión.
- Errores HTTP.
- Errores de autenticación.
- Errores de autorización.
- Errores de validación.
- Errores funcionales.
- Errores inesperados.

El manejo debe respetar los códigos HTTP y el formato de error documentado por el backend.

Reglas:

- No asumir que todos los errores contienen el mismo cuerpo.
- No mostrar directamente objetos técnicos al usuario.
- No ocultar errores inesperados.
- No duplicar la transformación de errores en cada componente.
- Mantener los detalles técnicos disponibles para diagnóstico cuando corresponda.
- Presentar mensajes comprensibles en la interfaz.

La infraestructura HTTP debe facilitar el manejo común, mientras que los módulos pueden adaptar los errores específicos de sus operaciones.

## 9. Autenticación y autorización

La integración debe respetar el mecanismo de autenticación implementado por el backend.

Antes de implementar autenticación, verificar:

- Tipo de autenticación.
- Forma de envío de credenciales.
- Uso de cookies o tokens.
- Renovación de sesión.
- Expiración de credenciales.
- Respuestas ante sesiones inválidas.
- Mecanismo de autorización.

No asumir que el backend utiliza JWT, cookies u otro mecanismo sin verificarlo.

Reglas:

- No almacenar credenciales de forma insegura.
- No incluir secretos en variables públicas del frontend.
- No duplicar lógica de autenticación en cada servicio.
- No implementar permisos únicamente mediante controles visuales.
- El backend sigue siendo responsable de validar los permisos reales.

La interfaz puede ocultar o deshabilitar opciones según los permisos disponibles, pero esto no sustituye la autorización del backend.

## 10. Integración con componentes y páginas

Los componentes visuales no deben conocer los detalles internos de la comunicación HTTP.

La separación recomendada es:

```text
Página
  ↓
Hook o lógica de aplicación
  ↓
Servicio API del módulo
  ↓
Cliente HTTP compartido
  ↓
Backend FastAPI
```

Esta separación es orientativa. No es obligatorio crear hooks para operaciones simples si no aportan valor.

Reglas:

- Evitar solicitudes HTTP directamente dentro del JSX.
- Evitar duplicar llamadas y estados de carga en múltiples componentes.
- Mantener la lógica de presentación separada de la comunicación HTTP.
- Gestionar estados de carga, error, vacío y éxito.
- Actualizar los datos visibles después de las operaciones de escritura.
- Evitar solicitudes innecesarias.
- Reutilizar las soluciones existentes para manejo de estado y caché.

## 11. Paginación, filtros y ordenamiento

La implementación frontend debe respetar los parámetros que realmente acepta cada endpoint.

Antes de implementar:

1. Consultar los parámetros en OpenAPI.
2. Verificar sus nombres y tipos.
3. Revisar los valores predeterminados.
4. Consultar la spec funcional si existen reglas adicionales.
5. Verificar el formato de respuesta.

No asumir que todos los listados utilizan los mismos nombres de parámetros o la misma estructura de paginación.

Los filtros, ordenamientos y búsquedas deben corresponder con las capacidades reales del backend.

No implementar filtros exclusivamente visuales que aparenten funcionar en servidor cuando no existe soporte para ellos.

## 12. Procedimiento de trabajo para nuevas integraciones

Cuando se implemente una funcionalidad que consuma el backend, seguir este procedimiento:

### Paso 1. Identificar el módulo

Determinar qué módulo funcional del frontend necesita la integración.

### Paso 2. Inspeccionar la infraestructura existente

Revisar:

- Cliente HTTP.
- Variables de entorno.
- Tipos compartidos.
- Manejo de errores.
- Autenticación.
- Hooks y utilidades existentes.

Reutilizar lo que ya exista.

### Paso 3. Consultar el contrato

Consultar:

1. `backend-contrato-http`.
2. `references/openapi.json`.
3. La spec funcional del módulo correspondiente.
4. Código backend cuando sea necesario verificar el comportamiento.

No leer todas las specs del backend si no son relevantes para la funcionalidad.

### Paso 4. Identificar los endpoints necesarios

Documentar para cada operación:

- Método HTTP.
- Ruta.
- Parámetros.
- Body.
- Tipo de respuesta.
- Códigos HTTP.
- Errores relevantes.

### Paso 5. Definir los tipos TypeScript

Crear los tipos de solicitud y respuesta basados en el contrato real.

Reutilizar los tipos genéricos compartidos cuando corresponda.

### Paso 6. Implementar los servicios

Crear o actualizar los servicios API del módulo utilizando el cliente HTTP compartido.

### Paso 7. Integrar con la interfaz

Conectar los servicios con las páginas, hooks o componentes correspondientes.

Gestionar estados de carga, error, vacío y éxito.

### Paso 8. Verificar la integración

Comprobar:

- URLs y métodos.
- Parámetros.
- Cuerpos de solicitud.
- Tipos de respuesta.
- Manejo de errores.
- Autenticación.
- Comportamiento de la interfaz.

### Paso 9. Actualizar documentación y pruebas

Actualizar la documentación del frontend cuando se incorporen decisiones relevantes.

Agregar o modificar pruebas según corresponda.

## 13. Pruebas

Las integraciones API deben probarse de acuerdo con su complejidad.

Se deben contemplar, cuando corresponda:

- Pruebas del cliente HTTP.
- Pruebas de servicios API.
- Pruebas de transformación de datos.
- Pruebas de manejo de errores.
- Pruebas de hooks.
- Pruebas de integración de páginas.

Las pruebas deben comprobar tanto los escenarios exitosos como los escenarios de error.

No depender exclusivamente de pruebas manuales en Swagger o Postman.

## 14. Restricciones

El agente NO debe:

- Inventar endpoints o contratos.
- Inventar campos de respuesta.
- Asumir estructuras de datos no verificadas.
- Duplicar el cliente HTTP.
- Implementar solicitudes directamente en componentes visuales.
- Exponer secretos en el frontend.
- Reimplementar reglas de negocio que pertenecen al backend.
- Modificar contratos backend sin autorización.
- Ignorar discrepancias entre OpenAPI, specs y código.
- Crear estructuras innecesarias.
- Reorganizar toda la plantilla frontend para integrar una API.
- Crear módulos o archivos vacíos por anticipado.
- Leer indiscriminadamente toda la documentación cuando solo se necesita una funcionalidad concreta.

## 15. Criterio final

La integración API debe ser coherente con la arquitectura existente del frontend y respetar los contratos reales del backend.

La prioridad es conseguir una comunicación HTTP centralizada, tipada, mantenible y verificable, manteniendo las responsabilidades separadas.

El agente debe consultar la documentación necesaria para la funcionalidad concreta, verificar los contratos antes de implementarlos y señalar cualquier discrepancia que pueda afectar la integración.