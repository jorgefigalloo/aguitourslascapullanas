import React, { useState } from 'react';
import { X, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export function CrearPaqueteModal({ isOpen, onClose, onPaqueteCreado, userId }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    titulo: '', destino: '', precio_persona: 1000, cupo_maximo: 15,
    fecha_salida: '', fecha_retorno: '', 
    imagen_portada: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop', 
    descripcion: '',
    whatsapp_url: '',
    pdf_formulario_url: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itinerarioPayload = {
        dias: [],
        whatsapp_url: formData.whatsapp_url || 'https://chat.whatsapp.com/ExclusivoAguitoursCapullanas',
        pdf_formulario_url: formData.pdf_formulario_url || '/rutas.txt'
      };

      const { error } = await supabase.from('paquetes_grupales').insert([{
        titulo: formData.titulo,
        destino: formData.destino,
        precio_persona: parseFloat(formData.precio_persona),
        cupo_maximo: parseInt(formData.cupo_maximo),
        cupo_disponible: parseInt(formData.cupo_maximo),
        fecha_salida: formData.fecha_salida,
        fecha_retorno: formData.fecha_retorno,
        imagen_portada: formData.imagen_portada,
        descripcion: formData.descripcion,
        itinerario: itinerarioPayload,
        estado: 'abierto',
        creado_por: userId
      }]);

      if (error) throw error;
      toast.success('Nuevo paquete grupal publicado exitosamente.', 'Paquete Creado 🎉');
      onPaqueteCreado();
      onClose();
      setFormData({
        titulo: '', destino: '', precio_persona: 1000, cupo_maximo: 15,
        fecha_salida: '', fecha_retorno: '', 
        imagen_portada: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop', 
        descripcion: '',
        whatsapp_url: '',
        pdf_formulario_url: ''
      });
    } catch (err) {
      toast.error('Error al publicar paquete: ' + err.message);
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
            <PlusCircle size={20} /> Publicar Nuevo Paquete Grupal
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">Ingresa la información completa de la nueva expedición</p>
        </div>

        {/* Formulario de Creación */}
        <form onSubmit={handleCrear} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Título del Paquete</label>
              <input 
                type="text" 
                value={formData.titulo} 
                onChange={e => setFormData({...formData, titulo: e.target.value})} 
                required 
                placeholder="Expedición a Machu Picchu"
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
                placeholder="Cusco, Perú"
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
              <label className="text-xs text-gray-300 font-bold block mb-1">Fecha Salida (ej: 15-22 Nov)</label>
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
              <label className="text-xs text-gray-300 font-bold block mb-1">Fecha Retorno (ej: 22 Nov)</label>
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
              placeholder="Descripción de la aventura..."
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div>
              <label className="text-xs text-[#25D366] font-bold block mb-1">💬 Link del Grupo de WhatsApp</label>
              <input 
                type="text" 
                value={formData.whatsapp_url} 
                onChange={e => setFormData({...formData, whatsapp_url: e.target.value})} 
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-[#071521] border border-[#25D366]/40 rounded-xl p-3 text-white text-sm focus:border-[#25D366] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-[#ffb703] font-bold block mb-1">📄 Link / Ruta de Formulario PDF</label>
              <input 
                type="text" 
                value={formData.pdf_formulario_url} 
                onChange={e => setFormData({...formData, pdf_formulario_url: e.target.value})} 
                placeholder="/rutas.txt o https://.../formulario.pdf"
                className="w-full bg-[#071521] border border-[#ffb703]/40 rounded-xl p-3 text-white text-sm focus:border-[#ffb703] focus:outline-none" 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary-3d justify-center py-3.5 mt-2 font-bold text-sm">
            {loading ? 'Publicando...' : 'Publicar Nuevo Paquete'}
          </button>
        </form>
      </div>
    </div>
  );
}
