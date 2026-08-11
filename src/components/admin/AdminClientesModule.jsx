import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle2, XCircle, Clock, MapPin, Calendar, FileText, Phone, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminClientesModule() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    cargarInscripciones();
  }, []);

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

  const handleCambiarEstado = async (inscripcionId, nuevoEstado, paqueteId) => {
    const confirmacion = window.confirm(`¿Deseas cambiar el estado de la inscripción a "${nuevoEstado.toUpperCase()}"?`);
    if (!confirmacion) return;

    try {
      const { error } = await supabase
        .from('inscripciones_grupo')
        .update({ estado: nuevoEstado })
        .eq('id', inscripcionId);

      if (error) throw error;
      alert(`¡Estado de la inscripción actualizado a ${nuevoEstado}!`);
      cargarInscripciones();
    } catch (err) {
      alert('Error al actualizar inscripción: ' + err.message);
    }
  };

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
    <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck size={26} className="text-[#1995ad]" /> Gestión de Clientes Inscritos & Reservas ({inscripcionesFiltradas.length})
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            Consulta los pasajeros registrados en cada paquete grupal, sus documentos y estados de cupo
          </p>
        </div>

        <button 
          onClick={cargarInscripciones}
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
            placeholder="Buscar cliente por nombre, DNI o paquete grupal..."
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
            <option value="todos">Estado: Todos los Registros</option>
            <option value="confirmado">🟢 Confirmados</option>
            <option value="pendiente">🟡 Pendientes</option>
            <option value="cancelado">🔴 Cancelados</option>
          </select>
        </div>
      </div>

      {/* Tabla de Pasajeros Inscritos */}
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
                  Cargando lista de clientes inscritos...
                </td>
              </tr>
            ) : inscripcionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                  No se encontraron pasajeros inscritos con el filtro actual.
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
                            onClick={() => handleCambiarEstado(item.id, 'confirmado', pkg?.id)}
                            className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black text-xs font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                            title="Confirmar reserva"
                          >
                            Confirmar
                          </button>
                        )}

                        {item.estado !== 'cancelado' && (
                          <button
                            onClick={() => handleCambiarEstado(item.id, 'cancelado', pkg?.id)}
                            className="bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                            title="Cancelar reserva"
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
    </div>
  );
}
