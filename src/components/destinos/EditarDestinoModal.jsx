import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Globe, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function EditarDestinoModal({ destino, isOpen, onClose, onDestinoActualizado }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'nacional',
    descripcion: '',
    imagen_portada: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (destino) {
      setFormData({
        nombre: destino.nombre || '',
        tipo: destino.tipo || 'nacional',
        descripcion: destino.descripcion || '',
        imagen_portada: destino.imagen_portada || ''
      });
    }
  }, [destino]);

  if (!isOpen || !destino) return null;

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('destinos_turisticos')
        .update({
          nombre: formData.nombre,
          tipo: formData.tipo,
          descripcion: formData.descripcion,
          imagen_portada: formData.imagen_portada
        })
        .eq('id', destino.id);

      if (error) throw error;
      alert('¡Destino turístico actualizado correctamente!');
      onDestinoActualizado();
      onClose();
    } catch (err) {
      alert('Error al actualizar destino: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    const confirmacion = window.confirm(`¿Estás seguro de eliminar el destino "${destino.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmacion) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('destinos_turisticos')
        .delete()
        .eq('id', destino.id);

      if (error) throw error;
      alert('¡Destino eliminado correctamente!');
      onDestinoActualizado();
      onClose();
    } catch (err) {
      alert('Error al eliminar destino: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-auto">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <Globe size={20} /> Editar Destino Turístico
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">{destino.nombre}</p>
        </div>

        {/* Formulario de Edición */}
        <form onSubmit={handleGuardar} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Nombre del Destino</label>
            <input 
              type="text" 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Tipo de Destino</label>
            <select
              value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value})}
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
            >
              <option value="nacional">🇵🇪 Nacional (Perú)</option>
              <option value="internacional">🌎 Internacional</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Ruta o URL de Imagen de Portada</label>
            <input 
              type="text" 
              value={formData.imagen_portada} 
              onChange={e => setFormData({...formData, imagen_portada: e.target.value})} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />

            {formData.imagen_portada && (
              <div className="mt-2 rounded-xl overflow-hidden h-32 border border-white/15 relative">
                <img 
                  src={formData.imagen_portada} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                  <ImageIcon size={12} /> Vista Previa
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Descripción del Destino</label>
            <textarea 
              rows={3} 
              value={formData.descripcion} 
              onChange={e => setFormData({...formData, descripcion: e.target.value})} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button 
              type="button" 
              onClick={handleEliminar}
              disabled={loading}
              className="bg-red-500/20 border border-red-500/40 text-red-300 font-bold py-3 px-4 rounded-2xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 text-xs flex-1"
            >
              <Trash2 size={16} /> Eliminar Destino
            </button>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-gold-3d justify-center py-3 font-bold text-xs flex-2 flex items-center gap-2"
            >
              <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
