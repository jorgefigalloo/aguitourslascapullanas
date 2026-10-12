/**
 * AGUITOURS LAS CAPULLANAS - SERVICIO FRONTEND CLOUDFLARE R2 & GALERÍA
 */
import { supabase } from './supabase';

/**
 * Sube un archivo de imagen al bucket de Cloudflare R2 a través del backend PHP seguro
 */
export async function subirImagenACloudflare(file, { titulo = '', categoria = 'general', userId = null } = {}) {
  const formData = new FormData();
  formData.append('imagen', file);
  if (titulo) formData.append('titulo', titulo);
  if (categoria) formData.append('categoria', categoria);
  if (userId) formData.append('creado_por', userId);

  const response = await fetch('/php/api/upload_r2.php', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al subir la imagen a Cloudflare R2');
  }

  return data;
}

/**
 * Consulta la galería de imágenes registradas en Supabase (Cloudflare R2 + Locales)
 */
export async function obtenerGaleriaImagenes(categoria = null) {
  try {
    let query = supabase
      .from('imagenes_galeria')
      .select('*')
      .order('created_at', { ascending: false });

    if (categoria && categoria !== 'todas') {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error al obtener galería de imágenes:', err);
    return [];
  }
}

/**
 * Elimina una imagen de Cloudflare R2 y de la tabla de galería
 */
export async function eliminarImagenR2(id, r2Key) {
  const response = await fetch('/php/api/eliminar_r2.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, r2_key: r2Key })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'No se pudo eliminar la imagen');
  }

  return data;
}
