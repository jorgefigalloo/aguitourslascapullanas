import React, { useState } from 'react';
import { Package, Plus, RefreshCw, Edit3, FileText, Calendar, MapPin, Users, Search, ArrowUpDown, Filter, Eye, EyeOff, Calculator } from 'lucide-react';
import { CrearPaqueteModal } from '../CrearPaqueteModal';
import { EditarPaqueteModal } from '../EditarPaqueteModal';
import { ReportePdfModal } from '../paquetes/ReportePdfModal';
import { VerInscritosModal } from '../paquetes/VerInscritosModal';
import { RecalcularTarifaModal } from '../paquetes/RecalcularTarifaModal';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function AdminPaquetesModule({ paquetes = [], user, profile, onActualizar }) {
  const toast = useToast();
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [paqueteAEditar, setPaqueteAEditar] = useState(null);
  const [paqueteAPdf, setPaqueteAPdf] = useState(null);
  const [paqueteAInscritos, setPaqueteAInscritos] = useState(null);
  const [paqueteARecalcular, setPaqueteARecalcular] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inscritosCounts, setInscritosCounts] = useState({});

  // Estados de Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('reciente');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  React.useEffect(() => {
    cargarContadoresInscritos();
  }, [paquetes]);

  const cargarContadoresInscritos = async () => {
    try {
      const counts = {};
      paquetes.forEach(p => { counts[p.id] = 0; });

      const { data } = await supabase
        .from('inscripciones_grupo')
        .select('paquete_id, cantidad_personas, estado')
        .in('estado', ['confirmado', 'pendiente', 'pendiente_confirmacion_tarifa']);

      if (data) {
        data.forEach(item => {
          if (item.paquete_id && counts[item.paquete_id] !== undefined) {
            counts[item.paquete_id] += (item.cantidad_personas || 1);
          }
        });
      }
      setInscritosCounts(counts);
    } catch (e) {
      console.log('Error al cargar contadores de inscritos:', e);
    }
  };

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
      toast.success('Cupos de todos los paquetes reiniciados al 100% exitosamente.', 'Cupos Reiniciados');
      onActualizar();
    } catch (e) {
      toast.error('Error al reiniciar cupos: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibilidadOculto = async (pkg) => {
    const esOculto = pkg.estado === 'oculto';
    const nuevoEstado = esOculto ? 'abierto' : 'oculto';

    try {
      const { error } = await supabase
        .from('paquetes_grupales')
        .update({ estado: nuevoEstado })
        .eq('id', pkg.id);

      if (error) throw error;

      if (nuevoEstado === 'oculto') {
        toast.info(`El paquete "${pkg.titulo}" fue ocultado del sitio web público (Borrador).`, 'Paquete Ocultado');
      } else {
        toast.success(`El paquete "${pkg.titulo}" fue publicado en la web pública.`, 'Paquete Publicado');
      }
      onActualizar();
    } catch (err) {
      toast.error('Error al cambiar estado del paquete: ' + err.message);
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
      if (ordenamiento === 'reciente') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (ordenamiento === 'precio-asc') return parseFloat(a.precio_persona) - parseFloat(b.precio_persona);
      if (ordenamiento === 'precio-desc') return parseFloat(b.precio_persona) - parseFloat(a.precio_persona);
      if (ordenamiento === 'nombre') return a.titulo.localeCompare(b.titulo);
      if (ordenamiento === 'fecha') return new Date(a.fecha_salida) - new Date(b.fecha_salida);
      return 0;
    });

  return (
    <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2">
            <Package size={26} className="text-[#1995ad]" /> Gestión de Paquetes Grupales ({paquetesFiltrados.length} / {paquetes.length})
          </h3>
          <p className="text-xs text-gray-300 mt-1">Crea, edita, filtra, publica o deshabilita los cupos e itinerarios de viajes</p>
        </div>

        <div className="flex flex-wrap gap-3">
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-[#071521] p-4 rounded-2xl border border-white/10">
        <div className="md:col-span-6 relative">
          <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por paquete, ciudad o fecha..."
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none"
          />
        </div>

        <div className="md:col-span-3 relative flex items-center gap-2">
          <ArrowUpDown size={16} className="text-[#1995ad] shrink-0" />
          <select
            value={ordenamiento}
            onChange={e => setOrdenamiento(e.target.value)}
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
          >
            <option value="reciente">Orden: Más Recientes Creados</option>
            <option value="precio-desc">💰 Precio: Mayor a Menor (S/ 📈)</option>
            <option value="precio-asc">💰 Precio: Menor a Mayor (S/ 📉)</option>
            <option value="nombre">🔤 Nombre: A - Z</option>
            <option value="fecha">📅 Fecha de Salida</option>
          </select>
        </div>

        <div className="md:col-span-3 relative flex items-center gap-2">
          <Filter size={16} className="text-[#ffb703] shrink-0" />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
          >
            <option value="todos">Estado: Todos los Estados</option>
            <option value="abierto">✅ Solo Abiertos</option>
            <option value="completo">🔴 Solo Completos</option>
            <option value="cerrado">🔒 Solo Cerrados</option>
            <option value="oculto">👁️ Solo Ocultos (Borradores)</option>
          </select>
        </div>
      </div>

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
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paquetesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400 text-xs">
                  No se encontraron paquetes que coincidan con la búsqueda "{searchTerm}".
                </td>
              </tr>
            ) : (
              paquetesFiltrados.map(pkg => {
                const inscritosReal = inscritosCounts[pkg.id] ?? Math.max(0, pkg.cupo_maximo - pkg.cupo_disponible);
                const esOculto = pkg.estado === 'oculto';
                return (
                  <tr key={pkg.id} className={`hover:bg-white/5 transition-colors ${esOculto ? 'opacity-60 bg-black/20' : ''}`}>
                    <td className="p-4">
                      <img 
                        src={pkg.imagen_portada} 
                        alt={pkg.titulo} 
                        className="w-16 h-12 rounded-xl object-cover border border-white/10" 
                        onError={(e) => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                      />
                    </td>
                    <td className="p-4 font-bold flex flex-col">
                      <span>{pkg.titulo}</span>
                      {esOculto && (
                        <span className="text-[10px] text-amber-400 font-normal flex items-center gap-1">
                          <EyeOff size={10} /> Oculto del público
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-300">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-[#1995ad]" /> {pkg.destino}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-300">
                      <span className="flex items-center gap-1"><Calendar size={14} className="text-[#ffb703]" /> {pkg.fecha_salida}</span>
                    </td>
                    <td className="p-4 font-bold text-[#ffb703]">S/ {parseFloat(pkg.precio_persona).toFixed(2)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setPaqueteAInscritos(pkg)}
                        className="bg-black/40 hover:bg-[#1995ad]/30 border border-white/15 hover:border-[#1995ad]/60 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md group"
                        title="Ver nómina completa de clientes inscritos en este viaje"
                      >
                        <Users size={13} className="text-[#ffb703] group-hover:scale-110 transition-transform" />
                        <span>{inscritosReal} / {pkg.cupo_maximo}</span>
                        <span className="text-[10px] text-[#1995ad] font-normal underline ml-0.5">Ver</span>
                      </button>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibilidadOculto(pkg)}
                        className={`text-[10px] uppercase font-extrabold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                          esOculto 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-black' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-amber-500/30'
                        }`}
                        title={esOculto ? "Hacer visible y publicar en la web pública" : "Ocultar del catálogo público (Guardar como borrador)"}
                      >
                        {esOculto ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{esOculto ? 'Oculto' : 'Publicado'}</span>
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button 
                          onClick={() => setPaqueteARecalcular(pkg)} 
                          className="bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Recalcular tarifa por persona y notificar ajuste a los clientes inscritos"
                        >
                          <Calculator size={14} /> Recalcular
                        </button>

                        <button 
                          onClick={() => setPaqueteAPdf(pkg)} 
                          className="bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#a0f0ff] hover:bg-[#1995ad] hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Ver y descargar reporte PDF del itinerario del paquete"
                        >
                          <FileText size={14} /> PDF
                        </button>

                        <button 
                          onClick={() => setPaqueteAEditar(pkg)} 
                          className="bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Editar detalles, itinerario o eliminar este paquete"
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

      <CrearPaqueteModal isOpen={crearModalOpen} onClose={() => setCrearModalOpen(false)} onPaqueteCreado={onActualizar} userId={user?.id} />
      <EditarPaqueteModal paquete={paqueteAEditar} isOpen={!!paqueteAEditar} onClose={() => setPaqueteAEditar(null)} onPaqueteActualizado={onActualizar} />
      <ReportePdfModal paquete={paqueteAPdf} isOpen={!!paqueteAPdf} onClose={() => setPaqueteAPdf(null)} />
      <VerInscritosModal paquete={paqueteAInscritos} isOpen={!!paqueteAInscritos} onClose={() => setPaqueteAInscritos(null)} />
      <RecalcularTarifaModal paquete={paqueteARecalcular} isOpen={!!paqueteARecalcular} onClose={() => setPaqueteARecalcular(null)} onTarifaRecalculada={onActualizar} />
    </div>
  );
}
