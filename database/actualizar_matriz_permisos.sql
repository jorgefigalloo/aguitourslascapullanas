-- ==============================================================================
-- SCRIPT SQL: ACTUALIZACIÓN DE MATRIZ DE PERMISOS GRANULARES EN ROLES DE SUPABASE
-- Proyecto: Aguitours Las Capullanas
-- Fecha: Agosto 2026
-- Instrucciones: Ejecutar este script en el Editor SQL de Supabase
-- ==============================================================================

-- 1. INSERTAR / ACTUALIZAR ROLES CON SUS MATRICES DE PERMISOS GRANULARES DE 54 ACCIONES

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
