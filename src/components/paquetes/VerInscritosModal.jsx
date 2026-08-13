import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Calendar, Phone, Mail, FileText, CheckCircle2, User, RefreshCw, DollarSign, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GestionCuotasModal } from './GestionCuotasModal';

export function VerInscritosModal({ paquete, isOpen, onClose }) {
  const [inscritos, setInscritos] = useState([]);
  const [acompanantesMap, setAcompanantesMap] = useState({});
  const [inscripcionSeleccionadaCuotas, setInscripcionSeleccionadaCuotas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paquete && isOpen) {
      cargarPasajerosInscritos();
    }
  }, [paquete, isOpen]);

  const cargarPasajerosInscritos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inscripciones_grupo')
        .select('*, perfiles(*), paquetes_grupales(*)')
        .eq('paquete_id', paquete.id)
        .order('fecha_inscripcion', { ascending: false });

      if (data) {
        setInscritos(data);
        data.forEach(item => {
          if (item.cantidad_personas > 1) {
            cargarAcompanantes(item.id);
          }
        });
      }
    } catch (e) {
      console.error('Error al cargar inscritos:', e);
    } finally {
      setLoading(false);
    }
  };

  const cargarAcompanantes = async (inscripcionId) => {
    try {
      const { data } = await supabase
        .from('acompanantes_inscripcion')
        .select('*')
        .eq('inscripcion_id', inscripcionId);

      if (data) {
        setAcompanantesMap(prev => ({
          ...prev,
          [inscripcionId]: data
        }));
      }
    } catch (e) {
      console.log('Error al cargar acompañantes:', e);
    }
  };

  if (!isOpen || !paquete) return null;

  const totalPersonasInscritas = inscritos
    .filter(item => item.estado !== 'cancelado' && item.estado !== 'rechazado_tarifa')
    .reduce((sum, item) => sum + (item.cantidad_personas || 1), 0);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-auto max-h-[88vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <Users size={22} /> Pasajeros Inscritos en el Grupo
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">{paquete.titulo} — {paquete.destino}</p>
        </div>

        {/* Resumen de Cupos Bar */}
        <div className="bg-[#071521] px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Capacidad Máxima:</span>
            <span className="text-white font-bold bg-white/10 px-2.5 py-0.5 rounded-full">{paquete.cupo_maximo} personas</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Cupos Ocupados:</span>
            <span className="text-[#ffb703] font-bold bg-[#ffb703]/20 border border-[#ffb703]/40 px-2.5 py-0.5 rounded-full">
              {totalPersonasInscritas} inscritos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Disponibles:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {Math.max(0, paquete.cupo_maximo - totalPersonasInscritas)} restantes
            </span>
          </div>

          <button
            onClick={cargarPasajerosInscritos}
            className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
            title="Recargar lista"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>

        {/* Tabla o Lista de Pasajeros */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-3xl text-[#1995ad] mb-2">progress_activity</span>
              <p className="text-xs">Cargando nómina de pasajeros del grupo...</p>
            </div>
          ) : inscritos.length === 0 ? (
            <div className="bg-white/5 p-8 rounded-2xl text-center border border-white/10">
              <Users size={40} className="text-gray-500 mx-auto mb-2 opacity-50" />
              <p className="text-gray-300 text-sm font-bold mb-1">Aún no hay clientes inscritos en este paquete grupal.</p>
              <p className="text-gray-400 text-xs">Cuando los viajeros reserven desde la web, aparecerán aquí con sus datos de contacto.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/15">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-[#071521] text-[11px] uppercase text-gray-300 border-b border-white/15">
                  <tr>
                    <th className="p-3">Pasajero Titular / Acompañantes</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">DNI / Doc</th>
                    <th className="p-3 text-center">Lugares</th>
                    <th className="p-3">Fecha Inscripción</th>
                    <th className="p-3 text-center">Estado & Pagos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {inscritos.map(item => {
                    const perf = item.perfiles || {};
                    const acompanantes = acompanantesMap[item.id] || [];

                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-full bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#1995ad] flex items-center justify-center font-bold text-xs shrink-0">
                              {perf.nombre_completo?.[0] || 'V'}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{perf.nombre_completo || 'Cliente Registrado'}</div>
                              <div className="text-[10px] text-gray-400">@{perf.username || 'sin_username'}</div>
                            </div>
                          </div>

                          {/* Lista Desplegada de Acompañantes */}
                          {acompanantes.length > 0 && (
                            <div className="mt-2 bg-[#071521] p-2 rounded-xl border border-white/10 text-[10px]">
                              <span className="text-amber-400 font-bold block mb-1 flex items-center gap-1">
                                <UserPlus size={11} /> Acompañantes Registrados ({acompanantes.length}):
                              </span>
                              {acompanantes.map((ac, idx) => (
                                <div key={ac.id || idx} className="text-gray-300 pl-2 border-l border-amber-500/30 mb-0.5">
                                  • <strong>{ac.nombre_completo}</strong> {ac.documento_identidad ? `(DNI: ${ac.documento_identidad})` : ''}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-gray-300">
                          <div><Mail size={11} className="inline mr-1 text-[#1995ad]" />{perf.email || 'Sin correo'}</div>
                          <div><Phone size={11} className="inline mr-1 text-[#ffb703]" />{perf.telefono || 'Sin teléfono'}</div>
                        </td>

                        <td className="p-3 font-semibold text-gray-200">
                          {perf.documento_identidad || 'N/A'}
                        </td>

                        <td className="p-3 text-center">
                          <span className="bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/40 px-2.5 py-1 rounded-full font-bold text-xs">
                            {item.cantidad_personas || 1} {item.cantidad_personas > 1 ? 'personas' : 'persona'}
                          </span>
                        </td>

                        <td className="p-3 text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#1995ad]" />
                            {item.fecha_inscripcion ? new Date(item.fecha_inscripcion).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1">
                              <CheckCircle2 size={11} /> {item.estado || 'confirmado'}
                            </span>

                            <button
                              onClick={() => setInscripcionSeleccionadaCuotas(item)}
                              className="bg-[#1995ad]/20 hover:bg-[#1995ad] border border-[#1995ad]/40 text-[#a0f0ff] hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Gestionar cronograma de cuotas y pagos"
                            >
                              <DollarSign size={12} /> Cuotas / Pagos
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-[#071521] border-t border-white/10 text-right shrink-0">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-5 rounded-xl border border-white/15 transition-all cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

        {/* Modal de Gestión de Cuotas de Pago */}
        {inscripcionSeleccionadaCuotas && (
          <GestionCuotasModal
            inscripcion={inscripcionSeleccionadaCuotas}
            isOpen={!!inscripcionSeleccionadaCuotas}
            onClose={() => setInscripcionSeleccionadaCuotas(null)}
            onCuotasActualizadas={cargarPasajerosInscritos}
          />
        )}

      </div>
    </div>,
    document.body
  );
}
