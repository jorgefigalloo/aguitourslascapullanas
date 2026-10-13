import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, GraduationCap, Building2, UserCheck, MapPin, Calendar, Users, Eye, Sparkles } from 'lucide-react';

export function GaleriaCompletaAntecedentesModal({ viajes = [], isOpen, onClose, onVerDetalle }) {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  if (!isOpen) return null;

  const viajesFiltrados = viajes.filter(v => {
    const matchTipo = filtroTipo === 'todos' || v.cliente_tipo === filtroTipo;
    const matchBusqueda = !busqueda || 
      v.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.destino?.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusqueda;
  });

  const getBadge = (tipo) => {
    switch (tipo) {
      case 'colegio':
        return { label: 'Colegio', icon: GraduationCap, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'empresa':
        return { label: 'Empresa', icon: Building2, bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'organizacion':
        return { label: 'Organización', icon: Building2, bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: 'Grupo Privado', icon: UserCheck, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1724] border border-white/15 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0d233a] to-[#07131e]">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-[#ffb703]" /> Historial & Catálogo de Viajes Realizados
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Experiencias de delegaciones escolares, empresas y grupos que confiaron en nosotros
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 border-b border-white/10 bg-[#07111a] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por colegio, empresa, destino..."
              className="w-full bg-[#0b1724] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#ffb703] focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'colegio', label: 'Colegios' },
              { id: 'empresa', label: 'Empresas' },
              { id: 'grupo_privado', label: 'Grupos Privados' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroTipo(f.id)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  filtroTipo === f.id
                    ? 'bg-[#ffb703] text-black shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de Resultados */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {viajesFiltrados.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-xs">
              No se encontraron viajes que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {viajesFiltrados.map(v => {
                const badge = getBadge(v.cliente_tipo);
                const BadgeIcon = badge.icon;
                const fotosCount = 1 + (Array.isArray(v.galeria) ? v.galeria.length : 0);

                return (
                  <div
                    key={v.id}
                    onClick={() => onVerDetalle(v)}
                    className="group bg-[#07131e] border border-white/10 hover:border-[#1995ad]/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-black/40">
                        <img 
                          src={v.imagen_portada} 
                          alt={v.titulo} 
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 backdrop-blur-md ${badge.bg}`}>
                            <BadgeIcon size={12} /> {badge.label}
                          </span>
                        </div>
                        <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          📸 {fotosCount} fotos
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <p className="text-[11px] text-[#ffb703] font-bold truncate">
                          {v.nombre_cliente}
                        </p>
                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#1995ad] transition-colors">
                          {v.titulo}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                          <span className="flex items-center gap-1 truncate"><MapPin size={12} className="text-[#1995ad]" /> {v.destino}</span>
                          <span className="flex items-center gap-1 shrink-0"><Calendar size={12} className="text-gray-400" /> {v.fecha_viaje}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-emerald-400" /> {v.cantidad_pasajeros} pasajeros
                      </span>
                      <span className="text-[#1995ad] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ver Álbum <Eye size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#07111a] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar Catálogo
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
