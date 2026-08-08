-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - CORRECCIÓN DE RESTRICCIÓN CHECK & ASIGNACIÓN SUPERADMIN
-- Ejecutar en el SQL Editor de Supabase
-- ==============================================================================

-- 1. ELIMINAR LA RESTRICCIÓN ROL ANTERIOR (que solo permitía cliente y admin)
ALTER TABLE public.perfiles 
DROP CONSTRAINT IF EXISTS perfiles_rol_check;

-- 2. AGREGAR LA NUEVA RESTRICCIÓN PERMITIENDO ROLES RBAC COMPLETOS
ALTER TABLE public.perfiles 
ADD CONSTRAINT perfiles_rol_check 
CHECK (rol IN ('super_admin', 'admin', 'editor_contenido', 'agente_ventas', 'cliente'));

-- 3. AGREGAR COLUMNA USERNAME A LA TABLA PERFILES SI NO EXISTE
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 4. ASIGNAR ROL SUPER_ADMIN AL USUARIO PRINCIPAL (jorge94web@gmail.com)
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
    username = EXCLUDED.username;

-- 5. POBLAR SECCIONES CMS POR DEFECTO PARA EDICIÓN TOTAL
INSERT INTO public.cms_contenido (clave_seccion, titulo, subtitulo, cuerpo_texto, imagen_url) VALUES
(
    'navbar_brand',
    'Aguitours',
    'Las Capullanas • Agencia 3D',
    'Inicio|Paquetes Grupales|Destinos|Quiénes Somos|Contacto',
    '/images/capullanas1.jpg'
),
(
    'hero_inicio',
    'Explora el Mundo con Aguitours Las Capullanas',
    'Vive la verdadera experiencia de viajes en grupos de turismo inmersivos con diseño 3D',
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
ON CONFLICT (clave_seccion) DO NOTHING;
