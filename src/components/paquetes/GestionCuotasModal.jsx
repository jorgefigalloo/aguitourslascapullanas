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
  const [cuotaProcesandoCobro, setCuotaProcesandoCobro] = useState(null);
  const [datosCobro, setDatosCobro] = useState({ metodo_pago: 'Efectivo', referencia_pago: '' });
  const [loadingCobro, setLoadingCobro] = useState(false);
  const [showFormCrear, setShowFormCrear] = useState(false);
  const [cuotaEditando, setCuotaEditando] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: '',
    mensaje: '',
    btnTexto: 'Confirmar',
    btnClass: 'bg-[#1995ad] hover:bg-[#1995ad]/80 text-white',
    onConfirmar: () => {}
  });

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

  const handleIniciarCobro = (cuota) => {
    if (cuota.estado === 'pagado') {
      solicitarDesmarcarPagado(cuota);
    } else {
      setCuotaProcesandoCobro(cuota);
      setDatosCobro({ metodo_pago: 'Efectivo', referencia_pago: '' });
    }
  };

  const solicitarDesmarcarPagado = (cuota) => {
    setConfirmModal({
      isOpen: true,
      titulo: '¿Desmarcar Cuota?',
      mensaje: `¿Deseas cambiar la Cuota #${cuota.numero_cuota} ("${cuota.concepto}") a estado PENDIENTE?`,
      btnTexto: 'Sí, Desmarcar',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-black',
      onConfirmar: () => ejecutarDesmarcarPagado(cuota.id)
    });
  };

  const ejecutarDesmarcarPagado = async (cuotaId) => {
    try {
      const { error } = await supabase
        .from('cuotas_inscripcion')
        .update({
          estado: 'pendiente',
          metodo_pago: null,
          referencia_pago: null,
          fecha_pago: null
        })
        .eq('id', cuotaId);

      if (error) throw error;
      toast.info('Cuota marcada como PENDIENTE.');
      cargarCuotas();
      if (onCuotasActualizadas) onCuotasActualizadas();
    } catch (err) {
      toast.error('Error al desmarcar cuota: ' + err.message);
    }
  };

  const handleConfirmarCobroSubmit = async (e) => {
    e.preventDefault();
    setLoadingCobro(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id || null;

      // 1. Actualizar cuotas_inscripcion
      const { error: cuotaErr } = await supabase
        .from('cuotas_inscripcion')
        .update({
          estado: 'pagado',
          metodo_pago: datosCobro.metodo_pago,
          referencia_pago: datosCobro.referencia_pago.trim() || null,
          fecha_pago: new Date().toISOString(),
          cobrado_por: currentUserId
        })
        .eq('id', cuotaProcesandoCobro.id);

      if (cuotaErr) throw cuotaErr;

      // 2. Insertar movimiento en historial_pagos_caja
      const { error: cajaErr } = await supabase
        .from('historial_pagos_caja')
        .insert([{
          cuota_id: cuotaProcesandoCobro.id,
          inscripcion_id: inscripcion.id,
          paquete_id: inscripcion.paquete_id,
          cliente_id: inscripcion.usuario_id,
          tipo_movimiento: 'ingreso',
          concepto: `Cuota #${cuotaProcesandoCobro.numero_cuota}: ${cuotaProcesandoCobro.concepto}`,
          monto: parseFloat(cuotaProcesandoCobro.monto),
          metodo_pago: datosCobro.metodo_pago,
          referencia_pago: datosCobro.referencia_pago.trim() || null,
          procesado_por: currentUserId
        }]);

      if (cajaErr) console.warn('Aviso: No se pudo guardar en historial de caja:', cajaErr);

      toast.success(`Pago de S/ ${parseFloat(cuotaProcesandoCobro.monto).toFixed(2)} registrado con éxito en Caja.`, 'Cobro Confirmado 💰');
      setCuotaProcesandoCobro(null);
      cargarCuotas();
      if (onCuotasActualizadas) onCuotasActualizadas();
    } catch (err) {
      toast.error('Error al procesar cobro: ' + err.message);
    } finally {
      setLoadingCobro(false);
    }
  };

  const handleGuardarEdicionCuota = async (e) => {
    e.preventDefault();
    if (parseFloat(cuotaEditando.monto) <= 0) {
      toast.warning('El monto debe ser mayor a S/ 0.00');
      return;
    }

    try {
      const { error } = await supabase
        .from('cuotas_inscripcion')
        .update({
          concepto: cuotaEditando.concepto,
          monto: parseFloat(cuotaEditando.monto),
          fecha_vencimiento: cuotaEditando.fecha_vencimiento || null
        })
        .eq('id', cuotaEditando.id);

      if (error) throw error;
      toast.success('Cuota del cronograma modificada con éxito.', 'Cuota Actualizada');
      setCuotaEditando(null);
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

  const solicitarEliminarCuota = (cuota) => {
    setConfirmModal({
      isOpen: true,
      titulo: '¿Eliminar Cuota?',
      mensaje: `¿Deseas eliminar la Cuota #${cuota.numero_cuota} ("${cuota.concepto}") por S/ ${parseFloat(cuota.monto).toFixed(2)} del cronograma de este cliente?`,
      btnTexto: 'Sí, Eliminar Cuota',
      btnClass: 'bg-red-600 hover:bg-red-700 text-white',
      onConfirmar: () => ejecutarEliminarCuota(cuota.id)
    });
  };

  const ejecutarEliminarCuota = async (cuotaId) => {
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
                const estaEditando = cuotaEditando?.id === c.id;

                if (estaEditando) {
                  return (
                    <form key={c.id} onSubmit={handleGuardarEdicionCuota} className="bg-[#071521] border border-amber-500/50 p-4 rounded-2xl flex flex-col gap-3">
                      <div className="text-xs text-amber-400 font-bold">Editar Cuota #{c.numero_cuota}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={cuotaEditando.concepto}
                          onChange={(e) => setCuotaEditando({...cuotaEditando, concepto: e.target.value})}
                          required
                          className="bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={cuotaEditando.monto}
                          onChange={(e) => setCuotaEditando({...cuotaEditando, monto: e.target.value})}
                          required
                          className="bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                        />
                        <input
                          type="date"
                          value={cuotaEditando.fecha_vencimiento}
                          onChange={(e) => setCuotaEditando({...cuotaEditando, fecha_vencimiento: e.target.value})}
                          className="bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setCuotaEditando(null)} className="text-xs text-gray-400 px-3 py-1.5">Cancelar</button>
                        <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold px-4 py-1.5 rounded-xl">Guardar Cambios</button>
                      </div>
                    </form>
                  );
                }

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

                    <div className="flex items-center gap-2.5 self-end md:self-auto">
                      <strong className="text-sm text-[#ffb703] mr-1">S/ {parseFloat(c.monto).toFixed(2)}</strong>

                      <button
                        onClick={() => setCuotaEditando({ id: c.id, concepto: c.concepto, monto: c.monto, fecha_vencimiento: c.fecha_vencimiento || '' })}
                        className="text-gray-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Editar concepto, monto o fecha de esta cuota"
                      >
                        <Edit size={15} />
                      </button>

                      <button
                        onClick={() => handleIniciarCobro(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                          esPagado 
                            ? 'bg-white/10 hover:bg-amber-500/20 text-gray-300 border-white/15' 
                            : 'bg-emerald-500/20 hover:bg-emerald-600 border-emerald-500/40 text-emerald-300 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 size={14} /> {esPagado ? 'Desmarcar' : 'Marcar Pagado'}
                      </button>

                      <button
                        onClick={() => solicitarEliminarCuota(c)}
                        className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Eliminar cuota"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Modal de Cobro Personalizado */}
      {cuotaProcesandoCobro && (
        <div className="fixed inset-0 z-[100060] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md">
          <div className="bg-[#0d2538] border border-emerald-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <DollarSign size={20} /> Registrar Cobro de Cuota
              </div>
              <button onClick={() => setCuotaProcesandoCobro(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#071521] p-3.5 rounded-2xl border border-white/10 text-xs text-gray-300 flex flex-col gap-1.5">
              <div><strong>Pasajero:</strong> {inscripcion.perfiles?.nombre_completo}</div>
              <div><strong>Concepto:</strong> Cuota #{cuotaProcesandoCobro.numero_cuota}: {cuotaProcesandoCobro.concepto}</div>
              <div><strong>Monto a Cobrar:</strong> <strong className="text-emerald-400 text-sm">S/ {parseFloat(cuotaProcesandoCobro.monto).toFixed(2)}</strong></div>
            </div>

            <form onSubmit={handleConfirmarCobroSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Método de Pago *</label>
                <select
                  value={datosCobro.metodo_pago}
                  onChange={(e) => setDatosCobro({ ...datosCobro, metodo_pago: e.target.value })}
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-2.5 text-white text-xs"
                >
                  <option value="Efectivo">Efectivo (Cobro Presencial)</option>
                  <option value="Transferencia BCP">Transferencia BCP</option>
                  <option value="Transferencia BBVA">Transferencia BBVA</option>
                  <option value="Transferencia Interbank">Transferencia Interbank</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Nº Operación / Referencia (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej: Op. #987654 / Ref BCP 123"
                  value={datosCobro.referencia_pago}
                  onChange={(e) => setDatosCobro({ ...datosCobro, referencia_pago: e.target.value })}
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-2.5 text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setCuotaProcesandoCobro(null)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCobro}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <CheckCircle2 size={16} /> {loadingCobro ? 'Procesando Cobro...' : 'Confirmar & Guardar en Caja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Sistema Personalizado */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100070] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md">
          <div className="bg-[#0d2538] border border-white/20 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-headline font-bold text-base text-white m-0">{confirmModal.titulo}</h4>
              <p className="text-xs text-gray-300 m-0 mt-2 leading-relaxed">{confirmModal.mensaje}</p>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirmar();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className={`${confirmModal.btnClass} text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg`}
              >
                {confirmModal.btnTexto}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
}
