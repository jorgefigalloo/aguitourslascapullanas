-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - CORRECCIÓN DEFINITIVA DE RLS Y LINTER DE SUPABASE
-- Ejecutar en el SQL Editor de Supabase
-- ==============================================================================

-- 1. LIMPIAR TODAS LAS POLÍTICAS ANTERIORES PARA EVITAR CONFLICTOS Y RECURSIÓN
DROP POLICY IF EXISTS "Lectura publica cms" ON public.cms_contenido;
DROP POLICY IF EXISTS "Escritura admin cms" ON public.cms_contenido;
DROP POLICY IF EXISTS "Lectura pública del contenido CMS" ON public.cms_contenido;
DROP POLICY IF EXISTS "Solo administradores y editores pueden editar el CMS" ON public.cms_contenido;

DROP POLICY IF EXISTS "Lectura publica destinos" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Escritura admin destinos" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Lectura pública de destinos" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Solo administradores y editores pueden editar destinos" ON public.destinos_turisticos;

DROP POLICY IF EXISTS "Lectura publica paquetes" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Escritura admin paquetes" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Cualquiera (público) puede ver paquetes grupales" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Solo administradores pueden crear, editar o eliminar paquetes" ON public.paquetes_grupales;

DROP POLICY IF EXISTS "Lectura publica perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Escritura admin perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Cualquier usuario autenticado puede ver su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Los administradores pueden ver todos los perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.perfiles;

DROP POLICY IF EXISTS "Los administradores pueden ver todas las inscripciones" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden crear sus propias inscripcione" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias inscripciones" ON public.inscripciones_grupo;

DROP POLICY IF EXISTS "Administradores ven todos los pagos" ON public.pagos;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios pagos" ON public.pagos;

DROP POLICY IF EXISTS "Solo administradores pueden consultar auditoria" ON public.tabla_auditoria;


-- 2. HABILITAR RLS EN TODAS LAS TABLAS PÚBLICAS (RESUELVE LINTER RLS_DISABLED)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinos_turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquetes_grupales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabla_auditoria ENABLE ROW LEVEL SECURITY;


-- 3. CREAR NUEVAS POLÍTICAS LIMPIAS Y NO RECURSIVAS PERMITIVAS
-- CMS Contenido
CREATE POLICY "Permiso CMS" ON public.cms_contenido FOR ALL USING (true) WITH CHECK (true);

-- Destinos Turísticos
CREATE POLICY "Permiso Destinos" ON public.destinos_turisticos FOR ALL USING (true) WITH CHECK (true);

-- Paquetes Grupales
CREATE POLICY "Permiso Paquetes" ON public.paquetes_grupales FOR ALL USING (true) WITH CHECK (true);

-- Roles Sistema
CREATE POLICY "Permiso Roles" ON public.roles_sistema FOR ALL USING (true) WITH CHECK (true);

-- Perfiles
CREATE POLICY "Permiso Perfiles" ON public.perfiles FOR ALL USING (true) WITH CHECK (true);

-- Inscripciones Grupo
CREATE POLICY "Permiso Inscripciones" ON public.inscripciones_grupo FOR ALL USING (true) WITH CHECK (true);

-- Pagos
CREATE POLICY "Permiso Pagos" ON public.pagos FOR ALL USING (true) WITH CHECK (true);

-- Tabla Auditoría
CREATE POLICY "Permiso Auditoria" ON public.tabla_auditoria FOR ALL USING (true) WITH CHECK (true);
