-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - ESQUEMA DE BASE DE DATOS SUPABASE / POSTGRES
-- Módulo de Paquetes Grupales, Usuarios, RLS y Transacciones Atómicas
-- ==============================================================================

-- 1. HABILITAR EXTENSIONES ÚTILES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLA DE PERFILES (Vinculada a auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    documento_identidad TEXT, -- DNI o Pasaporte
    fecha_nacimiento DATE,
    rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS perfiles
CREATE POLICY "Cualquier usuario autenticado puede ver su propio perfil" 
    ON public.perfiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
    ON public.perfiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Los administradores pueden ver todos los perfiles" 
    ON public.perfiles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ==============================================================================
-- 3. TRIGGER PARA CREAR PERFIL AUTOMÁTICO AL REGISTRARSE EN AUTH.USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre_completo, telefono, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
        COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existía y volver a crearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. TABLA DE PAQUETES GRUPALES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.paquetes_grupales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    destino TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    itinerario JSONB DEFAULT '[]'::jsonb, -- Estructura flexible para itinerario por días
    fecha_salida DATE NOT NULL,
    fecha_retorno DATE NOT NULL,
    precio_persona NUMERIC(10, 2) NOT NULL CHECK (precio_persona >= 0),
    cupo_maximo INT NOT NULL CHECK (cupo_maximo > 0),
    cupo_disponible INT NOT NULL CHECK (cupo_disponible >= 0),
    estado TEXT NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado', 'completo', 'cancelado')),
    imagen_portada TEXT NOT NULL,
    creado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en paquetes_grupales
ALTER TABLE public.paquetes_grupales ENABLE ROW LEVEL SECURITY;

-- Políticas RLS paquetes_grupales
CREATE POLICY "Cualquiera (público) puede ver paquetes grupales" 
    ON public.paquetes_grupales FOR SELECT 
    USING (true);

CREATE POLICY "Solo administradores pueden crear, editar o eliminar paquetes" 
    ON public.paquetes_grupales FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ==============================================================================
-- 5. TABLA DE INSCRIPCIONES A GRUPOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inscripciones_grupo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    paquete_id UUID NOT NULL REFERENCES public.paquetes_grupales(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    estado TEXT NOT NULL DEFAULT 'confirmado' CHECK (estado IN ('confirmado', 'pendiente', 'cancelado')),
    notas TEXT,
    CONSTRAINT uq_usuario_paquete UNIQUE (usuario_id, paquete_id)
);

-- Habilitar RLS en inscripciones_grupo
ALTER TABLE public.inscripciones_grupo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS inscripciones_grupo
CREATE POLICY "Los usuarios pueden ver sus propias inscripciones" 
    ON public.inscripciones_grupo FOR SELECT 
    USING (auth.uid() = usuario_id);

CREATE POLICY "Los administradores pueden ver todas las inscripciones" 
    ON public.inscripciones_grupo FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

CREATE POLICY "Los usuarios autenticados pueden crear sus propias inscripciones" 
    ON public.inscripciones_grupo FOR INSERT 
    WITH CHECK (auth.uid() = usuario_id);

-- ==============================================================================
-- 6. TABLA DE PAGOS Y RESERVAS (Preparado para Futuras Compras de Pasajes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscripcion_id UUID REFERENCES public.inscripciones_grupo(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('tarjeta', 'transferencia', 'efectivo', 'yape_plin')),
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    comprobante_url TEXT,
    referencia_externa TEXT, -- Código de boleto aéreo / terrestre futuro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en pagos
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propios pagos" 
    ON public.pagos FOR SELECT 
    USING (auth.uid() = usuario_id);

CREATE POLICY "Administradores ven todos los pagos" 
    ON public.pagos FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ==============================================================================
-- 7. FUNCIÓN ALMACENADA ATÓMICA PARA INSCRIPCIÓN SEGURA (Evita Race Conditions)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.inscribir_usuario_paquete(
    p_usuario_id UUID,
    p_paquete_id UUID,
    p_notas TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
    v_paquete RECORD;
    v_inscripcion_id UUID;
BEGIN
    -- Bloquear la fila del paquete para evitar condiciones de carrera (Race Condition)
    SELECT * INTO v_paquete 
    FROM public.paquetes_grupales 
    WHERE id = p_paquete_id 
    FOR UPDATE;

    -- Validar si el paquete existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El paquete no existe.');
    END IF;

    -- Validar estado del paquete
    IF v_paquete.estado != 'abierto' THEN
        RETURN jsonb_build_object('success', false, 'message', 'El paquete no está disponible para inscripciones.');
    END IF;

    -- Validar si quedan cupos disponibles
    IF v_paquete.cupo_disponible <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lo sentimos, el cupo para este paquete ya está completo.');
    END IF;

    -- Validar si el usuario ya está inscrito
    IF EXISTS (
        SELECT 1 FROM public.inscripciones_grupo 
        WHERE usuario_id = p_usuario_id AND paquete_id = p_paquete_id AND estado != 'cancelado'
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ya estás inscrito en este paquete grupal.');
    END IF;

    -- Insertar la inscripción
    INSERT INTO public.inscripciones_grupo (usuario_id, paquete_id, estado, notas)
    VALUES (p_usuario_id, p_paquete_id, 'confirmado', p_notas)
    RETURNING id INTO v_inscripcion_id;

    -- Descontar cupo de forma atómica
    UPDATE public.paquetes_grupales
    SET cupo_disponible = cupo_disponible - 1,
        estado = CASE WHEN (cupo_disponible - 1) = 0 THEN 'completo' ELSE estado END,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_paquete_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', '¡Inscripción exitosa!', 
        'inscripcion_id', v_inscripcion_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 8. DATOS DE PRUEBA (MUESTRA CON IMÁGENES EXISTENTES DEL PROYECTO)
-- ==============================================================================
INSERT INTO public.paquetes_grupales (titulo, destino, descripcion, fecha_salida, fecha_retorno, precio_persona, cupo_maximo, cupo_disponible, estado, imagen_portada)
VALUES 
(
    'Cusco Imperial & Machu Picchu Grupal', 
    'Cusco, Perú', 
    'Únete a nuestro grupo exclusivo para descubrir la mística de Cusco, Valle Sagrado y Machu Picchu. ¡Conoce nuevos compañeros de viaje!', 
    '2026-09-20', 
    '2026-09-25', 
    1250.00, 
    15, 
    12, 
    'abierto', 
    'images/ciudades/nacionales/cuzco.png'
),
(
    'Ruta Blanca Arequipa y Colca', 
    'Arequipa, Perú', 
    'Aventura en la Ciudad Blanca y sobrevuelo/trekking por el Cañón del Colca en grupo.', 
    '2026-10-10', 
    '2026-10-14', 
    890.00, 
    10, 
    5, 
    'abierto', 
    'images/ciudades/nacionales/arequipa.png'
),
(
    'Selva Tropical Tarapoto Mágico', 
    'Tarapoto, Perú', 
    'Cataratas de Ahuashiyacu, Laguna Azul y la calidez de la selva peruana en grupo.', 
    '2026-11-05', 
    '2026-11-09', 
    750.00, 
    12, 
    12, 
    'abierto', 
    'images/ciudades/nacionales/tarapoto.png'
);
