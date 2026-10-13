-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - MÓDULO VIAJES REALIZADOS, ANTECEDENTES Y NOTIFICACIONES
-- Script SQL Integral para ejecutar en Supabase > SQL Editor
-- ==============================================================================

-- 1. CREACIÓN DE LA TABLA VIAJES REALIZADOS (ANTECEDENTES / CASOS DE ÉXITO)
CREATE TABLE IF NOT EXISTS public.viajes_realizados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    cliente_tipo TEXT NOT NULL CHECK (cliente_tipo IN ('colegio', 'empresa', 'organizacion', 'grupo_privado', 'familiar')),
    nombre_cliente TEXT NOT NULL, -- Ej: 'Colegio San Ignacio de Loyola', 'Alicorp S.A.A.'
    destino TEXT NOT NULL,         -- Ej: 'Cusco & Valle Sagrado', 'Máncora & Playas'
    fecha_viaje TEXT NOT NULL,     -- Ej: 'Octubre 2025', '15 al 20 Nov 2025'
    cantidad_pasajeros INT NOT NULL DEFAULT 1 CHECK (cantidad_pasajeros >= 1),
    descripcion TEXT NOT NULL,     -- Reseña o testimonio del viaje realizado
    imagen_portada TEXT NOT NULL,  -- URL de foto de portada (Cloudflare R2 o local)
    galeria JSONB DEFAULT '[]'::jsonb, -- Array con URLs de fotos adicionales del álbum
    destacado BOOLEAN NOT NULL DEFAULT false, -- Si aparece en la sección principal del Home
    orden INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREACIÓN DE LA TABLA DE NOTIFICACIONES DEL SISTEMA
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE, -- NULL = Notificación global
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'alerta', 'reserva', 'pago', 'sistema')),
    leido BOOLEAN NOT NULL DEFAULT false,
    url_accion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.viajes_realizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para viajes_realizados
DROP POLICY IF EXISTS "Lectura pública de viajes realizados activos" ON public.viajes_realizados;
CREATE POLICY "Lectura pública de viajes realizados activos"
    ON public.viajes_realizados FOR SELECT
    USING (
        activo = true 
        OR EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'editor_contenido')
        )
    );

DROP POLICY IF EXISTS "Admins y editores pueden registrar viajes realizados" ON public.viajes_realizados;
CREATE POLICY "Admins y editores pueden registrar viajes realizados"
    ON public.viajes_realizados FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'editor_contenido')
        )
    );

DROP POLICY IF EXISTS "Admins y editores pueden actualizar viajes realizados" ON public.viajes_realizados;
CREATE POLICY "Admins y editores pueden actualizar viajes realizados"
    ON public.viajes_realizados FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'editor_contenido')
        )
    );

DROP POLICY IF EXISTS "Solo administradores pueden eliminar viajes realizados" ON public.viajes_realizados;
CREATE POLICY "Solo administradores pueden eliminar viajes realizados"
    ON public.viajes_realizados FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin')
        )
    );

-- Políticas RLS para notificaciones (cada usuario solo ve sus propias notificaciones)
DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios ven sus propias notificaciones"
    ON public.notificaciones FOR SELECT
    USING (
        auth.uid() = usuario_id OR usuario_id IS NULL
    );

DROP POLICY IF EXISTS "Usuarios pueden marcar como leídas sus notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios pueden marcar como leídas sus notificaciones"
    ON public.notificaciones FOR UPDATE
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Solo administradores crean notificaciones" ON public.notificaciones;
CREATE POLICY "Solo administradores crean notificaciones"
    ON public.notificaciones FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'agente_ventas')
        )
    );

-- ==============================================================================
-- 4. TRIGGERS DE AUDITORÍA AUTOMÁTICA EN TABLA_AUDITORIA
-- ==============================================================================
-- Para las tablas nuevas y las que faltaban en el sistema
DROP TRIGGER IF EXISTS audit_viajes_realizados ON public.viajes_realizados;
CREATE TRIGGER audit_viajes_realizados 
    AFTER INSERT OR UPDATE OR DELETE ON public.viajes_realizados
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

DROP TRIGGER IF EXISTS audit_notificaciones ON public.notificaciones;
CREATE TRIGGER audit_notificaciones 
    AFTER INSERT OR UPDATE OR DELETE ON public.notificaciones
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

DROP TRIGGER IF EXISTS audit_imagenes_galeria ON public.imagenes_galeria;
CREATE TRIGGER audit_imagenes_galeria 
    AFTER INSERT OR UPDATE OR DELETE ON public.imagenes_galeria
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

DROP TRIGGER IF EXISTS audit_acompanantes_inscripcion ON public.acompanantes_inscripcion;
CREATE TRIGGER audit_acompanantes_inscripcion 
    AFTER INSERT OR UPDATE OR DELETE ON public.acompanantes_inscripcion
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

DROP TRIGGER IF EXISTS audit_cuotas_inscripcion ON public.cuotas_inscripcion;
CREATE TRIGGER audit_cuotas_inscripcion 
    AFTER INSERT OR UPDATE OR DELETE ON public.cuotas_inscripcion
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

DROP TRIGGER IF EXISTS audit_historial_pagos_caja ON public.historial_pagos_caja;
CREATE TRIGGER audit_historial_pagos_caja 
    AFTER INSERT OR UPDATE OR DELETE ON public.historial_pagos_caja
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria();

-- ==============================================================================
-- 5. ACTUALIZAR MATRIZ DE PERMISOS EN ROLES_SISTEMA
-- ==============================================================================
UPDATE public.roles_sistema 
SET permisos = permisos || '["antecedentes_ver", "antecedentes_listar", "antecedentes_crear", "antecedentes_editar", "antecedentes_destacar", "antecedentes_bloquear", "antecedentes_eliminar"]'::jsonb
WHERE id IN ('admin', 'super_admin');

UPDATE public.roles_sistema 
SET permisos = permisos || '["antecedentes_ver", "antecedentes_listar", "antecedentes_crear", "antecedentes_editar", "antecedentes_destacar", "antecedentes_bloquear"]'::jsonb
WHERE id = 'editor_contenido';

UPDATE public.roles_sistema 
SET permisos = permisos || '["antecedentes_ver", "antecedentes_listar"]'::jsonb
WHERE id IN ('agente_ventas', 'cliente');

-- ==============================================================================
-- 6. DATOS INICIALES DE MUESTRA (SEED) PARA VIAJES REALIZADOS
-- ==============================================================================
INSERT INTO public.viajes_realizados (
    titulo, cliente_tipo, nombre_cliente, destino, fecha_viaje, cantidad_pasajeros, 
    descripcion, imagen_portada, galeria, destacado, orden
) VALUES
(
    'Viaje de Promoción Bodas de Plata - Cusco Mágico & Machu Picchu',
    'colegio',
    'Colegio San Ignacio de Loyola',
    'Cusco & Valle Sagrado, Perú',
    'Noviembre 2025',
    42,
    'Experiencia inolvidable para 42 estudiantes y profesores con guiado privado, tren panorámico a Aguas Calientes, hoteles 4 estrellas y seguridad integral 24 horas.',
    '/images/ciudades/nacionales/cuzco.png',
    '["/images/ciudades/nacionales/cuzco.png", "/images/ciudades/fondo-destinos1.png"]'::jsonb,
    true,
    1
),
(
    'Convención Anual & Team Building Playas del Norte',
    'empresa',
    'Corporación Backus & Johnston',
    'Máncora & Punta Sal, Perú',
    'Diciembre 2025',
    65,
    'Evento corporativo de integración con actividades de liderazgo en playa, avistamiento de fauna marina, cena buffet gourmet y hospedaje frente al mar.',
    '/images/ciudades/fondo-destinos1.png',
    '["/images/ciudades/fondo-destinos1.png", "/images/capullanas1.jpg"]'::jsonb,
    true,
    2
),
(
    'Expedición Aventura & Naturaleza en Tarapoto',
    'grupo_privado',
    'Delegación Médica Regional Piura',
    'Tarapoto & Laguna Azul, Perú',
    'Enero 2026',
    28,
    'Circuito exclusivo de relajación y ecoturismo: cataratas de Ahuashiyacu, navegación en Laguna Azul con almuerzo típico amazónico y transporte privado climatizado.',
    '/images/ciudades/nacionales/tarapoto.png',
    '["/images/ciudades/nacionales/tarapoto.png", "/images/fondo-turismo.png"]'::jsonb,
    true,
    3
)
ON CONFLICT DO NOTHING;
