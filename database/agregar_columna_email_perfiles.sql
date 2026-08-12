-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SCRIPT SQL: AGREGAR COLUMNA EMAIL EN PERFILES
-- Ejecutar en Supabase > SQL Editor para poder ver y editar el email en perfiles
-- ==============================================================================

ALTER TABLE public.perfiles 
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.perfiles.email IS 'Correo electrónico del usuario para login y notificaciones';
