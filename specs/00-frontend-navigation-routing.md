## Integración de módulos con la navegación y las rutas

### 1. Barra lateral

**Archivo:** `frontend/src/components/layout/app-layout/sidebar/data.tsx`

La navegación debe permitir organizar las funcionalidades mediante opciones independientes o grupos con elementos anidados (`subItems`).

Reglas:

1. Una funcionalidad puede registrarse como opción independiente cuando no necesita agruparse con otras.
2. Varias funcionalidades relacionadas pueden agruparse bajo una misma sección.
3. Los grupos deben representar áreas funcionales del sistema, no simplemente agrupar páginas sin relación.
4. Se permite combinar opciones independientes y grupos.
5. Un módulo puede incorporarse inicialmente como opción independiente y agruparse posteriormente cuando existan otras funcionalidades relacionadas.
6. Respetar la estructura `NavItem`, las propiedades admitidas y el comportamiento real de `subItems`.
7. Cada elemento debe tener una clave `key` válida para las traducciones y un `path` correspondiente a una ruta registrada.
8. Reutilizar los iconos existentes y seleccionar uno representativo para cada sección.
9. Respetar la organización existente de `navItems`, `othersItems` y `supportItems`.
10. No eliminar ni modificar opciones de la plantilla que no estén relacionadas con el cambio.

Ejemplo de organización funcional:

- Administración
  - Roles.
  - Permisos.
  - Usuarios.
- Gestión de citas
  - Calendario.
  - Citas.
- Gestión de pacientes
  - Pacientes.
  - Historial clínico.

La agrupación es orientativa y debe responder a las necesidades reales del sistema.

### 2. Registro de rutas

**Archivo:** `frontend/src/App.tsx`

Cada página o funcionalidad que deba ser accesible mediante navegación debe contar con una ruta registrada en el sistema.

Reglas:

1. Registrar las rutas de las páginas nuevas respetando el mecanismo de enrutamiento existente.
2. Utilizar rutas claras, consistentes y relacionadas con el módulo funcional.
3. Evitar rutas duplicadas.
4. Mantener una relación coherente entre las rutas registradas y los destinos definidos en `data.tsx`.
5. Las rutas deben apuntar a las páginas correspondientes del módulo.
6. Respetar los layouts existentes y utilizar el layout apropiado para cada página.
7. Mantener las rutas existentes de la plantilla que no estén relacionadas con la funcionalidad implementada.
8. Si una funcionalidad necesita varias páginas, registrar las rutas correspondientes para cada una.
9. Cuando corresponda, contemplar rutas con parámetros dinámicos, por ejemplo, identificadores de registros.
10. Mantener una estructura consistente para las rutas de listado, creación, detalle y edición, según las necesidades de cada módulo.
11. No implementar protección de rutas ni autorización efectiva salvo que exista una especificación que lo solicite.
12. Evitar introducir mecanismos de enrutamiento adicionales si la aplicación ya dispone de uno.

### 3. Relación entre rutas y barra lateral

1. Cada opción de navegación que tenga un destino debe apuntar a una ruta existente.
2. Los grupos de navegación organizan visualmente las opciones, pero no necesariamente necesitan una ruta propia.
3. Las páginas secundarias pueden tener rutas registradas sin aparecer directamente en la barra lateral. Por ejemplo, formularios de creación, edición y detalles.
4. Al acceder a una ruta secundaria, debe mantenerse una navegación coherente con el módulo al que pertenece.
5. El estado activo de las opciones y grupos debe respetar el comportamiento implementado por el componente de navegación.

### 4. Consideraciones antes de implementar

Antes de modificar `App.tsx` o `data.tsx`, inspeccionar:

- La configuración actual del router.
- Las rutas y layouts existentes.
- El tipo `NavItem`.
- El componente que renderiza la barra lateral.
- El comportamiento de los elementos `subItems`.
- El sistema de traducciones.
- Los mecanismos de detección de rutas activas.

No asumir estructuras, propiedades o comportamientos que no estén implementados.

### 5. Criterios de aceptación

- Las nuevas páginas tienen sus rutas registradas.
- Los destinos de la barra lateral corresponden a rutas existentes.
- Se pueden organizar funcionalidades como opciones independientes o grupos.
- Las páginas secundarias pueden ser accesibles sin aparecer obligatoriamente en el menú.
- Se conserva el funcionamiento de las rutas y la navegación existentes.
- Se reutilizan los layouts y mecanismos de navegación de la plantilla.
- Los nombres de las rutas deben ser descriptivos, representativos de la funcionalidad y coherentes con el módulo al que pertenecen. Evitar nombres genéricos, abreviaturas innecesarias o rutas ambiguas.
Ejemplos:
- /roles
- /roles/create
- /roles/15/edit
- /patients
- /appointments