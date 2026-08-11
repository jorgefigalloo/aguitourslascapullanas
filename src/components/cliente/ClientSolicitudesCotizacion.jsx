import React, { useState, useEffect } from 'react';
import { Send, Calendar, Users, DollarSign, CheckSquare, Sparkles, Clock, CheckCircle2, AlertCircle, FileText, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ClientSolicitudesCotizacion({ user, profile }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form State
  const [destino, setDestino] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [fechaRetorno, setFechaRetorno] = useState('');
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [presupuestoEstimado, setPresupuestoEstimado] = useState('');
  const [serviciosDeseados, setServiciosDeseados] = useState({
    hospedaje: true,
    tours: true,
    traslados: true,
    tickets: true,
    vuelos: false,
    alimentacion: false
  });
  const [detalles, setDetalles] = useState('');

  useEffect(() => {
    if (user) {
      cargarSolicitudes();
    }
  }, [user]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitudes_cotizacion')
        .select('*, paquetes_grupales(*)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setSolicitudes(data);
      }
    } catch (e) {
      console.error('Error al cargar solicitudes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleServicio = (key) => {
    setServiciosDeseados(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitCotizacion = async (e) => {
    e.preventDefault();
    if (!destino.trim()) {
      setMsg({ type: 'error', text: 'Por favor ingresa el destino deseado para tu paquete.' });
      return;
    }

    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      const serviciosArray = Object.keys(serviciosDeseados).filter(k => serviciosDeseados[k]);

      const { data, error } = await supabase
        .from('solicitudes_cotizacion')
        .insert([{
          usuario_id: user.id,
          destino: destino.trim(),
          fecha_salida: fechaSalida || null,
          fecha_retorno: fechaRetorno || null,
          cantidad_personas: parseInt(cantidadPersonas, 10) || 1,
          presupuesto_estimado: presupuestoEstimado ? parseFloat(presupuestoEstimado) : null,
          servicios_deseados: serviciosArray,
          detalles: detalles.trim() || null,
          estado: 'pendiente'
        }])
        .select();

      if (error) throw error;

      setMsg({ type: 'success', text: '¡Tu solicitud de cotización ha sido enviada con éxito! Nuestro agente se pondrá en contacto pronto.' });
      setDestino('');
      setFechaSalida('');
      setFechaRetorno('');
      setCantidadPersonas(1);
      setPresupuestoEstimado('');
      setDetalles('');
      
      cargarSolicitudes();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Error al enviar la solicitud.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Clock size={14} /> Pendiente de Revisión</span>;
      case 'en_revision':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Clock size={14} /> En Cotización</span>;
      case 'cotizado':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle2 size={14} /> Cotización Lista</span>;
      case 'paquete_creado':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Sparkles size={14} /> Paquete Publicado</span>;
      case 'rechazado':
        return <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertCircle size={14} /> No Disponible</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">{estado}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Formulario de Cotización de Paquete Personalizado */}
      <div className="lg:col-span-6 bg-[#071521]/90 border border-white/15 p-6 md:p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1995ad] to-[#ffb703] flex items-center justify-center text-[#071521] shadow-lg shadow-[#1995ad]/30">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white m-0">Cotizar Paquete Personalizado</h3>
            <p className="text-xs text-gray-300 m-0 mt-0.5">Diseña tu viaje a medida y nuestro equipo creará la propuesta perfecta</p>
          </div>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-2xl text-xs font-bold mb-5 ${
            msg.type === 'success' ? 'bg-emerald-900/40 border border-emerald-500 text-emerald-300' : 'bg-red-900/40 border border-red-500 text-red-300'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmitCotizacion} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-200 block mb-1.5">
              Destino o Ruta Deseada *
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-3 text-[#1995ad]" />
              <input 
                type="text" 
                value={destino}
                onChange={e => setDestino(e.target.value)}
                placeholder="Ej. Cusco & Valle Sagrado, Máncora, Tarapoto..."
                required
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-200 block mb-1.5">
                Fecha Salida Estimada
              </label>
              <input 
                type="date" 
                value={fechaSalida}
                onChange={e => setFechaSalida(e.target.value)}
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl p-3 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-200 block mb-1.5">
                Fecha Retorno Estimada
              </label>
              <input 
                type="date" 
                value={fechaRetorno}
                onChange={e => setFechaRetorno(e.target.value)}
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl p-3 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-200 block mb-1.5">
                N° de Pasajeros / Integrantes
              </label>
              <div className="relative">
                <Users size={18} className="absolute left-3.5 top-3 text-[#ffb703]" />
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={cantidadPersonas}
                  onChange={e => setCantidadPersonas(e.target.value)}
                  className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-200 block mb-1.5">
                Presupuesto Estimado por Persona (S/)
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3.5 top-3 text-emerald-400" />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ej. 1200.00"
                  value={presupuestoEstimado}
                  onChange={e => setPresupuestoEstimado(e.target.value)}
                  className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-200 block mb-2">
              Servicios Incluidos Deseados:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'hospedaje', label: '🏨 Hospedaje / Hotel' },
                { id: 'tours', label: '⛰️ Tours & Guías' },
                { id: 'traslados', label: '🚐 Traslados Privados' },
                { id: 'tickets', label: '🎟️ Tickets & Entradas' },
                { id: 'vuelos', label: '✈️ Vuelos / Transporte' },
                { id: 'alimentacion', label: '🍽️ Alimentación Completa' }
              ].map(serv => (
                <label key={serv.id} className="flex items-center gap-2 bg-[#0d2538] p-2.5 rounded-xl border border-white/10 cursor-pointer hover:border-[#1995ad]">
                  <input 
                    type="checkbox"
                    checked={serviciosDeseados[serv.id]}
                    onChange={() => handleToggleServicio(serv.id)}
                    className="accent-[#1995ad] w-4 h-4"
                  />
                  <span className="text-gray-200 text-[11px] font-semibold">{serv.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-200 block mb-1.5">
              Detalles Adicionales / Preferencias Especiales
            </label>
            <textarea 
              rows={3}
              value={detalles}
              onChange={e => setDetalles(e.target.value)}
              placeholder="Indícanos si viajas con niños, preferencias de hotel, actividades de aventura, etc."
              className="w-full bg-[#0d2538] border border-white/15 rounded-2xl p-3 text-white text-xs focus:border-[#1995ad] focus:outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-xs"
          >
            <Send size={16} /> {submitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Cotización'}
          </button>
        </form>
      </div>

      {/* Historial de Mis Solicitudes de Cotización */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="bg-[#071521]/90 border border-white/15 p-6 rounded-3xl shadow-xl flex justify-between items-center">
          <div>
            <h4 className="text-lg font-bold text-white m-0">Mis Cotizaciones Solicitadas</h4>
            <p className="text-xs text-gray-300 m-0 mt-0.5">Seguimiento en tiempo real de tus paquetes a medida</p>
          </div>
          <button 
            onClick={cargarSolicitudes}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-xl border border-white/15"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center p-8 text-gray-400 text-xs">Cargando tus solicitudes...</div>
        ) : solicitudes.length === 0 ? (
          <div className="bg-white/5 p-8 rounded-3xl text-center border border-white/10 text-xs text-gray-400">
            Aún no has solicitado ninguna cotización personalizada. Utiliza el formulario a la izquierda para cotizar tu primer viaje.
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-h-[750px] overflow-y-auto pr-1">
            {solicitudes.map(sol => {
              const pkgCreado = sol.paquetes_grupales;

              return (
                <div 
                  key={sol.id} 
                  className="bg-[#0d2538] border border-white/15 p-5 rounded-3xl shadow-md relative"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <span className="text-[#1995ad] font-bold text-xs uppercase flex items-center gap-1">
                        <MapPin size={13} /> {sol.destino}
                      </span>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Solicitado el: {new Date(sol.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div>{getBadgeEstado(sol.estado)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#071521] p-3 rounded-2xl border border-white/10 mb-3">
                    <div>
                      <span className="text-gray-400">Pasajeros:</span> <strong className="text-white">{sol.cantidad_personas} pnas.</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Presupuesto:</span> <strong className="text-[#ffb703]">{sol.presupuesto_estimado ? `S/ ${parseFloat(sol.presupuesto_estimado).toFixed(2)}` : 'A cotizar'}</strong>
                    </div>
                    {sol.fecha_salida && (
                      <div className="col-span-2 text-gray-300">
                        <Calendar size={12} className="inline mr-1 text-[#1995ad]" /> Fechas: {sol.fecha_salida} al {sol.fecha_retorno || 'N/A'}
                      </div>
                    )}
                  </div>

                  {sol.servicios_deseados && sol.servicios_deseados.length > 0 && (
                    <div className="text-xs mb-3">
                      <span className="text-gray-400 block mb-1">Servicios solicitados:</span>
                      <div className="flex flex-wrap gap-1">
                        {sol.servicios_deseados.map((s, idx) => (
                          <span key={idx} className="bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sol.detalles && (
                    <p className="text-xs text-gray-300 bg-black/20 p-3 rounded-xl m-0 italic border border-white/5">
                      "{sol.detalles}"
                    </p>
                  )}

                  {/* Si el admin creó un paquete grupal a partir de esta solicitud */}
                  {pkgCreado && (
                    <div className="mt-4 pt-3 border-t border-purple-500/40 bg-purple-900/20 p-3 rounded-2xl border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-purple-300 font-extrabold uppercase block">¡Paquete Creado para ti!</span>
                        <div className="text-xs font-bold text-white">{pkgCreado.titulo}</div>
                      </div>
                      <div className="text-xs font-black text-[#ffb703]">
                        S/ {parseFloat(pkgCreado.precio_persona).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
