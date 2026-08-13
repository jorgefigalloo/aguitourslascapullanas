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
        fecha_limite_inscripcion: paquete.fecha_limite_inscripcion || '',
        numero_cuotas: paquete.numero_cuotas || 2,
        porcentaje_cuota_inicial: paquete.porcentaje_cuota_inicial || 50,
        dias_limite_cuota_inicial: paquete.dias_limite_cuota_inicial || 5,
        fecha_limite_cuota_inicial: paquete.fecha_limite_cuota_inicial || '',
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
          fecha_limite_inscripcion: formData.fecha_limite_inscripcion || null,
          numero_cuotas: formData.numero_cuotas || 2,
          porcentaje_cuota_inicial: formData.porcentaje_cuota_inicial || 50,
          dias_limite_cuota_inicial: formData.dias_limite_cuota_inicial || 5,
          fecha_limite_cuota_inicial: formData.fecha_limite_cuota_inicial || null,
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
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0d2538] to-[#1995ad] p-6 text-white relative shrink-0 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#1995ad]/20 text-[#1995ad] p-2.5 rounded-2xl border border-[#1995ad]/40">
              <Edit3 size={24} />
            </span>
            <div>
              <h3 className="font-headline text-xl font-bold text-white m-0">
                Editar Paquete Grupal e Itinerario
              </h3>
              <p className="text-xs text-cyan-200 m-0 mt-0.5">{paquete.titulo}</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario de Edición Amplio */}
        <form onSubmit={handleGuardar} className="p-6 flex flex-col gap-6 overflow-y-auto">

          {/* 1. Información Principal */}
          <div className="bg-[#071521] p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-[#1995ad] uppercase tracking-wider m-0">
              📌 Información Principal del Paquete
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Título del Paquete</label>
                <input 
                  type="text" 
                  value={formData.titulo} 
                  onChange={e => setFormData({...formData, titulo: e.target.value})} 
                  required 
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Destino (Ciudad, País)</label>
                <input 
                  type="text" 
                  value={formData.destino} 
                  onChange={e => setFormData({...formData, destino: e.target.value})} 
                  required 
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
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
                className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Descripción Breve del Viaje</label>
              <textarea 
                rows={2}
                value={formData.descripcion} 
                onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                required 
                className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          {/* 2. Calculadora de Costos & Capacidad */}
          <div className="bg-[#071521] p-5 rounded-2xl border border-amber-500/30 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider m-0 flex items-center gap-1.5">
              💼 Calculadora de Costos & Capacidad de Cupos
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-amber-300 font-bold block mb-1">Costo Operativo Total Estimado (S/)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="ej: 9000.00"
                  value={formData.costo_total || (formData.precio_persona * formData.cupo_maximo) || ''} 
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
                  className="w-full bg-[#0d2538] border border-amber-500/40 rounded-xl p-3 text-white text-sm focus:border-amber-400 focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Cupo Máximo del Grupo</label>
                <input 
                  type="number" 
                  value={formData.cupo_maximo} 
                  onChange={e => {
                    const cupos = parseInt(e.target.value) || 1;
                    const costo = parseFloat(formData.costo_total || (formData.precio_persona * formData.cupo_maximo)) || 0;
                    const precioPersonaCalc = costo > 0 && cupos > 0 ? Math.round((costo / cupos) * 100) / 100 : formData.precio_persona;
                    setFormData({
                      ...formData, 
                      cupo_maximo: e.target.value,
                      precio_persona: precioPersonaCalc
                    });
                  }} 
                  required 
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#ffb703] font-bold block mb-1">💰 Precio por Persona Calculado (S/)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.precio_persona} 
                onChange={e => setFormData({...formData, precio_persona: e.target.value})} 
                required 
                className="w-full bg-[#0d2538] border border-[#ffb703]/50 rounded-xl p-3 text-[#ffb703] font-bold text-sm focus:border-[#ffb703] focus:outline-none" 
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Fórmula: Costo Operativo Total (S/ {(formData.precio_persona * formData.cupo_maximo).toFixed(2)}) ÷ {formData.cupo_maximo} cupos = <strong>S/ {parseFloat(formData.precio_persona || 0).toFixed(2)} por persona</strong>.
              </p>
            </div>
          </div>

          {/* 3. Fechas del Viaje */}
          <div className="bg-[#071521] p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider m-0">
              📅 Fechas & Plazos del Viaje
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Fecha de Salida (Calendario)</label>
                <input 
                  type="date" 
                  value={formData.fecha_salida} 
                  onChange={e => setFormData({...formData, fecha_salida: e.target.value})} 
                  required 
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none cursor-pointer" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Fecha de Retorno (Calendario)</label>
                <input 
                  type="date" 
                  value={formData.fecha_retorno} 
                  onChange={e => setFormData({...formData, fecha_retorno: e.target.value})} 
                  required 
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none cursor-pointer" 
                />
              </div>

              <div>
                <label className="text-xs text-amber-300 font-bold block mb-1">⏳ Fecha Límite de Inscripción</label>
                <input 
                  type="date" 
                  value={formData.fecha_limite_inscripcion || ''} 
                  onChange={e => setFormData({...formData, fecha_limite_inscripcion: e.target.value})} 
                  className="w-full bg-[#0d2538] border border-amber-500/40 rounded-xl p-3 text-white text-sm focus:border-amber-400 focus:outline-none cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* 4. Configuración de Cuotas y Pagos */}
          <div className="bg-[#071521] p-5 rounded-2xl border border-emerald-500/30 flex flex-col gap-4">
            <h4 className="text-xs text-emerald-400 font-bold uppercase tracking-wider m-0 flex items-center gap-1.5">
              💳 Configuración del Cronograma de Cuotas para los Clientes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Cantidad de Cuotas</label>
                <select
                  value={formData.numero_cuotas || 2}
                  onChange={e => setFormData({...formData, numero_cuotas: parseInt(e.target.value)})}
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-xs"
                >
                  <option value={1}>1 Cuota (Pago Único 100%)</option>
                  <option value={2}>2 Cuotas (Reserva + Saldo Final)</option>
                  <option value={3}>3 Cuotas (Reserva + 2da Cuota + Saldo Final)</option>
                  <option value={4}>4 Cuotas (Reserva + 3 Cuotas Mensuales)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">% Cuota Inicial / Reserva</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.porcentaje_cuota_inicial || 50}
                  onChange={e => setFormData({...formData, porcentaje_cuota_inicial: parseFloat(e.target.value)})}
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Días Plazo Cuota Inicial</label>
                <input
                  type="number"
                  min="1"
                  value={formData.dias_limite_cuota_inicial || 5}
                  onChange={e => setFormData({...formData, dias_limite_cuota_inicial: parseInt(e.target.value)})}
                  className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-3 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-amber-300 font-bold block mb-1">📅 Fecha Límite Fija para Pagar Cuota Inicial (Opcional)</label>
              <input
                type="date"
                value={formData.fecha_limite_cuota_inicial || ''}
                onChange={e => setFormData({...formData, fecha_limite_cuota_inicial: e.target.value})}
                className="w-full bg-[#0d2538] border border-amber-500/40 rounded-xl p-3 text-white text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Si se especifica una fecha exacta, la 1ra cuota vencerá en esa fecha. Si se deja vacío, vencerá en {formData.dias_limite_cuota_inicial || 5} días hábiles tras inscribirse.
              </p>
            </div>
          </div>

          {/* 5. Logística, Enlaces & PDFs */}
          <div className="bg-[#071521] p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h4 className="text-xs text-cyan-300 font-bold uppercase tracking-wider m-0">
              📍 Logística & Enlaces de Contacto
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#1995ad] font-bold block mb-1">📍 Punto de Partida & Horario</label>
                <input 
                  type="text" 
                  value={formData.punto_partida} 
                  onChange={e => setFormData({...formData, punto_partida: e.target.value})} 
                  placeholder="Plaza de Armas - 06:00 AM"
                  className="w-full bg-[#0d2538] border border-[#1995ad]/40 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-[#ffb703] font-bold block mb-1">🎒 Qué Llevar / Recomendaciones</label>
                <input 
                  type="text" 
                  value={formData.recomendaciones} 
                  onChange={e => setFormData({...formData, recomendaciones: e.target.value})} 
                  placeholder="Ropa abrigadora, Bloqueador, DNI"
                  className="w-full bg-[#0d2538] border border-[#ffb703]/40 rounded-xl p-3 text-white text-sm focus:border-[#ffb703] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-[#25D366] font-bold block mb-1">💬 Link del Grupo de WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.whatsapp_url} 
                  onChange={e => setFormData({...formData, whatsapp_url: e.target.value})} 
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full bg-[#0d2538] border border-[#25D366]/40 rounded-xl p-3 text-white text-sm focus:border-[#25D366] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-blue-400 font-bold block mb-1">📄 Link / Ruta de Formulario PDF</label>
                <input 
                  type="text" 
                  value={formData.pdf_formulario_url} 
                  onChange={e => setFormData({...formData, pdf_formulario_url: e.target.value})} 
                  placeholder="/rutas.txt o https://.../formulario.pdf"
                  className="w-full bg-[#0d2538] border border-blue-400/40 rounded-xl p-3 text-white text-sm focus:border-blue-400 focus:outline-none" 
                />
              </div>
            </div>
          </div>

          {/* 6. Editor de Días del Itinerario Amplio y Claro */}
          <div className="bg-[#071521] p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h4 className="text-xs text-[#ffb703] font-bold uppercase tracking-wider m-0">
                  🗺️ Itinerario Día por Día del Viaje
                </h4>
                <p className="text-[11px] text-gray-400 m-0 mt-0.5">Agrega, edita o remueve los días y detalles de la expedición</p>
              </div>

              <button 
                type="button" 
                onClick={handleAddDia}
                className="bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#a0f0ff] hover:bg-[#1995ad] hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus size={16} /> Agregar Día
              </button>
            </div>

            <div className="space-y-4">
              {diasItinerario.map((d, idx) => (
                <div key={idx} className="bg-[#0d2538] border border-white/15 p-4 rounded-2xl flex flex-col gap-3 relative shadow-lg">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={d.dia || `Día ${idx + 1}`}
                        onChange={e => handleDiaChange(idx, 'dia', e.target.value)}
                        className="w-28 bg-[#071521] border border-[#ffb703]/50 rounded-xl p-2.5 text-xs text-[#ffb703] font-bold"
                      />
                      <span className="text-xs text-gray-400 hidden sm:inline">—</span>
                    </div>

                    <input 
                      type="text" 
                      value={d.titulo || ''}
                      placeholder="Título de la Actividad (ej: Cataratas de Ahuashiyacu & Selva Alta)"
                      onChange={e => handleDiaChange(idx, 'titulo', e.target.value)}
                      className="flex-1 bg-[#071521] border border-white/15 rounded-xl p-2.5 text-xs text-white font-bold"
                    />

                    {diasItinerario.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveDia(idx)}
                        className="text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-white/5 transition-colors self-end sm:self-auto cursor-pointer"
                        title="Eliminar este día"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <textarea 
                    rows={3}
                    value={d.detalle || d.descripcion || ''}
                    placeholder="Escribe aquí la descripción detallada del itinerario para este día..."
                    onChange={e => handleDiaChange(idx, 'detalle', e.target.value)}
                    className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-xs text-gray-200 leading-relaxed focus:border-[#1995ad] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-gold-3d justify-center py-4 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xl mt-2"
          >
            <Save size={18} /> {loading ? 'Guardando en la Base de Datos...' : 'Guardar Todo en la Base de Datos'}
          </button>
        </form>

      </div>
    </div>
  );
}
