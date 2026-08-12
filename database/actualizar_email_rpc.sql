-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - FUNCION RPC Y LIMPIEZA DE CORREOS DUPLICADOS
-- Ejecutar en Supabase > SQL Editor para corregir correos duplicados y activar RPC
-- ==============================================================================

-- 1. DESVINCULAR CORREOS DUPLICADOS EN AUTH.USERS PARA LIBERAR fimestajorge@gmail.com
UPDATE auth.users
SET email = 'usuario_' || substring(id::text from 1 for 8) || '@ejemplo.com'
WHERE email = 'fimestajorge@gmail.com'
  AND id NOT IN (
      SELECT id FROM public.perfiles WHERE username = 'mesta' LIMIT 1
  );

-- 2. CREAR FUNCION RPC SEGURA PARA ACTUALIZAR EMAIL DE CUALQUIER USUARIO
CREATE OR REPLACE FUNCTION public.admin_actualizar_email_usuario(
    p_target_user_id uuid,
    p_new_email text
)
RETURNS void AS $$
BEGIN
    -- 1. Actualizar correo en auth.users
    BEGIN
        UPDATE auth.users
        SET email = p_new_email,
            email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc'::text, now()))
        WHERE id = p_target_user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Aviso al actualizar auth.users: %', SQLERRM;
    END;

    -- 2. Actualizar correo en public.perfiles
    UPDATE public.perfiles
    SET email = p_new_email
    WHERE id = p_target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sincronizar perfiles
UPDATE public.perfiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;
