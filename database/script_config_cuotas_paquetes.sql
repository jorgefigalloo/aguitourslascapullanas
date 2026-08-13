-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - CONFIGURACIÓN DE CUOTAS Y PAGOS EN PAQUETES
-- Ejecutar en Supabase > SQL Editor
-- ==============================================================================

-- 1. AGREGAR COLUMNAS DE CONFIGURACIÓN DE CUOTAS A PAQUETES GRUPALES
ALTER TABLE public.paquetes_grupales
ADD COLUMN IF NOT EXISTS numero_cuotas INTEGER NOT NULL DEFAULT 2 CHECK (numero_cuotas >= 1),
ADD COLUMN IF NOT EXISTS porcentaje_cuota_inicial NUMERIC NOT NULL DEFAULT 50.00 CHECK (porcentaje_cuota_inicial > 0 AND porcentaje_cuota_inicial <= 100),
ADD COLUMN IF NOT EXISTS dias_limite_cuota_inicial INTEGER NOT NULL DEFAULT 5 CHECK (dias_limite_cuota_inicial >= 1);
