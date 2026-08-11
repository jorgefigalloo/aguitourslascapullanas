-- ==============================================================================
-- SCRIPT SQL: AUDITORÍA INMUTABLE Y RLS COMPLETO SIN RECURSIÓN
-- Proyecto: Aguitours Las Capullanas
-- Fecha: Agosto 2026
-- Instrucciones: Ejecutar este script en el Editor SQL de Supabase
-- ==============================================================================

-- 1. FUNCIÓN SECURITY DEFINER PARA CONSULTAR PERMISOS SIN RECURSIÓN
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

-- 2. FUNCIÓN Y TRIGGERS DE AUDITORÍA INMUTABLE
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

-- 3. ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
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

-- 4. ELIMINACIÓN DINÁMICA DE TODAS LAS POLÍTICAS EXISTENTES PARA EVITAR ERRORES DE DUPLICIDAD
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
