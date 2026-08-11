-- ==============================================================================
-- SCRIPT SQL: SOLUCIÓN DE LOGIN POR USERNAME Y CAMBIO DE CONTRASEÑA POR ADMIN
-- Proyecto: Aguitours Las Capullanas
-- Fecha: Agosto 2026
-- Instrucciones: Ejecutar este script en el Editor SQL de Supabase
-- ==============================================================================

-- 1. EXTENSIÓN PARA CRIPTOGRAFÍA DE CONTRASEÑAS (PGCRYPTO)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. FUNCIÓN PARA BUSCAR CORREO ELECTRÓNICO ASOCIADO A CUALQUIER USERNAME
CREATE OR REPLACE FUNCTION public.obtener_email_por_username(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email text;
BEGIN
    SELECT u.email INTO v_email
    FROM auth.users u
    JOIN public.perfiles p ON p.id = u.id
    WHERE LOWER(p.username) = LOWER(TRIM(p_username));

    RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.obtener_email_por_username(text) TO anon, authenticated, service_role;

-- 3. FUNCIÓN PARA QUE ADMINISTRADORES CAMBIEN LA CONTRASEÑA DE CUALQUIER USUARIO
CREATE OR REPLACE FUNCTION public.admin_cambiar_password_usuario(p_target_user_id uuid, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario ejecutor sea super_admin o admin
    IF EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol IN ('super_admin', 'admin')
    ) THEN
        UPDATE auth.users
        SET encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
        WHERE id = p_target_user_id;

        RETURN true;
    ELSE
        RAISE EXCEPTION 'No tienes permisos de administrador para modificar contraseñas.';
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_cambiar_password_usuario(uuid, text) TO authenticated, service_role;

-- 4. ASEGURAR COLUMNA ACTIVO Y USERNAME EN PERFILES
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;
UPDATE public.perfiles SET activo = true WHERE activo IS NULL;

-- 5. AUTO-CONFIRMAR CORREOS PENDIENTES DE ACTIVACIÓN EN SUPABASE AUTH
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- 6. TRIGGER PARA AUTO-CONFIRMAR NUEVOS USUARIOS REGISTRADOS
CREATE OR REPLACE FUNCTION public.fn_auto_confirmar_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_confirmar_email ON auth.users;
CREATE TRIGGER trg_auto_confirmar_email
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.fn_auto_confirmar_email();
