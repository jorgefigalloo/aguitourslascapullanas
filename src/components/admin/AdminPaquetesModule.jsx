import React, { useState } from 'react';
import { Package, Plus, RefreshCw, Edit3, FileText, Calendar, MapPin, Users, Search, ArrowUpDown, Filter } from 'lucide-react';
import { CrearPaqueteModal } from '../CrearPaqueteModal';
import { EditarPaqueteModal } from '../EditarPaqueteModal';
import { ReportePdfModal } from '../paquetes/ReportePdfModal';
import { supabase } from '../../lib/supabase';

export function AdminPaquetesModule({ paquetes = [], user, profile, onActualizar }) {
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [paqueteAEditar, setPaqueteAEditar] = useState(null);
  const [paqueteAPdf, setPaqueteAPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados de Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('reciente');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const handleReiniciarCupos = async () => {
    const confirmacion = window.confirm('¿Deseas reiniciar la disponibilidad de cupos de TODOS los paquetes al 100%?');
    if (!confirmacion) return;

    setLoading(true);
    try {
      for (const p of paquetes) {
        await supabase
          .from('paquetes_grupales')
          .update({ cupo_disponible: p.cupo_maximo, estado: 'abierto' })
          .eq('id', p.id);
      }
      alert('¡Cupos reiniciados al 100% exitosamente!');
      onActualizar();
    } catch (e) {
      alert('Error al reiniciar cupos.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y Ordenamiento Dinámico
  const paquetesFiltrados = paquetes
    .filter(p => {
      const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.fecha_salida.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
      return matchSearch && matchEstado;
    })
    .sort((a, b) => {
      if (ordenamiento === 'precio_asc') return parseFloat(a.precio_persona) - parseFloat(b.precio_persona);
      if (ordenamiento === 'precio_desc') return parseFloat(b.precio_persona) - parseFloat(a.precio_persona);
      if (ordenamiento === 'fecha_salida') return String(a.fecha_salida).localeCompare(String(b.fecha_salida));
      if (ordenamiento === 'nombre') return a.titulo.localeCompare(b.titulo);
      return 0;
    });

  return (
    <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2">
            <Package size={26} className="text-[#ffb703]" /> Gestión de Paquetes Grupales ({paquetesFiltrados.length} / {paquetes.length})
          </h3>
          <p className="text-xs text-gray-300 mt-1">Crea, edita, filtra y administra los cupos e itinerarios de viajes</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleReiniciarCupos} 
            disabled={loading}
            className="bg-white/10 text-white hover:bg-white/20 text-xs font-bold py-2.5 px-4 rounded-2xl border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Reiniciar Cupos 100%
          </button>

          <button 
            onClick={() => setCrearModalOpen(true)} 
            className="btn-gold-3d text-xs font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus size={18} /> Publicar Nuevo Paquete
          </button>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Ordenamiento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-[#071521] p-4 rounded-2xl border border-white/10">
        
        {/* Campo de Búsqueda por Nombre / Destino / Fecha */}
        <div className="md:col-span-5 relative">
          <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por paquete, ciudad o fecha..."
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none"
          />
        </div>

        {/* Filtro por Ordenamiento (Precio Mayor/Menor, Nombre, Fecha) */}
        <div className="md:col-span-4 relative flex items-center gap-2">
          <ArrowUpDown size={16} className="text-[#ffb703] shrink-0" />
          <select
            value={ordenamiento}
            onChange={e => setOrdenamiento(e.target.value)}
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
          >
            <option value="reciente">Orden: Más Recientes Creados</option>
            <option value="precio_desc">💰 Precio: Mayor a Menor (S/ 📈)</option>
            <option value="precio_asc">💰 Precio: Menor a Mayor (S/ 📉)</option>
            <option value="nombre">🔤 Nombre: A - Z</option>
            <option value="fecha_salida">📅 Fecha de Salida</option>
          </select>
        </div>

        {/* Filtro por Estado (Abierto / Completo / Todos) */}
        <div className="md:col-span-3 relative flex items-center gap-2">
          <Filter size={16} className="text-[#1995ad] shrink-0" />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
          >
            <option value="todos">Estado: Todos los Estados</option>
            <option value="abierto">✅ Solo Abiertos</option>
            <option value="completo">🔴 Solo Completos</option>
            <option value="cerrado">🔒 Solo Cerrados</option>
          </select>
        </div>
      </div>

      {/* Tabla de Paquetes */}
      <div className="overflow-x-auto rounded-2xl border border-white/15">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-[#071521] text-xs uppercase text-gray-300 border-b border-white/15">
            <tr>
              <th className="p-4">Imagen</th>
              <th className="p-4">Título</th>
              <th className="p-4">Destino</th>
              <th className="p-4">Fecha Salida</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Cupos (Inscritos/Max)</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paquetesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                  No se encontraron paquetes que coincidan con la búsqueda "{searchTerm}".
                </td>
              </tr>
            ) : (
              paquetesFiltrados.map(pkg => {
                const inscritos = pkg.cupo_maximo - pkg.cupo_disponible;
                return (
                  <tr key={pkg.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <img 
                        src={pkg.imagen_portada} 
                        alt={pkg.titulo} 
                        className="w-16 h-12 rounded-xl object-cover border border-white/10" 
                        onError={(e) => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                      />
                    </td>
                    <td className="p-4 font-bold">{pkg.titulo}</td>
                    <td className="p-4 text-gray-300">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-[#1995ad]" /> {pkg.destino}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-300">
                      <span className="flex items-center gap-1"><Calendar size={14} className="text-[#ffb703]" /> {pkg.fecha_salida}</span>
                    </td>
                    <td className="p-4 font-bold text-[#ffb703]">S/ {parseFloat(pkg.precio_persona).toFixed(2)}</td>
                    <td className="p-4">
                      <span className="bg-black/40 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                        {inscritos} / {pkg.cupo_maximo}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setPaqueteAPdf(pkg)} 
                          className="bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#a0f0ff] hover:bg-[#1995ad] hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Ver y descargar reporte PDF del itinerario"
                        >
                          <FileText size={14} /> PDF
                        </button>

                        <button 
                          onClick={() => setPaqueteAEditar(pkg)} 
                          className="btn-gold-3d text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={14} /> Editar
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

      {/* Modales */}
      <CrearPaqueteModal 
        isOpen={crearModalOpen} 
        onClose={() => setCrearModalOpen(false)} 
        onPaqueteCreado={onActualizar} 
        userId={user?.id} 
      />

      <EditarPaqueteModal 
        paquete={paqueteAEditar} 
        isOpen={!!paqueteAEditar} 
        onClose={() => setPaqueteAEditar(null)} 
        onPaqueteActualizado={onActualizar} 
      />

      <ReportePdfModal 
        paquete={paqueteAPdf} 
        isOpen={!!paqueteAPdf} 
        onClose={() => setPaqueteAPdf(null)} 
      />
    </div>
  );
}
