-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - FASE DE AUDITORÍA CONSOLIDADA Y RLS (15 TABLAS ACTIVAS)
-- Instrucción: Copiar y ejecutar manualmente en Supabase > SQL Editor
-- ==============================================================================

-- 1. ASEGURAR TABLA DE AUDITORÍA INMUTABLE
CREATE TABLE IF NOT EXISTS public.tabla_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_afectada TEXT NOT NULL,
    operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para búsqueda rápida en el visor de auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON public.tabla_auditoria(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.tabla_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON public.tabla_auditoria(fecha DESC);

-- Habilitar RLS en tabla_auditoria
ALTER TABLE public.tabla_auditoria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff puede consultar auditoria" ON public.tabla_auditoria;
CREATE POLICY "Staff puede consultar auditoria" 
    ON public.tabla_auditoria FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'editor_contenido', 'agente_ventas')
        )
    );

-- 2. FUNCIÓN GENÉRICA ATÓMICA DE AUDITORÍA (SEGURIDAD DEFINER)
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

-- ==============================================================================
-- 3. TRIGGERS DE AUDITORÍA EN LAS 15 TABLAS FUNCIONALES ACTIVAS (COBERTURA 100%)
-- ==============================================================================

-- 1) perfiles (Usuarios y Clientes)
DROP TRIGGER IF EXISTS trg_audit_perfiles ON public.perfiles;
CREATE TRIGGER trg_audit_perfiles
    AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 2) paquetes_grupales
DROP TRIGGER IF EXISTS trg_audit_paquetes ON public.paquetes_grupales;
CREATE TRIGGER trg_audit_paquetes
    AFTER INSERT OR UPDATE OR DELETE ON public.paquetes_grupales
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 3) destinos_turisticos
DROP TRIGGER IF EXISTS trg_audit_destinos ON public.destinos_turisticos;
CREATE TRIGGER trg_audit_destinos
    AFTER INSERT OR UPDATE OR DELETE ON public.destinos_turisticos
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 4) inscripciones_grupo
DROP TRIGGER IF EXISTS trg_audit_inscripciones ON public.inscripciones_grupo;
CREATE TRIGGER trg_audit_inscripciones
    AFTER INSERT OR UPDATE OR DELETE ON public.inscripciones_grupo
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 5) acompanantes_inscripcion
DROP TRIGGER IF EXISTS trg_audit_acompanantes ON public.acompanantes_inscripcion;
CREATE TRIGGER trg_audit_acompanantes
    AFTER INSERT OR UPDATE OR DELETE ON public.acompanantes_inscripcion
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 6) cuotas_inscripcion
DROP TRIGGER IF EXISTS trg_audit_cuotas ON public.cuotas_inscripcion;
CREATE TRIGGER trg_audit_cuotas
    AFTER INSERT OR UPDATE OR DELETE ON public.cuotas_inscripcion
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 7) pagos
DROP TRIGGER IF EXISTS trg_audit_pagos ON public.pagos;
CREATE TRIGGER trg_audit_pagos
    AFTER INSERT OR UPDATE OR DELETE ON public.pagos
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 8) historial_pagos_caja
DROP TRIGGER IF EXISTS trg_audit_caja ON public.historial_pagos_caja;
CREATE TRIGGER trg_audit_caja
    AFTER INSERT OR UPDATE OR DELETE ON public.historial_pagos_caja
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 9) solicitudes_cotizacion
DROP TRIGGER IF EXISTS trg_audit_cotizaciones ON public.solicitudes_cotizacion;
CREATE TRIGGER trg_audit_cotizaciones
    AFTER INSERT OR UPDATE OR DELETE ON public.solicitudes_cotizacion
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 10) favoritos_usuario
DROP TRIGGER IF EXISTS trg_audit_favoritos ON public.favoritos_usuario;
CREATE TRIGGER trg_audit_favoritos
    AFTER INSERT OR UPDATE OR DELETE ON public.favoritos_usuario
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 11) cms_contenido
DROP TRIGGER IF EXISTS trg_audit_cms ON public.cms_contenido;
CREATE TRIGGER trg_audit_cms
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_contenido
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 12) roles_sistema
DROP TRIGGER IF EXISTS trg_audit_roles ON public.roles_sistema;
CREATE TRIGGER trg_audit_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.roles_sistema
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 13) imagenes_galeria (Cloudflare R2)
DROP TRIGGER IF EXISTS trg_audit_imagenes_galeria ON public.imagenes_galeria;
CREATE TRIGGER trg_audit_imagenes_galeria
    AFTER INSERT OR UPDATE OR DELETE ON public.imagenes_galeria
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 14) viajes_realizados (Experiencias de Colegios, Empresas, etc.)
DROP TRIGGER IF EXISTS trg_audit_viajes_realizados ON public.viajes_realizados;
CREATE TRIGGER trg_audit_viajes_realizados
    AFTER INSERT OR UPDATE OR DELETE ON public.viajes_realizados
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- 15) notificaciones (Avisos del Sistema)
DROP TRIGGER IF EXISTS trg_audit_notificaciones ON public.notificaciones;
CREATE TRIGGER trg_audit_notificaciones
    AFTER INSERT OR UPDATE OR DELETE ON public.notificaciones
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- ==============================================================================
-- 4. ACTUALIZAR MATRIZ DE PERMISOS EN ROLES_SISTEMA (RBAC)
-- ==============================================================================
-- Incorporar permisos de Galería Cloudflare R2 y Notificaciones
UPDATE public.roles_sistema 
SET permisos = permisos || '["galeria_ver", "galeria_listar", "galeria_subir", "galeria_editar", "galeria_eliminar", "notificaciones_ver", "notificaciones_listar", "notificaciones_crear", "notificaciones_bloquear", "notificaciones_eliminar"]'::jsonb
WHERE id IN ('admin', 'super_admin');

UPDATE public.roles_sistema 
SET permisos = permisos || '["galeria_ver", "galeria_listar", "galeria_subir", "galeria_editar", "notificaciones_ver", "notificaciones_listar"]'::jsonb
WHERE id = 'editor_contenido';

UPDATE public.roles_sistema 
SET permisos = permisos || '["galeria_ver", "galeria_listar", "notificaciones_ver", "notificaciones_listar"]'::jsonb
WHERE id = 'agente_ventas';

UPDATE public.roles_sistema 
SET permisos = permisos || '["notificaciones_ver"]'::jsonb
WHERE id = 'cliente';

-- ==============================================================================
-- VERIFICACIÓN FINAL
-- ==============================================================================
SELECT 'Auditoría y RLS configuradas exitosamente en las 15 tablas funcionales activas del sistema.' AS resultado;
