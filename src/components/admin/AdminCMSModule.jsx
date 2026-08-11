import React, { useState } from 'react';
import { Save, Folder, Link2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GALERIA_PREDETERMINADA = [
  { label: 'Logo Aguitours Principal', url: '/images/capullanas1.jpg' },
  { label: 'Portada Hero Destinos', url: '/images/ciudades/fondo-destinos1.png' },
  { label: 'Nosotros / Quiénes Somos', url: '/images/nosotros-hero.png' },
  { label: 'Cusco & Machu Picchu', url: '/images/ciudades/nacionales/cuzco.png' },
  { label: 'Arequipa Ciudad Blanca', url: '/images/ciudades/nacionales/arequipa.png' },
  { label: 'Tarapoto Selva', url: '/images/ciudades/nacionales/tarapoto.png' },
  { label: 'París Internacional', url: '/images/ciudades/internacionales/francia.png' }
];

const IMAGENES_PREDETERMINADAS_CMS = {
  navbar_brand: '/images/capullanas1.jpg',
  hero_inicio: '/images/ciudades/fondo-destinos1.png',
  quienes_somos: '/images/nosotros-hero.png',
  mision_vision: '/images/nosotros-hero.png',
  contacto_info: '/images/nosotros-hero.png',
  footer_texto: '/images/capullanas1.jpg'
};

export function AdminCMSModule({ cmsSections = [], user, onActualizar }) {
  const [cmsEditando, setCmsEditando] = useState({
    clave_seccion: 'hero_inicio',
    titulo: '', subtitulo: '', cuerpo_texto: '', imagen_url: '/images/ciudades/fondo-destinos1.png'
  });
  const [tipoOrigenImagen, setTipoOrigenImagen] = useState('local');
  const [contactoCampos, setContactoCampos] = useState({
    telefono: '+51 987 654 321',
    email: 'contacto@aguitourslascapullanas.com',
    direccion: 'Cusco & Piura, Perú',
    facebook_url: 'https://www.facebook.com/people/Aguitours-las-capullanas/100054386595848/'
  });
  const [loading, setLoading] = useState(false);

  const handleSeleccionarSeccionCMS = (seccionKey) => {
    const found = cmsSections.find(s => s.clave_seccion === seccionKey);
    const imagenPredeterminada = IMAGENES_PREDETERMINADAS_CMS[seccionKey] || '/images/capullanas1.jpg';

    if (found) {
      const imagenActual = found.imagen_url && found.imagen_url.trim() !== '' ? found.imagen_url : imagenPredeterminada;
      setCmsEditando({ ...found, imagen_url: imagenActual });
      setTipoOrigenImagen(imagenActual.startsWith('http') ? 'url' : 'local');

      if (seccionKey === 'contacto_info' && found.cuerpo_texto) {
        const partes = found.cuerpo_texto.split('|');
        setContactoCampos({
          telefono: partes[0] ? partes[0].trim() : '+51 987 654 321',
          email: partes[1] ? partes[1].trim() : 'contacto@aguitourslascapullanas.com',
          direccion: partes[2] ? partes[2].trim() : 'Cusco & Piura, Perú',
          facebook_url: partes[3] ? partes[3].trim() : 'https://www.facebook.com/people/Aguitours-las-capullanas/100054386595848/'
        });
      }
    } else {
      setCmsEditando({
        clave_seccion: seccionKey,
        titulo: '',
        subtitulo: '',
        cuerpo_texto: '',
        imagen_url: imagenPredeterminada
      });
      setTipoOrigenImagen('local');
    }
  };

  const handleGuardarCMS = async (e) => {
    e.preventDefault();
    setLoading(true);

    let cuerpoFinal = cmsEditando.cuerpo_texto;
    if (cmsEditando.clave_seccion === 'contacto_info') {
      cuerpoFinal = `${contactoCampos.telefono}|${contactoCampos.email}|${contactoCampos.direccion}|${contactoCampos.facebook_url}`;
    }

    const imagenFinal = cmsEditando.imagen_url && cmsEditando.imagen_url.trim() !== '' 
      ? cmsEditando.imagen_url 
      : (IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg');

    try {
      const { error } = await supabase
        .from('cms_contenido')
        .upsert([{
          clave_seccion: cmsEditando.clave_seccion,
          titulo: cmsEditando.titulo,
          subtitulo: cmsEditando.subtitulo,
          cuerpo_texto: cuerpoFinal,
          imagen_url: imagenFinal,
          config_3d: cmsEditando.config_3d || { tilt: true, depth: 20 },
          creado_por: user?.id
        }], { onConflict: 'clave_seccion' });

      if (error) throw error;
      alert('¡Sección CMS actualizada con éxito!');
      onActualizar();
    } catch (err) {
      alert('Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
      <h3 className="font-headline text-2xl font-bold text-white mb-6">Módulo CMS - Editar Cualquier Sección del Sitio Web</h3>

      <form onSubmit={handleGuardarCMS} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-gray-300 font-bold block mb-1">Sección del Sitio A Modificar</label>
          <select 
            value={cmsEditando.clave_seccion} 
            onChange={e => handleSeleccionarSeccionCMS(e.target.value)} 
            className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
          >
            <option value="navbar_brand">Navegación & Marca (navbar_brand)</option>
            <option value="hero_inicio">Portada Hero Principal (hero_inicio)</option>
            <option value="quienes_somos">Sección Quiénes Somos (quienes_somos)</option>
            <option value="mision_vision">Misión y Visión (mision_vision)</option>
            <option value="contacto_info">Información de Contacto (contacto_info)</option>
            <option value="footer_texto">Pie de Página / Copyright (footer_texto)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-300 font-bold block mb-1">Título Principal</label>
          <input 
            type="text" 
            value={cmsEditando.titulo || ''} 
            onChange={e => setCmsEditando({...cmsEditando, titulo: e.target.value})} 
            required 
            className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 font-bold block mb-1">Subtítulo / Bajada</label>
          <input 
            type="text" 
            value={cmsEditando.subtitulo || ''} 
            onChange={e => setCmsEditando({...cmsEditando, subtitulo: e.target.value})} 
            className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
          />
        </div>

        {cmsEditando.clave_seccion === 'hero_inicio' && (
          <div>
            <label className="text-xs text-[#ffb703] font-bold block mb-1">📍 Badge Flotante (Próximas Salidas)</label>
            <input 
              type="text" 
              value={cmsEditando.config_3d?.hero_badge_salidas || 'Máncora & Piura'} 
              onChange={e => setCmsEditando({
                ...cmsEditando, 
                config_3d: { ...cmsEditando.config_3d, hero_badge_salidas: e.target.value }
              })} 
              placeholder="Ej: Máncora & Piura"
              className="w-full bg-[#071521] border border-[#ffb703]/40 rounded-xl p-3 text-white text-sm focus:border-[#ffb703] focus:outline-none" 
            />
          </div>
        )}

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <label className="text-xs text-gray-300 font-bold block mb-2">Seleccionar Origen de Imagen</label>
          <div className="flex gap-4 mb-4">
            <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${tipoOrigenImagen === 'local' ? 'bg-[#ffb703] text-black border-[#ffb703]' : 'bg-[#071521] text-gray-300 border-white/15'}`}>
              <input 
                type="radio" 
                name="origen_imagen" 
                value="local" 
                checked={tipoOrigenImagen === 'local'} 
                onChange={() => {
                  setTipoOrigenImagen('local');
                  const defaultImg = IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg';
                  setCmsEditando({ ...cmsEditando, imagen_url: defaultImg });
                }}
                className="hidden" 
              />
              <Folder size={16} /> Imagen Predeterminada (Local)
            </label>

            <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${tipoOrigenImagen === 'url' ? 'bg-[#ffb703] text-[#000] border-[#ffb703]' : 'bg-[#071521] text-gray-300 border-white/15'}`}>
              <input 
                type="radio" 
                name="origen_imagen" 
                value="url" 
                checked={tipoOrigenImagen === 'url'} 
                onChange={() => setTipoOrigenImagen('url')}
                className="hidden" 
              />
              <Link2 size={16} /> Enlace Web Externo (URL)
            </label>
          </div>

          {tipoOrigenImagen === 'local' ? (
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Elegir de la Galería Predeterminada</label>
              <select 
                value={cmsEditando.imagen_url} 
                onChange={e => setCmsEditando({...cmsEditando, imagen_url: e.target.value})}
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm"
              >
                {GALERIA_PREDETERMINADA.map(g => (
                  <option key={g.url} value={g.url}>{g.label} ({g.url})</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Pegar URL de Imagen Externa</label>
              <input 
                type="text" 
                value={cmsEditando.imagen_url || ''} 
                onChange={e => setCmsEditando({...cmsEditando, imagen_url: e.target.value})} 
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
              />
            </div>
          )}

          <div className="mt-3 rounded-xl overflow-hidden h-36 border border-white/15 relative bg-black/40">
            <img 
              src={cmsEditando.imagen_url || IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg'} 
              alt="Vista previa" 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg'; }}
            />
            <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
              <ImageIcon size={12} /> Vista Previa en Vivo
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-300 font-bold block mb-1">Cuerpo de Texto</label>
          <textarea 
            rows={4} 
            value={cmsEditando.cuerpo_texto || ''} 
            onChange={e => setCmsEditando({...cmsEditando, cuerpo_texto: e.target.value})} 
            className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
          />
        </div>

        <button type="submit" disabled={loading} className="btn-gold-3d text-sm font-bold py-3 mt-2 flex items-center justify-center gap-2">
          <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios del CMS'}
        </button>
      </form>
    </div>
  );
}
