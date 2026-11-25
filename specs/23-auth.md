# SPEC: Implementación de autenticación, protección de rutas y control de expiración de sesión en el frontend

## 1. Contexto actual

El frontend ya cuenta con los módulos y CRUD de:

- Roles.
- Permisos.

Estos módulos ya existen y funcionan. **No deben volver a crearse, duplicarse ni reemplazarse.** El objetivo es integrar la autenticación y autorización del frontend con el sistema de seguridad implementado en el backend.

Antes de realizar cualquier modificación, el agente debe inspeccionar las skills del proyecto y comprender la arquitectura existente.

Ruta de referencia del frontend:

`C:\Users\braya\OneDrive - unc.edu.pe\TESIS\implementacion\frontend_gestion_citas\frontend`

Leer las skills completas, especialmente:

- `integration`: integración frontend-backend, OpenAPI, endpoints, métodos HTTP, schemas, cuerpos, headers, respuestas y manejo de errores.
- Arquitectura y organización del frontend.
- Servicios HTTP y consumo de API.
- Autenticación y manejo de estado, si existen.
- Routing, componentes, formularios y convenciones visuales.

No asumir nombres de archivos, carpetas, librerías ni patrones arquitectónicos sin inspeccionar el proyecto.

## 2. Objetivo

Implementar en el frontend:

1. Login público.
2. Gestión centralizada de la sesión autenticada.
3. Protección de todas las rutas privadas.
4. Control de permisos para rutas, menús y acciones.
5. Alerta de expiración de sesión un minuto antes de que expire el JWT.
6. Redirección automática al login cuando expire el token.
7. Cierre de sesión y limpieza del estado de autenticación.

La integración debe realizarse utilizando los endpoints y contratos reales del backend.

## 3. Rutas públicas y privadas

### Ruta pública

Debe existir una ruta de login accesible sin autenticación.

Ejemplo conceptual:

`/login`

Características:

- Cualquier usuario puede acceder sin token.
- Presentar formulario de email y contraseña.
- Validar campos obligatorios.
- Mostrar errores de autenticación.
- Mostrar estado de carga mientras se procesa el login.
- Evitar múltiples envíos simultáneos.
- Si el usuario ya tiene una sesión válida, redirigirlo a la aplicación privada.

### Rutas privadas

Todas las demás rutas de la aplicación deben estar protegidas.

Esto incluye:

- Dashboard.
- Pacientes.
- Personal.
- Citas.
- Clínicas.
- Procedimientos.
- Roles.
- Permisos.
- Los demás módulos existentes.

No debe quedar ninguna ruta funcional privada accesible sin autenticación.

Implementar una protección centralizada de rutas. No repetir verificaciones manuales en cada página.

Si un usuario no autenticado intenta acceder a una ruta privada:

- Redirigirlo a `/login`.
- Si es posible, conservar la ruta que intentaba visitar.
- Después de autenticarse, permitirle regresar a esa ruta si tiene los permisos necesarios.

## 4. Integración del login

Consumir el endpoint de autenticación real del backend.

Antes de implementarlo, revisar OpenAPI y la skill `integration` para conocer:

- Método HTTP.
- Ruta.
- Estructura del request.
- Estructura de la respuesta.
- Nombre del campo del token.
- Manejo de errores.
- Expiración del token.

No inventar contratos ni asumir que la respuesta tiene una estructura determinada.

Después de iniciar sesión correctamente:

- Guardar el token mediante la estrategia de almacenamiento compatible con el backend y la arquitectura del proyecto.
- Obtener los datos del usuario autenticado.
- Recuperar sus roles y permisos efectivos.
- Inicializar el estado global de autenticación.
- Redirigir al usuario a la aplicación privada.

## 5. Gestión centralizada de sesión

Implementar una única fuente de verdad para la sesión.

Debe gestionar:

- Token de acceso.
- Información del usuario.
- Roles.
- Permisos efectivos.
- Estado de inicialización.
- Estado de autenticación.
- Fecha y hora de expiración del token.

La inicialización de la aplicación debe comprobar si existe una sesión válida.

Si existe un token:

1. Validar su expiración.
2. Consultar al backend para recuperar el usuario autenticado, utilizando el endpoint real correspondiente.
3. Recuperar roles y permisos.
4. Permitir el acceso a las rutas correspondientes.

Mientras se realiza esta comprobación, mostrar un estado de carga. Evitar que aparezca momentáneamente el login o el contenido privado antes de conocer el estado real de la sesión.

## 6. Control de expiración del JWT

Este requisito es obligatorio.

El frontend debe controlar la fecha de expiración del token JWT mediante su claim `exp`, siempre que el token esté disponible para el cliente.

### 6.1. Alerta un minuto antes de expirar

Cuando falte exactamente un minuto para la expiración del token, el sistema debe mostrar una alerta visible al usuario.

Ejemplo del mensaje:

**Tu sesión está por expirar.** Tu sesión finalizará en un minuto. Guarda tus cambios antes de continuar.

Requisitos:

- Mostrar la alerta cuando falten aproximadamente 60 segundos.
- Mostrarla una sola vez por sesión/token.
- No mostrarla si el token ya expiró.
- La alerta debe ser claramente visible y comprensible.
- No bloquear innecesariamente el uso de la aplicación.
- La alerta debe desaparecer al cerrar sesión o cambiar de token.
- Debe de haber un boton para cerrar la alerta

No mostrar la alerta simplemente un minuto después del login. Calcular el tiempo restante utilizando la fecha real de expiración del JWT.

### 6.2. Cuando expire el token

Cuando se alcance la fecha de expiración:

1. Invalidar la sesión local.
2. Limpiar el token almacenado.
3. Limpiar el usuario autenticado.
4. Limpiar roles y permisos del estado global.
5. Limpiar los datos privados en caché que puedan conservar información de la sesión anterior.
6. Redirigir automáticamente a `/login`.
7. Mostrar un mensaje informativo:

**Tu sesión ha expirado. Inicia sesión nuevamente para continuar.**

No permitir que el usuario continúe navegando por rutas privadas con un token expirado.

### 6.3. Consideraciones técnicas

- Calcular el tiempo restante a partir de `exp` del JWT.
- Considerar que `exp` representa segundos Unix.
- Evitar depender únicamente de un temporizador iniciado al cargar la aplicación.
- Recalcular el tiempo restante cuando la pestaña vuelva a estar activa o el usuario regrese a la aplicación.
- Manejar correctamente la suspensión del equipo, cambios de pestaña y temporizadores retrasados.
- Evitar temporizadores duplicados cuando se actualice el estado de autenticación.
- Cancelar los temporizadores anteriores cuando se cierre sesión o se sustituya el token.
- Considerar la diferencia entre la hora del cliente y la del servidor cuando corresponda.

El backend sigue siendo la autoridad para validar el token. El control del frontend mejora la experiencia de usuario, pero no sustituye la validación del servidor.

## 7. Manejo global de respuestas HTTP

El cliente HTTP debe centralizar el manejo de errores de autenticación.

- **401 Unauthorized:** invalidar la sesión y redirigir al login cuando corresponda a un token inválido, expirado o una sesión no válida.
- **403 Forbidden:** mostrar acceso denegado. No cerrar la sesión automáticamente, porque el usuario puede estar autenticado pero no tener permiso para una operación.
- **422:** mostrar los errores de validación correspondientes.
- **500:** mostrar un mensaje de error controlado.
- **Errores de conexión:** informar al usuario sin destruir innecesariamente una sesión válida.

Evitar redirecciones repetidas o múltiples notificaciones cuando varias peticiones devuelvan 401 simultáneamente.

## 8. Autorización por permisos

El backend es la autoridad definitiva de autorización.

El frontend debe utilizar los permisos efectivos que devuelve el backend, sin definir permisos artificiales ni asumir permisos únicamente por el nombre del rol.

Implementar mecanismos reutilizables para:

- Comprobar un permiso.
- Comprobar si tiene al menos uno de varios permisos.
- Comprobar si tiene todos los permisos requeridos.

Aplicarlos a:

### Rutas

Impedir que un usuario acceda a una página si no tiene el permiso necesario.

### Menús

Mostrar únicamente las opciones de navegación autorizadas.

### Acciones

Controlar la visibilidad de botones y acciones como:

- Crear.
- Consultar.
- Editar.
- Eliminar.
- Cancelar.
- Asignar.
- Enviar.

Los nombres de los permisos deben coincidir con el catálogo real del backend.

No implementar listas fijas de permisos por rol. Si cambian los roles o sus permisos, el frontend debe reflejar los permisos efectivos recibidos del backend.

Ocultar botones no sustituye la autorización del backend.

## 9. CRUD existentes de roles y permisos

Los módulos de roles y permisos ya existen en el frontend.

Por tanto:

- No volver a desarrollar sus CRUD.
- No duplicar páginas, componentes, formularios ni servicios.
- No modificar innecesariamente su estructura.
- Integrarlos con el sistema centralizado de autenticación y permisos.
- Verificar que sus operaciones consuman los endpoints reales del backend.
- Proteger las rutas y acciones correspondientes según los permisos efectivos.

Si se necesita ajustar algún componente existente, hacerlo respetando su arquitectura y convenciones.

## 10. Cierre de sesión

Implementar el cierre de sesión.

Al cerrar sesión:

- Eliminar las credenciales locales.
- Limpiar usuario, roles y permisos.
- Limpiar los estados y datos privados asociados a la sesión.
- Cancelar temporizadores de expiración y alertas.
- Redirigir a `/login`.

No asumir que existe un endpoint de logout en el backend. Revisar OpenAPI y utilizarlo únicamente si está implementado.

## 11. Seguridad y almacenamiento

Inspeccionar cómo el backend entrega y espera recibir el token.

- Si existe soporte para cookies HttpOnly, Secure y SameSite, evaluar su utilización conforme a la arquitectura.
- Si el backend entrega el JWT en el cuerpo de la respuesta, utilizar la estrategia de almacenamiento existente o la más adecuada para el proyecto, documentando sus implicaciones.
- No asumir que `localStorage` es completamente seguro.
- No implementar refresh tokens si el backend no ofrece esa funcionalidad.
- No incluir credenciales en el código fuente.
- No confiar en la protección visual del frontend como mecanismo de seguridad.

## 12. Pruebas obligatorias

Verificar los siguientes escenarios:

1. Usuario no autenticado intenta ingresar al dashboard.
2. Usuario no autenticado intenta ingresar a cualquier módulo privado.
3. Usuario accede correctamente al login.
4. Login con credenciales incorrectas.
5. Login correcto.
6. Usuario autenticado accede a una ruta permitida.
7. Usuario autenticado intenta acceder a una ruta sin permisos.
8. Menús y acciones se muestran según los permisos efectivos.
9. La alerta aparece un minuto antes de expirar el token.
10. La alerta no aparece si el token ya expiró.
11. Al expirar el token se limpia la sesión y se redirige al login.
12. La aplicación detecta la expiración al volver a una pestaña suspendida.
13. Una respuesta 401 invalida la sesión cuando corresponde.
14. Una respuesta 403 no cierra la sesión.
15. El cierre de sesión limpia todos los datos privados.
16. Los CRUD existentes de roles y permisos siguen funcionando con los permisos correspondientes.
17. No existen rutas privadas accesibles sin autenticación.

## 13. Criterios de aceptación

La implementación se considera terminada cuando:

- Existe un login funcional y público.
- Todas las demás rutas funcionales están protegidas.
- La sesión se gestiona centralizadamente.
- El usuario recibe una alerta un minuto antes de expirar su JWT.
- Al expirar el token, se cierra la sesión local y se redirige al login.
- Los errores 401 y 403 tienen comportamientos diferenciados.
- La autorización visual utiliza los permisos efectivos del backend.
- Los CRUD existentes de roles y permisos continúan funcionando y no se han duplicado.
- La integración coincide con OpenAPI y la skill `integration`.
- Se han ejecutado y documentado las pruebas correspondientes.

## 14. Entregables

Al finalizar, presentar:

1. Archivos creados y modificados.
2. Implementación del login.
3. Sistema centralizado de autenticación.
4. Protección de rutas públicas y privadas.
5. Control de permisos.
6. Alerta de expiración de sesión.
7. Redirección automática al login cuando expire el JWT.
8. Manejo global de errores HTTP.
9. Pruebas ejecutadas y resultados.
10. Decisiones técnicas y cualquier limitación encontrada.

**Importante:** No modificar la arquitectura por conveniencia ni crear una segunda implementación de funcionalidades que ya existen. Primero inspeccionar las skills y el código actual; después implementar siguiendo las convenciones reales del proyecto.
