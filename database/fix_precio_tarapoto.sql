-- Actualizar el precio por persona de Selva Tropical Tarapoto Mágico a S/ 900.00 (S/ 9,000.00 costo total ÷ 10 cupos)
UPDATE public.paquetes_grupales
SET precio_persona = 900.00
WHERE titulo ILIKE '%Tarapoto%';
