-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - SOLUCIÓN DEFINITIVA DE RLS Y CARGA DE DATOS COMPLETA
-- Ejecutar en el SQL Editor de Supabase
-- ==============================================================================

-- 1. DESACTIVAR RLS EN TODAS LAS TABLAS PARA EVITAR ERRORES DE RECURSIÓN INFINITA
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_contenido DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinos_turisticos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquetes_grupales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabla_auditoria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_sistema DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_grupo DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos DISABLE ROW LEVEL SECURITY;

-- 2. ASEGURAR SUPERADMIN Y CAMPO USERNAME
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

INSERT INTO public.perfiles (id, nombre_completo, telefono, rol, username)
VALUES (
    'ba15e491-47db-4a29-b710-7e5e24f3af97',
    'Jorge Figallo',
    '+51 987 654 321',
    'super_admin',
    'jorge94web'
)
ON CONFLICT (id) DO UPDATE SET 
    rol = 'super_admin',
    username = 'jorge94web';


-- 3. CARGAR SECCIONES EN CMS_CONTENIDO (DISPONIBLES PARA EDITAR EN EL DASHBOARD)
INSERT INTO public.cms_contenido (clave_seccion, titulo, subtitulo, cuerpo_texto, imagen_url) VALUES
(
    'navbar_brand',
    'Aguitours',
    'Las Capullanas • Agencia de Viajes',
    'Inicio|Paquetes Grupales|Destinos|Quiénes Somos|Contacto',
    '/images/capullanas1.jpg'
),
(
    'hero_inicio',
    'Explora el Mundo con Aguitours Las Capullanas',
    'Vive la verdadera experiencia de viajes en grupos de turismo inmersivos y exclusivos',
    'Ofrecemos los mejores itinerarios nacionales e internacionales con acompañamiento profesional y grupos organizados.',
    '/images/ciudades/fondo-destinos1.png'
),
(
    'quienes_somos',
    'Conoce Nuestra Historia y Pasión por El Turismo',
    'Más de 10 años creando recuerdos inolvidables y conectando viajeros apasionados.',
    'En Aguitours Las Capullanas nos dedicamos a ofrecer experiencias de viaje seguras, auténticas y enriquecedoras en los destinos más hermosos de Perú y el mundo.',
    '/images/nosotros-hero.png'
),
(
    'mision_vision',
    'Nuestra Misión y Visión Corporativa',
    'Brindar paquetes turísticos grupales y privados con los más altos estándares de calidad, garantizando seguridad, confort y experiencias culturales auténticas para cada viajero.',
    'Consolidarnos como la agencia de viajes líder en turismo en grupo a nivel nacional e internacional, reconocida por la innovación tecnológica y el servicio de excelencia.',
    ''
),
(
    'contacto_info',
    'Estamos Listos para Planear tu Próximo Viaje',
    'Escríbenos una consulta o comunícate directamente por WhatsApp con uno de nuestros asesores de viaje.',
    '+51 987 654 321|contacto@aguitourslascapullanas.com|Cusco & Piura, Perú|https://www.facebook.com/people/Aguitours-las-capullanas/100054386595848/',
    ''
),
(
    'footer_texto',
    '© 2026 Agencia de Viajes "Aguitours Las Capullanas". Todos los derechos reservados.',
    'SÍGUENOS EN NUESTRAS REDES SOCIALES',
    '',
    ''
)
ON CONFLICT (clave_seccion) DO UPDATE SET 
    titulo = EXCLUDED.titulo,
    subtitulo = EXCLUDED.subtitulo,
    cuerpo_texto = EXCLUDED.cuerpo_texto;


-- 4. CARGAR DESTINOS TURÍSTICOS DE MUESTRA
INSERT INTO public.destinos_turisticos (nombre, tipo, descripcion, imagen_portada, destacado) VALUES
('Arequipa', 'nacional', 'Conocida como la Ciudad Blanca, hermosa arquitectura colonial rodeada de volcanes.', '/images/ciudades/nacionales/arequipa.png', true),
('Cusco y Machu Picchu', 'nacional', 'El corazón del imperio Inca y una de las 7 maravillas del mundo moderno.', '/images/ciudades/nacionales/cuzco.png', true),
('Tarapoto', 'nacional', 'La ciudad de las palmeras, llena de cascadas y naturaleza amazónica.', '/images/ciudades/nacionales/tarapoto.png', true),
('París y Louvre', 'internacional', 'La ciudad de la luz, arte, cultura e historia europea.', '/images/ciudades/internacionales/francia.png', true)
ON CONFLICT DO NOTHING;


-- 5. CARGAR PAQUETES GRUPALES DE MUESTRA
INSERT INTO public.paquetes_grupales (titulo, destino, descripcion, fecha_salida, fecha_retorno, precio_persona, cupo_maximo, cupo_disponible, estado, imagen_portada) VALUES
(
    'Expedición Sagrada a Cusco',
    'Cusco, Perú',
    'Ocho días de inmersión cultural y paisajes espectaculares con guías expertos y alojamiento premium.',
    '2026-11-15',
    '2026-11-22',
    1250.00,
    20,
    8,
    'abierto',
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop'
),
(
    'Aventura en Dunas y Oasis',
    'Huacachina, Perú',
    'Paseo en carros tubulares, sandboard y atardecer mágico en el desierto de Ica.',
    '2026-12-01',
    '2026-12-04',
    450.00,
    25,
    15,
    'abierto',
    'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?q=80&w=800&auto=format&fit=crop'
),
(
    'Trekking Colores del Sur',
    'Vinicunca, Perú',
    'Vinicunca y Valle Rojo con campamento de lujo.',
    '2027-01-10',
    '2027-01-12',
    650.00,
    12,
    2,
    'abierto',
    'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=800&auto=format&fit=crop'
),
(
    'Misterios del Titicaca',
    'Puno, Perú',
    'Navegación premium y estancia en islas flotantes exclusivas.',
    '2027-02-05',
    '2027-02-09',
    820.00,
    15,
    10,
    'abierto',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop'
)
ON CONFLICT DO NOTHING;


-- 6. CARGAR ROLES DE SISTEMA
INSERT INTO public.roles_sistema (id, nombre, descripcion) VALUES
('super_admin', 'Super Administrador', 'Acceso total a todos los módulos y gestión de permisos.'),
('admin', 'Administrador General', 'Gestión de contenidos, paquetes y clientes.'),
('editor_contenido', 'Editor CMS', 'Edición de textos y fotos de la web.'),
('agente_ventas', 'Agente de Ventas', 'Gestión de inscripciones y paquetes grupales.'),
('cliente', 'Cliente Viajero', 'Reserva de cupos y consulta de sus viajes.')
ON CONFLICT (id) DO NOTHING;
