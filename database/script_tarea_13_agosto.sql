-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SCRIPT SQL TAREAS DEL 13 DE AGOSTO (ACTUALIZADO)
-- Ejecutar en Supabase > SQL Editor
-- ==============================================================================

-- 1. ACTUALIZAR RESTRICCIÓN CHECK EN PAQUETES GRUPALES PARA PERMITIR ESTADO 'oculto'
ALTER TABLE public.paquetes_grupales 
DROP CONSTRAINT IF EXISTS paquetes_grupales_estado_check;

ALTER TABLE public.paquetes_grupales 
ADD CONSTRAINT paquetes_grupales_estado_check 
CHECK (estado = ANY (ARRAY['abierto'::text, 'cerrado'::text, 'completo'::text, 'cancelado'::text, 'oculto'::text]));

-- 2. ACTUALIZAR RESTRICCIÓN CHECK EN INSCRIPCIONES DE GRUPO PARA PERMITIR CONFIRMACIÓN DE NUEVA TARIFA
ALTER TABLE public.inscripciones_grupo 
DROP CONSTRAINT IF EXISTS inscripciones_grupo_estado_check;

ALTER TABLE public.inscripciones_grupo 
ADD CONSTRAINT inscripciones_grupo_estado_check 
CHECK (estado = ANY (ARRAY['confirmado'::text, 'pendiente'::text, 'cancelado'::text, 'pendiente_confirmacion_tarifa'::text, 'rechazado_tarifa'::text]));

-- 3. FUNCIÓN ATÓMICA RPC PARA CERRAR PAQUETE CON RECÁLCULO DE TARIFA POR PERSONA Y AJUSTE DE CUPOS REALES
CREATE OR REPLACE FUNCTION public.fn_recalcular_tarifa_cerrar_paquete(
    p_paquete_id UUID,
    p_nuevo_precio_persona NUMERIC
)
RETURNS VOID AS $$
DECLARE
    v_total_personas INT;
BEGIN
    -- 1. Calcular total de personas inscritas actualmente
    SELECT COALESCE(SUM(cantidad_personas), 0) INTO v_total_personas
    FROM public.inscripciones_grupo
    WHERE paquete_id = p_paquete_id AND estado IN ('confirmado', 'pendiente', 'pendiente_confirmacion_tarifa');

    IF v_total_personas = 0 THEN
        v_total_personas := 1;
    END IF;

    -- 2. Actualizar el paquete: reciclar precio_persona, ajustar cupo_maximo al headcount actual de inscritos y dejar cupo_disponible en 0
    UPDATE public.paquetes_grupales
    SET precio_persona = p_nuevo_precio_persona,
        cupo_maximo = v_total_personas,
        cupo_disponible = 0,
        estado = 'cerrado',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_paquete_id;

    -- 3. Actualizar las inscripciones de este paquete al estado 'pendiente_confirmacion_tarifa'
    UPDATE public.inscripciones_grupo
    SET estado = 'pendiente_confirmacion_tarifa',
        precio_total = cantidad_personas * p_nuevo_precio_persona,
        notas = COALESCE(notas, '') || ' [Cierre de grupo con tarifa recalculada: S/ ' || p_nuevo_precio_persona || ' por persona]'
    WHERE paquete_id = p_paquete_id 
      AND estado IN ('confirmado', 'pendiente');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCIÓN ATÓMICA RPC PARA QUE EL CLIENTE ACEPTE O RECHAZE LA NUEVA TARIFA RECALCULADA
CREATE OR REPLACE FUNCTION public.fn_responder_nueva_tarifa_cliente(
    p_inscripcion_id UUID,
    p_usuario_id UUID,
    p_aceptar BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    v_paquete_id UUID;
    v_cant INT;
BEGIN
    SELECT paquete_id, cantidad_personas INTO v_paquete_id, v_cant
    FROM public.inscripciones_grupo
    WHERE id = p_inscripcion_id AND usuario_id = p_usuario_id;

    IF v_paquete_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la inscripción o no pertenece al usuario.';
    END IF;

    IF p_aceptar THEN
        UPDATE public.inscripciones_grupo
        SET estado = 'confirmado',
            notas = COALESCE(notas, '') || ' [Cliente aceptó nueva tarifa]'
        WHERE id = p_inscripcion_id;
    ELSE
        UPDATE public.inscripciones_grupo
        SET estado = 'cancelado',
            notas = COALESCE(notas, '') || ' [Cliente rechazó nueva tarifa]'
        WHERE id = p_inscripcion_id;

        -- Al rechazar, si el paquete está cerrado pero se liberan personas, actualizar cupo_maximo
        UPDATE public.paquetes_grupales
        SET cupo_maximo = GREATEST(1, cupo_maximo - v_cant)
        WHERE id = v_paquete_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. POLÍTICAS DE SEGURIDAD RLS PARA CONSULTAR QUIÉNES DIERON ME GUSTA Y AUDITORÍA
ALTER TABLE public.favoritos_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica o usuarios autenticados favoritos" ON public.favoritos_usuario;
CREATE POLICY "Lectura publica o usuarios autenticados favoritos"
ON public.favoritos_usuario FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Usuarios modifican sus propios favoritos" ON public.favoritos_usuario;
CREATE POLICY "Usuarios modifican sus propios favoritos"
ON public.favoritos_usuario FOR ALL
USING (auth.uid() = usuario_id);
