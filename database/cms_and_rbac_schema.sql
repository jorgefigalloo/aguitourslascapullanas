-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - ESQUEMA CMS DINÁMICO & ROLES GRANULARES (RBAC)
-- Ejecutar en el SQL Editor de Supabase
-- ==============================================================================

-- 1. TABLA DE ROLES Y PERMISOS (RBAC)
CREATE TABLE IF NOT EXISTS public.roles_sistema (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    permisos JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar roles por defecto
INSERT INTO public.roles_sistema (id, nombre, descripcion, permisos) VALUES
('super_admin', 'Super Administrador', 'Acceso total a gestión de usuarios, auditoría y CMS', '["all"]'::jsonb),
('editor_contenido', 'Editor de Contenido', 'Gestión de banners 3D, textos, destinos y galería', '["cms_read", "cms_write"]'::jsonb),
('agente_ventas', 'Agente de Ventas', 'Gestión de cupos, inscripciones grupales y reservas', '["ventas_read", "ventas_write"]'::jsonb),
('cliente', 'Cliente / Viajero', 'Acceso a portal de cliente y reserva de grupos', '["cliente_read"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. TABLA DE SECCIONES DINÁMICAS CMS (Todo el contenido HTML editable en BD)
CREATE TABLE IF NOT EXISTS public.cms_contenido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave_seccion TEXT UNIQUE NOT NULL, -- ej: 'hero_inicio', 'mision_vision', 'banner_contacto'
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    cuerpo_texto TEXT,
    imagen_url TEXT,
    config_3d JSONB DEFAULT '{"tilt": true, "depth": 20}'::jsonb,
    creado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en CMS
ALTER TABLE public.cms_contenido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública del contenido CMS" 
    ON public.cms_contenido FOR SELECT 
    USING (true);

CREATE POLICY "Solo administradores y editores pueden editar el CMS" 
    ON public.cms_contenido FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'editor_contenido')
        )
    );

-- 3. TABLA DE DESTINOS DINÁMICOS
CREATE TABLE IF NOT EXISTS public.destinos_turisticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('nacional', 'internacional')),
    descripcion TEXT NOT NULL,
    imagen_portada TEXT NOT NULL,
    galeria JSONB DEFAULT '[]'::jsonb,
    destacado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.destinos_turisticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de destinos" 
    ON public.destinos_turisticos FOR SELECT 
    USING (true);

CREATE POLICY "Solo administradores y editores pueden editar destinos" 
    ON public.destinos_turisticos FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'editor_contenido')
        )
    );

-- 4. INSERTAR CONTENIDO DE MUESTRA CMS MIGRADO DE LAS SECCIONES ANTERIORES
INSERT INTO public.cms_contenido (clave_seccion, titulo, subtitulo, cuerpo_texto, imagen_url) VALUES
(
    'hero_inicio',
    'Explora el Mundo con Aguitours Las Capullanas',
    'Vive la verdadera experiencia de viajes en grupos de turismo inmersivos con diseño 3D',
    'Ofrecemos los mejores itinerarios nacionales e internacionales con acompañamiento profesional y grupos organizados.',
    'images/ciudades/fondo-destinos1.png'
),
(
    'nosotros_filosofia',
    'Nuestra Filosofía y Pasión por Viajar',
    'Más de 10 años conectando personas y creando recuerdos imborrables',
    'Somos una agencia de viajes confiable dedicada a organizar viajes en grupo y paquetes a medida para todos los amantes del turismo.',
    'images/nosotros-hero.png'
)
ON CONFLICT (clave_seccion) DO NOTHING;
