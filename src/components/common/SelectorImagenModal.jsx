import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Cloud, Folder, UploadCloud, Link2, Search, Check, 
  Trash2, Image as ImageIcon, Loader2, Sparkles, AlertCircle, Plus, Eye
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
  onSeleccionarMultiples,
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
  const [ajusteVisual, setAjusteVisual] = useState('contain'); // 'contain' para ver completa | 'cover' para llenar recuadro

  // Estado Subir Archivos Múltiples a Cloudflare R2
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]); // array de { id, file, previewUrl, titulo, sizeFormatted }
  const [categoriaSubida, setCategoriaSubida] = useState(categoriaSugerida);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState({ actual: 0, total: 0, porcentaje: 0, nombreActual: '' });

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

  // Manejo de Selección de Archivos (Soporta Múltiples)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const nuevosValidos = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.warning(`"${file.name}" no es una imagen válida.`, 'Formato omitido');
        continue;
      }

      if (file.size > 12 * 1024 * 1024) {
        toast.warning(`"${file.name}" supera el límite de 12 MB.`, 'Archivo muy pesado');
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      nuevosValidos.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        titulo: nameWithoutExt.replace(/[_-]/g, ' '),
        sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }

    if (nuevosValidos.length > 0) {
      setArchivosSeleccionados(prev => [...prev, ...nuevosValidos]);
      toast.info(`Se agregaron ${nuevosValidos.length} imagen(es) a la cola de subida.`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoverArchivoDeCola = (id) => {
    setArchivosSeleccionados(prev => prev.filter(item => item.id !== id));
  };

  const handleCambiarTituloArchivo = (id, nuevoTitulo) => {
    setArchivosSeleccionados(prev => prev.map(item => item.id === id ? { ...item, titulo: nuevoTitulo } : item));
  };

  // Subir Archivos a Cloudflare R2
  const handleSubirACloudflare = async (e) => {
    e.preventDefault();
    if (archivosSeleccionados.length === 0) {
      toast.warning('Selecciona al menos una imagen para subir.', 'Atención');
      return;
    }

    setSubiendo(true);
    const total = archivosSeleccionados.length;
    const urlsSubidas = [];

    try {
      for (let i = 0; i < total; i++) {
        const item = archivosSeleccionados[i];
        setProgresoSubida({
          actual: i + 1,
          total,
          porcentaje: Math.round(((i + 1) / total) * 100),
          nombreActual: item.titulo
        });

        const res = await subirImagenACloudflare(item.file, {
          titulo: item.titulo.trim() || item.file.name,
          categoria: categoriaSubida,
          userId
        });

        if (res.url) {
          urlsSubidas.push(res.url);
        }
      }

      toast.success(
        total === 1 
          ? '¡Imagen subida a Cloudflare R2 con éxito!' 
          : `¡${total} imágenes subidas con éxito a Cloudflare R2! 🎉`,
        'Nube Actualizada'
      );

      // Limpiar cola
      setArchivosSeleccionados([]);
      setProgresoSubida({ actual: 0, total: 0, porcentaje: 0, nombreActual: '' });

      // Si el componente padre acepta múltiples selecciones
      if (onSeleccionarMultiples && urlsSubidas.length > 0) {
        onSeleccionarMultiples(urlsSubidas);
        onClose();
        return;
      }

      // Si es selección individual
      if (onSeleccionar && urlsSubidas.length > 0) {
        onSeleccionar(urlsSubidas[0]);
        onClose();
      } else {
        await cargarImagenes();
        setTabActiva('cloud');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al subir a Cloudflare R2', 'Error de Subida');
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
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1724] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0d233a] to-[#07131e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1995ad] to-[#ffb703] p-0.5 flex items-center justify-center shadow-lg shadow-[#1995ad]/20">
              <div className="w-full h-full bg-[#0b1724] rounded-[10px] flex items-center justify-center">
                <Cloud className="text-[#ffb703]" size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
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
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-white/10 bg-[#07111a] px-3 sm:px-5 gap-1.5 sm:gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setTabActiva('cloud')}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer whitespace-nowrap ${
              tabActiva === 'cloud'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Cloud size={15} /> Galería Cloudflare R2 ({imagenesCloud.length})
          </button>
          
          <button
            onClick={() => setTabActiva('local')}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer whitespace-nowrap ${
              tabActiva === 'local'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Folder size={15} /> Predeterminadas del Proyecto ({IMAGENES_PREDETERMINADAS_LOCALES.length})
          </button>

          <button
            onClick={() => setTabActiva('subir')}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer whitespace-nowrap ${
              tabActiva === 'subir'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <UploadCloud size={15} /> Subir Foto(s) a R2 {archivosSeleccionados.length > 0 && `(${archivosSeleccionados.length})`}
          </button>

          <button
            onClick={() => setTabActiva('url')}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer whitespace-nowrap ${
              tabActiva === 'url'
                ? 'bg-[#0b1724] text-[#ffb703] border-white/15 border-b-transparent shadow-lg'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Link2 size={15} /> Enlace URL Directo
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">

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

                {/* Controles de visualización y Categorías */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Selector para ver foto completa o llenar recuadro */}
                  <button
                    onClick={() => setAjusteVisual(prev => prev === 'contain' ? 'cover' : 'contain')}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-gray-300 hover:text-white cursor-pointer"
                    title="Alternar entre ver foto completa o recortada"
                  >
                    {ajusteVisual === 'contain' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#1995ad] inline-block"></span>
                        <span>Ver Completa (Sin Recorte)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#ffb703] inline-block"></span>
                        <span>Llenar Recuadro</span>
                      </>
                    )}
                  </button>

                  {/* Filtro por Categorías */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {['todas', 'paquetes', 'destinos', 'cms', 'general'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFiltroCategoria(cat)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                          filtroCategoria === cat
                            ? 'bg-[#ffb703] text-black shadow'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
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
                    className="px-4 py-2 bg-[#ffb703] text-black font-bold text-xs rounded-xl shadow-lg hover:bg-amber-400 transition-all inline-flex items-center gap-2 cursor-pointer"
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
                        {/* Contenedor de Imagen con Ajuste Completo */}
                        <div className="h-36 w-full overflow-hidden relative bg-[#030a12] flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.titulo}
                            className={`w-full h-full transition-all duration-300 ${
                              ajusteVisual === 'contain' ? 'object-contain p-1' : 'object-cover group-hover:scale-105'
                            }`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                            <span className="text-[10px] font-bold bg-[#ffb703] text-black px-2 py-0.5 rounded shadow">
                              Seleccionar
                            </span>
                            {img.r2_key && (
                              <button
                                title="Eliminar de Cloudflare R2"
                                onClick={(e) => handleEliminarImagen(e, img)}
                                className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
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
                            <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                              <Cloud size={10} /> Cloudflare
                            </span>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-3 text-amber-200 text-xs">
                  <Sparkles size={18} className="shrink-0 text-amber-400" />
                  <span>
                    Imágenes predeterminadas guardadas en <code className="bg-black/30 px-1 py-0.5 rounded">/public/images/</code>.
                  </span>
                </div>
                <button
                  onClick={() => setAjusteVisual(prev => prev === 'contain' ? 'cover' : 'contain')}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-gray-300 hover:text-white cursor-pointer"
                >
                  {ajusteVisual === 'contain' ? '🔍 Completa' : '📐 Llenar'}
                </button>
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
                      <div className="h-36 w-full overflow-hidden relative bg-[#030a12] flex items-center justify-center">
                        <img
                          src={img.url}
                          alt={img.titulo}
                          className={`w-full h-full transition-all duration-300 ${
                            ajusteVisual === 'contain' ? 'object-contain p-1' : 'object-cover group-hover:scale-110'
                          }`}
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

          {/* TAB 3: SUBIR UNA O VARIAS FOTOS A CLOUDFLARE R2 */}
          {tabActiva === 'subir' && (
            <form onSubmit={handleSubirACloudflare} className="space-y-5 max-w-2xl mx-auto py-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Zona de Arrastrar y Soltar / Selección Múltiple */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all relative overflow-hidden border-white/20 hover:border-[#1995ad] bg-white/[0.02] hover:bg-white/[0.05]"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1995ad]/20 to-[#ffb703]/20 flex items-center justify-center border border-white/10 text-[#ffb703]">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Haz clic para seleccionar tus imágenes <span className="text-[#ffb703]">(puedes elegir varias a la vez)</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Formatos admitidos: JPG, PNG, WebP (Máx. 12 MB por archivo)</p>
                  </div>
                  <div className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3.5 py-1 rounded-full flex items-center gap-1.5">
                    <Cloud size={14} /> Se subirá directamente a Cloudflare R2 (aguitourscapullanas)
                  </div>
                </div>
              </div>

              {/* Lista de Imágenes Seleccionadas en Cola */}
              {archivosSeleccionados.length > 0 && (
                <div className="space-y-3 bg-[#07131e] p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        Archivos listos para subir:
                      </span>
                      <span className="bg-[#ffb703] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {archivosSeleccionados.length} foto(s)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#1995ad] hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Agregar más
                      </button>
                      <button
                        type="button"
                        onClick={() => setArchivosSeleccionados([])}
                        className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer ml-2"
                      >
                        Limpiar todos
                      </button>
                    </div>
                  </div>

                  {/* Grid de Vista Previa Completa (Sin Recorte) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto custom-scrollbar p-1">
                    {archivosSeleccionados.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-[#0b1724] border border-white/10 rounded-xl overflow-hidden p-2 flex flex-col justify-between group relative"
                      >
                        {/* Contenedor de Foto con Ajuste Completo */}
                        <div className="w-full h-28 rounded-lg overflow-hidden relative bg-black/60 flex items-center justify-center border border-white/5 mb-2">
                          <img
                            src={item.previewUrl}
                            alt={item.titulo}
                            className="w-full h-full object-contain p-1"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                            {item.sizeFormatted}
                          </span>
                        </div>

                        {/* Input para Título Individual */}
                        <input
                          type="text"
                          value={item.titulo}
                          onChange={e => handleCambiarTituloArchivo(item.id, e.target.value)}
                          placeholder="Nombre de la imagen"
                          className="w-full bg-[#07131e] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:border-[#ffb703] focus:outline-none truncate"
                        />

                        {/* Botón Eliminar de la Cola */}
                        <button
                          type="button"
                          onClick={() => handleRemoverArchivoDeCola(item.id)}
                          title="Quitar de la lista"
                          className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white p-1 rounded-md shadow-md cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de Categoría Global */}
              <div className="bg-[#07131e] p-4 rounded-2xl border border-white/10">
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Categoría para las imágenes a subir
                </label>
                <select
                  value={categoriaSubida}
                  onChange={e => setCategoriaSubida(e.target.value)}
                  className="w-full bg-[#0b1724] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ffb703] focus:outline-none"
                >
                  <option value="paquetes">🎒 Paquetes Grupales</option>
                  <option value="destinos">📍 Destinos Turísticos</option>
                  <option value="cms">🎨 CMS / Portada / Quiénes Somos</option>
                  <option value="general">📁 General / Viajes Realizados</option>
                </select>
              </div>

              {/* Barra de Progreso durante la Subida */}
              {subiendo && (
                <div className="bg-[#07131e] border border-[#ffb703]/30 p-4 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#ffb703] flex items-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> 
                      Subiendo {progresoSubida.actual} de {progresoSubida.total}... ({progresoSubida.nombreActual})
                    </span>
                    <span className="font-mono text-gray-300 font-bold">{progresoSubida.porcentaje}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-[#1995ad] via-[#0d5c75] to-[#ffb703] transition-all duration-300 rounded-full"
                      style={{ width: `${progresoSubida.porcentaje}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botón de Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={archivosSeleccionados.length === 0 || subiendo}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1995ad] via-[#0d5c75] to-[#ffb703] text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {subiendo ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Subiendo a Cloudflare R2...
                    </>
                  ) : (
                    <>
                      <Cloud size={18} /> 
                      {archivosSeleccionados.length <= 1 
                        ? 'Subir Imagen a Cloudflare R2' 
                        : `Subir ${archivosSeleccionados.length} Imágenes a Cloudflare R2`}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ENLACE URL DIRECTO */}
          {tabActiva === 'url' && (
            <div className="space-y-4 max-w-lg mx-auto py-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block">
                  Pega un enlace URL de imagen directo
                </label>
                <input
                  type="url"
                  value={urlDirecta}
                  onChange={e => setUrlDirecta(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full bg-[#07131e] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ffb703] focus:outline-none"
                />
              </div>

              {urlDirecta && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-400">Vista previa:</span>
                  <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                    <img
                      src={urlDirecta}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/ciudades/fondo-destinos1.png';
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!urlDirecta) {
                    toast.warning('Ingresa una URL válida');
                    return;
                  }
                  onSeleccionar(urlDirecta);
                  onClose();
                }}
                disabled={!urlDirecta}
                className="w-full py-3 bg-[#1995ad] hover:bg-[#127285] text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
              >
                Usar Esta URL
              </button>
            </div>
          )}

        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-white/10 bg-[#07111a] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2 truncate max-w-md">
            <span>Imagen actual:</span>
            <code className="text-[#ffb703] font-mono text-[11px] truncate bg-black/40 px-2 py-0.5 rounded border border-white/5">
              {imagenActual || 'Ninguna seleccionada'}
            </code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
