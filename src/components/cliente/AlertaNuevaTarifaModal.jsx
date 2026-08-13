import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, DollarSign, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function AlertaNuevaTarifaModal({ user, onReservaActualizada }) {
  const toast = useToast();
  const [pendientes, setPendientes] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (user) {
      cargarPendientes();
    }
  }, [user]);

  const cargarPendientes = async () => {
    try {
      const { data } = await supabase
        .from('inscripciones_grupo')
        .select('*, paquetes_grupales(titulo, destino, fecha_salida, precio_persona)')
        .eq('usuario_id', user.id)
        .eq('estado', 'pendiente_confirmacion_tarifa');

      if (data) setPendientes(data);
    } catch (e) {
      console.log('Error al cargar alertas de tarifa:', e);
    }
  };

  if (!pendientes || pendientes.length === 0) return null;

  const handleResponderTarifa = async (inscripcionId, aceptar) => {
    setLoadingId(inscripcionId);
    try {
      // 1. Intentar responder vía RPC atómica
      const { error: rpcErr } = await supabase.rpc('fn_responder_nueva_tarifa_cliente', {
        p_inscripcion_id: inscripcionId,
        p_usuario_id: user.id,
        p_aceptar: aceptar
      });

      if (rpcErr) {
        console.warn('Fallback al actualizar respuesta cliente:', rpcErr);
        await supabase
          .from('inscripciones_grupo')
          .update({ estado: aceptar ? 'confirmado' : 'cancelado' })
          .eq('id', inscripcionId);
      }

      if (aceptar) {
        toast.success('¡Has aceptado la nueva tarifa ajustada del grupo! Tu reserva sigue confirmada.', 'Tarifa Aceptada 🎉');
      } else {
        toast.info('Has rechazado la tarifa. Tu reserva ha sido cancelada.', 'Reserva Cancelada');
      }

      cargarPendientes();
      if (onReservaActualizada) onReservaActualizada();
    } catch (err) {
      toast.error('Error al responder tarifa: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      {pendientes.map((item) => {
        const p = item.paquetes_grupales || {};
        const precioTotal = parseFloat(item.precio_total || 0).toFixed(2);
        const precioUnitario = parseFloat(p.precio_persona || 0).toFixed(2);

        return (
          <div 
            key={item.id}
            className="bg-gradient-to-r from-amber-950/80 via-[#0d2538] to-amber-950/80 border border-amber-500/50 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-start gap-3">
              <span className="bg-amber-500/20 text-amber-300 p-2.5 rounded-xl border border-amber-500/40 shrink-0 mt-0.5">
                <AlertTriangle size={22} className="animate-bounce text-amber-400" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-white text-base m-0">
                    Aviso de Ajuste de Tarifa: {p.titulo}
                  </h4>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                    Confirmación Requerida
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  El grupo ha cerrado inscripciones. La nueva tarifa ajustada por persona es de{' '}
                  <strong className="text-amber-300 text-sm">S/ {precioUnitario}</strong> (Total para {item.cantidad_personas} persona(s):{' '}
                  <strong className="text-emerald-400 font-bold">S/ {precioTotal}</strong>).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center w-full md:w-auto">
              <button
                disabled={loadingId === item.id}
                onClick={() => handleResponderTarifa(item.id, true)}
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle size={15} /> Aceptar Nueva Tarifa
              </button>

              <button
                disabled={loadingId === item.id}
                onClick={() => handleResponderTarifa(item.id, false)}
                className="flex-1 md:flex-none bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/40 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle size={15} /> Rechazar y Cancelar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
