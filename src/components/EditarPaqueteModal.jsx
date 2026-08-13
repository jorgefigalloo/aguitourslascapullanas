import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Image as ImageIcon, Plus, Trash2, Calendar, MapPin, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export function EditarPaqueteModal({ paquete, isOpen, onClose, onPaqueteActualizado }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    titulo: '', destino: '', precio_persona: 1000, cupo_maximo: 10,
    fecha_salida: '', fecha_retorno: '', imagen_portada: '', descripcion: '',
    whatsapp_url: '', pdf_formulario_url: '',
    punto_partida: '', recomendaciones: ''
  });

  const [diasItinerario, setDiasItinerario] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paquete) {
      const itObj = typeof paquete.itinerario === 'object' && paquete.itinerario ? paquete.itinerario : {};
      const diasArray = Array.isArray(itObj.dias) ? itObj.dias : (Array.isArray(paquete.itinerario) ? paquete.itinerario : []);

      setFormData({
        titulo: paquete.titulo || '',
        destino: paquete.destino || '',
        precio_persona: paquete.precio_persona || 0,
        cupo_maximo: paquete.cupo_maximo || 10,
        fecha_salida: paquete.fecha_salida || '',
        fecha_retorno: paquete.fecha_retorno || '',
        imagen_portada: paquete.imagen_portada || '',
        descripcion: paquete.descripcion || '',
        whatsapp_url: itObj.whatsapp_url || '',
        pdf_formulario_url: itObj.pdf_formulario_url || '',
        punto_partida: itObj.punto_partida || 'Plaza de Armas / Aeropuerto Principal - 06:00 AM',
        recomendaciones: itObj.recomendaciones || 'Ropa abrigadora, Bloqueador solar, Zapatillas de trekking, DNI o Pasaporte original'
      });

      setDiasItinerario(diasArray.length > 0 ? diasArray : [
        { dia: 'Día 1', titulo: 'Recepción y Bienvenida', detalle: 'Llegada al destino, traslado al hotel y tiempo libre.' }
      ]);
    }
  }, [paquete]);

  if (!isOpen || !paquete) return null;

  const handleAddDia = () => {
    const nextNum = diasItinerario.length + 1;
    setDiasItinerario([
      ...diasItinerario,
      { dia: `Día ${nextNum}`, titulo: `Actividad del Día ${nextNum}`, detalle: 'Detalle de la ruta y traslados...' }
    ]);
  };

  const handleRemoveDia = (index) => {
    setDiasItinerario(diasItinerario.filter((_, i) => i !== index));
  };

  const handleDiaChange = (index, field, value) => {
    const updated = [...diasItinerario];
    updated[index][field] = value;
    setDiasItinerario(updated);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const diferenciaCupos = parseInt(formData.cupo_maximo) - paquete.cupo_maximo;
      const nuevoCupoDisponible = Math.max(0, paquete.cupo_disponible + diferenciaCupos);

      const itinerarioCompleto = {
        punto_partida: formData.punto_partida,
        recomendaciones: formData.recomendaciones,
        whatsapp_url: formData.whatsapp_url,
        pdf_formulario_url: formData.pdf_formulario_url,
        dias: diasItinerario
      };

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
          itinerario: itinerarioCompleto,
          updated_at: new Date().toISOString()
        })
        .eq('id', paquete.id);

      if (error) throw error;
      toast.success('Paquete e Itinerario actualizados con éxito.', 'Paquete Guardado');
      onPaqueteActualizado();
      onClose();
    } catch (err) {
      toast.error('Error al actualizar paquete: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <Edit3 size={20} /> Editar Paquete e Itinerario en BD
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
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Descripción Breve del Viaje</label>
            <textarea 
              rows={2}
              value={formData.descripcion} 
              onChange={e => setFormData({...formData, descripcion: e.target.value})} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          {/* Sección de Punto de Partida y Recomendaciones para la BD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div>
              <label className="text-xs text-[#1995ad] font-bold block mb-1">📍 Punto de Partida & Horario</label>
              <input 
                type="text" 
                value={formData.punto_partida} 
                onChange={e => setFormData({...formData, punto_partida: e.target.value})} 
                placeholder="Plaza de Armas - 06:00 AM"
                className="w-full bg-[#071521] border border-[#1995ad]/40 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-[#ffb703] font-bold block mb-1">🎒 Qué Llevar / Recomendaciones</label>
              <input 
                type="text" 
                value={formData.recomendaciones} 
                onChange={e => setFormData({...formData, recomendaciones: e.target.value})} 
                placeholder="Ropa abrigadora, Bloqueador, DNI"
                className="w-full bg-[#071521] border border-[#ffb703]/40 rounded-xl p-3 text-white text-sm focus:border-[#ffb703] focus:outline-none" 
              />
            </div>

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
              <label className="text-xs text-blue-400 font-bold block mb-1">📄 Link / Ruta de Formulario PDF</label>
              <input 
                type="text" 
                value={formData.pdf_formulario_url} 
                onChange={e => setFormData({...formData, pdf_formulario_url: e.target.value})} 
                placeholder="/rutas.txt o https://.../formulario.pdf"
                className="w-full bg-[#071521] border border-blue-400/40 rounded-xl p-3 text-white text-sm focus:border-blue-400 focus:outline-none" 
              />
            </div>
          </div>

          {/* Editor de Días del Itinerario en BD */}
          <div className="bg-[#071521] border border-white/10 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs text-[#ffb703] font-bold block uppercase tracking-wider">
                🗺️ Itinerario Día por Día (Guardado en JSONB de la BD)
              </label>
              <button 
                type="button" 
                onClick={handleAddDia}
                className="bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#a0f0ff] hover:bg-[#1995ad] hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Agregar Día
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {diasItinerario.map((d, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between gap-2">
                    <input 
                      type="text" 
                      value={d.dia || `Día ${idx + 1}`}
                      onChange={e => handleDiaChange(idx, 'dia', e.target.value)}
                      className="w-24 bg-[#071521] border border-white/15 rounded-lg p-2 text-xs text-[#ffb703] font-bold"
                    />
                    <input 
                      type="text" 
                      value={d.titulo || ''}
                      placeholder="Título de la Actividad"
                      onChange={e => handleDiaChange(idx, 'titulo', e.target.value)}
                      className="flex-1 bg-[#071521] border border-white/15 rounded-lg p-2 text-xs text-white font-bold"
                    />
                    {diasItinerario.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveDia(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <textarea 
                    rows={2}
                    value={d.detalle || d.descripcion || ''}
                    placeholder="Detalle completo de traslados, visitas y excursiones..."
                    onChange={e => handleDiaChange(idx, 'detalle', e.target.value)}
                    className="w-full bg-[#071521] border border-white/15 rounded-lg p-2 text-xs text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <Save size={18} /> {loading ? 'Guardando en la BD...' : 'Guardar Todo en la Base de Datos'}
          </button>
        </form>
      </div>
    </div>
  );
}
