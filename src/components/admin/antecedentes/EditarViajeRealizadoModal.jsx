import React, { useState, useEffect } from 'react';
import { 
  X, Edit3, Award, Image as ImageIcon, Sparkles, 
  Trash2, Plus, Calendar, MapPin, Users, Building2, GraduationCap, AlertTriangle 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../context/ToastContext';
import { SelectorImagenModal } from '../../common/SelectorImagenModal';

export function EditarViajeRealizadoModal({ isOpen, onClose, viaje, onViajeActualizado, user, can }) {
  const toast = useToast();
  const [selectorPortadaOpen, setSelectorPortadaOpen] = useState(false);
  const [selectorGaleriaOpen, setSelectorGaleriaOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    cliente_tipo: 'colegio',
    nombre_cliente: '',
    destino: '',
    fecha_viaje: '',
    cantidad_pasajeros: 1,
    descripcion: '',
    imagen_portada: '',
    galeria: [],
    destacado: false,
    orden: 0,
    activo: true
  });

  useEffect(() => {
    if (viaje) {
      setFormData({
        titulo: viaje.titulo || '',
        cliente_tipo: viaje.cliente_tipo || 'colegio',
        nombre_cliente: viaje.nombre_cliente || '',
        destino: viaje.destino || '',
        fecha_viaje: viaje.fecha_viaje || '',
        cantidad_pasajeros: viaje.cantidad_pasajeros || 1,
        descripcion: viaje.descripcion || '',
        imagen_portada: viaje.imagen_portada || '/images/ciudades/fondo-destinos1.png',
        galeria: Array.isArray(viaje.galeria) ? viaje.galeria : [],
        destacado: !!viaje.destacado,
        orden: viaje.orden || 0,
        activo: viaje.activo !== false
      });
      setConfirmarEliminar(false);
    }
  }, [viaje]);

  if (!isOpen || !viaje) return null;

  const handleAgregarFotoGaleria = (url) => {
    if (!url) return;
    if (formData.galeria.includes(url)) {
      toast.warning('Esta foto ya forma parte del álbum.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      galeria: [...prev.galeria, url]
    }));
    toast.success('Foto agregada al álbum.');
  };

  const handleAgregarFotosMultiples = (urls) => {
    if (!Array.isArray(urls) || urls.length === 0) return;
    const nuevas = urls.filter(u => !formData.galeria.includes(u));
    if (nuevas.length > 0) {
      setFormData(prev => ({
        ...prev,
        galeria: [...prev.galeria, ...nuevas]
      }));
      toast.success(`Se agregaron ${nuevas.length} foto(s) al álbum.`);
    }
  };

  const handleRemoverFotoGaleria = (index) => {
    setFormData(prev => ({
      ...prev,
      galeria: prev.galeria.filter((_, i) => i !== index)
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.nombre_cliente.trim() || !formData.destino.trim()) {
      toast.warning('Por favor completa los campos requeridos.');
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
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('viajes_realizados')
        .update(payload)
        .eq('id', viaje.id);

      if (error) throw error;

      toast.success('Cambios guardados exitosamente.', '¡Actualizado! ✨');
      if (onViajeActualizado) onViajeActualizado();
      onClose();
    } catch (err) {
      console.error('Error al actualizar viaje realizado:', err);
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('viajes_realizados')
        .delete()
        .eq('id', viaje.id);

      if (error) throw error;

      toast.success('El antecedente fue eliminado del sistema.', 'Eliminado Correctamente');
      if (onViajeActualizado) onViajeActualizado();
      onClose();
    } catch (err) {
      console.error('Error al eliminar viaje realizado:', err);
      toast.error('Error al eliminar: ' + err.message);
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
                <Edit3 size={20} className="text-[#ffb703]" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold m-0 flex items-center gap-2">
                  Editar Experiencia / Viaje Realizado
                </h3>
                <p className="text-[11px] text-white/80 m-0">
                  Modifica información, fotos de Cloudflare R2 y estado de publicación
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
          <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
            
            {/* Título */}
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1.5">
                Título de la Experiencia <span className="text-[#ffb703]">*</span>
              </label>
              <input 
                type="text"
                required
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
              />
            </div>

            {/* Fila: Tipo & Nombre Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  Tipo de Delegación
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
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  Fecha de Viaje
                </label>
                <input 
                  type="text"
                  value={formData.fecha_viaje}
                  onChange={e => setFormData({ ...formData, fecha_viaje: e.target.value })}
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1.5">
                  N° Pasajeros
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

            {/* Reseña */}
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1.5">
                Reseña del Viaje o Testimonio
              </label>
              <textarea 
                rows="3"
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Portada */}
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
                  <Sparkles size={14} /> Cambiar Foto con Cloudflare R2
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-white/20 bg-black/40 shrink-0">
                  <img 
                    src={formData.imagen_portada} 
                    alt="Portada" 
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 break-all m-0 font-mono">
                    {formData.imagen_portada}
                  </p>
                </div>
              </div>
            </div>

            {/* Galería Adicional */}
            <div className="bg-[#071521] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-gray-200 font-bold flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#ffb703]" /> Álbum de Fotos ({formData.galeria.length})
                  </span>
                  <p className="text-[10px] text-gray-400 m-0 mt-0.5">
                    Fotos visibles en el visor lightbox al pulsar la experiencia
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectorGaleriaOpen(true)}
                  className="btn-gold-3d text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus size={14} /> + Agregar Foto
                </button>
              </div>

              {formData.galeria.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-white/15 rounded-xl text-gray-400 text-xs">
                  Sin fotos adicionales registradas.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {formData.galeria.map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/20 aspect-video bg-black/40">
                      <img 
                        src={imgUrl} 
                        alt={`Foto ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all"
                        onError={e => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoverFotoGaleria(idx)}
                        title="Quitar foto"
                        className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Opciones Destacado / Activo / Orden */}
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

            {/* Eliminar Sección si tiene permiso */}
            {(!can || can('antecedentes_eliminar')) && (
              confirmarEliminar ? (
                <div className="bg-red-950/60 border border-red-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-red-200 text-xs">
                    <AlertTriangle size={18} className="text-red-400 shrink-0" />
                    <span>¿Confirmas eliminar permanentemente esta experiencia de la base de datos?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmarEliminar(false)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      No, Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleEliminar}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Sí, Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmarEliminar(true)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} /> Eliminar esta experiencia...
                  </button>
                </div>
              )
            )}

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold-3d text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Selector de Portada */}
      <SelectorImagenModal
        isOpen={selectorPortadaOpen}
        onClose={() => setSelectorPortadaOpen(false)}
        onSeleccionar={(url) => {
          setFormData(prev => ({ ...prev, imagen_portada: url }));
          setSelectorPortadaOpen(false);
          toast.success('Foto de portada seleccionada.');
        }}
        imagenActual={formData.imagen_portada}
        categoriaSugerida="general"
        userId={user?.id}
      />

      {/* Selector de Galería */}
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
    </>
  );
}
