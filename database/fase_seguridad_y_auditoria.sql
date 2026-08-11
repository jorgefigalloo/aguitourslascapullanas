-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - FASE DE SEGURIDAD, RLS & AUDITORÍA DE TABLAS
-- Ejecutar este archivo manualmente en el SQL Editor del Dashboard de Supabase
-- ==============================================================================

-- 1. HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
ALTER TABLE IF EXISTS public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.paquetes_grupales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inscripciones_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.destinos_turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cms_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tabla_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles_sistema ENABLE ROW LEVEL SECURITY;

-- 2. FUNCIÓN SECURITY DEFINER PARA EVITAR RECURSIÓN INFINITA EN POLÍTICAS RLS
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

-- ==============================================================================
-- 3. POLÍTICAS RLS PARA CADA TABLA (SIN RECURSIÓN)
-- ==============================================================================

-- A. PERFILES
DROP POLICY IF EXISTS "Perfil accesible por su dueño" ON public.perfiles;
DROP POLICY IF EXISTS "Perfil editable por su dueño" ON public.perfiles;
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Lectura publica de perfiles para usuarios autenticados" ON public.perfiles;
DROP POLICY IF EXISTS "Los usuarios actualizan su propio perfil" ON public.perfiles;

CREATE POLICY "Lectura publica de perfiles para usuarios autenticados" 
    ON public.perfiles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Los usuarios actualizan su propio perfil" 
    ON public.perfiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

-- B. PAQUETES GRUPALES
DROP POLICY IF EXISTS "Paquetes visibles publicamente" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Admins y ventas gestionan paquetes" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Lectura publica de paquetes grupales" ON public.paquetes_grupales;
DROP POLICY IF EXISTS "Gestion de paquetes por personal autorizado" ON public.paquetes_grupales;

CREATE POLICY "Lectura publica de paquetes grupales" 
    ON public.paquetes_grupales FOR SELECT 
    USING (true);

CREATE POLICY "Gestion de paquetes por personal autorizado" 
    ON public.paquetes_grupales FOR ALL 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));

-- C. INSCRIPCIONES A GRUPOS
DROP POLICY IF EXISTS "Clientes ven sus propias inscripciones" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Clientes pueden inscribirse" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Admins ven todas las inscripciones" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Lectura de inscripciones de grupo" ON public.inscripciones_grupo;
DROP POLICY IF EXISTS "Inscripciones de grupo por usuarios" ON public.inscripciones_grupo;

CREATE POLICY "Lectura de inscripciones de grupo" 
    ON public.inscripciones_grupo FOR SELECT 
    TO authenticated 
    USING (auth.uid() = usuario_id OR public.es_admin_o_personal(auth.uid()));

CREATE POLICY "Inscripciones de grupo por usuarios" 
    ON public.inscripciones_grupo FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = usuario_id);

-- D. DESTINOS TURÍSTICOS
DROP POLICY IF EXISTS "Destinos lectura publica" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Admins y editores gestionan destinos" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Lectura publica de destinos" ON public.destinos_turisticos;
DROP POLICY IF EXISTS "Gestion de destinos por personal autorizado" ON public.destinos_turisticos;

CREATE POLICY "Lectura publica de destinos" 
    ON public.destinos_turisticos FOR SELECT 
    USING (true);

CREATE POLICY "Gestion de destinos por personal autorizado" 
    ON public.destinos_turisticos FOR ALL 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));

-- E. CMS CONTENIDO
DROP POLICY IF EXISTS "CMS lectura publica" ON public.cms_contenido;
DROP POLICY IF EXISTS "Admins y editores gestionan CMS" ON public.cms_contenido;
DROP POLICY IF EXISTS "Lectura publica del CMS" ON public.cms_contenido;
DROP POLICY IF EXISTS "Gestion del CMS por personal autorizado" ON public.cms_contenido;

CREATE POLICY "Lectura publica del CMS" 
    ON public.cms_contenido FOR SELECT 
    USING (true);

CREATE POLICY "Gestion del CMS por personal autorizado" 
    ON public.cms_contenido FOR ALL 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));

-- F. TABLA DE AUDITORÍA
DROP POLICY IF EXISTS "Admins leen auditoria" ON public.tabla_auditoria;
DROP POLICY IF EXISTS "Lectura de auditoria por administradores" ON public.tabla_auditoria;

CREATE POLICY "Lectura de auditoria por administradores" 
    ON public.tabla_auditoria FOR SELECT 
    TO authenticated 
    USING (public.es_admin_o_personal(auth.uid()));

-- ==============================================================================
-- 4. FUNCIÓN Y TRIGGERS DE AUDITORÍA AUTOMÁTICA DE TABLAS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.registrar_auditoria_tabla()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tabla_auditoria (
        tabla_afectada,
        operacion,
        usuario_id,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de auditoría en tablas clave
DROP TRIGGER IF EXISTS trg_auditoria_destinos ON public.destinos_turisticos;
CREATE TRIGGER trg_auditoria_destinos
    AFTER INSERT OR UPDATE OR DELETE ON public.destinos_turisticos
    FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria_tabla();

DROP TRIGGER IF EXISTS trg_auditoria_paquetes ON public.paquetes_grupales;
CREATE TRIGGER trg_auditoria_paquetes
    AFTER INSERT OR UPDATE OR DELETE ON public.paquetes_grupales
    FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria_tabla();

DROP TRIGGER IF EXISTS trg_auditoria_cms ON public.cms_contenido;
CREATE TRIGGER trg_auditoria_cms
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_contenido
    FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria_tabla();

DROP TRIGGER IF EXISTS trg_auditoria_inscripciones ON public.inscripciones_grupo;
CREATE TRIGGER trg_auditoria_inscripciones
    AFTER INSERT OR UPDATE OR DELETE ON public.inscripciones_grupo
    FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria_tabla();
