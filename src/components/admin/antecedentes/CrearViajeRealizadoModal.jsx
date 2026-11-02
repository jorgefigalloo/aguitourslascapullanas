import React, { useState } from 'react';
import { 
  X, PlusCircle, Award, Image as ImageIcon, Sparkles, 
  Trash2, Plus, Calendar, MapPin, Users, Building2, GraduationCap, UserCheck,
  Eye, Star
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../context/ToastContext';
import { SelectorImagenModal } from '../../common/SelectorImagenModal';
import { VisorFotoModal } from '../../common/VisorFotoModal';

export function CrearViajeRealizadoModal({ isOpen, onClose, onViajeCreado, user }) {
  const toast = useToast();
  const [selectorPortadaOpen, setSelectorPortadaOpen] = useState(false);
  const [selectorGaleriaOpen, setSelectorGaleriaOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Visor de Foto Predeterminada / Lightbox
  const [visorFotoConfig, setVisorFotoConfig] = useState({
    isOpen: false,
    fotoActual: '',
    listaFotos: [],
    indiceInicial: 0,
    titulo: ''
  });

  const [formData, setFormData] = useState({
    titulo: '',
    cliente_tipo: 'colegio',
    nombre_cliente: '',
    destino: '',
    fecha_viaje: '',
    cantidad_pasajeros: 25,
    descripcion: '',
    imagen_portada: '/images/ciudades/nacionales/cuzco.png',
    galeria: [],
    destacado: true,
    orden: 0,
    activo: true
  });

  if (!isOpen) return null;

  const handleAgregarFotoGaleria = (url) => {
    if (!url) return;
    if (formData.galeria.includes(url)) {
      toast.warning('Esta imagen ya está incluida en la galería de este viaje.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      galeria: [...prev.galeria, url]
    }));
    toast.success('Imagen agregada al álbum.');
  };

  const handleAgregarFotosMultiples = (urls) => {
    if (!Array.isArray(urls) || urls.length === 0) return;
    const nuevas = urls.filter(u => !formData.galeria.includes(u));
    if (nuevas.length > 0) {
      setFormData(prev => ({
        ...prev,
        galeria: [...prev.galeria, ...nuevas]
      }));
      toast.success(`Se agregaron ${nuevas.length} imagen(es) al álbum fotográfico.`);
    }
  };

  const handleRemoverFotoGaleria = (index) => {
    setFormData(prev => ({
      ...prev,
      galeria: prev.galeria.filter((_, i) => i !== index)
    }));
  };

  // Ver imagen de portada en tamaño completo / predeterminado
  const handleVerFotoPortada = () => {
    if (!formData.imagen_portada) return;
    const albumCompleto = [
      formData.imagen_portada, 
      ...formData.galeria.filter(u => u !== formData.imagen_portada)
    ];
    setVisorFotoConfig({
      isOpen: true,
      fotoActual: formData.imagen_portada,
      listaFotos: albumCompleto,
      indiceInicial: 0,
      titulo: `Foto de Portada: ${formData.titulo || 'Nueva Experiencia'}`
    });
  };

  // Ver imagen del álbum en tamaño completo / predeterminado
  const handleVerFotoGaleria = (index) => {
    setVisorFotoConfig({
      isOpen: true,
      fotoActual: formData.galeria[index],
      listaFotos: formData.galeria,
      indiceInicial: index,
      titulo: `Álbum (${index + 1}/${formData.galeria.length}): ${formData.titulo || 'Nueva Experiencia'}`
    });
  };

  // Establecer foto del álbum como portada predeterminada
  const handleHacerPortadaPredeterminada = (url) => {
    if (!url) return;
    setFormData(prev => ({
      ...prev,
      imagen_portada: url
    }));
    toast.success('¡Foto asignada como portada predeterminada! ⭐', 'Portada Actualizada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.nombre_cliente.trim() || !formData.destino.trim()) {
      toast.warning('Por favor completa los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        cliente_tipo: formData.cliente_tipo,
        nombre_cliente: formData.nombre_cliente.trim(),
        destino: formData.destino.trim(),
        fecha_viaje: formData.fecha_viaje.trim(),
        cantidad_pasajeros: parseInt(formData.cantidad_pasajeros, 10) || 1,
        descripcion: formData.descripcion.trim(),
        imagen_portada: formData.imagen_portada,
        galeria: formData.galeria,
        destacado: formData.destacado,
        orden: parseInt(formData.orden, 10) || 0,
        activo: formData.activo,
        creado_por: user?.id || null
      };

      const { error } = await supabase
        .from('viajes_realizados')
        .insert([payload]);

      if (error) throw error;

      toast.success('El viaje realizado se guardó en el catálogo y Cloudflare R2.', '¡Experiencia Registrada! 🎉');
      if (onViajeCreado) onViajeCreado();
      onClose();
      
      // Reset form
      setFormData({
        titulo: '',
        cliente_tipo: 'colegio',
        nombre_cliente: '',
        destino: '',
        fecha_viaje: '',
        cantidad_pasajeros: 25,
        descripcion: '',
        imagen_portada: '/images/ciudades/nacionales/cuzco.png',
        galeria: [],
        destacado: true,
        orden: 0,
        activo: true
      });
    } catch (err) {
      console.error('Error al registrar viaje realizado:', err);
      toast.error('No se pudo guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
        <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#003366] via-[#1995ad] to-[#0d2538] p-5 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                <Award size={22} className="text-[#ffb703]" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold m-0 flex items-center gap-2">
                  Registrar Viaje Realizado / Experiencia
                </h3>
                <p className="text-[11px] text-white/80 m-0">
                  Muestra la trayectoria de Aguitours con fotos subidas a Cloudflare R2
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white bg-black/30 hover:bg-black/50 p-2 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
            
            {/* Título Principal */}
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1.5">
                Título de la Experiencia <span className="text-[#ffb703]">*</span>
              </label>
              <input 
                type="text"
                required
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Viaje de Promoción Bodas de Plata - Cusco Imperial"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
              />
            </div>

            {/* Fila: Tipo de Cliente & Nombre del Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  Tipo de Delegación / Grupo
                </label>
                <select 
                  value={formData.cliente_tipo}
                  onChange={e => setFormData({ ...formData, cliente_tipo: e.target.value })}
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                >
                  <option value="colegio">🎓 Colegio / Promoción Escolar</option>
                  <option value="empresa">🏢 Empresa / Corporativo</option>
                  <option value="organizacion">🏛️ Organización / Institución</option>
                  <option value="grupo_privado">👥 Grupo Privado / Amigos</option>
                  <option value="familiar">👨‍👩‍👧‍👦 Viaje Familiar</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  Nombre de la Institución o Cliente <span className="text-[#ffb703]">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={formData.nombre_cliente}
                  onChange={e => setFormData({ ...formData, nombre_cliente: e.target.value })}
                  placeholder="Ej: Colegio San Ignacio de Loyola"
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>
            </div>

            {/* Fila: Destino, Fecha, Pasajeros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  Destino Visitado <span className="text-[#ffb703]">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={formData.destino}
                  onChange={e => setFormData({ ...formData, destino: e.target.value })}
                  placeholder="Ej: Cusco & Machu Picchu"
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  Fecha o Mes de Viaje
                </label>
                <input 
                  type="text"
                  value={formData.fecha_viaje}
                  onChange={e => setFormData({ ...formData, fecha_viaje: e.target.value })}
                  placeholder="Ej: Noviembre 2025"
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  N° Pasajeros Atendidos
                </label>
                <input 
                  type="number"
                  min="1"
                  value={formData.cantidad_pasajeros}
                  onChange={e => setFormData({ ...formData, cantidad_pasajeros: e.target.value })}
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>
            </div>

            {/* Reseña / Descripción */}
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1.5">
                Reseña del Viaje o Testimonio
              </label>
              <textarea 
                rows="3"
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe los puntos destacados del viaje: traslados, visitas guiadas, hoteles, seguridad brindada y satisfacción del grupo..."
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Foto de Portada */}
            <div className="bg-[#071521] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-200 font-bold flex items-center gap-1.5">
                  <ImageIcon size={16} className="text-[#ffb703]" /> Foto de Portada Principal
                </span>
                <button
                  type="button"
                  onClick={() => setSelectorPortadaOpen(true)}
                  className="bg-[#1995ad]/20 hover:bg-[#1995ad] text-[#1995ad] hover:text-white border border-[#1995ad]/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Seleccionar de Cloudflare R2 / Galería
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div 
                  onClick={handleVerFotoPortada}
                  title="Haz clic para ver la imagen en su proporción y tamaño completo"
                  className="w-32 h-22 rounded-xl overflow-hidden border border-white/20 bg-black/40 shrink-0 cursor-pointer relative group shadow-md"
                >
                  <img 
                    src={formData.imagen_portada} 
                    alt="Portada" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    onError={e => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-[2px]">
                    <Eye size={18} className="text-[#ffb703]" />
                    <span className="text-[10px] font-bold">Ver Completa</span>
                  </div>
                  <div className="absolute top-1 left-1 bg-[#ffb703] text-black px-1.5 py-0.5 rounded-md shadow flex items-center gap-1 text-[9px] font-bold">
                    <Star size={9} className="fill-black" /> Portada
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={handleVerFotoPortada}
                      className="text-xs font-bold text-[#ffb703] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} /> Ver imagen predeterminada en grande
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 break-all m-0 font-mono">
                    {formData.imagen_portada}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 m-0">
                    Esta imagen se verá en la portada de la tarjeta y encabezado del álbum. También puedes seleccionar fotos del álbum para fijarlas como portada.
                  </p>
                </div>
              </div>
            </div>

            {/* Galería de Fotos Adicionales (Álbum) */}
            <div className="bg-[#071521] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-gray-200 font-bold flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#ffb703]" /> Álbum de Fotos del Viaje ({formData.galeria.length})
                  </span>
                  <p className="text-[10px] text-gray-400 m-0 mt-0.5">
                    Haz clic en cualquier foto para abrirla en el visor o pulsa ⭐ para fijarla como foto predeterminada
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectorGaleriaOpen(true)}
                  className="btn-gold-3d text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus size={14} /> + Agregar Foto al Álbum
                </button>
              </div>

              {formData.galeria.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-white/15 rounded-xl text-gray-400 text-xs">
                  Aún no has agregado fotos adicionales. Haz clic en <strong className="text-white">"+ Agregar Foto al Álbum"</strong> para cargar desde Cloudflare R2.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {formData.galeria.map((imgUrl, idx) => {
                    const esPortada = formData.imagen_portada === imgUrl;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleVerFotoGaleria(idx)}
                        title="Haz clic para ver la imagen en pantalla completa"
                        className={`relative group rounded-xl overflow-hidden border aspect-video bg-black/40 cursor-pointer transition-all shadow-md ${
                          esPortada 
                            ? 'border-[#ffb703] ring-2 ring-[#ffb703]/50' 
                            : 'border-white/20 hover:border-white/60'
                        }`}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Foto ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                          onError={e => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                        />

                        {/* Badge indicador de Portada */}
                        {esPortada && (
                          <div className="absolute top-1.5 left-1.5 bg-[#ffb703] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow flex items-center gap-1 z-10">
                            <Star size={9} className="fill-black" /> Portada
                          </div>
                        )}

                        {/* Overlay con acciones */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 backdrop-blur-[1px]">
                          
                          {/* Botón Ver en Grande */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerFotoGaleria(idx);
                            }}
                            title="Ver en pantalla completa"
                            className="p-1.5 bg-white/20 hover:bg-white text-gray-200 hover:text-black rounded-lg transition-colors cursor-pointer shadow"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Botón Asignar como Portada Predeterminada */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHacerPortadaPredeterminada(imgUrl);
                            }}
                            title={esPortada ? 'Ya es la portada predeterminada' : 'Establecer como portada predeterminada'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer shadow ${
                              esPortada 
                                ? 'bg-[#ffb703] text-black cursor-default' 
                                : 'bg-[#ffb703]/80 hover:bg-[#ffb703] text-black'
                            }`}
                          >
                            <Star size={14} className={esPortada ? 'fill-black' : ''} />
                          </button>

                          {/* Botón Quitar */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoverFotoGaleria(idx);
                            }}
                            title="Quitar foto del álbum"
                            className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer shadow"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Opciones Adicionales: Destacado & Activo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.destacado}
                  onChange={e => setFormData({ ...formData, destacado: e.target.checked })}
                  className="rounded text-[#ffb703] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-200">
                  ⭐ Destacar en Inicio
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.activo}
                  onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded text-[#1995ad] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-200">
                  Visible al Público
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300 font-bold whitespace-nowrap">Prioridad/Orden:</span>
                <input 
                  type="number"
                  value={formData.orden}
                  onChange={e => setFormData({ ...formData, orden: e.target.value })}
                  className="w-16 bg-[#071521] border border-white/20 rounded-lg p-1.5 text-xs text-white text-center"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold-3d text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar y Publicar Experiencia'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Selector de Imagen para Portada */}
      <SelectorImagenModal
        isOpen={selectorPortadaOpen}
        onClose={() => setSelectorPortadaOpen(false)}
        onSeleccionar={(url) => {
          setFormData(prev => ({ ...prev, imagen_portada: url }));
          setSelectorPortadaOpen(false);
          toast.success('Foto de portada actualizada.');
        }}
        imagenActual={formData.imagen_portada}
        categoriaSugerida="general"
        userId={user?.id}
      />

      {/* Selector de Imagen para Galería */}
      <SelectorImagenModal
        isOpen={selectorGaleriaOpen}
        onClose={() => setSelectorGaleriaOpen(false)}
        onSeleccionar={(url) => {
          handleAgregarFotoGaleria(url);
          setSelectorGaleriaOpen(false);
        }}
        onSeleccionarMultiples={(urls) => {
          handleAgregarFotosMultiples(urls);
          setSelectorGaleriaOpen(false);
        }}
        categoriaSugerida="general"
        userId={user?.id}
      />

      {/* Visor Modal de Foto Completa / Predeterminada */}
      <VisorFotoModal
        isOpen={visorFotoConfig.isOpen}
        onClose={() => setVisorFotoConfig(prev => ({ ...prev, isOpen: false }))}
        fotoActual={visorFotoConfig.fotoActual}
        listaFotos={visorFotoConfig.listaFotos}
        indiceInicial={visorFotoConfig.indiceInicial}
        fotoPortadaActual={formData.imagen_portada}
        onSetPortada={handleHacerPortadaPredeterminada}
        titulo={visorFotoConfig.titulo}
      />
    </>
  );
}
