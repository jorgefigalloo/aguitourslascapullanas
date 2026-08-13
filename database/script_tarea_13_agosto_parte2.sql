-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SCRIPT SQL TAREAS DEL 13 DE AGOSTO (PARTE 2)
-- Ejecutar en Supabase > SQL Editor
-- ==============================================================================

-- 1. COLUMNA FECHA LÍMITE DE INSCRIPCIÓN EN PAQUETES GRUPALES
ALTER TABLE public.paquetes_grupales
ADD COLUMN IF NOT EXISTS fecha_limite_inscripcion DATE;

-- 2. TABLA DE ACOMPAÑANTES POR RESERVA DE GRUPO
CREATE TABLE IF NOT EXISTS public.acompanantes_inscripcion (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL,
    nombre_completo TEXT NOT NULL,
    documento_identidad TEXT,
    fecha_nacimiento DATE,
    parentesco_nota TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT acompanantes_inscripcion_pkey PRIMARY KEY (id),
    CONSTRAINT acompanantes_inscripcion_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) 
        REFERENCES public.inscripciones_grupo(id) ON DELETE CASCADE
);

-- 3. TABLA DE CRONOGRAMA DE CUOTAS Y PAGOS DE CADA RESERVA
CREATE TABLE IF NOT EXISTS public.cuotas_inscripcion (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL,
    numero_cuota INTEGER NOT NULL DEFAULT 1 CHECK (numero_cuota > 0),
    concepto TEXT NOT NULL DEFAULT 'Cuota Inicial / Reserva'::text,
    monto NUMERIC NOT NULL CHECK (monto >= 0::numeric),
    fecha_vencimiento DATE,
    estado TEXT NOT NULL DEFAULT 'pendiente'::text 
        CHECK (estado = ANY (ARRAY['pendiente'::text, 'pagado'::text, 'vencido'::text, 'en_revision'::text])),
    comprobante_url TEXT,
    metodo_pago TEXT,
    referencia_pago TEXT,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT cuotas_inscripcion_pkey PRIMARY KEY (id),
    CONSTRAINT cuotas_inscripcion_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) 
        REFERENCES public.inscripciones_grupo(id) ON DELETE CASCADE
);

-- 4. FUNCIÓN Y TRIGGERS DE AUDITORÍA INMUTABLE PARA TODAS LAS TABLAS
CREATE OR REPLACE FUNCTION public.fn_auditar_tabla()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_datos_ant JSONB := NULL;
    v_datos_nuev JSONB := NULL;
BEGIN
    v_usuario_id := auth.uid();

    IF (TG_OP = 'DELETE') THEN
        v_datos_ant := to_jsonb(OLD);
        INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_anteriores)
        VALUES (TG_TABLE_NAME, TG_OP, v_usuario_id, v_datos_ant);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_datos_ant := to_jsonb(OLD);
        v_datos_nuev := to_jsonb(NEW);
        INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_usuario_id, v_datos_ant, v_datos_nuev);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        v_datos_nuev := to_jsonb(NEW);
        INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_usuario_id, v_datos_nuev);
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoría en tablas principales si no existen
DO $$
BEGIN
    -- acompanantes_inscripcion
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auditoria_acompanantes') THEN
        CREATE TRIGGER trg_auditoria_acompanantes
        AFTER INSERT OR UPDATE OR DELETE ON public.acompanantes_inscripcion
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_tabla();
    END IF;

    -- cuotas_inscripcion
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auditoria_cuotas') THEN
        CREATE TRIGGER trg_auditoria_cuotas
        AFTER INSERT OR UPDATE OR DELETE ON public.cuotas_inscripcion
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_tabla();
    END IF;

    -- paquetes_grupales
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auditoria_paquetes') THEN
        CREATE TRIGGER trg_auditoria_paquetes
        AFTER INSERT OR UPDATE OR DELETE ON public.paquetes_grupales
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_tabla();
    END IF;

    -- inscripciones_grupo
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auditoria_inscripciones') THEN
        CREATE TRIGGER trg_auditoria_inscripciones
        AFTER INSERT OR UPDATE OR DELETE ON public.inscripciones_grupo
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_tabla();
    END IF;

    -- pagos
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auditoria_pagos') THEN
        CREATE TRIGGER trg_auditoria_pagos
        AFTER INSERT OR UPDATE OR DELETE ON public.pagos
        FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_tabla();
    END IF;
END $$;

-- 5. SEGURIDAD ROW LEVEL SECURITY (RLS)
ALTER TABLE public.acompanantes_inscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuotas_inscripcion ENABLE ROW LEVEL SECURITY;

-- Políticas acompañantes
DROP POLICY IF EXISTS "Lectura publica o usuarios autenticados acompanantes" ON public.acompanantes_inscripcion;
CREATE POLICY "Lectura publica o usuarios autenticados acompanantes"
ON public.acompanantes_inscripcion FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios administran sus acompanantes" ON public.acompanantes_inscripcion;
CREATE POLICY "Usuarios administran sus acompanantes"
ON public.acompanantes_inscripcion FOR ALL USING (true);

-- Políticas cuotas
DROP POLICY IF EXISTS "Lectura publica o usuarios autenticados cuotas" ON public.cuotas_inscripcion;
CREATE POLICY "Lectura publica o usuarios autenticados cuotas"
ON public.cuotas_inscripcion FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios o admins administran cuotas" ON public.cuotas_inscripcion;
CREATE POLICY "Usuarios o admins administran cuotas"
ON public.cuotas_inscripcion FOR ALL USING (true);
