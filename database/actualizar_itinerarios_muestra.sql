-- ==============================================================================
-- AGUITOURS LAS CAPULLANAS - ACTUALIZAR ITINERARIOS DE MUESTRA EN SUPABASE
-- Ejecutar en el SQL Editor de Supabase para llenar itinerarios detallados
-- ==============================================================================

UPDATE public.paquetes_grupales
SET itinerario = '{
  "punto_partida": "Plaza de Armas de Cusco / Aeropuerto Velasco Astete - 07:00 AM",
  "recomendaciones": "Llevar ropa abrigadora para la noche, zapatillas de trekking, bloqueador solar, poncho de lluvia y DNI o Pasaporte original.",
  "whatsapp_url": "https://chat.whatsapp.com/ExclusivoCuscoAguitours",
  "pdf_formulario_url": "/rutas.txt",
  "dias": [
    {
      "dia": "Día 1",
      "titulo": "Recepción en Cusco & City Tour Arqueológico",
      "detalle": "Llegada a Cusco, aclimatación en el hotel y recorrido guiado por Qorikancha, Sacsayhuamán y la Plaza de Armas."
    },
    {
      "dia": "Día 2",
      "titulo": "Valle Sagrado & Pisac Tradicional",
      "detalle": "Visita al mercado artesanal de Pisac, fortaleza de Ollantaytambo y almuerzo buffet inclusivo en Urubamba."
    },
    {
      "dia": "Día 3",
      "titulo": "Santuario Histórico de Machu Picchu",
      "detalle": "Abordaje en tren Expeditions hacia Aguas Calientes, ingreso al santuario de Machu Picchu con guía privado y fotos panorámicas."
    },
    {
      "dia": "Día 4",
      "titulo": "Retorno & Compras Souvenirs",
      "detalle": "Mañana libre en Cusco para compras de souvenirs y traslado al aeropuerto para vuelo de retorno."
    }
  ]
}'::jsonb
WHERE titulo LIKE '%Cusco%';

UPDATE public.paquetes_grupales
SET itinerario = '{
  "punto_partida": "Plaza de Armas de Arequipa / Terrapuerto - 06:30 AM",
  "recomendaciones": "Llevar ropa ligera para el día y muy abrigadora para el Cañón del Colca (4000 msnm), camara fotográfica y agua mineral.",
  "whatsapp_url": "https://chat.whatsapp.com/ExclusivoArequipaAguitours",
  "pdf_formulario_url": "/rutas.txt",
  "dias": [
    {
      "dia": "Día 1",
      "titulo": "Recorrido por la Ciudad Blanca & Monasterio de Santa Catalina",
      "detalle": "Paseo colonial por los claustros de Yanahuara, mirador de Sachaca y el histórico Monasterio de Santa Catalina."
    },
    {
      "dia": "Día 2",
      "titulo": "Ruta hacia el Cañón del Colca & Mirador Cruz del Cóndor",
      "detalle": "Viaje hacia Chivay pasando por Pampa Cañahuas (reserva de vicuñas) y avistamiento del vuelo de los cóndores."
    },
    {
      "dia": "Día 3",
      "titulo": "Baños Termales & Retorno",
      "detalle": "Relajación en las aguas termales de La Calera y retorno a la ciudad de Arequipa."
    }
  ]
}'::jsonb
WHERE titulo LIKE '%Arequipa%' OR titulo LIKE '%Colca%';

UPDATE public.paquetes_grupales
SET itinerario = '{
  "punto_partida": "Aeropuerto Guillermo del Castillo Paredes / Plaza de Tarapoto - 08:00 AM",
  "recomendaciones": "Repelente contra insectos, traje de baño, toalla, zapatillas acua-trekking y protector solar biodegradable.",
  "whatsapp_url": "https://chat.whatsapp.com/ExclusivoTarapotoAguitours",
  "pdf_formulario_url": "/rutas.txt",
  "dias": [
    {
      "dia": "Día 1",
      "titulo": "Cataratas de Ahuashiyacu & Selva Alta",
      "detalle": "Excursión a la hermosa caída de agua de Ahuashiyacu en medio de la selva tropical con tiempo libre de natación."
    },
    {
      "dia": "Día 2",
      "titulo": "Laguna Azul & Paseo en Bote Motorizado",
      "detalle": "Navegación por la majestuosa Laguna Azul en El Sauce con almuerzo selvático a orillas de la laguna."
    },
    {
      "dia": "Día 3",
      "titulo": "Lamas Pueblo de Colores & Castillo Medieval",
      "detalle": "Visita a Lamas, la capital folclórica de la selva, y su famoso Castillo de Piedra."
    }
  ]
}'::jsonb
WHERE titulo LIKE '%Tarapoto%' OR titulo LIKE '%Vinicunca%' OR titulo LIKE '%Titicaca%';
