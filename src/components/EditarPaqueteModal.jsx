import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function EditarPaqueteModal({ paquete, isOpen, onClose, onPaqueteActualizado }) {
  const [formData, setFormData] = useState({
    titulo: '', destino: '', precio_persona: 1000, cupo_maximo: 10,
    fecha_salida: '', fecha_retorno: '', imagen_portada: '', descripcion: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paquete) {
      setFormData({
        titulo: paquete.titulo || '',
        destino: paquete.destino || '',
        precio_persona: paquete.precio_persona || 0,
        cupo_maximo: paquete.cupo_maximo || 10,
        fecha_salida: paquete.fecha_salida || '',
        fecha_retorno: paquete.fecha_retorno || '',
        imagen_portada: paquete.imagen_portada || '',
        descripcion: paquete.descripcion || ''
      });
    }
  }, [paquete]);

  if (!isOpen || !paquete) return null;

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const diferenciaCupos = parseInt(formData.cupo_maximo) - paquete.cupo_maximo;
      const nuevoCupoDisponible = Math.max(0, paquete.cupo_disponible + diferenciaCupos);

      const { error } = await supabase
        .from('paquetes_grupales')
        .update({
          titulo: formData.titulo,
          destino: formData.destino,
          precio_persona: parseFloat(formData.precio_persona),
          cupo_maximo: parseInt(formData.cupo_maximo),
          cupo_disponible: nuevoCupoDisponible,
          fecha_salida: formData.fecha_salida,
          fecha_retorno: formData.fecha_retorno,
          imagen_portada: formData.imagen_portada,
          descripcion: formData.descripcion,
          updated_at: new Date().toISOString()
        })
        .eq('id', paquete.id);

      if (error) throw error;
      alert('¡Paquete grupal actualizado correctamente!');
      onPaqueteActualizado();
      onClose();
    } catch (err) {
      alert('Error al actualizar paquete: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative my-auto max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <Edit3 size={20} /> Editar Paquete Grupal
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">{paquete.titulo}</p>
        </div>

        {/* Formulario de Edición */}
        <form onSubmit={handleGuardar} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Título del Paquete</label>
              <input 
                type="text" 
                value={formData.titulo} 
                onChange={e => setFormData({...formData, titulo: e.target.value})} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Destino (Ciudad, País)</label>
              <input 
                type="text" 
                value={formData.destino} 
                onChange={e => setFormData({...formData, destino: e.target.value})} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Precio por Persona (S/)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.precio_persona} 
                onChange={e => setFormData({...formData, precio_persona: e.target.value})} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Cupo Máximo</label>
              <input 
                type="number" 
                value={formData.cupo_maximo} 
                onChange={e => setFormData({...formData, cupo_maximo: e.target.value})} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Fecha de Salida</label>
              <input 
                type="text" 
                value={formData.fecha_salida} 
                onChange={e => setFormData({...formData, fecha_salida: e.target.value})} 
                required 
                placeholder="15-22 Nov"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Fecha de Retorno</label>
              <input 
                type="text" 
                value={formData.fecha_retorno} 
                onChange={e => setFormData({...formData, fecha_retorno: e.target.value})} 
                required 
                placeholder="22 Nov"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Ruta / URL Imagen Portada</label>
            <input 
              type="text" 
              value={formData.imagen_portada} 
              onChange={e => setFormData({...formData, imagen_portada: e.target.value})} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />

            {/* Vista Previa en Vivo de la Imagen */}
            {formData.imagen_portada && (
              <div className="mt-2 rounded-xl overflow-hidden h-36 border border-white/15 relative">
                <img 
                  src={formData.imagen_portada} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/images/ciudades/fondo-destinos.png'; }}
                />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <ImageIcon size={12} /> Vista Previa en Vivo
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Descripción del Viaje</label>
            <textarea 
              rows={3}
              value={formData.descripcion} 
              onChange={e => setFormData({...formData, descripcion: e.target.value})} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios del Paquete'}
          </button>
        </form>
      </div>
    </div>
  );
}
