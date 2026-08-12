-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SOLUCIÓN DEFINITIVA DE PERFILES Y TRIGGER DE REGISTRO
-- Instrucción: Ejecutar en Supabase > SQL Editor para corregir perfiles y login
-- ==============================================================================

-- 1. ASEGURAR COLUMNA EMAIL EN TABLA PERFILES
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS email text;

-- 2. ACTUALIZAR TRIGGER PARA EXTRAER USERNAME, EMAIL, NOMBRE, TELÉFONO Y DNI
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_nombre text;
    v_username text;
    v_telefono text;
    v_dni text;
    v_rol text;
BEGIN
    v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1));
    v_username := LOWER(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
    v_telefono := COALESCE(NEW.raw_user_meta_data->>'telefono', '');
    v_dni := COALESCE(NEW.raw_user_meta_data->>'documento_identidad', '');
    v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente');

    INSERT INTO public.perfiles (
        id,
        email,
        nombre_completo,
        username,
        telefono,
        documento_identidad,
        rol,
        activo
    )
    VALUES (
        NEW.id,
        NEW.email,
        v_nombre,
        v_username,
        v_telefono,
        v_dni,
        v_rol,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nombre_completo = CASE WHEN public.perfiles.nombre_completo IS NULL OR public.perfiles.nombre_completo = 'Usuario' THEN EXCLUDED.nombre_completo ELSE public.perfiles.nombre_completo END,
        username = CASE WHEN public.perfiles.username IS NULL THEN EXCLUDED.username ELSE public.perfiles.username END,
        telefono = CASE WHEN public.perfiles.telefono IS NULL OR public.perfiles.telefono = '' THEN EXCLUDED.telefono ELSE public.perfiles.telefono END,
        documento_identidad = CASE WHEN public.perfiles.documento_identidad IS NULL OR public.perfiles.documento_identidad = '' THEN EXCLUDED.documento_identidad ELSE public.perfiles.documento_identidad END,
        rol = COALESCE(public.perfiles.rol, EXCLUDED.rol);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. CORREGIR PERFILES EXISTENTES (SINCRONIZAR EMAIL Y USERNAME DESDE AUTH.USERS)
UPDATE public.perfiles p
SET email = u.email,
    username = COALESCE(p.username, LOWER(COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)))),
    nombre_completo = COALESCE(NULLIF(p.nombre_completo, ''), COALESCE(u.raw_user_meta_data->>'nombre_completo', split_part(u.email, '@', 1))),
    telefono = COALESCE(NULLIF(p.telefono, ''), COALESCE(u.raw_user_meta_data->>'telefono', '')),
    documento_identidad = COALESCE(NULLIF(p.documento_identidad, ''), COALESCE(u.raw_user_meta_data->>'documento_identidad', ''))
FROM auth.users u
WHERE p.id = u.id;

-- 4. FUNCIÓN RPC REFORZADA PARA RESOLVER EMAIL POR USERNAME
CREATE OR REPLACE FUNCTION public.obtener_email_por_username(p_username text)
RETURNS text AS $$
DECLARE
    v_email text;
BEGIN
    SELECT email INTO v_email
    FROM public.perfiles
    WHERE LOWER(username) = LOWER(p_username)
    LIMIT 1;

    IF v_email IS NULL THEN
        SELECT email INTO v_email
        FROM auth.users
        WHERE LOWER(raw_user_meta_data->>'username') = LOWER(p_username)
           OR LOWER(split_part(email, '@', 1)) = LOWER(p_username)
        LIMIT 1;
    END IF;

    RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- FIN DEL SCRIPT. Todos los usuarios actuales y futuros tendrán correo, username,
-- nombre completo, DNI y teléfono vinculados correctamente.
-- ==============================================================================
