import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle2, XCircle, Clock, MapPin, Calendar, FileText, Phone, UserCheck, UserPlus, Edit, Power, ShieldAlert, AtSign, Package, Heart, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CrearUsuarioModal } from '../usuarios/CrearUsuarioModal';
import { EditarUsuarioAdminModal } from '../EditarUsuarioAdminModal';
import { VerDetalleClienteModal } from '../clientes/VerDetalleClienteModal';
import { useToast } from '../../context/ToastContext';

export function AdminClientesModule() {
  const toast = useToast();
  const [subTab, setSubTab] = useState('directorio'); // 'directorio' | 'inscripciones'
  const [clientes, setClientes] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [clientCounts, setClientCounts] = useState({});

  // Modales
  const [crearClienteOpen, setCrearClienteOpen] = useState(false);
  const [editarUsuarioModal, setEditarUsuarioModal] = useState({ open: false, usuario: null });
  const [clienteVerDetalle, setClienteVerDetalle] = useState(null);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = () => {
    cargarClientes();
    cargarInscripciones();
    cargarContadoresActividad();
  };

  const cargarContadoresActividad = async () => {
    try {
      const counts = {};

      // 1. Contar reservas por usuario
      const { data: resData } = await supabase.from('inscripciones_grupo').select('usuario_id');
      if (resData) {
        resData.forEach(r => {
          if (!counts[r.usuario_id]) counts[r.usuario_id] = { reservas: 0, meGusta: 0 };
          counts[r.usuario_id].reservas += 1;
        });
      }

      // 2. Contar me gustas por usuario
      const { data: favData } = await supabase.from('favoritos_usuario').select('usuario_id');
      if (favData) {
        favData.forEach(f => {
          if (!counts[f.usuario_id]) counts[f.usuario_id] = { reservas: 0, meGusta: 0 };
          counts[f.usuario_id].meGusta += 1;
        });
      }

      setClientCounts(counts);
    } catch (e) {
      console.log('Error al cargar contadores de actividad:', e);
    }
  };

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const clientesFiltrados = data.filter(u => !u.rol || u.rol === 'cliente' || u.rol === '');
        setClientes(clientesFiltrados);
      }
    } catch (e) {
      console.log('Error al cargar clientes:', e);
    } finally {
      setLoading(false);
    }
  };

  const cargarInscripciones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inscripciones_grupo')
        .select('*, perfiles(id, nombre_completo, username, telefono, documento_identidad, rol), paquetes_grupales(*)')
        .order('fecha_inscripcion', { ascending: false });

      if (data) {
        setInscripciones(data);
      }
    } catch (e) {
      console.log('Error al cargar inscripciones:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstadoActivo = async (cliente) => {
    const nuevoEstado = !(cliente.activo ?? true);
    const mensaje = nuevoEstado 
      ? `¿Deseas activar al cliente "${cliente.nombre_completo}"?`
      : `¿Deseas desactivar el acceso del cliente "${cliente.nombre_completo}"?`;

    if (!window.confirm(mensaje)) return;

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ activo: nuevoEstado })
        .eq('id', cliente.id);

      if (error) throw error;
      toast.success(`Cliente "${cliente.nombre_completo}" ${nuevoEstado ? 'ACTIVADO 🟢' : 'DESACTIVADO 🔴'} con éxito.`, 'Estado Actualizado');
      cargarClientes();
    } catch (err) {
      toast.error('Error al actualizar estado del cliente: ' + err.message);
    }
  };

  const handleCambiarEstadoInscripcion = async (inscripcionId, nuevoEstado) => {
    const confirmacion = window.confirm(`¿Deseas cambiar el estado de la reserva a "${nuevoEstado.toUpperCase()}"?`);
    if (!confirmacion) return;

    try {
      const { error } = await supabase
        .from('inscripciones_grupo')
        .update({ estado: nuevoEstado })
        .eq('id', inscripcionId);

      if (error) throw error;
      toast.success(`Estado de la reserva actualizado a ${nuevoEstado.toUpperCase()}.`, 'Reserva Actualizada');
      cargarInscripciones();
    } catch (err) {
      toast.error('Error al actualizar reserva: ' + err.message);
    }
  };

  // Filtro de Clientes Registrados
  const clientesFiltrados = clientes.filter(c => {
    const nombre = c.nombre_completo || '';
    const dni = c.documento_identidad || '';
    const username = c.username || '';

    const matchSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        username.toLowerCase().includes(searchTerm.toLowerCase());

    const isActivo = c.activo ?? true;
    const matchEstado = filtroEstado === 'todos' || 
                        (filtroEstado === 'activo' && isActivo) ||
                        (filtroEstado === 'inactivo' && !isActivo);

    return matchSearch && matchEstado;
  });

  // Filtro de Inscripciones
  const inscripcionesFiltradas = inscripciones.filter(item => {
    const viajero = item.perfiles;
    const pkg = item.paquetes_grupales;
    const nombre = viajero?.nombre_completo || '';
    const dni = viajero?.documento_identidad || '';
    const tituloPkg = pkg?.titulo || '';

    const matchSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tituloPkg.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filtroEstado === 'todos' || item.estado === filtroEstado;

    return matchSearch && matchEstado;
  });

  return (
    <div className="bg-[#0d2538] border border-white/15 p-6 md:p-8 rounded-3xl shadow-xl">
      {/* Header del Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2 m-0">
            <UserCheck size={26} className="text-[#1995ad]" /> Módulo de Clientes & Reservas
          </h3>
          <p className="text-xs text-gray-300 mt-1 m-0">
            Registra nuevos clientes con credenciales, administra su estado activo/inactivo y consulta reservas de viajes
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setCrearClienteOpen(true)}
            className="btn-gold-3d text-xs px-4 py-2.5 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={16} /> Registrar Nuevo Cliente
          </button>

          <button 
            onClick={cargarTodo}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-2xl border border-white/15 transition-all cursor-pointer"
          >
            Actualizar Lista
          </button>
        </div>
      </div>

      {/* Sub-Pestañas: Directorio vs Reservas */}
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
        <button
          onClick={() => setSubTab('directorio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'directorio' ? 'bg-[#1995ad] text-white shadow-lg shadow-[#1995ad]/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Users size={16} /> Directorio de Clientes Registrados ({clientesFiltrados.length})
        </button>

        <button
          onClick={() => setSubTab('inscripciones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'inscripciones' ? 'bg-[#1995ad] text-white shadow-lg shadow-[#1995ad]/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <MapPin size={16} /> Reservas & Paquetes Inscritos ({inscripcionesFiltradas.length})
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
            placeholder={subTab === 'directorio' ? "Buscar por nombre, username o DNI..." : "Buscar por cliente, DNI o paquete grupal..."}
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none"
          />
        </div>

        <div className="md:col-span-4 relative flex items-center gap-2">
          <Filter size={16} className="text-[#ffb703] shrink-0" />
          {subTab === 'directorio' ? (
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
            >
              <option value="todos">Estado: Todos los Clientes</option>
              <option value="activo">🟢 Activos</option>
              <option value="inactivo">🔴 Inactivos / Suspendidos</option>
            </select>
          ) : (
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
            >
              <option value="todos">Estado Reserva: Todos</option>
              <option value="confirmado">🟢 Confirmados</option>
              <option value="pendiente">🟡 Pendientes</option>
              <option value="cancelado">🔴 Cancelados</option>
            </select>
          )}
        </div>
      </div>

      {/* VISTA 1: Directorio de Clientes Registrados */}
      {subTab === 'directorio' && (
        <div className="overflow-x-auto rounded-2xl border border-white/15">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-[#071521] text-xs uppercase text-gray-300 border-b border-white/15">
              <tr>
                <th className="p-4">Cliente / Usuario</th>
                <th className="p-4">Documento / Teléfono</th>
                <th className="p-4">Reservas & Me Gusta</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4">Estado Cuenta</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    Cargando directorio de clientes...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    No se encontraron clientes registrados con el filtro actual.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map(c => {
                  const isActivo = c.activo ?? true;
                  const counts = clientCounts[c.id] || { reservas: 0, meGusta: 0 };

                  return (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#1995ad] flex items-center justify-center font-bold text-xs">
                            {c.nombre_completo?.[0] || 'C'}
                          </div>
                          <div>
                            <div className="text-white">{c.nombre_completo || 'Cliente Registrado'}</div>
                            <div className="text-xs text-gray-400 font-normal flex items-center gap-1.5 flex-wrap">
                              <span className="flex items-center gap-0.5"><AtSign size={12} className="text-[#1995ad]" /> {c.username || 'sin_username'}</span>
                              {c.email && <span className="text-[#1995ad] font-semibold text-[11px]">({c.email})</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-gray-300">
                        <div>DNI/Doc: <strong className="text-white">{c.documento_identidad || 'N/A'}</strong></div>
                        <div>Tel: <span className="text-[#1995ad] font-semibold">{c.telefono || 'Sin teléfono'}</span></div>
                      </td>

                      <td className="p-4 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setClienteVerDetalle(c)}
                            title="Ver viajes inscritos de este cliente"
                            className="bg-[#1995ad]/20 hover:bg-[#1995ad]/40 text-[#1995ad] border border-[#1995ad]/40 text-[11px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Package size={13} /> {counts.reservas} Viajes
                          </button>

                          <button
                            onClick={() => setClienteVerDetalle(c)}
                            title="Ver me gusta guardados de este cliente"
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/40 text-[11px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Heart size={13} className="fill-red-400" /> {counts.meGusta} Likes
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-gray-300">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-[#ffb703]" /> 
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isActivo 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}>
                          {isActivo ? '🟢 ACTIVO' : '🔴 INACTIVO'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setClienteVerDetalle(c)}
                            className="bg-[#1995ad]/20 hover:bg-[#1995ad] text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-[#1995ad]/40 flex items-center gap-1 transition-all cursor-pointer"
                            title="Ver Expediente Completo de Reservas y Likes"
                          >
                            <Eye size={14} /> Expediente
                          </button>

                          <button
                            onClick={() => setEditarUsuarioModal({ open: true, usuario: c })}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-1 transition-all cursor-pointer"
                            title="Editar Datos y Contraseña"
                          >
                            <Edit size={14} /> Editar
                          </button>

                          <button
                            onClick={() => handleToggleEstadoActivo(c)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                              isActivo 
                                ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white' 
                                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-black'
                            }`}
                            title={isActivo ? 'Desactivar Cliente' : 'Activar Cliente'}
                          >
                            <Power size={14} /> {isActivo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA 2: Reservas & Inscripciones de Paquetes */}
      {subTab === 'inscripciones' && (
        <div className="overflow-x-auto rounded-2xl border border-white/15">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-[#071521] text-xs uppercase text-gray-300 border-b border-white/15">
              <tr>
                <th className="p-4">Pasajero / Cliente</th>
                <th className="p-4">Documento / Teléfono</th>
                <th className="p-4">Paquete Grupal Reservado</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4">Estado Cupo</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    Cargando lista de reservas de paquetes...
                  </td>
                </tr>
              ) : inscripcionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    No se encontraron reservas con el filtro actual.
                  </td>
                </tr>
              ) : (
                inscripcionesFiltradas.map(item => {
                  const viajero = item.perfiles;
                  const pkg = item.paquetes_grupales;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#1995ad] flex items-center justify-center font-bold text-xs">
                            {viajero?.nombre_completo?.[0] || 'V'}
                          </div>
                          <div>
                            <div>{viajero?.nombre_completo || 'Pasajero Registrado'}</div>
                            <div className="text-xs text-gray-400 font-normal">{viajero?.username || 'sin_username'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-gray-300">
                        <div>DNI/Doc: <strong className="text-white">{viajero?.documento_identidad || 'N/A'}</strong></div>
                        <div>Tel: <span className="text-[#1995ad] font-semibold">{viajero?.telefono || 'Sin registro'}</span></div>
                      </td>

                      <td className="p-4 font-bold text-xs">
                        {pkg ? (
                          <div>
                            <div className="text-white">{pkg.titulo}</div>
                            <div className="text-gray-400 font-normal flex items-center gap-1 mt-0.5">
                              <MapPin size={12} className="text-[#1995ad]" /> {pkg.destino} | S/ {parseFloat(pkg.precio_persona).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-normal">Paquete no disponible</span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-gray-300">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-[#ffb703]" /> 
                          {new Date(item.fecha_inscripcion).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          item.estado === 'confirmado' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          item.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}>
                          {item.estado.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          {item.estado !== 'confirmado' && (
                            <button
                              onClick={() => handleCambiarEstadoInscripcion(item.id, 'confirmado')}
                              className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black text-xs font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                            >
                              Confirmar
                            </button>
                          )}

                          {item.estado !== 'cancelado' && (
                            <button
                              onClick={() => handleCambiarEstadoInscripcion(item.id, 'cancelado')}
                              className="bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear Cliente */}
      {crearClienteOpen && (
        <CrearUsuarioModal
          isOpen={crearClienteOpen}
          onClose={() => setCrearClienteOpen(false)}
          onUsuarioCreado={cargarTodo}
          fixedRol="cliente"
          title="Registrar Nuevo Cliente Viajero"
        />
      )}

      {/* Modal Editar Cliente */}
      {editarUsuarioModal.open && (
        <EditarUsuarioAdminModal
          isOpen={editarUsuarioModal.open}
          usuario={editarUsuarioModal.usuario}
          onClose={() => setEditarUsuarioModal({ open: false, usuario: null })}
          onUsuarioActualizado={cargarTodo}
          isClientModule={true}
        />
      )}

      {/* Modal Expediente de Reservas y Likes */}
      <VerDetalleClienteModal
        cliente={clienteVerDetalle}
        isOpen={!!clienteVerDetalle}
        onClose={() => setClienteVerDetalle(null)}
      />
    </div>
  );
}
