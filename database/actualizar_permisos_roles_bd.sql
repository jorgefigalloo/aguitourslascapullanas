-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - POBLAR MATRIZ DE PERMISOS GRANULARES EN BD
-- Ejecutar en el SQL Editor de Supabase
-- ==============================================================================

-- 1. RE-INSERTAR O ACTUALIZAR ROLES CON MATRIZ DE PERMISOS EN FORMUTO JSONB

-- SUPER ADMIN (Full Acceso a los 16 Permisos)
INSERT INTO public.roles_sistema (id, nombre, descripcion, permisos) VALUES
(
    'super_admin',
    'Super Administrador',
    'Acceso total a gestión de usuarios, auditoría, paquetes y CMS.',
    '[
        "usuarios_ver", "usuarios_crear", "usuarios_editar", "usuarios_bloquear",
        "paquetes_ver", "paquetes_crear", "paquetes_editar", "paquetes_eliminar",
        "cms_ver", "cms_editar",
        "destinos_ver", "destinos_crear", "destinos_editar", "destinos_eliminar",
        "analytics_ver", "auditoria_ver"
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos;

-- ADMINISTRADOR GENERAL
INSERT INTO public.roles_sistema (id, nombre, descripcion, permisos) VALUES
(
    'admin',
    'Administrador General',
    'Gestión de contenidos, paquetes turísticos, clientes y reportes.',
    '[
        "usuarios_ver", "usuarios_crear", "usuarios_editar",
        "paquetes_ver", "paquetes_crear", "paquetes_editar",
        "cms_ver", "cms_editar",
        "destinos_ver", "destinos_crear", "destinos_editar",
        "analytics_ver"
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos;

-- EDITOR CMS
INSERT INTO public.roles_sistema (id, nombre, descripcion, permisos) VALUES
(
    'editor_contenido',
    'Editor CMS',
    'Gestión de banners, textos corporativos, destinos y galería.',
    '[
        "cms_ver", "cms_editar",
        "destinos_ver", "destinos_crear", "destinos_editar"
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos;

-- AGENTE DE VENTAS
INSERT INTO public.roles_sistema (id, nombre, descripcion, permisos) VALUES
(
    'agente_ventas',
    'Agente de Ventas',
    'Gestión de cupos, reservas e inscripciones a viajes grupales.',
    '[
        "usuarios_ver",
        "paquetes_ver", "paquetes_crear", "paquetes_editar",
        "analytics_ver"
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos;

-- CLIENTE VIAJERO
INSERT INTO public.roles_sistema (id, nombre, descripcion, permisos) VALUES
(
    'cliente',
    'Cliente / Viajero',
    'Acceso al portal del cliente, reserva de cupos e itinerarios.',
    '[
        "paquetes_ver", "destinos_ver"
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos;
