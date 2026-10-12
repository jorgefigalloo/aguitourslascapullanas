-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - MÓDULO DE GALERÍA DE IMÁGENES Y CLOUDFLARE R2
-- Script SQL para Supabase (Editor SQL)
-- ==============================================================================

-- 1. CREACIÓN DE TABLA DE REGISTRO DE IMÁGENES (LOCALES Y CLOUDFLARE R2)
CREATE TABLE IF NOT EXISTS public.imagenes_galeria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    r2_key TEXT, -- Identificador único del objeto en Cloudflare R2
    origen TEXT NOT NULL DEFAULT 'cloudflare_r2' CHECK (origen IN ('cloudflare_r2', 'local', 'externo')),
    categoria TEXT NOT NULL DEFAULT 'general' CHECK (categoria IN ('paquetes', 'destinos', 'cms', 'general')),
    bytes BIGINT DEFAULT 0,
    tipo_mime TEXT DEFAULT 'image/jpeg',
    creado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.imagenes_galeria ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACCESO RLS
-- Lectura pública para que cualquier visitante vea fotos en la web
DROP POLICY IF EXISTS "Lectura pública de galería de imágenes" ON public.imagenes_galeria;
CREATE POLICY "Lectura pública de galería de imágenes"
    ON public.imagenes_galeria FOR SELECT
    USING (true);

-- Administradores y editores pueden registrar nuevas imágenes
DROP POLICY IF EXISTS "Administradores pueden registrar imágenes" ON public.imagenes_galeria;
CREATE POLICY "Administradores pueden registrar imágenes"
    ON public.imagenes_galeria FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Administradores pueden actualizar metadatos de imágenes
DROP POLICY IF EXISTS "Administradores pueden actualizar imágenes" ON public.imagenes_galeria;
CREATE POLICY "Administradores pueden actualizar imágenes"
    ON public.imagenes_galeria FOR UPDATE
    USING (
        auth.role() = 'authenticated'
    );

-- Administradores pueden eliminar imágenes registradas
DROP POLICY IF EXISTS "Administradores pueden eliminar imágenes" ON public.imagenes_galeria;
CREATE POLICY "Administradores pueden eliminar imágenes"
    ON public.imagenes_galeria FOR DELETE
    USING (
        auth.role() = 'authenticated'
    );

-- 4. INSERTAR IMÁGENES PREDETERMINADAS LOCALES EXISTENTES (SEED)
-- Conservamos las imágenes predeterminadas del proyecto para que puedan seguir siendo elegidas
INSERT INTO public.imagenes_galeria (titulo, url, r2_key, origen, categoria)
VALUES
    ('Logo Oficial Aguitours', '/images/capullanas1.jpg', NULL, 'local', 'cms'),
    ('Portada Hero Destinos', '/images/ciudades/fondo-destinos1.png', NULL, 'local', 'cms'),
    ('Quiénes Somos / Nosotros Hero', '/images/nosotros-hero.png', NULL, 'local', 'cms'),
    ('Cusco & Machu Picchu', '/images/ciudades/nacionales/cuzco.png', NULL, 'local', 'destinos'),
    ('Arequipa Ciudad Blanca', '/images/ciudades/nacionales/arequipa.png', NULL, 'local', 'destinos'),
    ('Tarapoto Selva Tropical', '/images/ciudades/nacionales/tarapoto.png', NULL, 'local', 'destinos'),
    ('París - Torre Eiffel', '/images/ciudades/internacionales/paris.jpg', NULL, 'local', 'destinos'),
    ('Fondo Turismo General', '/images/fondo-turismo.png', NULL, 'local', 'general')
ON CONFLICT DO NOTHING;
