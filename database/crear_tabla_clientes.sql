-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - TABLA DE CLIENTES Y VÍNCULO CON USUARIOS DE AUTH
-- Ejecutar en el SQL Editor de Supabase
-- ==============================================================================

-- 1. CREAR TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    usuario_id uuid UNIQUE REFERENCES public.perfiles(id) ON DELETE CASCADE,
    codigo_cliente text UNIQUE NOT NULL,
    nombre_completo text NOT NULL,
    email text NOT NULL,
    telefono text,
    documento_identidad text,
    direccion text,
    estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    fecha_registro timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT clientes_pkey PRIMARY KEY (id)
);

-- 2. TRIGGER AUTOMÁTICO PARA CREAR CLIENTE CUANDO SE REGISTRA UN PERFIL
CREATE OR REPLACE FUNCTION public.handle_nuevo_cliente()
RETURNS trigger AS $$
BEGIN
    IF NEW.rol = 'cliente' THEN
        INSERT INTO public.clientes (usuario_id, codigo_cliente, nombre_completo, email, telefono, documento_identidad)
        VALUES (
            NEW.id,
            'CLI-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6)),
            NEW.nombre_completo,
            (SELECT email FROM auth.users WHERE id = NEW.id),
            NEW.telefono,
            NEW.documento_identidad
        )
        ON CONFLICT (usuario_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger
DROP TRIGGER IF EXISTS on_perfil_creado_cliente ON public.perfiles;
CREATE TRIGGER on_perfil_creado_cliente
    AFTER INSERT OR UPDATE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_nuevo_cliente();

-- 3. FORZAR ROL SUPER_ADMIN PARA JORGE FIGALLO EN LA BD
UPDATE public.perfiles 
SET rol = 'super_admin' 
WHERE id = 'ba15e491-47db-4a29-b710-7e5e24f3af97' OR username = 'jorge94web';
