-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - TRIGGERS Y AUDITORÍA COMPLETA DE TABLAS (SUPABASE)
-- Instrucción: Copiar y ejecutar manualmente en Supabase > SQL Editor
-- ==============================================================================

-- 1. ASEGURAR ESTRUCTURA DE LA TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.tabla_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_afectada TEXT NOT NULL,
    operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en auditoría
ALTER TABLE public.tabla_auditoria ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen para evitar conflictos
DROP POLICY IF EXISTS "Solo administradores pueden consultar auditoria" ON public.tabla_auditoria;
DROP POLICY IF EXISTS "Staff puede consultar auditoria" ON public.tabla_auditoria;

-- Política RLS Auditoría: Administradores y Staff pueden consultar el historial completo
CREATE POLICY "Staff puede consultar auditoria" 
    ON public.tabla_auditoria FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'editor_contenido', 'agente_ventas')
        )
    );

-- 2. FUNCIÓN GENÉRICA ATÓMICA DE AUDITORÍA
CREATE OR REPLACE FUNCTION public.fn_registrar_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tabla_auditoria (
        tabla_afectada,
        operacion,
        usuario_id,
        datos_anteriores,
        datos_nuevos
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ASIGNACIÓN DE TRIGGERS EN TODAS LAS TABLAS DEL SISTEMA

-- A) Tabla: perfiles
DROP TRIGGER IF EXISTS trg_audit_perfiles ON public.perfiles;
CREATE TRIGGER trg_audit_perfiles
    AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- B) Tabla: paquetes_grupales
DROP TRIGGER IF EXISTS trg_audit_paquetes ON public.paquetes_grupales;
CREATE TRIGGER trg_audit_paquetes
    AFTER INSERT OR UPDATE OR DELETE ON public.paquetes_grupales
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- C) Tabla: inscripciones_grupo
DROP TRIGGER IF EXISTS trg_audit_inscripciones ON public.inscripciones_grupo;
CREATE TRIGGER trg_audit_inscripciones
    AFTER INSERT OR UPDATE OR DELETE ON public.inscripciones_grupo
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- D) Tabla: pagos
DROP TRIGGER IF EXISTS trg_audit_pagos ON public.pagos;
CREATE TRIGGER trg_audit_pagos
    AFTER INSERT OR UPDATE OR DELETE ON public.pagos
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- E) Tabla: destinos_turisticos
DROP TRIGGER IF EXISTS trg_audit_destinos ON public.destinos_turisticos;
CREATE TRIGGER trg_audit_destinos
    AFTER INSERT OR UPDATE OR DELETE ON public.destinos_turisticos
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- F) Tabla: solicitudes_cotizacion
DROP TRIGGER IF EXISTS trg_audit_cotizaciones ON public.solicitudes_cotizacion;
CREATE TRIGGER trg_audit_cotizaciones
    AFTER INSERT OR UPDATE OR DELETE ON public.solicitudes_cotizacion
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- G) Tabla: cms_contenido
DROP TRIGGER IF EXISTS trg_audit_cms ON public.cms_contenido;
CREATE TRIGGER trg_audit_cms
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_contenido
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- H) Tabla: favoritos_usuario
DROP TRIGGER IF EXISTS trg_audit_favoritos ON public.favoritos_usuario;
CREATE TRIGGER trg_audit_favoritos
    AFTER INSERT OR UPDATE OR DELETE ON public.favoritos_usuario
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- I) Tabla: roles_sistema
DROP TRIGGER IF EXISTS trg_audit_roles ON public.roles_sistema;
CREATE TRIGGER trg_audit_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.roles_sistema
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- ==============================================================================
-- FIN DEL SCRIPT. Todos los cambios (Insert, Update, Delete) en cualquiera de las 9
-- tablas del sistema serán auditados automáticamente con ID de usuario y marca de tiempo.
-- ==============================================================================
