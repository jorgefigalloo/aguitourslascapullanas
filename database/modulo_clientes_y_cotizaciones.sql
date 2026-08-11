-- ==============================================================================
-- SCRIPT SQL: MÓDULO DE CLIENTES, FAVORITOS Y COTIZACIONES PERSONALIZADAS
-- Proyecto: Aguitours Las Capullanas
-- Fecha: Agosto 2026
-- Instrucciones: Ejecutar este script manualmente en el SQL Editor de Supabase
-- ==============================================================================

-- 1. TABLA: FAVORITOS Y SEGUIMIENTO DE USUARIO
CREATE TABLE IF NOT EXISTS public.favoritos_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  paquete_id uuid REFERENCES public.paquetes_grupales(id) ON DELETE CASCADE,
  destino_id uuid REFERENCES public.destinos_turisticos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['paquete'::text, 'destino'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT favoritos_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT favoritos_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT favoritos_usuario_unicidad UNIQUE (usuario_id, paquete_id, destino_id)
);

-- 2. TABLA: SOLICITUDES DE COTIZACIÓN DE PAQUETES PERSONALIZADOS
CREATE TABLE IF NOT EXISTS public.solicitudes_cotizacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  destino text NOT NULL,
  fecha_salida date,
  fecha_retorno date,
  cantidad_personas integer NOT NULL DEFAULT 1 CHECK (cantidad_personas > 0),
  presupuesto_estimado numeric CHECK (presupuesto_estimado >= 0::numeric),
  servicios_deseados jsonb DEFAULT '[]'::jsonb,
  detalles text,
  estado text NOT NULL DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY['pendiente'::text, 'en_revision'::text, 'cotizado'::text, 'paquete_creado'::text, 'rechazado'::text])),
  paquete_creado_id uuid REFERENCES public.paquetes_grupales(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT solicitudes_cotizacion_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_cotizacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.favoritos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_cotizacion ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS EN FAVORITOS_USUARIO
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios favoritos" ON public.favoritos_usuario;
CREATE POLICY "Los usuarios pueden ver sus propios favoritos" ON public.favoritos_usuario
  FOR SELECT USING (auth.uid() = usuario_id OR EXISTS (
    SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'agente_ventas')
  ));

DROP POLICY IF EXISTS "Los usuarios pueden agregar sus propios favoritos" ON public.favoritos_usuario;
CREATE POLICY "Los usuarios pueden agregar sus propios favoritos" ON public.favoritos_usuario
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios favoritos" ON public.favoritos_usuario;
CREATE POLICY "Los usuarios pueden eliminar sus propios favoritos" ON public.favoritos_usuario
  FOR DELETE USING (auth.uid() = usuario_id);

-- POLÍTICAS RLS EN SOLICITUDES_COTIZACION
DROP POLICY IF EXISTS "Los usuarios ven sus solicitudes o staff ve todas" ON public.solicitudes_cotizacion;
CREATE POLICY "Los usuarios ven sus solicitudes o staff ve todas" ON public.solicitudes_cotizacion
  FOR SELECT USING (auth.uid() = usuario_id OR EXISTS (
    SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'agente_ventas')
  ));

DROP POLICY IF EXISTS "Los usuarios pueden registrar solicitudes de cotizacion" ON public.solicitudes_cotizacion;
CREATE POLICY "Los usuarios pueden registrar solicitudes de cotizacion" ON public.solicitudes_cotizacion
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "El staff administrativo puede actualizar solicitudes" ON public.solicitudes_cotizacion;
CREATE POLICY "El staff administrativo puede actualizar solicitudes" ON public.solicitudes_cotizacion
  FOR UPDATE USING (
    auth.uid() = usuario_id OR EXISTS (
      SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol IN ('super_admin', 'admin', 'agente_ventas')
    )
  );

-- 4. TRIGGERS DE AUDITORÍA AUTOMÁTICA PARA LA TABLA_AUDITORIA
CREATE OR REPLACE FUNCTION public.fn_auditoria_favoritos_y_cotizaciones()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario uuid;
BEGIN
  v_usuario := auth.uid();
  
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_anteriores)
    VALUES (TG_TABLE_NAME, TG_OP, v_usuario, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_anteriores, datos_nuevos)
    VALUES (TG_TABLE_NAME, TG_OP, v_usuario, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.tabla_auditoria (tabla_afectada, operacion, usuario_id, datos_nuevos)
    VALUES (TG_TABLE_NAME, TG_OP, v_usuario, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auditoria_favoritos ON public.favoritos_usuario;
CREATE TRIGGER trg_auditoria_favoritos
  AFTER INSERT OR UPDATE OR DELETE ON public.favoritos_usuario
  FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_favoritos_y_cotizaciones();

DROP TRIGGER IF EXISTS trg_auditoria_solicitudes ON public.solicitudes_cotizacion;
CREATE TRIGGER trg_auditoria_solicitudes
  AFTER INSERT OR UPDATE OR DELETE ON public.solicitudes_cotizacion
  FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_favoritos_y_cotizaciones();

-- 5. PERMISOS Y CONCESIÓN DE ACCESO
GRANT ALL ON TABLE public.favoritos_usuario TO authenticated;
GRANT ALL ON TABLE public.favoritos_usuario TO service_role;

GRANT ALL ON TABLE public.solicitudes_cotizacion TO authenticated;
GRANT ALL ON TABLE public.solicitudes_cotizacion TO service_role;
