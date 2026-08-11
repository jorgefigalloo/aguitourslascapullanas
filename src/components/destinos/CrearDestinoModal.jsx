import React, { useState } from 'react';
import { X, PlusCircle, Globe, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CrearDestinoModal({ isOpen, onClose, onDestinoCreado }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'nacional',
    descripcion: '',
    imagen_portada: '/images/ciudades/nacionales/arequipa.png'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('destinos_turisticos')
        .insert([{
          nombre: formData.nombre,
          tipo: formData.tipo,
          descripcion: formData.descripcion,
          imagen_portada: formData.imagen_portada
        }]);

      if (error) throw error;
      alert('¡Nuevo destino turístico registrado exitosamente!');
      onDestinoCreado();
      onClose();
      setFormData({
        nombre: '',
        tipo: 'nacional',
        descripcion: '',
        imagen_portada: '/images/ciudades/nacionales/arequipa.png'
      });
    } catch (err) {
      alert('Error al registrar destino: ' + err.message);
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
            <PlusCircle size={20} /> Registrar Nuevo Destino Turístico
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">Agrega una nueva ciudad o atracción para el catálogo</p>
        </div>

        {/* Formulario de Creación */}
        <form onSubmit={handleCrear} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Nombre del Destino (ej: Arequipa)</label>
            <input 
              type="text" 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
              required 
              placeholder="Cusco & Machu Picchu"
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
              placeholder="/images/ciudades/nacionales/cuzco.png"
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
              placeholder="Descripción breve y atractiva para los viajeros..."
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <Globe size={18} /> {loading ? 'Registrando...' : 'Registrar Destino'}
          </button>
        </form>
      </div>
    </div>
  );
}
