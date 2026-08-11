-- ==============================================================================
-- SCRIPT SQL: AGREGAR CAMPO ACTIVO A LA TABLA PERFILES
-- Proyecto: Aguitours Las Capullanas
-- Fecha: Agosto 2026
-- Instrucciones: Ejecutar este script en el SQL Editor de Supabase
-- ==============================================================================

ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;

-- Actualizar usuarios existentes para asegurar activo = true
UPDATE public.perfiles 
SET activo = true 
WHERE activo IS NULL;
