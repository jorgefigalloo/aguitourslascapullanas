import React, { useState, useEffect } from 'react';
import { 
  Award, Plus, Search, Edit3, Trash2, Eye, Star, MapPin, 
  Calendar, Users, Building2, GraduationCap, UserCheck, Sparkles, 
  Image as ImageIcon, RefreshCw, CheckCircle2, Filter
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../context/ToastContext';
import { CrearViajeRealizadoModal } from './CrearViajeRealizadoModal';
import { EditarViajeRealizadoModal } from './EditarViajeRealizadoModal';
import { VerDetalleViajeModal } from '../../antecedentes/VerDetalleViajeModal';

export function AdminAntecedentesModule({ user, profile, tienePermiso }) {
  const toast = useToast();
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'destacados' | 'activos' | 'ocultos'

  // Modales
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [viajeAEditar, setViajeAEditar] = useState(null);
  const [viajeAPreview, setViajeAPreview] = useState(null);

  const can = (perm) => {
    if (!tienePermiso) return true;
    return tienePermiso(perm);
  };

  useEffect(() => {
    cargarViajes();
  }, []);

  const cargarViajes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viajes_realizados')
        .select('*')
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error al cargar viajes de la BD:', error.message);
      } else if (data) {
        setViajes(data);
      }
    } catch (e) {
      console.error('Error al consultar viajes realizados:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDestacado = async (viaje) => {
    if (!can('antecedentes_destacar')) {
      toast.warning('No tienes permiso para cambiar experiencias destacadas.');
      return;
    }
    const nuevoDestacado = !viaje.destacado;
    try {
      const { error } = await supabase
        .from('viajes_realizados')
        .update({ destacado: nuevoDestacado, updated_at: new Date().toISOString() })
        .eq('id', viaje.id);

      if (error) throw error;
      toast.success(nuevoDestacado ? 'Marcado como Destacado en Inicio ⭐' : 'Removido de Destacados');
      cargarViajes();
    } catch (err) {
      toast.error('Error al actualizar: ' + err.message);
    }
  };

  const handleToggleActivo = async (viaje) => {
    if (!can('antecedentes_bloquear')) {
      toast.warning('No tienes permiso para cambiar la visibilidad de experiencias.');
      return;
    }
    const nuevoActivo = !viaje.activo;
    try {
      const { error } = await supabase
        .from('viajes_realizados')
        .update({ activo: nuevoActivo, updated_at: new Date().toISOString() })
        .eq('id', viaje.id);

      if (error) throw error;
      toast.success(nuevoActivo ? 'Experiencia visible al público' : 'Experiencia ocultada del catálogo');
      cargarViajes();
    } catch (err) {
      toast.error('Error al cambiar visibilidad: ' + err.message);
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'colegio':
        return { label: 'Colegio / Promo', icon: GraduationCap, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'empresa':
        return { label: 'Empresa / Corporativo', icon: Building2, bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'organizacion':
        return { label: 'Organización', icon: Building2, bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'familiar':
        return { label: 'Familia', icon: Users, bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Grupo Privado', icon: UserCheck, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
  };

  // Filtrado reactivo
  const viajesFiltrados = viajes.filter(v => {
    const coincideBusqueda = 
      (v.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.nombre_cliente || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.destino || '').toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo = filtroTipo === 'todos' || v.cliente_tipo === filtroTipo;

    let coincideEstado = true;
    if (filtroEstado === 'destacados') coincideEstado = !!v.destacado;
    else if (filtroEstado === 'activos') coincideEstado = v.activo !== false;
    else if (filtroEstado === 'ocultos') coincideEstado = v.activo === false;

    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  // Métricas
  const totalPasajeros = viajes.reduce((acc, curr) => acc + (parseInt(curr.cantidad_pasajeros, 10) || 0), 0);
  const totalColegios = viajes.filter(v => v.cliente_tipo === 'colegio').length;
  const totalEmpresas = viajes.filter(v => v.cliente_tipo === 'empresa').length;

  return (
    <div className="bg-[#0d2538] border border-white/15 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6">
      
      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2.5">
            <Award size={28} className="text-[#ffb703]" /> 
            Viajes Realizados & Antecedentes ({viajes.length})
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            Gestiona los testimonios de promociones escolares, empresas y delegaciones con álbumes fotográficos en Cloudflare R2
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={cargarViajes}
            title="Recargar datos"
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {can('antecedentes_crear') && (
            <button 
              onClick={() => setCrearModalOpen(true)} 
              className="btn-gold-3d text-xs font-bold py-2.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer flex-1 md:flex-none"
            >
              <Plus size={18} /> Registrar Nueva Experiencia
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#071521] border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 border border-[#ffb703]/30 flex items-center justify-center text-[#ffb703]">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider m-0">Total Casos</p>
            <p className="text-xl font-bold text-white m-0">{viajes.length}</p>
          </div>
        </div>

        <div className="bg-[#071521] border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider m-0">Colegios / Promos</p>
            <p className="text-xl font-bold text-white m-0">{totalColegios}</p>
          </div>
        </div>

        <div className="bg-[#071521] border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider m-0">Empresas / Corp</p>
            <p className="text-xl font-bold text-white m-0">{totalEmpresas}</p>
          </div>
        </div>

        <div className="bg-[#071521] border border-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1995ad]/20 border border-[#1995ad]/30 flex items-center justify-center text-[#1995ad]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider m-0">Pasajeros Atendidos</p>
            <p className="text-xl font-bold text-white m-0">+{totalPasajeros.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#071521] p-3.5 rounded-2xl border border-white/10">
        
        {/* Input Buscador */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por título, institución o destino..."
            className="w-full bg-[#0d2538] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#1995ad]"
          />
        </div>

        {/* Filtros por Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'colegio', label: 'Colegios' },
            { id: 'empresa', label: 'Empresas' },
            { id: 'grupo_privado', label: 'Grupos Privados' },
            { id: 'familiar', label: 'Familias' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltroTipo(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filtroTipo === tab.id 
                  ? 'bg-[#1995ad] text-white shadow-md' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtro por Estado */}
        <div className="flex items-center gap-1.5">
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="bg-[#0d2538] border border-white/10 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="todos">Todos los Estados</option>
            <option value="destacados">⭐ Solo Destacados</option>
            <option value="activos">Visibles al Público</option>
            <option value="ocultos">Ocultos</option>
          </select>
        </div>
      </div>

      {/* Grid de Experiencias */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm flex items-center justify-center gap-3">
          <RefreshCw size={20} className="animate-spin text-[#1995ad]" /> Cargando antecedentes...
        </div>
      ) : viajesFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-[#071521] border border-white/10 rounded-3xl p-8">
          <Award size={40} className="text-gray-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No se encontraron viajes con estos filtros</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-5">
            Puedes registrar tu primera experiencia con colegios o empresas y subir las fotografías a Cloudflare R2.
          </p>
          <button
            onClick={() => setCrearModalOpen(true)}
            className="btn-gold-3d text-xs font-bold py-2.5 px-5 rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Registrar Nueva Experiencia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {viajesFiltrados.map(v => {
            const badge = getTipoBadge(v.cliente_tipo);
            const BadgeIcon = badge.icon;
            const galeriaFotos = Array.isArray(v.galeria) ? v.galeria : [];
            const isR2 = (v.imagen_portada || '').includes('r2.cloudflarestorage.com') || (v.imagen_portada || '').includes('.r2.dev');

            return (
              <div 
                key={v.id}
                className="bg-[#071521] border border-white/10 hover:border-[#1995ad]/50 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group transition-all"
              >
                {/* Portada & Badges */}
                <div className="h-48 relative overflow-hidden bg-black/40">
                  <img 
                    src={v.imagen_portada} 
                    alt={v.titulo} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                  />

                  {/* Badge Categoría */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`backdrop-blur-md border text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${badge.bg}`}>
                      <BadgeIcon size={12} /> {badge.label}
                    </span>
                    {isR2 && (
                      <span className="bg-[#f38020]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                        Cloudflare R2
                      </span>
                    )}
                  </div>

                  {/* Botón Destacado Rápido */}
                  <button
                    onClick={() => handleToggleDestacado(v)}
                    title={v.destacado ? 'Quitar de Destacados' : 'Marcar como Destacado en Inicio'}
                    className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                      v.destacado 
                        ? 'bg-[#ffb703] text-black shadow-lg shadow-[#ffb703]/40 scale-110' 
                        : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
                    }`}
                  >
                    <Star size={16} className={v.destacado ? 'fill-black' : ''} />
                  </button>

                  {/* Badge de cantidad de fotos */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <ImageIcon size={12} className="text-[#ffb703]" /> 
                    {1 + galeriaFotos.length} {1 + galeriaFotos.length === 1 ? 'Foto' : 'Fotos'}
                  </div>

                  {/* Badge de estado Inactivo si aplica */}
                  {!v.activo && (
                    <div className="absolute bottom-3 left-3 bg-red-600/90 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow">
                      Oculto del público
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base line-clamp-2 leading-snug group-hover:text-[#ffb703] transition-colors mb-2">
                      {v.titulo}
                    </h4>

                    <p className="text-xs text-[#1995ad] font-bold mb-3 flex items-center gap-1.5">
                      <Building2 size={14} className="shrink-0" /> {v.nombre_cliente}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={13} className="text-[#ffb703] shrink-0" />
                        <span className="truncate">{v.destino}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-[#1995ad] shrink-0" />
                        <span>{v.cantidad_pasajeros} viajeros</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-gray-400">
                        <Calendar size={13} className="text-gray-400 shrink-0" />
                        <span>{v.fecha_viaje || 'Fecha no especificada'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {v.descripcion}
                    </p>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setViajeAPreview(v)}
                      title="Vista Previa de cómo lo ve el cliente"
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => handleToggleActivo(v)}
                      title={v.activo ? 'Ocultar al público' : 'Publicar al público'}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        v.activo 
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    {can('antecedentes_editar') && (
                      <button
                        onClick={() => setViajeAEditar(v)}
                        className="flex-1 bg-white/10 hover:bg-[#1995ad] hover:text-white text-gray-200 border border-white/15 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Edit3 size={14} /> Gestionar / Fotos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear */}
      <CrearViajeRealizadoModal 
        isOpen={crearModalOpen}
        onClose={() => setCrearModalOpen(false)}
        onViajeCreado={cargarViajes}
        user={user}
      />

      {/* Modal para Editar */}
      <EditarViajeRealizadoModal
        isOpen={!!viajeAEditar}
        viaje={viajeAEditar}
        onClose={() => setViajeAEditar(null)}
        onViajeActualizado={cargarViajes}
        user={user}
        can={can}
      />

      {/* Modal Lightbox Preview */}
      <VerDetalleViajeModal
        isOpen={!!viajeAPreview}
        viaje={viajeAPreview}
        onClose={() => setViajeAPreview(null)}
      />
    </div>
  );
}
