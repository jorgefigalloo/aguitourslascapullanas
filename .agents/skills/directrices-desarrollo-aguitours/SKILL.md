---
name: directrices-desarrollo-aguitours
description: Directrices maestras de desarrollo, arquitectura modular, gestión de base de datos Supabase, testing manual y actualización de documentación para el proyecto Aguitours Las Capullanas.
---

# 🚀 DIRECTRICES MAESTRAS DE DESARROLLO - AGUITOURS LAS CAPULLANAS

Esta skill define el protocolo de trabajo obligatorio y los estándares de ingeniería para todo desarrollo, refactorización o ampliación en el proyecto **Aguitours Las Capullanas**.

---

## 1. 🧪 Testing y Pruebas
- **Pruebas manuales exclusivas**: El usuario realiza todas las pruebas funcionales, interactivas y de testing directamente en su navegador y entorno local.
- **Rol del asistente**: Validar sintaxis, integridad de tipos, estructura de componentes y compilación (evitar romper el bundle o generar errores de consola). No ejecutar suites automatizadas intrusivas o cambios ciegos sin verificación previa.

---

## 2. 🧩 Modularidad y Archivos Extensos
- **Archivos limpios y desacoplados**: Si un archivo se vuelve extenso, complejo o sobrepasa un tamaño manejable, se debe **reestructurar inmediatamente** extrayendo subcomponentes, modales, hooks personalizados o utilidades a archivos independientes.
- **Estructura modular por carpetas**: Mantener la convención de carpetas por cada módulo del sistema:
  - `src/components/admin/<modulo>/` (ej: `antecedentes`, `destinos`, `paquetes`, `usuarios`, `cms`, `caja`, `auditoria`)
  - `src/components/cliente/`
  - `src/components/common/` (componentes reutilizables como selectores, visores de imágenes, alertas)
  - `src/lib/` (conexiones, clientes de API, matrices de permisos)
  - `src/context/` (estados globales como notificaciones Toast)

---

## 3. 🗄️ Backend en Supabase & Scripts SQL Independientes
- **Entrega en archivos separados**: Todo cambio a nivel de base de datos (tablas, funciones RPC, triggers, vistas, índices y políticas RLS) debe proporcionarse en un archivo `.sql` independiente dentro de la carpeta `database/`.
- **Ejecución manual por el usuario**: El usuario copia y ejecuta los scripts manualmente en el **SQL Editor de Supabase**. El asistente nunca debe asumir la ejecución directa en BD ni alterar esquemas sin entregar el script SQL correspondiente.
- **Idempotencia**: Todos los scripts SQL deben ser re-ejecutables de forma segura (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `DROP TRIGGER IF EXISTS ... CREATE TRIGGER`, `DROP POLICY IF EXISTS ... CREATE POLICY`).

---

## 4. 🛡️ Matriz de Permisos RBAC y Nuevas Tablas
- **Permisos granulares obligatorios**: Por cada tabla o módulo nuevo que se agregue o modifique, se deben registrar sus respectivos permisos granulares en `src/lib/permisos.js`:
  - `*_ver`: Ver detalle
  - `*_listar`: Listar registros
  - `*_crear`: Registrar nuevos datos
  - `*_editar`: Modificar información
  - `*_actualizar`: Cambiar estados o parámetros
  - `*_bloquear`: Desactivar u ocultar del público
  - `*_eliminar`: Eliminar registros
- **Sincronización con roles**: Actualizar las políticas RLS y los permisos por defecto de los roles en `public.roles_sistema` (`super_admin`, `admin`, `editor_contenido`, `agente_ventas`, `cliente`).

---

## 5. 📋 Auditoría Inmutable de Cambios (Triggers)
- **Cobertura 100% de tablas**: Toda tabla con operaciones CRUD debe contar con un trigger automático conectado a la función `public.fn_registrar_auditoria()`.
- **Registro de auditoría**: Cada trigger debe registrar en `public.tabla_auditoria`:
  - Tabla afectada
  - Operación (`INSERT`, `UPDATE`, `DELETE`)
  - ID de usuario ejecutor (`auth.uid()`)
  - Estado anterior (`OLD` en JSONB)
  - Estado nuevo (`NEW` en JSONB)
  - Marca de tiempo UTC

---

## 6. 🗺️ Plan de Backend en Supabase por Fases
- Los desarrollos de backend deben planificarse y ejecutarse **fase por fase**:
  - **Fase 1: Núcleo de Autenticación, Perfiles y RBAC**
  - **Fase 2: Catálogo Turístico & CMS Dinámico 3D**
  - **Fase 3: Clientes, Reservas & Cotizaciones a Medida**
  - **Fase 4: Pagos, Cuotas & Caja Libro Diario**
  - **Fase 5: Cloudflare R2, Galería & Antecedentes / Viajes Realizados**
  - **Fase 6: Auditoría Inmutable & Seguridad RLS Consolidada**

---

## 7. 📖 Documentación Centralizada
- Mantener siempre actualizado el archivo `DOCUMENTACION_PROYECTO.md` tras completar cualquier cambio arquitectónico, nuevo componente, script SQL o ajuste de permisos.
- Registrar el estado de avance, tablas auditadas, rutas de componentes y comandos para ejecutar en local.
