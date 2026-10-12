import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Cloud, Folder, UploadCloud, Link2, Search, Check, 
  Trash2, Image as ImageIcon, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import { subirImagenACloudflare, obtenerGaleriaImagenes, eliminarImagenR2 } from '../../lib/cloudflareR2';
import { useToast } from '../../context/ToastContext';

const IMAGENES_PREDETERMINADAS_LOCALES = [
  { titulo: 'Logo Oficial Aguitours', url: '/images/capullanas1.jpg', categoria: 'cms' },
  { titulo: 'Portada Hero Destinos', url: '/images/ciudades/fondo-destinos1.png', categoria: 'cms' },
  { titulo: 'Nosotros / Quiénes Somos', url: '/images/nosotros-hero.png', categoria: 'cms' },
  { titulo: 'Cusco & Machu Picchu', url: '/images/ciudades/nacionales/cuzco.png', categoria: 'destinos' },
  { titulo: 'Arequipa Ciudad Blanca', url: '/images/ciudades/nacionales/arequipa.png', categoria: 'destinos' },
  { titulo: 'Tarapoto Selva Tropical', url: '/images/ciudades/nacionales/tarapoto.png', categoria: 'destinos' },
  { titulo: 'París - Francia', url: '/images/ciudades/internacionales/paris.jpg', categoria: 'destinos' },
  { titulo: 'Fondo Turismo General', url: '/images/fondo-turismo.png', categoria: 'general' }
];

export function SelectorImagenModal({ 
  isOpen, 
  onClose, 
  onSeleccionar, 
  imagenActual = '', 
  categoriaSugerida = 'general',
  userId = null 
}) {
  const toast = useToast();
  const [tabActiva, setTabActiva] = useState('cloud'); // 'cloud' | 'local' | 'subir' | 'url'
  
  // Estado Galería
  const [imagenesCloud, setImagenesCloud] = useState([]);
  const [cargandoGaleria, setCargandoGaleria] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  // Estado Subir Archivo
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [previewSubida, setPreviewSubida] = useState(null);
  const [tituloSubida, setTituloSubida] = useState('');
  const [categoriaSubida, setCategoriaSubida] = useState(categoriaSugerida);
  const [subiendo, setSubiendo] = useState(false);

  // Estado URL Directa
  const [urlDirecta, setUrlDirecta] = useState('');

  const fileInputRef = useRef(null);

  // Cargar galería al abrir o cambiar filtro
  useEffect(() => {
    if (isOpen) {
      cargarImagenes();
      setCategoriaSubida(categoriaSugerida);
      setUrlDirecta(imagenActual || '');
    }
  }, [isOpen, filtroCategoria]);

  const cargarImagenes = async () => {
    setCargandoGaleria(true);
    try {
      const data = await obtenerGaleriaImagenes(filtroCategoria);
      setImagenesCloud(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoGaleria(false);
    }
  };

  if (!isOpen) return null;

  // Manejo de Selección de Archivo Local
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).', 'Formato no válido');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.warning('La imagen supera el límite de 12 MB.', 'Archivo muy pesado');
      return;
    }

    setArchivoSeleccionado(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewSubida(objectUrl);
    
    // Auto-completar título con el nombre del archivo
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setTituloSubida(nameWithoutExt.replace(/[_-]/g, ' '));
  };

  // Subir a Cloudflare R2
  const handleSubirACloudflare = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      toast.warning('Selecciona una imagen para subir.', 'Atención');
      return;
    }

    setSubiendo(true);
    try {
      const res = await subirImagenACloudflare(archivoSeleccionado, {
        titulo: tituloSubida.trim(),
        categoria: categoriaSubida,
        userId
      });

      toast.success('¡Imagen subida a Cloudflare R2 con éxito!', 'Nube Actualizada');
      
      // Limpiar estados de subida
      setArchivoSeleccionado(null);
      setPreviewSubida(null);
      setTituloSubida('');

      // Auto-seleccionar la imagen subida
      if (res.url) {
        onSeleccionar(res.url);
        onClose();
      } else {
        await cargarImagenes();
        setTabActiva('cloud');
      }
    } catch (err) {
      toast.error(err.message || 'No se pudo subir la imagen a Cloudflare R2', 'Error de Subida');
    } finally {
      setSubiendo(false);
    }
  };

  // Eliminar Imagen de Cloudflare R2
  const handleEliminarImagen = async (e, img) => {
    e.stopPropagation();
    if (!window.confirm(`¿Estás seguro de eliminar "${img.titulo}" de Cloudflare R2?`)) return;

    try {
      await eliminarImagenR2(img.id, img.r2_key);
      toast.info('Imagen eliminada de Cloudflare R2', 'Galería');
      setImagenesCloud(prev => prev.filter(i => i.id !== img.id));
    } catch (err) {
      toast.error(err.message || 'Error al eliminar imagen', 'Error');
    }
  };

  // Filtrado de Galería Cloudflare
  const imagenesFiltradas = imagenesCloud.filter(img => {
    const matchBusqueda = !busqueda || img.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || img.url?.toLowerCase().includes(busqueda.toLowerCase());
    return matchBusqueda;
  });

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1724] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0d233a] to-[#07131e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1995ad] to-[#ffb703] p-0.5 flex items-center justify-center shadow-lg shadow-[#1995ad]/20">
              <div className="w-full h-full bg-[#0b1724] rounded-[10px] flex items-center justify-center">
                <Cloud className="text-[#ffb703]" size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Gestor de Imágenes & Cloudflare R2
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  R2 Storage
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Elige imágenes locales predeterminadas o administra tus fotos en la nube
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-white/10 bg-[#07111a] px-5 gap-2 pt-2">
          <button
            onClick={() => setTabActiva('cloud')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              tabActiva === 'cloud'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Cloud size={15} /> Galería Cloudflare R2 ({imagenesCloud.length})
          </button>
          
          <button
            onClick={() => setTabActiva('local')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              tabActiva === 'local'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Folder size={15} /> Predeterminadas del Proyecto ({IMAGENES_PREDETERMINADAS_LOCALES.length})
          </button>

          <button
            onClick={() => setTabActiva('subir')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              tabActiva === 'subir'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <UploadCloud size={15} /> Subir Nueva Foto a R2
          </button>

          <button
            onClick={() => setTabActiva('url')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              tabActiva === 'url'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Link2 size={15} /> Enlace URL Directo
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

          {/* TAB 1: GALERÍA CLOUDFLARE R2 */}
          {tabActiva === 'cloud' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Buscador */}
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por título..."
                    className="w-full bg-[#07131e] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#ffb703] focus:outline-none"
                  />
                </div>

                {/* Filtro por Categorías */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {['todas', 'paquetes', 'destinos', 'cms', 'general'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFiltroCategoria(cat)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                        filtroCategoria === cat
                          ? 'bg-[#ffb703] text-black shadow-md'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {cargandoGaleria ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Loader2 className="animate-spin text-[#ffb703]" size={32} />
                  <p className="text-xs">Consultando imágenes en Cloudflare R2...</p>
                </div>
              ) : imagenesFiltradas.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Cloud className="mx-auto text-gray-500 mb-2" size={40} />
                  <p className="text-sm font-semibold text-gray-300">No hay imágenes en la nube aún</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                    Comienza subiendo tus fotos al bucket de Cloudflare R2 con el botón de abajo.
                  </p>
                  <button
                    onClick={() => setTabActiva('subir')}
                    className="px-4 py-2 bg-[#ffb703] text-black font-bold text-xs rounded-xl shadow-lg hover:bg-amber-400 transition-all inline-flex items-center gap-2"
                  >
                    <UploadCloud size={14} /> Subir Primera Imagen
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagenesFiltradas.map((img) => {
                    const esSeleccionada = imagenActual === img.url;
                    return (
                      <div
                        key={img.id || img.url}
                        onClick={() => {
                          onSeleccionar(img.url);
                          onClose();
                        }}
                        className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] bg-[#07131e] ${
                          esSeleccionada
                            ? 'border-[#ffb703] ring-2 ring-[#ffb703]/50 shadow-xl'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="h-32 w-full overflow-hidden relative bg-black/40">
                          <img
                            src={img.url}
                            alt={img.titulo}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                            <span className="text-[10px] text-white font-bold bg-[#ffb703] text-black px-2 py-0.5 rounded shadow">
                              Seleccionar
                            </span>
                            {img.r2_key && (
                              <button
                                title="Eliminar de Cloudflare R2"
                                onClick={(e) => handleEliminarImagen(e, img)}
                                className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          {esSeleccionada && (
                            <div className="absolute top-2 right-2 bg-[#ffb703] text-black p-1 rounded-full shadow-lg">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-white truncate" title={img.titulo}>
                            {img.titulo}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                            <span className="capitalize px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                              {img.categoria}
                            </span>
                            {img.origen === 'cloudflare_r2' ? (
                              <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                                <Cloud size={10} /> Cloudflare
                              </span>
                            ) : (
                              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                                <Folder size={10} /> Local
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PREDETERMINADAS DEL PROYECTO */}
          {tabActiva === 'local' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-200 text-xs">
                <Sparkles size={18} className="shrink-0 text-amber-400" />
                <span>
                  Estas imágenes están guardadas directamente dentro del código del proyecto en <code className="bg-black/30 px-1 py-0.5 rounded">/public/images/</code> y se mantienen intactas.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {IMAGENES_PREDETERMINADAS_LOCALES.map((img) => {
                  const esSeleccionada = imagenActual === img.url;
                  return (
                    <div
                      key={img.url}
                      onClick={() => {
                        onSeleccionar(img.url);
                        onClose();
                      }}
                      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] bg-[#07131e] ${
                        esSeleccionada
                          ? 'border-[#ffb703] ring-2 ring-[#ffb703]/50 shadow-xl'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="h-32 w-full overflow-hidden relative bg-black/40">
                        <img
                          src={img.url}
                          alt={img.titulo}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                          <span className="text-[10px] text-white font-bold bg-[#ffb703] text-black px-2 py-0.5 rounded shadow">
                            Usar Esta
                          </span>
                        </div>
                        {esSeleccionada && (
                          <div className="absolute top-2 right-2 bg-[#ffb703] text-black p-1 rounded-full shadow-lg">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-white truncate" title={img.titulo}>
                          {img.titulo}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5" title={img.url}>
                          {img.url}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SUBIR NUEVA FOTO A CLOUDFLARE R2 */}
          {tabActiva === 'subir' && (
            <form onSubmit={handleSubirACloudflare} className="space-y-5 max-w-xl mx-auto py-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Zona de arrastrar y soltar */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all relative overflow-hidden ${
                  previewSubida
                    ? 'border-[#ffb703]/50 bg-black/30'
                    : 'border-white/20 hover:border-[#1995ad] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                {previewSubida ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-full h-48 rounded-2xl overflow-hidden relative border border-white/20">
                      <img
                        src={previewSubida}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                        Archivo seleccionado
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Haz clic si deseas cambiar la imagen
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1995ad]/20 to-[#ffb703]/20 flex items-center justify-center border border-white/10 text-[#ffb703]">
                      <UploadCloud size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Haz clic para seleccionar tu foto</p>
                      <p className="text-xs text-gray-400 mt-1">Formatos admitidos: JPG, PNG, WebP (Máx. 12 MB)</p>
                    </div>
                    <div className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">
                      Se subirá directo a Cloudflare R2 (aguitourscapullanas)
                    </div>
                  </div>
                )}
              </div>

              {/* Campos adicionales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Título o Nombre de la Imagen
                  </label>
                  <input
                    type="text"
                    value={tituloSubida}
                    onChange={e => setTituloSubida(e.target.value)}
                    placeholder="Ej: Máncora Playa Atardecer"
                    className="w-full bg-[#07131e] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ffb703] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={categoriaSubida}
                    onChange={e => setCategoriaSubida(e.target.value)}
                    className="w-full bg-[#07131e] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ffb703] focus:outline-none"
                  >
                    <option value="paquetes">🎒 Paquetes Grupales</option>
                    <option value="destinos">📍 Destinos Turísticos</option>
                    <option value="cms">🎨 CMS / Portada / Quiénes Somos</option>
                    <option value="general">📁 General</option>
                  </select>
                </div>
              </div>

              {/* Botón de Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!archivoSeleccionado || subiendo}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1995ad] via-[#0d5c75] to-[#ffb703] text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {subiendo ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Subiendo a Cloudflare R2...
                    </>
                  ) : (
                    <>
                      <Cloud size={18} /> Subir y Seleccionar Imagen
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ENLACE URL DIRECTO */}
          {tabActiva === 'url' && (
            <div className="space-y-5 max-w-xl mx-auto py-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Pegar URL de Imagen Externa (Unsplash, CDN, etc.)
                </label>
                <input
                  type="text"
                  value={urlDirecta}
                  onChange={e => setUrlDirecta(e.target.value)}
                  placeholder="https://images.unsplash.com/... o https://pub-xxxx.r2.dev/..."
                  className="w-full bg-[#07131e] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ffb703] focus:outline-none"
                />
              </div>

              {urlDirecta && (
                <div className="border border-white/10 rounded-2xl p-3 bg-black/30">
                  <p className="text-[11px] text-gray-400 mb-2 font-semibold">Vista previa del enlace:</p>
                  <div className="h-44 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                    <img
                      src={urlDirecta}
                      alt="Vista previa URL"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/ciudades/fondo-destinos1.png';
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!urlDirecta.trim()}
                onClick={() => {
                  onSeleccionar(urlDirecta.trim());
                  onClose();
                }}
                className="w-full py-3.5 bg-[#ffb703] text-black font-bold text-sm rounded-xl shadow-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} /> Usar esta URL
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#07111a] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2 truncate max-w-md">
            <span className="font-semibold text-gray-300">Imagen actual:</span>
            <span className="truncate text-[11px] text-cyan-400 font-mono" title={imagenActual}>
              {imagenActual || 'Ninguna seleccionada'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
