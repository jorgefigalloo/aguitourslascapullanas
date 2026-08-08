-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - REINICIO DE CUPOS PARA INSCRIPCIONES EN VIVO
-- Ejecutar en el SQL Editor de Supabase
-- ==============================================================================

-- 1. LIMPIAR INSCRIPCIONES Y PAGOS DE PRUEBA
TRUNCATE TABLE public.inscripciones_grupo CASCADE;
TRUNCATE TABLE public.pagos CASCADE;

-- 2. REINICIAR CUPO DISPONIBLE AL MÁXIMO EN TODOS LOS PAQUETES
UPDATE public.paquetes_grupales
SET cupo_disponible = cupo_maximo;
