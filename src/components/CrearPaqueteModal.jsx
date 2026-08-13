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
        fecha_limite_inscripcion: formData.fecha_limite_inscripcion || null,
        numero_cuotas: formData.numero_cuotas || 2,
        porcentaje_cuota_inicial: formData.porcentaje_cuota_inicial || 50,
        dias_limite_cuota_inicial: formData.dias_limite_cuota_inicial || 5,
        fecha_limite_cuota_inicial: formData.fecha_limite_cuota_inicial || null,
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
              <label className="text-xs text-amber-300 font-bold block mb-1">💼 Costo Operativo Total del Viaje (S/)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="ej: 9000.00"
                value={formData.costo_total || ''} 
                onChange={e => {
                  const costo = parseFloat(e.target.value) || 0;
                  const cupos = parseInt(formData.cupo_maximo) || 1;
                  const precioPersonaCalc = cupos > 0 && costo > 0 ? Math.round((costo / cupos) * 100) / 100 : formData.precio_persona;
                  setFormData({
                    ...formData, 
                    costo_total: e.target.value,
                    precio_persona: precioPersonaCalc
                  });
                }} 
                className="w-full bg-[#071521] border border-amber-500/40 rounded-xl p-3 text-white text-sm focus:border-amber-400 focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Cupo Máximo del Grupo</label>
              <input 
                type="number" 
                value={formData.cupo_maximo} 
                onChange={e => {
                  const cupos = parseInt(e.target.value) || 1;
                  const costo = parseFloat(formData.costo_total) || 0;
                  const precioPersonaCalc = costo > 0 && cupos > 0 ? Math.round((costo / cupos) * 100) / 100 : formData.precio_persona;
                  setFormData({
                    ...formData, 
                    cupo_maximo: e.target.value,
                    precio_persona: precioPersonaCalc
                  });
                }} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-[#ffb703] font-bold block mb-1">💰 Precio por Persona Calculado (S/)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.precio_persona} 
                onChange={e => setFormData({...formData, precio_persona: e.target.value})} 
                required 
                className="w-full bg-[#071521] border border-[#ffb703]/50 rounded-xl p-3 text-[#ffb703] font-bold text-sm focus:border-[#ffb703] focus:outline-none" 
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Calculado: {formData.costo_total ? `S/ ${formData.costo_total} ÷ ${formData.cupo_maximo} cupos = S/ ${formData.precio_persona} por persona` : 'Ingresa el costo operativo total para dividir automáticamente entre la cantidad de cupos.'}
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">📅 Fecha de Salida (Calendario)</label>
              <input 
                type="date" 
                value={formData.fecha_salida} 
                onChange={e => setFormData({...formData, fecha_salida: e.target.value})} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none cursor-pointer" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">📅 Fecha de Retorno (Calendario)</label>
              <input 
                type="date" 
                value={formData.fecha_retorno} 
                onChange={e => setFormData({...formData, fecha_retorno: e.target.value})} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none cursor-pointer" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-amber-300 font-bold block mb-1">⏳ Fecha Límite de Inscripción / Confirmación (Opcional)</label>
              <input 
                type="date" 
                value={formData.fecha_limite_inscripcion || ''} 
                onChange={e => setFormData({...formData, fecha_limite_inscripcion: e.target.value})} 
                className="w-full bg-[#071521] border border-amber-500/40 rounded-xl p-3 text-white text-sm focus:border-amber-400 focus:outline-none cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-1">Los clientes verán una alerta avisándoles hasta qué fecha pueden inscribirse o confirmar el grupo.</p>
            </div>

            {/* Configuración de Cuotas y Pagos */}
            <div className="md:col-span-2 bg-[#071521] p-4 rounded-2xl border border-emerald-500/30 flex flex-col gap-3">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                💳 Configuración del Cronograma de Cuotas para los Clientes
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-300 font-semibold block mb-1">Cantidad de Cuotas</label>
                  <select
                    value={formData.numero_cuotas || 2}
                    onChange={e => setFormData({...formData, numero_cuotas: parseInt(e.target.value)})}
                    className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                  >
                    <option value={1}>1 Cuota (Pago Único 100%)</option>
                    <option value={2}>2 Cuotas (Reserva + Saldo Final)</option>
                    <option value={3}>3 Cuotas (Reserva + 2da Cuota + Saldo Final)</option>
                    <option value={4}>4 Cuotas (Reserva + 3 Cuotas Mensuales)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 font-semibold block mb-1">% Cuota Inicial / Reserva</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.porcentaje_cuota_inicial || 50}
                    onChange={e => setFormData({...formData, porcentaje_cuota_inicial: parseFloat(e.target.value)})}
                    className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 font-semibold block mb-1">Días Plazo Cuota Inicial</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dias_limite_cuota_inicial || 5}
                    onChange={e => setFormData({...formData, dias_limite_cuota_inicial: parseInt(e.target.value)})}
                    className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-amber-300 font-bold block mb-1">📅 Fecha Límite Fija para Pagar Cuota Inicial (Opcional - Calendario)</label>
                <input
                  type="date"
                  value={formData.fecha_limite_cuota_inicial || ''}
                  onChange={e => setFormData({...formData, fecha_limite_cuota_inicial: e.target.value})}
                  className="w-full bg-[#0d2538] border border-amber-500/40 rounded-xl p-2.5 text-white text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Si se especifica una fecha exacta, la 1ra cuota vencerá en esa fecha. Si se deja vacío, vencerá en {formData.dias_limite_cuota_inicial || 5} días hábiles tras inscribirse.
                </p>
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
          </div>

          <button type="submit" disabled={loading} className="btn-primary-3d justify-center py-3.5 mt-2 font-bold text-sm">
            {loading ? 'Publicando...' : 'Publicar Nuevo Paquete'}
          </button>
        </form>
      </div>
    </div>
  );
}
