import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Filter, MapPin, Calendar, Users, DollarSign, CheckCircle2, Clock, XCircle, Plus, User, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CrearPaqueteModal } from '../CrearPaqueteModal';

export function AdminSolicitudesModule() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Modal para convertir en Paquete Grupal
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitudes_cotizacion')
        .select('*, perfiles(id, nombre_completo, username, telefono, documento_identidad), paquetes_grupales(*)')
        .order('created_at', { ascending: false });

      if (data) {
        setSolicitudes(data);
      }
    } catch (e) {
      console.log('Error al cargar solicitudes de cotización:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (solicitudId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('solicitudes_cotizacion')
        .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
        .eq('id', solicitudId);

      if (error) throw error;
      alert(`Estado de la solicitud actualizado a "${nuevoEstado.toUpperCase()}".`);
      cargarSolicitudes();
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  const handleIniciarCreacionPaquete = (sol) => {
    setSolicitudSeleccionada(sol);
    setCrearModalOpen(true);
  };

  const handlePaqueteCreadoExitoso = async (nuevoPaquete) => {
    if (solicitudSeleccionada && nuevoPaquete) {
      try {
        // 1. Vincular paquete creado en la solicitud
        await supabase
          .from('solicitudes_cotizacion')
          .update({
            estado: 'paquete_creado',
            paquete_creado_id: nuevoPaquete.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', solicitudSeleccionada.id);

        // 2. Inscribir automáticamente al cliente solicitante en el nuevo paquete grupal
        await supabase
          .from('inscripciones_grupo')
          .insert([{
            usuario_id: solicitudSeleccionada.usuario_id,
            paquete_id: nuevoPaquete.id,
            estado: 'confirmado',
            notas: 'Inscripción automática por solicitud de cotización personalizada'
          }]);

        alert(`¡Paquete Creado con Éxito y Cliente "${solicitudSeleccionada.perfiles?.nombre_completo || 'Solicitante'}" inscrito automáticamente!`);
        cargarSolicitudes();
      } catch (e) {
        console.error('Error al vincular paquete con cliente:', e);
      }
    }
    setCrearModalOpen(false);
    setSolicitudSeleccionada(null);
  };

  const solicitudesFiltradas = solicitudes.filter(sol => {
    const cliente = sol.perfiles;
    const nombre = cliente?.nombre_completo || '';
    const dest = sol.destino || '';

    const matchSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        dest.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filtroEstado === 'todos' || sol.estado === filtroEstado;

    return matchSearch && matchEstado;
  });

  return (
    <div className="bg-[#0d2538] border border-white/15 p-6 md:p-8 rounded-3xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2 m-0">
            <Sparkles size={26} className="text-[#ffb703]" /> Cotizaciones Personalizadas de Clientes ({solicitudesFiltradas.length})
          </h3>
          <p className="text-xs text-gray-300 mt-1 m-0">
            Revisa las solicitudes a medida enviadas por los viajeros y conviértelas en paquetes grupales
          </p>
        </div>

        <button 
          onClick={cargarSolicitudes}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-2xl border border-white/15 transition-all cursor-pointer"
        >
          Actualizar Lista
        </button>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-[#071521] p-4 rounded-2xl border border-white/10">
        <div className="md:col-span-8 relative">
          <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o destino..."
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none"
          />
        </div>

        <div className="md:col-span-4 relative flex items-center gap-2">
          <Filter size={16} className="text-[#ffb703] shrink-0" />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
          >
            <option value="todos">Estado: Todos</option>
            <option value="pendiente">🟡 Pendientes</option>
            <option value="en_revision">🔵 En Revisión</option>
            <option value="cotizado">🟢 Cotizados</option>
            <option value="paquete_creado">🟣 Paquete Creado</option>
            <option value="rechazado">🔴 Rechazados</option>
          </select>
        </div>
      </div>

      {/* Listado de Solicitudes */}
      {loading ? (
        <div className="text-center p-12 text-gray-400 text-xs">
          Cargando solicitudes de cotización...
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-xs bg-[#071521] rounded-2xl border border-white/10">
          No se encontraron solicitudes con los criterios de búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {solicitudesFiltradas.map(sol => {
            const cliente = sol.perfiles;
            const pkgCreado = sol.paquetes_grupales;

            return (
              <div 
                key={sol.id} 
                className="bg-[#071521] border border-white/15 p-5 rounded-2xl flex flex-col lg:flex-row justify-between gap-6 hover:border-[#1995ad]/50 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#1995ad]/20 border border-[#1995ad] text-[#a0f0ff] text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
                      Destino: {sol.destino}
                    </span>
                    <span className="text-xs text-gray-400">
                      Fecha solicitud: {new Date(sol.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white m-0 flex items-center gap-2">
                    <User size={18} className="text-[#ffb703]" /> 
                    {cliente?.nombre_completo || 'Cliente Registrado'}
                  </h4>
                  <p className="text-xs text-gray-300 m-0 mt-0.5 flex items-center gap-3">
                    <span>Tel: <strong className="text-[#1995ad]">{cliente?.telefono || 'Sin registro'}</strong></span>
                    <span>DNI: <strong>{cliente?.documento_identidad || 'N/A'}</strong></span>
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#0d2538] p-3 rounded-xl border border-white/10 mt-3">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Pasajeros</span>
                      <strong className="text-white">{sol.cantidad_personas} personas</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Presupuesto Estimado</span>
                      <strong className="text-[#ffb703]">{sol.presupuesto_estimado ? `S/ ${parseFloat(sol.presupuesto_estimado).toFixed(2)}` : 'A definir'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Salida</span>
                      <strong className="text-white">{sol.fecha_salida || 'Por definir'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Retorno</span>
                      <strong className="text-white">{sol.fecha_retorno || 'Por definir'}</strong>
                    </div>
                  </div>

                  {sol.servicios_deseados && sol.servicios_deseados.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-gray-400 mr-2">Servicios solicitados:</span>
                      {sol.servicios_deseados.map((s, idx) => (
                        <span key={idx} className="bg-white/10 text-gray-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded mr-1">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {sol.detalles && (
                    <p className="text-xs text-gray-300 bg-black/30 p-2.5 rounded-xl m-0 mt-2 italic">
                      "{sol.detalles}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-between items-end gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    sol.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    sol.estado === 'en_revision' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                    sol.estado === 'cotizado' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    sol.estado === 'paquete_creado' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                    'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {sol.estado.toUpperCase()}
                  </span>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {sol.estado !== 'paquete_creado' && (
                      <button
                        onClick={() => handleIniciarCreacionPaquete(sol)}
                        className="bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <Plus size={15} /> Convertir en Paquete Grupal
                      </button>
                    )}

                    {sol.estado === 'pendiente' && (
                      <button
                        onClick={() => handleCambiarEstado(sol.id, 'en_revision')}
                        className="bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        Marcar En Revisión
                      </button>
                    )}

                    {sol.estado !== 'cotizado' && sol.estado !== 'paquete_creado' && (
                      <button
                        onClick={() => handleCambiarEstado(sol.id, 'cotizado')}
                        className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        Marcar Cotizado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear Paquete a partir de Solicitud */}
      {crearModalOpen && (
        <CrearPaqueteModal
          isOpen={crearModalOpen}
          onClose={() => { setCrearModalOpen(false); setSolicitudSeleccionada(null); }}
          onPaqueteCreado={handlePaqueteCreadoExitoso}
          initialData={solicitudSeleccionada ? {
            titulo: `Paquete Especial ${solicitudSeleccionada.destino} (${solicitudSeleccionada.perfiles?.nombre_completo || 'Cotizado'})`,
            destino: solicitudSeleccionada.destino,
            descripcion: `Paquete turístico personalizado creado a solicitud de ${solicitudSeleccionada.perfiles?.nombre_completo || 'cliente VIP'}. Incluye servicios seleccionados: ${solicitudSeleccionada.servicios_deseados?.join(', ') || 'servicios turísticos completos'}.`,
            fecha_salida: solicitudSeleccionada.fecha_salida || new Date().toISOString().split('T')[0],
            fecha_retorno: solicitudSeleccionada.fecha_retorno || new Date().toISOString().split('T')[0],
            precio_persona: solicitudSeleccionada.presupuesto_estimado || 990,
            cupo_maximo: solicitudSeleccionada.cantidad_personas || 10,
            imagen_portada: '/images/hero-bg.jpg'
          } : null}
        />
      )}
    </div>
  );
}
