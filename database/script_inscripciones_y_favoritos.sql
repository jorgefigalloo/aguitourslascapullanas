-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - INSCRIPCIONES ATÓMICAS, FAVORITOS Y RLS
-- Ejecutar en Supabase > SQL Editor
-- ==============================================================================

-- 1. ASEGURAR ESTRUCTURA DE TABLA FAVORITOS_USUARIO
CREATE TABLE IF NOT EXISTS public.favoritos_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    paquete_id UUID REFERENCES public.paquetes_grupales(id) ON DELETE CASCADE,
    destino_id UUID REFERENCES public.destinos_turisticos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('paquete', 'destino')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en favoritos_usuario
ALTER TABLE public.favoritos_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Los usuarios ven sus propios favoritos" ON public.favoritos_usuario;
CREATE POLICY "Los usuarios ven sus propios favoritos" 
    ON public.favoritos_usuario FOR SELECT 
    USING (auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol IN ('super_admin', 'admin')));

DROP POLICY IF EXISTS "Los usuarios pueden insertar sus favoritos" ON public.favoritos_usuario;
CREATE POLICY "Los usuarios pueden insertar sus favoritos" 
    ON public.favoritos_usuario FOR INSERT 
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus favoritos" ON public.favoritos_usuario;
CREATE POLICY "Los usuarios pueden eliminar sus favoritos" 
    ON public.favoritos_usuario FOR DELETE 
    USING (auth.uid() = usuario_id);

-- 2. FUNCION ATÓMICA DE RESERVA E INSCRIPCIÓN A PAQUETES GRUPALES
CREATE OR REPLACE FUNCTION public.fn_inscribir_usuario_paquete(
    p_usuario_id UUID,
    p_paquete_id UUID,
    p_cantidad_personas INT DEFAULT 1,
    p_notas TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_cupo_disp INT;
    v_precio_persona NUMERIC;
    v_precio_total NUMERIC;
    v_inscripcion_id UUID;
    v_resultado JSONB;
BEGIN
    -- Validar cupo y precio en paquetes_grupales
    SELECT cupo_disponible, precio_persona 
    INTO v_cupo_disp, v_precio_persona
    FROM public.paquetes_grupales
    WHERE id = p_paquete_id FOR UPDATE;

    IF v_cupo_disp IS NULL THEN
        RAISE EXCEPTION 'El paquete turistico seleccionado no existe.';
    END IF;

    IF v_cupo_disp < p_cantidad_personas THEN
        RAISE EXCEPTION 'No hay suficientes cupos disponibles. Cupos restantes: %', v_cupo_disp;
    END IF;

    v_precio_total := v_precio_persona * p_cantidad_personas;

    -- Insertar inscripcion
    INSERT INTO public.inscripciones_grupo (
        usuario_id,
        paquete_id,
        cantidad_personas,
        precio_total,
        estado,
        notas
    )
    VALUES (
        p_usuario_id,
        p_paquete_id,
        p_cantidad_personas,
        v_precio_total,
        'confirmado',
        p_notas
    )
    RETURNING id INTO v_inscripcion_id;

    -- Decrementar cupos atómicamente
    UPDATE public.paquetes_grupales
    SET cupo_disponible = cupo_disponible - p_cantidad_personas,
        estado = CASE WHEN (cupo_disponible - p_cantidad_personas) <= 0 THEN 'completo' ELSE estado END,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_paquete_id;

    v_resultado := jsonb_build_object(
        'success', true,
        'inscripcion_id', v_inscripcion_id,
        'precio_total', v_precio_total,
        'cupos_restantes', v_cupo_disp - p_cantidad_personas
    );

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNCION RPC PARA TOGGLE DE FAVORITO (LIKE / UNLIKE)
CREATE OR REPLACE FUNCTION public.fn_toggle_favorito(
    p_usuario_id UUID,
    p_item_id UUID,
    p_tipo TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_favorito_id UUID;
    v_is_liked BOOLEAN;
BEGIN
    IF p_tipo = 'destino' THEN
        SELECT id INTO v_favorito_id
        FROM public.favoritos_usuario
        WHERE usuario_id = p_usuario_id AND destino_id = p_item_id AND tipo = 'destino';
    ELSE
        SELECT id INTO v_favorito_id
        FROM public.favoritos_usuario
        WHERE usuario_id = p_usuario_id AND paquete_id = p_item_id AND tipo = 'paquete';
    END IF;

    IF v_favorito_id IS NOT NULL THEN
        DELETE FROM public.favoritos_usuario WHERE id = v_favorito_id;
        v_is_liked := false;
    ELSE
        IF p_tipo = 'destino' THEN
            INSERT INTO public.favoritos_usuario (usuario_id, destino_id, tipo) VALUES (p_usuario_id, p_item_id, 'destino');
        ELSE
            INSERT INTO public.favoritos_usuario (usuario_id, paquete_id, tipo) VALUES (p_usuario_id, p_item_id, 'paquete');
        END IF;
        v_is_liked := true;
    END IF;

    RETURN jsonb_build_object('success', true, 'liked', v_is_liked);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
