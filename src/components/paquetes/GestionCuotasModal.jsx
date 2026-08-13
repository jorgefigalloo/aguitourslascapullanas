import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, Calendar, CheckCircle2, Clock, Plus, Trash2, Edit, FileText, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function GestionCuotasModal({ inscripcion, isOpen, onClose, onCuotasActualizadas }) {
  const toast = useToast();
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaCuota, setNuevaCuota] = useState({
    concepto: 'Cuota Personalizada',
    monto: 100,
    fecha_vencimiento: ''
  });
  const [showFormCrear, setShowFormCrear] = useState(false);

  useEffect(() => {
    if (isOpen && inscripcion) {
      cargarCuotas();
    }
  }, [isOpen, inscripcion]);

  const cargarCuotas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cuotas_inscripcion')
        .select('*')
        .eq('inscripcion_id', inscripcion.id)
        .order('numero_cuota', { ascending: true });

      if (error) throw error;
      setCuotas(data || []);
    } catch (e) {
      console.error('Error al cargar cuotas:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPagado = async (cuotaId, estadoActual) => {
    const nuevoEstado = estadoActual === 'pagado' ? 'pendiente' : 'pagado';
    const metodoPago = nuevoEstado === 'pagado' ? (window.prompt('Método de pago (Efectivo / Transferencia / Yape / Plin):', 'Efectivo') || 'Efectivo') : null;

    try {
      const { error } = await supabase
        .from('cuotas_inscripcion')
        .update({
          estado: nuevoEstado,
          metodo_pago: metodoPago,
          fecha_pago: nuevoEstado === 'pagado' ? new Date().toISOString() : null
        })
        .eq('id', cuotaId);

      if (error) throw error;

      toast.success(
        nuevoEstado === 'pagado' ? 'Cuota marcada como PAGADA con éxito.' : 'Cuota marcada como PENDIENTE.',
        'Estado de Cuota Actualizado'
      );
      cargarCuotas();
      if (onCuotasActualizadas) onCuotasActualizadas();
    } catch (err) {
      toast.error('Error al actualizar cuota: ' + err.message);
    }
  };

  const handleCrearCuota = async (e) => {
    e.preventDefault();
    if (parseFloat(nuevaCuota.monto) <= 0) {
      toast.warning('El monto debe ser mayor a S/ 0.00');
      return;
    }

    try {
      const proximoNumero = cuotas.length + 1;
      const { error } = await supabase
        .from('cuotas_inscripcion')
        .insert([{
          inscripcion_id: inscripcion.id,
          numero_cuota: proximoNumero,
          concepto: nuevaCuota.concepto || `Cuota #${proximoNumero}`,
          monto: parseFloat(nuevaCuota.monto),
          fecha_vencimiento: nuevaCuota.fecha_vencimiento || null,
          estado: 'pendiente'
        }]);

      if (error) throw error;
      toast.success('Nueva cuota agregada al cronograma.', 'Cuota Creada');
      setShowFormCrear(false);
      setNuevaCuota({ concepto: 'Cuota Personalizada', monto: 100, fecha_vencimiento: '' });
      cargarCuotas();
      if (onCuotasActualizadas) onCuotasActualizadas();
    } catch (err) {
      toast.error('Error al agregar cuota: ' + err.message);
    }
  };

  const handleEliminarCuota = async (cuotaId) => {
    if (!window.confirm('¿Deseas eliminar esta cuota del cronograma?')) return;

    try {
      const { error } = await supabase
        .from('cuotas_inscripcion')
        .delete()
        .eq('id', cuotaId);

      if (error) throw error;
      toast.info('Cuota eliminada del cronograma.');
      cargarCuotas();
      if (onCuotasActualizadas) onCuotasActualizadas();
    } catch (err) {
      toast.error('Error al eliminar cuota: ' + err.message);
    }
  };

  if (!isOpen || !inscripcion) return null;

  const totalCuotas = cuotas.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0);
  const totalPagado = cuotas.filter(c => c.estado === 'pagado').reduce((sum, c) => sum + parseFloat(c.monto || 0), 0);
  const saldoPendiente = Math.max(0, parseFloat(inscripcion.precio_total || 0) - totalPagado);

  return createPortal(
    <div className="fixed inset-0 z-[100050] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto max-h-[90vh] flex flex-col">

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-700 via-[#0d2538] to-[#003366] p-6 text-white relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/20 text-emerald-300 p-2.5 rounded-2xl border border-emerald-500/40">
              <DollarSign size={24} />
            </span>
            <div>
              <h3 className="font-headline text-lg font-bold text-white m-0">
                Cronograma de Cuotas y Pagos del Pasajero
              </h3>
              <p className="text-xs text-emerald-200 m-0 mt-0.5">
                Cliente: <strong>{inscripcion.perfiles?.nombre_completo || 'Viajero'}</strong> — {inscripcion.paquetes_grupales?.titulo}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">

          {/* Resumen Financiero */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#071521] border border-white/10 p-3 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block uppercase">Precio Total</span>
              <strong className="text-white text-base">S/ {parseFloat(inscripcion.precio_total || 0).toFixed(2)}</strong>
            </div>
            <div className="bg-[#071521] border border-emerald-500/30 p-3 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block uppercase">Total Abonado</span>
              <strong className="text-emerald-400 text-base">S/ {totalPagado.toFixed(2)}</strong>
            </div>
            <div className="bg-[#071521] border border-amber-500/30 p-3 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block uppercase">Saldo Pendiente</span>
              <strong className={`text-base ${saldoPendiente > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                S/ {saldoPendiente.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Botón agregar nueva cuota */}
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Cuotas Programadas</h4>
            <button
              onClick={() => setShowFormCrear(!showFormCrear)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Agregar Cuota
            </button>
          </div>

          {/* Formulario Nueva Cuota */}
          {showFormCrear && (
            <form onSubmit={handleCrearCuota} className="bg-[#071521] p-4 rounded-2xl border border-[#1995ad]/40 flex flex-col gap-3">
              <div className="text-xs text-[#ffb703] font-bold">Agregar Nueva Cuota al Cronograma</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Concepto (ej: Cuota #3)"
                  value={nuevaCuota.concepto}
                  onChange={(e) => setNuevaCuota({...nuevaCuota, concepto: e.target.value})}
                  required
                  className="bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto (S/)"
                  value={nuevaCuota.monto}
                  onChange={(e) => setNuevaCuota({...nuevaCuota, monto: e.target.value})}
                  required
                  className="bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                />
                <input
                  type="date"
                  value={nuevaCuota.fecha_vencimiento}
                  onChange={(e) => setNuevaCuota({...nuevaCuota, fecha_vencimiento: e.target.value})}
                  className="bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowFormCrear(false)} className="text-xs text-gray-400 px-3 py-1.5">Cancelar</button>
                <button type="submit" className="bg-[#1995ad] hover:bg-[#1995ad]/80 text-white text-xs font-bold px-4 py-1.5 rounded-xl">Guardar Cuota</button>
              </div>
            </form>
          )}

          {/* Lista de Cuotas */}
          {loading ? (
            <div className="text-center p-6 text-gray-400 text-xs">Cargando cronograma de cuotas...</div>
          ) : cuotas.length === 0 ? (
            <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10 text-gray-400 text-xs">
              No hay cuotas programadas para esta reserva. Puedes presionar "Agregar Cuota" para generar el cronograma.
            </div>
          ) : (
            <div className="space-y-3">
              {cuotas.map((c) => {
                const esPagado = c.estado === 'pagado';
                return (
                  <div key={c.id} className="bg-[#071521] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Cuota #{c.numero_cuota}: {c.concepto}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          esPagado ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {esPagado ? '🟢 PAGADO' : '⏳ PENDIENTE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                        {c.fecha_vencimiento && <span><Calendar size={12} className="inline mr-1" /> Vence: {c.fecha_vencimiento}</span>}
                        {c.metodo_pago && <span>💳 Método: {c.metodo_pago}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <strong className="text-sm text-[#ffb703]">S/ {parseFloat(c.monto).toFixed(2)}</strong>
                      <button
                        onClick={() => handleMarcarPagado(c.id, c.estado)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                          esPagado 
                            ? 'bg-white/10 hover:bg-amber-500/20 text-gray-300 border-white/15' 
                            : 'bg-emerald-500/20 hover:bg-emerald-600 border-emerald-500/40 text-emerald-300 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 size={14} /> {esPagado ? 'Desmarcar' : 'Marcar Pagado'}
                      </button>

                      <button
                        onClick={() => handleEliminarCuota(c.id)}
                        className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        title="Eliminar cuota"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}
