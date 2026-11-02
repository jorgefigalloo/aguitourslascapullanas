# 🧭 DIRECTRICES DEL PROYECTO AGUITOURS LAS CAPULLANAS

Este documento contiene las reglas maestras de desarrollo que deben aplicarse rigurosamente en cada interacción:

1. **Testing Manual por el Usuario**:
   - Todas las pruebas y testings interactivos los realiza el usuario directamente en su navegador.
   - El agente no ejecuta pruebas invasivas; se enfoca en verificar código limpio, sin errores sintácticos ni fallas de compilación.

2. **Reestructuración y Modularidad**:
   - Si un archivo es extenso o complejo, reestructurarlo creando componentes y módulos desacoplados bajo la jerarquía de carpetas correspondiente (`src/components/admin/<modulo>/`, `src/components/cliente/`, `src/components/common/`, `src/lib/`, etc.).

3. **Backend en Supabase & Scripts SQL Separados**:
   - Todo cambio en base de datos (funciones RPC, triggers, tablas, vistas, RLS) debe entregarse en un archivo `.sql` independiente dentro de la carpeta `database/`.
   - El usuario ejecuta estos scripts manualmente en el SQL Editor de Supabase. Nunca intentar ejecutarlos automáticamente ni asumir cambios sin entregar el script.

4. **Matriz de Permisos RBAC**:
   - Toda tabla nueva o existente debe contar con sus respectivos permisos granulares en `src/lib/permisos.js` (`*_ver`, `*_listar`, `*_crear`, `*_editar`, `*_actualizar`, `*_bloquear`, `*_eliminar`) y sincronizarse con `roles_sistema`.

5. **Auditoría Inmutable en Base de Datos**:
   - Toda tabla funcional del sistema debe contar con su trigger automático conectado a `public.tabla_auditoria` para registrar operaciones INSERT, UPDATE y DELETE.

6. **Desarrollo por Fases Estructuradas**:
   - Seguir el plan de backend y frontend fase por fase de forma ordenada y documentada.

7. **Actualización Obligatoria de Documentación**:
   - Mantener al día `DOCUMENTACION_PROYECTO.md` registrando cada nuevo componente, script SQL, permisos y tablas auditadas.
