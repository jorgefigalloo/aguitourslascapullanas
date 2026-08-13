-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SCRIPT SQL DE AUDITORÍA INTEGRAL PARA 10 TABLAS
-- Ejecutar en Supabase > SQL Editor
-- ==============================================================================

-- 1. ASEGURAR TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.tabla_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_afectada TEXT NOT NULL,
    operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tabla_auditoria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo administradores leen auditoria" ON public.tabla_auditoria;
CREATE POLICY "Solo administradores leen auditoria" 
    ON public.tabla_auditoria FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin')
        )
    );

-- 2. FUNCIÓN GENÉRICA REGISTRADORA DE AUDITORÍA
CREATE OR REPLACE FUNCTION public.fn_registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_datos_antes JSONB := NULL;
    v_datos_nuevos JSONB := NULL;
BEGIN
    v_user_id := auth.uid();

    IF (TG_OP = 'DELETE') THEN
        v_datos_antes := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_datos_antes := to_jsonb(OLD);
        v_datos_nuevos := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_datos_nuevos := to_jsonb(NEW);
    END IF;

    INSERT INTO public.tabla_auditoria (
        tabla_afectada,
        operacion,
        usuario_id,
        datos_anteriores,
        datos_nuevos
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        v_user_id,
        v_datos_antes,
        v_datos_nuevos
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APLICAR TRIGGERS DE AUDITORÍA A LAS 10 TABLAS DEL SISTEMA

-- 1. perfiles
DROP TRIGGER IF EXISTS audit_perfiles ON public.perfiles;
CREATE TRIGGER audit_perfiles AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 2. paquetes_grupales
DROP TRIGGER IF EXISTS audit_paquetes_grupales ON public.paquetes_grupales;
CREATE TRIGGER audit_paquetes_grupales AFTER INSERT OR UPDATE OR DELETE ON public.paquetes_grupales
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 3. inscripciones_grupo
DROP TRIGGER IF EXISTS audit_inscripciones_grupo ON public.inscripciones_grupo;
CREATE TRIGGER audit_inscripciones_grupo AFTER INSERT OR UPDATE OR DELETE ON public.inscripciones_grupo
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 4. pagos
DROP TRIGGER IF EXISTS audit_pagos ON public.pagos;
CREATE TRIGGER audit_pagos AFTER INSERT OR UPDATE OR DELETE ON public.pagos
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 5. roles_sistema
DROP TRIGGER IF EXISTS audit_roles_sistema ON public.roles_sistema;
CREATE TRIGGER audit_roles_sistema AFTER INSERT OR UPDATE OR DELETE ON public.roles_sistema
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 6. cms_contenido
DROP TRIGGER IF EXISTS audit_cms_contenido ON public.cms_contenido;
CREATE TRIGGER audit_cms_contenido AFTER INSERT OR UPDATE OR DELETE ON public.cms_contenido
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 7. destinos_turisticos
DROP TRIGGER IF EXISTS audit_destinos_turisticos ON public.destinos_turisticos;
CREATE TRIGGER audit_destinos_turisticos AFTER INSERT OR UPDATE OR DELETE ON public.destinos_turisticos
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 8. favoritos_usuario
DROP TRIGGER IF EXISTS audit_favoritos_usuario ON public.favoritos_usuario;
CREATE TRIGGER audit_favoritos_usuario AFTER INSERT OR UPDATE OR DELETE ON public.favoritos_usuario
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 9. solicitudes_cotizacion
DROP TRIGGER IF EXISTS audit_solicitudes_cotizacion ON public.solicitudes_cotizacion;
CREATE TRIGGER audit_solicitudes_cotizacion AFTER INSERT OR UPDATE OR DELETE ON public.solicitudes_cotizacion
FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 10. tabla_auditoria (Solo lecturas / auto-auditoria si aplica)
-- Auditoria de tabla_auditoria omitida para evitar recursión.
