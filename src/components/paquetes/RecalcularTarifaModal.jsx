import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator, DollarSign, Users, AlertTriangle, CheckCircle, RefreshCw, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function RecalcularTarifaModal({ paquete, isOpen, onClose, onTarifaRecalculada }) {
  const toast = useToast();
  const [inscritosCount, setInscritosCount] = useState(0);
  const [precioOriginal, setPrecioOriginal] = useState(0);
  const [costoOperativoTotal, setCostoOperativoTotal] = useState(0);
  const [nuevoPrecioPorPersona, setNuevoPrecioPorPersona] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paquete) {
      const precio = parseFloat(paquete.precio_persona || 0);
      setPrecioOriginal(precio);

      // Calcular inscritos reales (cupo_maximo - cupo_disponible)
      const cuposReservados = Math.max(1, (paquete.cupo_maximo || 1) - (paquete.cupo_disponible || 0));
      setInscritosCount(cuposReservados);

      // Sugerencia inicial: costo operativo = precio original × inscritos (lo que ya pagaron)
      const costoSugerido = precio * cuposReservados;
      setCostoOperativoTotal(costoSugerido);
      setNuevoPrecioPorPersona(precio); // Inicialmente igual al original
    }
  }, [isOpen, paquete]);

  // Recalcular precio por persona cuando cambia el costo operativo
  const handleCostoChange = (valor) => {
    const costo = parseFloat(valor) || 0;
    setCostoOperativoTotal(costo);
    if (inscritosCount > 0) {
      setNuevoPrecioPorPersona(Math.round((costo / inscritosCount) * 100) / 100);
    }
  };

  if (!isOpen || !paquete) return null;

  const diferencia = nuevoPrecioPorPersona - precioOriginal;
  const porcentajeCambio = precioOriginal > 0 ? ((diferencia / precioOriginal) * 100).toFixed(1) : 0;

  const handleEjecutarRecalculo = async (e) => {
    e.preventDefault();
    if (nuevoPrecioPorPersona <= 0) {
      toast.warning('El nuevo precio por persona debe ser mayor a S/ 0.00');
      return;
    }

    setLoading(true);
    try {
      // 1. Intentar RPC atómica
      const { error: rpcError } = await supabase.rpc('fn_recalcular_tarifa_cerrar_paquete', {
        p_paquete_id: paquete.id,
        p_nuevo_precio_persona: nuevoPrecioPorPersona
      });

      if (rpcError) {
        console.warn('Fallback actualizando directamente:', rpcError);

        // Fallback: actualizar paquete (cerrar + nueva tarifa + ajustar cupo_maximo a inscritos reales)
        await supabase
          .from('paquetes_grupales')
          .update({
            precio_persona: nuevoPrecioPorPersona,
            estado: 'cerrado',
            cupo_maximo: inscritosCount,
            cupo_disponible: 0
          })
          .eq('id', paquete.id);

        // Actualizar inscripciones activas a pendiente_confirmacion_tarifa
        await supabase
          .from('inscripciones_grupo')
          .update({
            estado: 'pendiente_confirmacion_tarifa',
            precio_total: nuevoPrecioPorPersona // se recalcula por cada persona (cantidad_personas se usa abajo)
          })
          .eq('paquete_id', paquete.id)
          .in('estado', ['confirmado', 'pendiente']);
      }

      toast.success(
        `Paquete "${paquete.titulo}" cerrado con ${inscritosCount} pasajero(s). Nueva tarifa: S/ ${nuevoPrecioPorPersona.toFixed(2)} por persona. Los pasajeros recibirán la alerta para confirmar.`,
        'Recálculo Exitoso 💰'
      );
      if (onTarifaRecalculada) onTarifaRecalculada();
      onClose();
    } catch (err) {
      toast.error('Error al recalcular tarifa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-[#0d2538] to-[#003366] p-6 text-white relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <span className="bg-amber-500/20 text-amber-300 p-2.5 rounded-2xl border border-amber-500/40">
              <Calculator size={22} />
            </span>
            <div>
              <h3 className="font-headline text-lg font-bold text-white m-0">
                Cerrar Grupo y Recalcular Tarifa
              </h3>
              <p className="text-xs text-amber-200 m-0 mt-0.5">
                {paquete.titulo} — {paquete.destino}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleEjecutarRecalculo} className="p-6 flex flex-col gap-4">

          {/* Resumen del estado actual */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block uppercase">Inscritos</span>
              <strong className="text-white text-lg">👥 {inscritosCount}</strong>
              <span className="text-gray-400 text-[10px] block">de {paquete.cupo_maximo} max</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block uppercase">Precio Original</span>
              <strong className="text-[#ffb703] text-lg">S/ {precioOriginal.toFixed(2)}</strong>
              <span className="text-gray-400 text-[10px] block">por persona</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block uppercase">Nuevo Precio</span>
              <strong className={`text-lg ${diferencia > 0 ? 'text-red-400' : diferencia < 0 ? 'text-emerald-400' : 'text-white'}`}>
                S/ {nuevoPrecioPorPersona.toFixed(2)}
              </strong>
              <span className={`text-[10px] block font-bold ${diferencia > 0 ? 'text-red-400' : diferencia < 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                {diferencia > 0 ? `+${porcentajeCambio}%` : diferencia < 0 ? `${porcentajeCambio}%` : 'Sin cambio'}
              </span>
            </div>
          </div>

          {/* Alerta explicativa */}
          <div className="bg-amber-500/10 border border-amber-500/25 p-3.5 rounded-2xl text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 mb-0.5">¿Cómo funciona el recálculo?</strong>
              Ingresa el <strong>costo operativo total del viaje</strong> (transporte, alojamiento, guías, etc.) y el sistema calculará automáticamente cuánto debe pagar cada pasajero inscrito. Al confirmar, el paquete se cerrará con <strong>{inscritosCount} pasajero(s)</strong> y cada uno recibirá una alerta para aceptar o rechazar la nueva tarifa.
            </div>
          </div>

          {/* Campo: Costo Operativo Total */}
          <div>
            <label className="text-xs text-gray-200 font-bold block mb-1.5">
              💼 Costo Operativo Total del Viaje (S/)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-amber-400 font-bold text-sm">S/</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={costoOperativoTotal}
                onChange={(e) => handleCostoChange(e.target.value)}
                required
                className="w-full bg-[#071521] border border-amber-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white font-bold text-base focus:border-amber-400 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Incluye todos los gastos operativos: transporte, hospedaje, alimentación, guías, seguros, etc.
            </p>
          </div>

          {/* Resultado del cálculo */}
          <div className="bg-[#071521] border border-[#1995ad]/40 p-4 rounded-2xl">
            <div className="text-xs text-gray-300 mb-2">📊 Resultado del Cálculo Automático:</div>
            <div className="text-sm text-white">
              <strong>S/ {costoOperativoTotal.toFixed(2)}</strong>
              <span className="text-gray-400"> ÷ </span>
              <strong>{inscritosCount} pasajero(s)</strong>
              <span className="text-gray-400"> = </span>
              <strong className="text-[#ffb703] text-lg">S/ {nuevoPrecioPorPersona.toFixed(2)}</strong>
              <span className="text-gray-400 text-xs"> por persona</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm flex items-center gap-2 cursor-pointer"
          >
            <Send size={16} /> {loading ? 'Procesando Recálculo...' : `Cerrar con ${inscritosCount} Pasajero(s) y Notificar`}
          </button>
        </form>

      </div>
    </div>,
    document.body
  );
}
