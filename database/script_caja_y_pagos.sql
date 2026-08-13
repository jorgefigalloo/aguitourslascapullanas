-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - MÓDULO DE CAJA, AUDITORÍA DE PAGOS Y ANULACIONES
-- Ejecutar en Supabase > SQL Editor
-- ==============================================================================

-- 1. AGREGAR CAMPOS DE AUTORÍA Y ANULACIÓN A CUOTAS_INSCRIPCION
ALTER TABLE public.cuotas_inscripcion
ADD COLUMN IF NOT EXISTS cobrado_por UUID REFERENCES public.perfiles(id),
ADD COLUMN IF NOT EXISTS anulado_por UUID REFERENCES public.perfiles(id),
ADD COLUMN IF NOT EXISTS fecha_anulacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;

-- 2. CREAR TABLA DE HISTORIAL DE TRANSACCIONES DE CAJA (LIBRO DIARIO DE COBROS)
CREATE TABLE IF NOT EXISTS public.historial_pagos_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuota_id UUID REFERENCES public.cuotas_inscripcion(id) ON DELETE SET NULL,
    inscripcion_id UUID REFERENCES public.inscripciones_grupo(id) ON DELETE CASCADE,
    paquete_id UUID REFERENCES public.paquetes_grupales(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(20) NOT NULL DEFAULT 'ingreso' CHECK (tipo_movimiento IN ('ingreso', 'anulacion')),
    concepto VARCHAR(255) NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
    referencia_pago VARCHAR(100),
    procesado_por UUID REFERENCES public.perfiles(id),
    motivo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HABILITAR RLS Y POLÍTICAS DE SEGURIDAD
ALTER TABLE public.historial_pagos_caja ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver historial pagos admin" ON public.historial_pagos_caja;
CREATE POLICY "Ver historial pagos admin" 
ON public.historial_pagos_caja FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles 
    WHERE id = auth.uid() AND rol IN ('admin', 'vendedor', 'tesoreria')
  )
);

DROP POLICY IF EXISTS "Insertar historial pagos admin" ON public.historial_pagos_caja;
CREATE POLICY "Insertar historial pagos admin" 
ON public.historial_pagos_caja FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.perfiles 
    WHERE id = auth.uid() AND rol IN ('admin', 'vendedor', 'tesoreria')
  )
);
