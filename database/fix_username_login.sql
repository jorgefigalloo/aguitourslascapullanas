-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - FUNCIÓN DE BÚSQUEDA DE CORREO POR USERNAME
-- Permite iniciar sesión ingresando el username o el correo electrónico
-- ==============================================================================

-- 1. FUNCIÓN SECURITY DEFINER PARA OBTENER EL EMAIL ASOCIADO A UN USERNAME
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
    WHERE LOWER(p.username) = LOWER(p_username);

    RETURN v_email;
END;
$$;

-- 2. ASIGNAR PERMISOS DE EJECUCIÓN PÚBLICOS A LA FUNCIÓN
GRANT EXECUTE ON FUNCTION public.obtener_email_por_username(text) TO anon, authenticated;

-- 3. VERIFICAR Y VINCULAR EL USERNAME DEL SUPERADMIN
UPDATE public.perfiles 
SET username = 'jorge94web' 
WHERE id = 'ba15e491-47db-4a29-b710-7e5e24f3af97';
