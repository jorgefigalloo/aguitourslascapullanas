-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SOLUCIÓN A RECURSIÓN INFINITA EN RLS (POLÍTICAS)
-- Ejecutar en el SQL Editor de Supabase para arreglar el error 500 inmediatamente
-- ==============================================================================

-- 1. CREAR FUNCIÓN SECURITY DEFINER PARA CONSULTAR ROLES SIN RECURSIÓN
CREATE OR REPLACE FUNCTION public.es_admin_o_personal(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles 
        WHERE id = p_user_id 
          AND rol IN ('super_admin', 'admin', 'editor_contenido', 'agente_ventas')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. LIMPIAR POLÍTICAS CONFLICTIVAS EN PERFILES
DROP POLICY IF EXISTS "Perfil accesible por su dueño" ON public.perfiles;
DROP POLICY IF EXISTS "Perfil editable por su dueño" ON public.perfiles;
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Cualquier usuario autenticado puede ver su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Los administradores pueden ver todos los perfiles" ON public.perfiles;

-- Políticas sanas para perfiles sin bucles
CREATE POLICY "Lectura publica de perfiles para usuarios autenticados" 
    ON public.perfiles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Los usuarios actualizan su propio perfil" 
    ON public.perfiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

-- 3. RE-APLICAR POLÍTICAS SEGURAS EN PAQUETES GRUPALES
DROP POLICY IF EXISTS "Paquetes visibles publicamente" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Admins y ventas gestionan paquetes" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Solo administradores pueden crear, editar o eliminar paquetes" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Cualquiera (público) puede ver paquetes grupales" ON public.paquetes_grupales;

CREATE POLICY "Lectura publica de paquetes grupales" 
    ON public.paquetes_grupales FOR SELECT 
    USING (true);

CREATE POLICY "Gestion de paquetes por personal autorizado" 
    ON public.paquetes_grupales FOR ALL 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));

-- 4. RE-APLICAR POLÍTICAS SEGURAS EN DESTINOS TURÍSTICOS
DROP POLICY IF EXISTS "Destinos lectura publica" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Admins y editores gestionan destinos" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Lectura pública de destinos" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Solo administradores y editores pueden editar destinos" ON public.destinos_turisticos;

CREATE POLICY "Lectura publica de destinos" 
    ON public.destinos_turisticos FOR SELECT 
    USING (true);

CREATE POLICY "Gestion de destinos por personal autorizado" 
    ON public.destinos_turisticos FOR ALL 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));

-- 5. RE-APLICAR POLÍTICAS SEGURAS EN CMS CONTENIDO
DROP POLICY IF EXISTS "CMS lectura publica" ON public.cms_contenido;
DROP POLICY IF EXISTS "Admins y editores gestionan CMS" ON public.cms_contenido;
DROP POLICY IF EXISTS "Lectura pública del contenido CMS" ON public.cms_contenido;
DROP POLICY IF EXISTS "Solo administradores y editores pueden editar el CMS" ON public.cms_contenido;

CREATE POLICY "Lectura publica del CMS" 
    ON public.cms_contenido FOR SELECT 
    USING (true);

CREATE POLICY "Gestion del CMS por personal autorizado" 
    ON public.cms_contenido FOR ALL 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));

-- 6. RE-APLICAR POLÍTICAS SEGURAS EN INSCRIPCIONES Y AUDITORÍA
DROP POLICY IF EXISTS "Clientes ven sus propias inscripciones" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Clientes pueden inscribirse" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Admins ven todas las inscripciones" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias inscripciones" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Los administradores pueden ver todas las inscripciones" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden crear sus propias inscripciones" ON public.inscripciones_grupo;

CREATE POLICY "Lectura de inscripciones de grupo" 
    ON public.inscripciones_grupo FOR SELECT 
    TO authenticated 
    USING (auth.uid() = usuario_id OR public.es_admin_o_personal(auth.uid()));

CREATE POLICY "Inscripciones de grupo por usuarios" 
    ON public.inscripciones_grupo FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins leen auditoria" ON public.tabla_auditoria;

CREATE POLICY "Lectura de auditoria por administradores" 
    ON public.tabla_auditoria FOR SELECT 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));
