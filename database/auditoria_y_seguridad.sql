-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SISTEMA DE AUDITORÍA Y SEGURIDAD AVANZADA (SUPABASE)
-- Ejecutar este archivo manualmente en el SQL Editor de Supabase
-- ==============================================================================

-- 1. CREACIÓN DE TABLA DE AUDITORÍA
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

-- Política RLS Auditoría: Solo administradores pueden consultar el registro de auditoría
CREATE POLICY "Solo administradores pueden consultar auditoria" 
    ON public.tabla_auditoria FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- 2. FUNCIÓN DE TRIGGER PARA REGISTRAR CAMBIOS AUTOMÁTICAMENTE
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

-- 3. ASIGNAR TRIGGERS DE AUDITORÍA A LAS TABLAS CLAVE

-- Auditoría en paquetes_grupales
DROP TRIGGER IF EXISTS trg_audit_paquetes ON public.paquetes_grupales;
CREATE TRIGGER trg_audit_paquetes
    AFTER INSERT OR UPDATE OR DELETE ON public.paquetes_grupales
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- Auditoría en inscripciones_grupo
DROP TRIGGER IF EXISTS trg_audit_inscripciones ON public.inscripciones_grupo;
CREATE TRIGGER trg_audit_inscripciones
    AFTER INSERT OR UPDATE OR DELETE ON public.inscripciones_grupo
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- Auditoría en perfiles
DROP TRIGGER IF EXISTS trg_audit_perfiles ON public.perfiles;
CREATE TRIGGER trg_audit_perfiles
    AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- Auditoría en pagos
DROP TRIGGER IF EXISTS trg_audit_pagos ON public.pagos;
CREATE TRIGGER trg_audit_pagos
    AFTER INSERT OR UPDATE OR DELETE ON public.pagos
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();
