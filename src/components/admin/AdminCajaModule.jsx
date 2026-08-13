import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calendar, Filter, Search, ShieldAlert, CheckCircle2, XCircle, 
  RefreshCw, User, Package, CreditCard, ArrowDownRight, ArrowUpRight, Ban, FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function AdminCajaModule({ user, profile, tienePermiso }) {
  const toast = useToast();
  const [pagos, setPagos] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState('mes'); // hoy, semana, mes, ano, todos, personalizado
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroPaquete, setFiltroPaquete] = useState('todos');
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Estado de Anulación Modal
  const [pagoAnulando, setPagoAnulando] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [loadingAnular, setLoadingAnular] = useState(false);

  const puedeAnular = tienePermiso ? tienePermiso('caja_anular') : (profile?.rol === 'admin' || profile?.rol === 'super_admin');

  useEffect(() => {
    cargarDatos();
  }, [filtroPeriodo, fechaInicio, fechaFin, filtroPaquete, filtroMetodo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // 1. Cargar Lista de Paquetes para el filtro
      const { data: paqData } = await supabase
        .from('paquetes_grupales')
        .select('id, titulo')
        .order('titulo', { ascending: true });
      if (paqData) setPaquetes(paqData);

      // 2. Consultar Historial de Caja con relaciones
      let query = supabase
        .from('historial_pagos_caja')
        .select(`
          *,
          perfiles:cliente_id(nombre_completo, documento_identidad, email, username),
          paquetes_grupales:paquete_id(titulo, destino),
          cobrador:procesado_por(nombre_completo, username)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtro de paquete
      if (filtroPaquete !== 'todos') {
        query = query.eq('paquete_id', filtroPaquete);
      }

      // Aplicar filtro de método de pago
      if (filtroMetodo !== 'todos') {
        query = query.eq('metodo_pago', filtroMetodo);
      }

      // Aplicar filtro de rango de fechas
      const hoy = new Date();
      if (filtroPeriodo === 'hoy') {
        const inicio = new Date(hoy.setHours(0,0,0,0)).toISOString();
        query = query.gte('created_at', inicio);
      } else if (filtroPeriodo === 'semana') {
        const haceUnaSemana = new Date(hoy.setDate(hoy.getDate() - 7)).toISOString();
        query = query.gte('created_at', haceUnaSemana);
      } else if (filtroPeriodo === 'mes') {
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
        query = query.gte('created_at', primerDiaMes);
      } else if (filtroPeriodo === 'personalizado' && fechaInicio && fechaFin) {
        query = query.gte('created_at', new Date(fechaInicio).toISOString())
                     .lte('created_at', new Date(fechaFin + 'T23:59:59').toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setPagos(data || []);

    } catch (err) {
      console.error('Error al cargar caja:', err);
      toast.error('Error al cargar reporte de caja: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por búsqueda de texto local
  const pagosFiltrados = pagos.filter(p => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase();
    const cliente = p.perfiles?.nombre_completo?.toLowerCase() || '';
    const dni = p.perfiles?.documento_identidad || '';
    const paquete = p.paquetes_grupales?.titulo?.toLowerCase() || '';
    const ref = p.referencia_pago?.toLowerCase() || '';
    const cobrador = p.cobrador?.nombre_completo?.toLowerCase() || '';
    return cliente.includes(term) || dni.includes(term) || paquete.includes(term) || ref.includes(term) || cobrador.includes(term);
  });

  // Cálculo de KPIs
  const totalRecaudado = pagosFiltrados
    .filter(p => p.tipo_movimiento === 'ingreso')
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

  const totalEfectivo = pagosFiltrados
    .filter(p => p.tipo_movimiento === 'ingreso' && p.metodo_pago === 'Efectivo')
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

  const totalDigital = pagosFiltrados
    .filter(p => p.tipo_movimiento === 'ingreso' && p.metodo_pago !== 'Efectivo')
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

  const totalAnulado = pagosFiltrados
    .filter(p => p.tipo_movimiento === 'anulacion')
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

  // Proceso de Anulación de Pago
  const handleConfirmarAnulacion = async (e) => {
    e.preventDefault();
    if (!motivoAnulacion.trim()) {
      toast.warning('Ingresa el motivo de la anulación para fines de auditoría.');
      return;
    }

    setLoadingAnular(true);
    try {
      const cuotaId = pagoAnulando.cuota_id;

      // 1. Si la transacción está vinculada a una cuota, actualizarla a 'pendiente'
      if (cuotaId) {
        const { error: cuotaErr } = await supabase
          .from('cuotas_inscripcion')
          .update({
            estado: 'pendiente',
            metodo_pago: null,
            referencia_pago: null,
            fecha_pago: null,
            anulado_por: user.id,
            fecha_anulacion: new Date().toISOString(),
            motivo_anulacion: motivoAnulacion.trim()
          })
          .eq('id', cuotaId);

        if (cuotaErr) throw cuotaErr;
      }

      // 2. Registrar asiento de contramovimiento (anulación) en el libro diario de caja
      const { error: ledgerErr } = await supabase
        .from('historial_pagos_caja')
        .insert([{
          cuota_id: cuotaId || null,
          inscripcion_id: pagoAnulando.inscripcion_id,
          paquete_id: pagoAnulando.paquete_id,
          cliente_id: pagoAnulando.cliente_id,
          tipo_movimiento: 'anulacion',
          concepto: `ANULACIÓN: ${pagoAnulando.concepto}`,
          monto: parseFloat(pagoAnulando.monto),
          metodo_pago: pagoAnulando.metodo_pago,
          referencia_pago: pagoAnulando.referencia_pago,
          procesado_por: user.id,
          motivo: motivoAnulacion.trim()
        }]);

      if (ledgerErr) throw ledgerErr;

      toast.success('El cobro ha sido ANULADO y revertido en el sistema.', 'Cobro Anulado');
      setPagoAnulando(null);
      setMotivoAnulacion('');
      cargarDatos();
    } catch (err) {
      toast.error('Error al anular pago: ' + err.message);
    } finally {
      setLoadingAnular(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header del Módulo de Caja */}
      <div className="bg-[#071521] border border-white/10 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign size={26} />
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-white m-0">
              Caja, Recaudaciones & Historial de Pagos
            </h2>
            <p className="text-xs text-gray-400 m-0 mt-0.5">
              Libro diario de cobros por paquete, mes, día y auditoría de recaudador
            </p>
          </div>
        </div>

        <button
          onClick={cargarDatos}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar Caja
        </button>
      </div>

      {/* KPIs de Caja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#071521] border border-emerald-500/30 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">Total Recaudado</span>
            <strong className="text-2xl font-bold text-emerald-400 mt-1 block">S/ {totalRecaudado.toFixed(2)}</strong>
            <span className="text-[10px] text-emerald-300/70 mt-1 block">Ingresos en el período</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="bg-[#071521] border border-cyan-500/30 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">Efectivo en Caja</span>
            <strong className="text-2xl font-bold text-cyan-300 mt-1 block">S/ {totalEfectivo.toFixed(2)}</strong>
            <span className="text-[10px] text-cyan-200/70 mt-1 block">Pagos presenciales</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-[#071521] border border-amber-500/30 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">Digital / Bancos</span>
            <strong className="text-2xl font-bold text-[#ffb703] mt-1 block">S/ {totalDigital.toFixed(2)}</strong>
            <span className="text-[10px] text-amber-200/70 mt-1 block">Yape, Plin, Transferencias</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#ffb703] flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>

        <div className="bg-[#071521] border border-red-500/30 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">Total Anulado</span>
            <strong className="text-2xl font-bold text-red-400 mt-1 block">S/ {totalAnulado.toFixed(2)}</strong>
            <span className="text-[10px] text-red-300/70 mt-1 block">Cobros extornados</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <Ban size={20} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#071521] border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-[#1995ad]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Período de Caja:</span>
            
            <button
              onClick={() => setFiltroPeriodo('hoy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filtroPeriodo === 'hoy' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Hoy
            </button>

            <button
              onClick={() => setFiltroPeriodo('semana')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filtroPeriodo === 'semana' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Esta Semana
            </button>

            <button
              onClick={() => setFiltroPeriodo('mes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filtroPeriodo === 'mes' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Este Mes
            </button>

            <button
              onClick={() => setFiltroPeriodo('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filtroPeriodo === 'todos' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Histórico Completo
            </button>

            <button
              onClick={() => setFiltroPeriodo('personalizado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filtroPeriodo === 'personalizado' ? 'bg-[#ffb703] text-black border-[#ffb703]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              📅 Rango de Fechas
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente, DNI, ref..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#0d2538] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-[#1995ad] focus:outline-none"
            />
          </div>
        </div>

        {/* Sub-filtros por Rango de Fechas, Paquete y Método de Pago */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-3">
          {filtroPeriodo === 'personalizado' && (
            <div className="sm:col-span-3 flex flex-wrap items-center gap-3 bg-[#0d2538] p-3 rounded-xl border border-amber-500/30">
              <span className="text-xs text-amber-300 font-bold">Desde:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-[#071521] border border-white/15 rounded-lg p-2 text-xs text-white cursor-pointer"
              />
              <span className="text-xs text-amber-300 font-bold">Hasta:</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="bg-[#071521] border border-white/15 rounded-lg p-2 text-xs text-white cursor-pointer"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] text-gray-400 font-bold block mb-1">Filtrar por Paquete Grupal:</label>
            <select
              value={filtroPaquete}
              onChange={(e) => setFiltroPaquete(e.target.value)}
              className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-[#1995ad]"
            >
              <option value="todos">Todos los Paquetes</option>
              {paquetes.map(pq => (
                <option key={pq.id} value={pq.id}>{pq.titulo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 font-bold block mb-1">Filtrar por Método de Pago:</label>
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-[#1995ad]"
            >
              <option value="todos">Todos los Métodos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia BCP">Transferencia BCP</option>
              <option value="Transferencia BBVA">Transferencia BBVA</option>
              <option value="Yape">Yape</option>
              <option value="Plin">Plin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos de Caja */}
      <div className="bg-[#071521] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#1995ad] mb-2">progress_activity</span>
            <p className="text-xs">Cargando libro de transacciones de caja...</p>
          </div>
        ) : pagosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No se encontraron cobros ni movimientos registrados para los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#0d2538] text-[11px] uppercase text-gray-300 border-b border-white/15">
                <tr>
                  <th className="p-3.5">Fecha & Hora</th>
                  <th className="p-3.5">Cliente / Pasajero</th>
                  <th className="p-3.5">Paquete Grupal</th>
                  <th className="p-3.5">Concepto</th>
                  <th className="p-3.5">Método / Ref.</th>
                  <th className="p-3.5 text-right">Monto (S/)</th>
                  <th className="p-3.5">Cobrado Por</th>
                  <th className="p-3.5 text-center">Acciones / Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {pagosFiltrados.map((item) => {
                  const esAnulacion = item.tipo_movimiento === 'anulacion';
                  const fechaFormateada = new Date(item.created_at).toLocaleString('es-PE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <tr key={item.id} className={`hover:bg-white/5 transition-colors ${esAnulacion ? 'bg-red-500/5' : ''}`}>
                      <td className="p-3.5 text-gray-300 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#1995ad]" />
                          {fechaFormateada}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white">{item.perfiles?.nombre_completo || 'Cliente Registrado'}</div>
                        <div className="text-[10px] text-gray-400">DNI: {item.perfiles?.documento_identidad || 'N/A'}</div>
                      </td>

                      <td className="p-3.5 text-gray-300 font-semibold max-w-[200px] truncate" title={item.paquetes_grupales?.titulo}>
                        {item.paquetes_grupales?.titulo || 'Viaje Grupal'}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          esAnulacion ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/10 text-gray-200'
                        }`}>
                          {item.concepto}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-emerald-400">{item.metodo_pago}</div>
                        {item.referencia_pago && (
                          <div className="text-[10px] text-gray-400 font-mono">Ref: {item.referencia_pago}</div>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-bold whitespace-nowrap">
                        <span className={esAnulacion ? 'text-red-400' : 'text-emerald-400'}>
                          {esAnulacion ? '-' : ''}S/ {parseFloat(item.monto).toFixed(2)}
                        </span>
                      </td>

                      <td className="p-3.5 text-gray-300">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-[#ffb703]" />
                          {item.cobrador?.nombre_completo || 'Administrador'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        {esAnulacion ? (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1" title={item.motivo}>
                            <Ban size={11} /> ANULADO
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1">
                              <CheckCircle2 size={11} /> INGRESADO
                            </span>

                            {puedeAnular ? (
                              <button
                                onClick={() => setPagoAnulando(item)}
                                className="bg-red-500/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                title="Anular este cobro con motivo de auditoría"
                              >
                                Anular
                              </button>
                            ) : (
                              <span className="text-[9px] text-gray-500 italic" title="Requiere rol admin o permiso caja_anular">Sin permiso anulación</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Anulación con Motivo Auditable */}
      {pagoAnulando && (
        <div className="fixed inset-0 z-[100060] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md">
          <div className="bg-[#0d2538] border border-red-500/50 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert size={20} /> Anular Cobro de Caja
              </div>
              <button onClick={() => setPagoAnulando(null)} className="text-gray-400 hover:text-white">
                <XCircle size={18} />
              </button>
            </div>

            <div className="bg-[#071521] p-3.5 rounded-2xl border border-white/10 text-xs text-gray-300 flex flex-col gap-1.5">
              <div><strong>Cliente:</strong> {pagoAnulando.perfiles?.nombre_completo}</div>
              <div><strong>Concepto:</strong> {pagoAnulando.concepto}</div>
              <div><strong>Monto a Revertir:</strong> <span className="text-red-400 font-bold">S/ {parseFloat(pagoAnulando.monto).toFixed(2)}</span></div>
              <div><strong>Cobrado Por:</strong> {pagoAnulando.cobrador?.nombre_completo || 'Admin'}</div>
            </div>

            <form onSubmit={handleConfirmarAnulacion} className="flex flex-col gap-3">
              <label className="text-xs text-gray-300 font-bold block">
                Motivo de Anulación (Requerido para Auditoría):
              </label>
              <textarea
                rows={3}
                required
                placeholder="Escribe la razón detallada (ej: Error en método de pago / Transferencia rebotada por banco)..."
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-red-400 focus:outline-none"
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPagoAnulando(null)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAnular}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg"
                >
                  <Ban size={15} /> {loadingAnular ? 'Anulando...' : 'Confirmar Anulación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
