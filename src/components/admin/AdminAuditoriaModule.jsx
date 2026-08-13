import React, { useState, useEffect } from 'react';
import { 
  Database, Clock, Activity, Filter, Search, Download, Eye, FileText, 
  BarChart3, TrendingUp, PieChart, Users, DollarSign, Calendar, CheckCircle2, 
  AlertTriangle, RefreshCw, XCircle, Printer, Layers, ArrowUpRight, ShieldCheck, Copy
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function AdminAuditoriaModule({ auditorias = [], tienePermiso }) {
  const toast = useToast();

  // Sub-Pestaña Activa
  const [subTab, setSubTab] = useState('bitacora'); // 'bitacora' | 'analytics'

  // Filtros de Auditoría
  const [filtroTabla, setFiltroTabla] = useState('todas');
  const [filtroOperacion, setFiltroOperacion] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal de Detalle JSON
  const [registroDetalle, setRegistroDetalle] = useState(null);

  // Datos para Analytics & Métricas
  const [paquetesAnalytics, setPaquetesAnalytics] = useState([]);
  const [pagosAnalytics, setPagosAnalytics] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Evaluación de Permisos Granulares
  const canVerAuditoria = !tienePermiso || tienePermiso('auditoria_ver');
  const canListarAuditoria = !tienePermiso || tienePermiso('auditoria_listar');
  const canExportarAuditoria = !tienePermiso || tienePermiso('auditoria_exportar');
  const canVerAnalytics = !tienePermiso || tienePermiso('analytics_ver');
  const canExportarAnalytics = !tienePermiso || tienePermiso('analytics_exportar');

  useEffect(() => {
    if (subTab === 'analytics') {
      cargarAnalyticsData();
    }
  }, [subTab]);

  const cargarAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      // Cargar Paquetes con Inscritos
      const { data: paqData } = await supabase
        .from('paquetes_grupales')
        .select('*, inscripciones_grupo(id, cantidad_personas, estado, precio_total)')
        .order('fecha_salida', { ascending: true });

      if (paqData) setPaquetesAnalytics(paqData);

      // Cargar Historial de Pagos en Caja
      const { data: pagosData } = await supabase
        .from('historial_pagos_caja')
        .select('*');

      if (pagosData) setPagosAnalytics(pagosData);
    } catch (err) {
      console.error('Error al cargar métricas de analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Obtener tablas únicas para el filtro dropdown
  const tablasUnicas = Array.from(new Set(auditorias.map(a => a.tabla_afectada))).filter(Boolean);

  // Filtrado de Bitácora
  const auditoriasFiltradas = auditorias.filter(item => {
    // Filtro por Tabla
    if (filtroTabla !== 'todas' && item.tabla_afectada !== filtroTabla) return false;

    // Filtro por Operación
    if (filtroOperacion !== 'todas' && item.operacion !== filtroOperacion) return false;

    // Filtro por Período
    const fecha = new Date(item.fecha);
    const hoy = new Date();
    if (filtroPeriodo === 'hoy') {
      if (fecha.toDateString() !== hoy.toDateString()) return false;
    } else if (filtroPeriodo === 'semana') {
      const haceSemana = new Date(hoy.setDate(hoy.getDate() - 7));
      if (fecha < haceSemana) return false;
    } else if (filtroPeriodo === 'mes') {
      if (fecha.getMonth() !== hoy.getMonth() || fecha.getFullYear() !== hoy.getFullYear()) return false;
    }

    // Filtro por Búsqueda de Texto
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      const tabla = (item.tabla_afectada || '').toLowerCase();
      const operacion = (item.operacion || '').toLowerCase();
      const usuario = (item.usuario_id || '').toLowerCase();
      const datos = JSON.stringify(item.datos_nuevos || item.datos_anteriores || {}).toLowerCase();

      return tabla.includes(term) || operacion.includes(term) || usuario.includes(term) || datos.includes(term);
    }

    return true;
  });

  // Exportar Bitácora a CSV
  const handleExportarCSV = () => {
    if (!canExportarAuditoria) {
      toast.error('No tienes permiso para exportar la bitácora de auditoría.');
      return;
    }

    if (auditoriasFiltradas.length === 0) {
      toast.warning('No hay registros de auditoría para exportar.');
      return;
    }

    const headers = ['ID', 'Fecha', 'Tabla Afectada', 'Operación', 'Usuario ID', 'Datos Anteriores', 'Datos Nuevos'];
    const rows = auditoriasFiltradas.map(a => [
      a.id,
      new Date(a.fecha).toLocaleString('es-PE'),
      a.tabla_afectada,
      a.operacion,
      a.usuario_id || 'Sistema',
      `"${JSON.stringify(a.datos_anteriores || {}).replace(/"/g, '""')}"`,
      `"${JSON.stringify(a.datos_nuevos || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bitacora_auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Bitácora de auditoría exportada en formato CSV correctamente.', 'Exportación Exitosa 📥');
  };

  // Exportar Reporte Ejecutivo PDF/Imprimir
  const handleImprimirReporteEjecutivo = () => {
    if (!canExportarAnalytics) {
      toast.error('No tienes permiso para exportar reportes ejecutivos.');
      return;
    }
    window.print();
  };

  // Cálculos para Analytics
  const totalRecaudadoGlobal = pagosAnalytics
    .filter(p => p.tipo_movimiento === 'ingreso')
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

  const totalInscritosGlobal = paquetesAnalytics.reduce((sum, pq) => {
    const inscritos = (pq.inscripciones_grupo || [])
      .filter(i => i.estado === 'confirmado')
      .reduce((s, i) => s + (i.cantidad_personas || 1), 0);
    return sum + inscritos;
  }, 0);

  const totalCapacidadGlobal = paquetesAnalytics.reduce((sum, pq) => sum + (parseInt(pq.capacidad_maxima) || 0), 0);
  const porcentajeOcupacionGlobal = totalCapacidadGlobal > 0 ? ((totalInscritosGlobal / totalCapacidadGlobal) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Header del Módulo de Analytics & Auditoría */}
      <div className="bg-[#071521] border border-white/10 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">
            <Activity size={26} />
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-white m-0 flex items-center gap-2">
              Analytics, Reportes & Auditoría Inmutable BD
            </h2>
            <p className="text-xs text-gray-400 m-0 mt-0.5">
              Control de cambios en base de datos (Triggers Supabase) y reporte comercial ejecutivo de ocupación
            </p>
          </div>
        </div>

        {/* Selector de Sub-Pestaña */}
        <div className="flex bg-[#0d2538] p-1 rounded-2xl border border-white/10">
          {canVerAuditoria && (
            <button
              onClick={() => setSubTab('bitacora')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'bitacora' ? 'bg-[#1995ad] text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Database size={15} /> Bitácora Auditoría ({auditorias.length})
            </button>
          )}

          {canVerAnalytics && (
            <button
              onClick={() => setSubTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'analytics' ? 'bg-emerald-500 text-black shadow font-extrabold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 size={15} /> Analytics & Ocupación
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: BITÁCORA DE AUDITORÍA DE BASE DE DATOS */}
      {subTab === 'bitacora' && canVerAuditoria && (
        <div className="flex flex-col gap-5">
          {/* Panel de Filtros & Acciones */}
          {canListarAuditoria && (
            <div className="bg-[#071521] border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Filter size={16} className="text-[#1995ad]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Período:</span>

                  <button
                    onClick={() => setFiltroPeriodo('hoy')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      filtroPeriodo === 'hoy' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Hoy
                  </button>

                  <button
                    onClick={() => setFiltroPeriodo('semana')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      filtroPeriodo === 'semana' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Esta Semana
                  </button>

                  <button
                    onClick={() => setFiltroPeriodo('mes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      filtroPeriodo === 'mes' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Este Mes
                  </button>

                  <button
                    onClick={() => setFiltroPeriodo('todos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      filtroPeriodo === 'todos' ? 'bg-[#1995ad] text-white border-[#1995ad]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Todos
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por tabla, datos, usuario..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      className="w-full bg-[#0d2538] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-[#1995ad] focus:outline-none"
                    />
                  </div>

                  {canExportarAuditoria && (
                    <button
                      onClick={handleExportarCSV}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg whitespace-nowrap"
                    >
                      <Download size={14} /> Exportar Bitácora (CSV)
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Filtros por Tabla y Operación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-bold block mb-1">Filtrar por Tabla Afectada:</label>
                  <select
                    value={filtroTabla}
                    onChange={e => setFiltroTabla(e.target.value)}
                    className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-[#1995ad]"
                  >
                    <option value="todas">Todas las Tablas ({tablasUnicas.length})</option>
                    {tablasUnicas.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 font-bold block mb-1">Filtrar por Operación:</label>
                  <select
                    value={filtroOperacion}
                    onChange={e => setFiltroOperacion(e.target.value)}
                    className="w-full bg-[#0d2538] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-[#1995ad]"
                  >
                    <option value="todas">Todas las Operaciones (INSERT, UPDATE, DELETE)</option>
                    <option value="INSERT">🟢 INSERT (Nuevos Registros)</option>
                    <option value="UPDATE">🟡 UPDATE (Modificaciones)</option>
                    <option value="DELETE">🔴 DELETE (Eliminaciones)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Registros de Auditoría BD */}
          <div className="bg-[#071521] border border-white/15 rounded-2xl overflow-hidden shadow-xl">
            {auditoriasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No se encontraron registros de auditoría para los filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white">
                  <thead className="bg-[#0d2538] text-[11px] uppercase text-gray-300 border-b border-white/15">
                    <tr>
                      <th className="p-3.5">Fecha / Hora</th>
                      <th className="p-3.5">Tabla Afectada</th>
                      <th className="p-3.5">Operación</th>
                      <th className="p-3.5">Usuario ID</th>
                      <th className="p-3.5">Detalle / Datos Registrados</th>
                      <th className="p-3.5 text-center">Inspeccionar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-mono">
                    {auditoriasFiltradas.map(a => (
                      <tr key={a.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 text-gray-300 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Clock size={13} className="text-[#ffb703]" />
                            {new Date(a.fecha).toLocaleString('es-PE')}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold text-[#1995ad] font-mono">
                          {a.tabla_afectada}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            a.operacion === 'INSERT' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                            a.operacion === 'UPDATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}>
                            {a.operacion}
                          </span>
                        </td>

                        <td className="p-3.5 text-gray-400">
                          {a.usuario_id ? (
                            <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px]" title={a.usuario_id}>
                              {a.usuario_id.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-gray-500 italic text-[10px]">Sistema / Supabase Trigger</span>
                          )}
                        </td>

                        <td className="p-3.5 max-w-xs truncate text-gray-400 text-[11px]">
                          {JSON.stringify(a.datos_nuevos || a.datos_anteriores || {})}
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setRegistroDetalle(a)}
                            className="bg-white/10 hover:bg-[#1995ad] text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 mx-auto cursor-pointer"
                            title="Ver diff completo de datos de auditoría"
                          >
                            <Eye size={12} /> Detalle JSON
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ANALYTICS & MÉTRICAS DE OCUPACIÓN */}
      {subTab === 'analytics' && canVerAnalytics && (
        <div className="flex flex-col gap-6">

          {/* Tarjetas KPI de Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#071521] border border-emerald-500/30 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">Recaudación Total Empresa</span>
                <strong className="text-2xl font-bold text-emerald-400 mt-1 block">S/ {totalRecaudadoGlobal.toFixed(2)}</strong>
                <span className="text-[10px] text-emerald-300/70 mt-1 block">Ingresos en caja registrados</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="bg-[#071521] border border-cyan-500/30 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">Pasajeros Confirmados</span>
                <strong className="text-2xl font-bold text-cyan-300 mt-1 block">{totalInscritosGlobal} Viajeros</strong>
                <span className="text-[10px] text-cyan-200/70 mt-1 block">Cupos reservados e inscritos</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-[#071521] border border-amber-500/30 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">Nivel de Ocupación Global</span>
                <strong className="text-2xl font-bold text-[#ffb703] mt-1 block">{porcentajeOcupacionGlobal}%</strong>
                <span className="text-[10px] text-amber-200/70 mt-1 block">{totalInscritosGlobal} de {totalCapacidadGlobal} cupos totales</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#ffb703] flex items-center justify-center font-bold">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Botón Imprimir Reporte Ejecutivo */}
          <div className="flex justify-end">
            {canExportarAnalytics && (
              <button
                onClick={handleImprimirReporteEjecutivo}
                className="btn-gold-3d text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Printer size={16} /> Imprimir Reporte Ejecutivo PDF
              </button>
            )}
          </div>

          {/* Reporte de Ocupación por Paquete Grupal */}
          <div className="bg-[#071521] border border-white/15 p-6 rounded-3xl shadow-xl">
            <h3 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-[#1995ad]" /> Rendimiento & Ocupación por Paquete Turístico
            </h3>

            {loadingAnalytics ? (
              <div className="text-center py-10 text-gray-400 text-xs">Cargando métricas de ocupación...</div>
            ) : paquetesAnalytics.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">No hay paquetes turísticos registrados para analizar.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paquetesAnalytics.map(pq => {
                  const inscritosConfirmados = (pq.inscripciones_grupo || [])
                    .filter(i => i.estado === 'confirmado')
                    .reduce((sum, i) => sum + (i.cantidad_personas || 1), 0);

                  const capMax = parseInt(pq.capacidad_maxima || 10);
                  const pct = Math.min(100, Math.round((inscritosConfirmados / capMax) * 100));

                  const totalGeneradoEstimado = (pq.inscripciones_grupo || [])
                    .filter(i => i.estado === 'confirmado')
                    .reduce((sum, i) => sum + parseFloat(i.precio_total || (pq.precio_persona * i.cantidad_personas) || 0), 0);

                  return (
                    <div key={pq.id} className="bg-[#0d2538] border border-white/10 p-4 rounded-2xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-[#1995ad] uppercase tracking-wider">{pq.destino}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pct >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            pct >= 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-white/10 text-gray-300 border border-white/20'
                          }`}>
                            {pct}% Ocupado
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm m-0">{pq.titulo}</h4>
                        <p className="text-[11px] text-gray-400 mt-1 m-0">📅 Salida: {pq.fecha_salida} • Precio: S/ {parseFloat(pq.precio_persona || 0).toFixed(2)}</p>
                      </div>

                      {/* Barra de Ocupación Visual */}
                      <div>
                        <div className="flex justify-between text-[11px] text-gray-300 font-bold mb-1">
                          <span>Cupos: {inscritosConfirmados} de {capMax}</span>
                          <span className="text-emerald-400">Ventas Est: S/ {totalGeneradoEstimado.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              pct >= 80 ? 'bg-emerald-400' : pct >= 40 ? 'bg-[#ffb703]' : 'bg-[#1995ad]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE COMPLETO JSON DE AUDITORÍA */}
      {registroDetalle && (
        <div className="fixed inset-0 z-[100070] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md">
          <div className="bg-[#0d2538] border border-white/20 rounded-3xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#1995ad] font-bold text-sm">
                <Database size={20} /> Detalle de Registro de Auditoría Inmutable BD
              </div>
              <button onClick={() => setRegistroDetalle(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#071521] p-3 rounded-2xl border border-white/10 text-xs text-gray-300">
              <div><strong>Tabla:</strong> <span className="text-[#1995ad] font-mono font-bold">{registroDetalle.tabla_afectada}</span></div>
              <div><strong>Operación:</strong> <span className="text-amber-400 font-mono font-bold">{registroDetalle.operacion}</span></div>
              <div><strong>Fecha / Hora:</strong> {new Date(registroDetalle.fecha).toLocaleString('es-PE')}</div>
              <div><strong>Usuario ID:</strong> {registroDetalle.usuario_id || 'Sistema'}</div>
            </div>

            {/* Datos Anteriores vs Datos Nuevos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {registroDetalle.datos_anteriores && (
                <div className="bg-[#071521] border border-red-500/30 p-3 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-red-400 font-bold text-[11px] uppercase tracking-wider block">🔴 Estado Anterior (datos_anteriores):</span>
                  <pre className="bg-black/50 p-2.5 rounded-xl text-[10px] text-red-200 overflow-x-auto font-mono whitespace-pre-wrap max-h-60">
                    {JSON.stringify(registroDetalle.datos_anteriores, null, 2)}
                  </pre>
                </div>
              )}

              {registroDetalle.datos_nuevos && (
                <div className="bg-[#071521] border border-emerald-500/30 p-3 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider block">🟢 Estado Nuevo (datos_nuevos):</span>
                  <pre className="bg-black/50 p-2.5 rounded-xl text-[10px] text-emerald-200 overflow-x-auto font-mono whitespace-pre-wrap max-h-60">
                    {JSON.stringify(registroDetalle.datos_nuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(registroDetalle, null, 2));
                  toast.success('JSON copiado al portapapeles.');
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Copy size={14} /> Copiar JSON Completo
              </button>

              <button
                onClick={() => setRegistroDetalle(null)}
                className="bg-[#1995ad] hover:bg-[#1995ad]/80 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
