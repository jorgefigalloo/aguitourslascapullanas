-- ==============================================================================
-- SCRIPT SQL DEFINITIVO: AUTENTICACIÓN USERNAME, SECURITY DEFINER, RLS Y AUDITORÍA
-- Proyecto: Aguitours Las Capullanas
-- Fecha: Agosto 2026
-- Instrucciones: Ejecutar este script COMPLETO en el Editor SQL de Supabase
-- ==============================================================================

-- 1. EXTENSIÓN DE CRIPTOGRAFÍA
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. ASEGURAR COLUMNAS EN TABLA PERFILES Y AUTO-CONFIRMAR CORREOS
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;
UPDATE public.perfiles SET activo = true WHERE activo IS NULL;

-- AUTO-CONFIRMAR CORREOS DE USUARIOS EXISTENTES EN SUPABASE AUTH
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- TRIGGER PARA AUTO-CONFIRMAR NUEVOS USUARIOS CREADOS DESDE EL SISTEMA
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

-- 3. FUNCIÓN SECURITY DEFINER PARA EVITAR RECURSIÓN INFINITA EN RLS
CREATE OR REPLACE FUNCTION public.es_admin_o_personal(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles 
        WHERE id = p_user_id 
          AND rol IN ('super_admin', 'admin', 'editor_contenido', 'agente_ventas')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.es_admin_o_personal(UUID) TO anon, authenticated, service_role;

-- 4. FUNCIÓN SECURITY DEFINER PARA BUSCAR EMAIL POR USERNAME AL INICIAR SESIÓN
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

-- 5. FUNCIÓN SECURITY DEFINER PARA QUE ADMINS CAMBIEN CONTRASEÑAS
CREATE OR REPLACE FUNCTION public.admin_cambiar_password_usuario(p_target_user_id uuid, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF public.es_admin_o_personal(auth.uid()) THEN
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

-- 6. FUNCIÓN Y TRIGGERS DE AUDITORÍA INMUTABLE
CREATE OR REPLACE FUNCTION public.fn_registrar_auditoria_inmutable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usuario_id uuid;
BEGIN
    v_usuario_id := auth.uid();

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_nuevos)
        VALUES (TG_TABLE_NAME, 'INSERT', v_usuario_id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, 'UPDATE', v_usuario_id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_anteriores)
        VALUES (TG_TABLE_NAME, 'DELETE', v_usuario_id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- ASIGNAR TRIGGERS DE AUDITORÍA A TODAS LAS TABLAS DEL SISTEMA
DO $$
DECLARE
    t text;
    tablas text[] := ARRAY[
        'perfiles', 'paquetes_grupales', 'inscripciones_grupo', 
        'pagos', 'cms_contenido', 'destinos_turisticos', 
        'favoritos_usuario', 'solicitudes_cotizacion', 'roles_sistema'
    ];
BEGIN
    FOREACH t IN ARRAY tablas LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_auditoria_%I ON public.%I;', t, t);
        EXECUTE format('
            CREATE TRIGGER trg_auditoria_%I
            AFTER INSERT OR UPDATE OR DELETE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_auditoria_inmutable();
        ', t, t);
    END LOOP;
END;
$$;

-- 7. ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquetes_grupales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabla_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinos_turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_cotizacion ENABLE ROW LEVEL SECURITY;

-- 8. ELIMINACIÓN DINÁMICA DE TODAS LAS POLÍTICAS EXISTENTES PARA EVITAR ERRORES DE DUPLICIDAD
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
    END LOOP;
END;
$$;

-- 9. CREACIÓN DE POLÍTICAS SANAS SIN RECURSIÓN INFINITA

-- [perfiles]
CREATE POLICY "Lectura publica de perfiles" ON public.perfiles FOR SELECT USING (true);
CREATE POLICY "Usuarios editan su propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins administran perfiles" ON public.perfiles FOR ALL USING (public.es_admin_o_personal(auth.uid()));

-- [paquetes_grupales]
CREATE POLICY "Lectura publica paquetes" ON public.paquetes_grupales FOR SELECT USING (true);
CREATE POLICY "Staff administra paquetes" ON public.paquetes_grupales FOR ALL USING (public.es_admin_o_personal(auth.uid()));

-- [destinos_turisticos]
CREATE POLICY "Lectura publica destinos" ON public.destinos_turisticos FOR SELECT USING (true);
CREATE POLICY "Staff administra destinos" ON public.destinos_turisticos FOR ALL USING (public.es_admin_o_personal(auth.uid()));

-- [cms_contenido]
CREATE POLICY "Lectura publica cms" ON public.cms_contenido FOR SELECT USING (true);
CREATE POLICY "Staff administra cms" ON public.cms_contenido FOR ALL USING (public.es_admin_o_personal(auth.uid()));

-- [inscripciones_grupo & solicitudes_cotizacion & favoritos_usuario]
CREATE POLICY "Lectura de inscripciones" ON public.inscripciones_grupo FOR SELECT USING (auth.uid() = usuario_id OR public.es_admin_o_personal(auth.uid()));
CREATE POLICY "Creacion de inscripciones" ON public.inscripciones_grupo FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Lectura de cotizaciones" ON public.solicitudes_cotizacion FOR SELECT USING (auth.uid() = usuario_id OR public.es_admin_o_personal(auth.uid()));
CREATE POLICY "Gestion de cotizaciones" ON public.solicitudes_cotizacion FOR ALL USING (auth.uid() = usuario_id OR public.es_admin_o_personal(auth.uid()));

CREATE POLICY "Gestion de favoritos" ON public.favoritos_usuario FOR ALL USING (auth.uid() = usuario_id);

-- [tabla_auditoria & roles_sistema]
CREATE POLICY "Admins leen auditoria" ON public.tabla_auditoria FOR SELECT USING (public.es_admin_o_personal(auth.uid()));
CREATE POLICY "Lectura publica roles" ON public.roles_sistema FOR SELECT USING (true);
CREATE POLICY "Admins gestionan roles" ON public.roles_sistema FOR ALL USING (public.es_admin_o_personal(auth.uid()));

-- 10. POBLAR MATRIZ DE PERMISOS GRANULARES COMPLETA DE 54 ACCIONES EN ROLES DE SISTEMA
INSERT INTO public.roles_sistema (id, nombre, descripcion, permisos) VALUES
(
  'super_admin',
  'Super Administrador',
  'Acceso total ilimitado a la gestión de usuarios, auditoría, paquetes, cotizaciones, pagos y CMS.',
  '["usuarios_ver", "usuarios_listar", "usuarios_crear", "usuarios_editar", "usuarios_actualizar", "usuarios_bloquear", "usuarios_eliminar", "clientes_ver", "clientes_listar", "clientes_crear", "clientes_editar", "clientes_actualizar", "clientes_bloquear", "clientes_eliminar", "paquetes_ver", "paquetes_listar", "paquetes_crear", "paquetes_editar", "paquetes_actualizar", "paquetes_bloquear", "paquetes_eliminar", "destinos_ver", "destinos_listar", "destinos_crear", "destinos_editar", "destinos_actualizar", "destinos_bloquear", "destinos_eliminar", "cms_ver", "cms_listar", "cms_crear", "cms_editar", "cms_actualizar", "cms_bloquear", "cms_eliminar", "cotizaciones_ver", "cotizaciones_listar", "cotizaciones_crear", "cotizaciones_editar", "cotizaciones_actualizar", "cotizaciones_bloquear", "cotizaciones_eliminar", "pagos_ver", "pagos_listar", "pagos_crear", "pagos_editar", "pagos_actualizar", "pagos_bloquear", "pagos_eliminar", "analytics_ver", "analytics_exportar", "auditoria_ver", "auditoria_listar", "auditoria_exportar"]'::jsonb
),
(
  'admin',
  'Administrador General',
  'Gestión integral de contenidos, paquetes turísticos, clientes, solicitudes de cotización y reportes.',
  '["usuarios_ver", "usuarios_listar", "usuarios_crear", "usuarios_editar", "usuarios_actualizar", "usuarios_bloquear", "clientes_ver", "clientes_listar", "clientes_crear", "clientes_editar", "clientes_actualizar", "clientes_bloquear", "paquetes_ver", "paquetes_listar", "paquetes_crear", "paquetes_editar", "paquetes_actualizar", "paquetes_bloquear", "destinos_ver", "destinos_listar", "destinos_crear", "destinos_editar", "destinos_actualizar", "destinos_bloquear", "cms_ver", "cms_listar", "cms_crear", "cms_editar", "cms_actualizar", "cms_bloquear", "cotizaciones_ver", "cotizaciones_listar", "cotizaciones_crear", "cotizaciones_editar", "cotizaciones_actualizar", "pagos_ver", "pagos_listar", "pagos_crear", "pagos_editar", "pagos_actualizar", "analytics_ver", "analytics_exportar", "auditoria_ver", "auditoria_listar"]'::jsonb
),
(
  'editor_contenido',
  'Editor CMS',
  'Gestión de banners, textos corporativos, portadas 3D, catálogo de destinos y galería turística.',
  '["cms_ver", "cms_listar", "cms_crear", "cms_editar", "cms_actualizar", "cms_bloquear", "destinos_ver", "destinos_listar", "destinos_crear", "destinos_editar", "destinos_actualizar", "destinos_bloquear", "paquetes_ver", "paquetes_listar"]'::jsonb
),
(
  'agente_ventas',
  'Agente de Ventas',
  'Gestión de cupos, itinerarios, cotizaciones a medida, comprobantes de pago e inscripciones.',
  '["clientes_ver", "clientes_listar", "clientes_crear", "clientes_editar", "paquetes_ver", "paquetes_listar", "paquetes_crear", "paquetes_editar", "paquetes_actualizar", "cotizaciones_ver", "cotizaciones_listar", "cotizaciones_crear", "cotizaciones_editar", "cotizaciones_actualizar", "pagos_ver", "pagos_listar", "pagos_crear", "pagos_editar", "pagos_actualizar", "analytics_ver"]'::jsonb
),
(
  'cliente',
  'Cliente / Viajero VIP',
  'Acceso al portal del cliente, catálogo de viajes, reservación de cupos y lista de favoritos.',
  '["paquetes_ver", "paquetes_listar", "destinos_ver", "destinos_listar"]'::jsonb
)
ON CONFLICT (id) 
DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  permisos = EXCLUDED.permisos;
