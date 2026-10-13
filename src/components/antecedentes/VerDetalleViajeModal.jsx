import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Users, ChevronLeft, ChevronRight, Sparkles, Building2, GraduationCap, UserCheck, Share2 } from 'lucide-react';

export function VerDetalleViajeModal({ viaje, isOpen, onClose }) {
  if (!isOpen || !viaje) return null;

  // Combinar foto de portada y galería de fotos
  const todasLasFotos = [
    viaje.imagen_portada,
    ...(Array.isArray(viaje.galeria) ? viaje.galeria : [])
  ].filter(Boolean);

  const [fotoActivaIdx, setFotoActivaIdx] = useState(0);
  const [ajusteFoto, setAjusteFoto] = useState('contain'); // 'contain' para ver completa | 'cover' para llenar marco

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'colegio':
        return { label: 'Colegio / Promoción', icon: GraduationCap, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'empresa':
        return { label: 'Empresa / Corporativo', icon: Building2, bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'organizacion':
        return { label: 'Organización / Institución', icon: Building2, bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: 'Grupo Privado / VIP', icon: UserCheck, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
  };

  const badgeInfo = getTipoBadge(viaje.cliente_tipo);
  const BadgeIcon = badgeInfo.icon;

  const handlePrev = (e) => {
    e.stopPropagation();
    setFotoActivaIdx(prev => (prev === 0 ? todasLasFotos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setFotoActivaIdx(prev => (prev === todasLasFotos.length - 1 ? 0 : prev + 1));
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1724] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0d233a] to-[#07131e]">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shrink-0 ${badgeInfo.bg}`}>
              <BadgeIcon size={14} /> {badgeInfo.label}
            </span>
            <div className="truncate">
              <h3 className="text-base sm:text-lg font-bold text-white truncate" title={viaje.titulo}>
                {viaje.titulo}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {viaje.nombre_cliente}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Visor de Fotos */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* Foto Principal con Controles de Carrusel y Ajuste Completo */}
          <div className="relative h-72 sm:h-[450px] w-full rounded-2xl overflow-hidden bg-[#030a10] border border-white/10 group flex items-center justify-center">
            
            {/* Fondo difuminado para armonía visual al ajustar tamaño completo */}
            {ajusteFoto === 'contain' && (
              <img 
                src={todasLasFotos[fotoActivaIdx] || viaje.imagen_portada} 
                alt="" 
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
              />
            )}

            <img 
              src={todasLasFotos[fotoActivaIdx] || viaje.imagen_portada} 
              alt={viaje.titulo} 
              className={`relative z-10 w-full h-full transition-all duration-300 ${
                ajusteFoto === 'contain' ? 'object-contain' : 'object-cover'
              }`}
            />

            {/* Selector de modo de visualización: Completa vs Llenar marco */}
            <button
              onClick={() => setAjusteFoto(prev => prev === 'contain' ? 'cover' : 'contain')}
              className="absolute top-3 right-3 z-20 bg-black/75 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
              title="Alternar entre ver foto completa o recortar llenando recuadro"
            >
              {ajusteFoto === 'contain' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#1995ad] inline-block animate-pulse"></span>
                  <span>Ver Completa (Sin Recorte)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#ffb703] inline-block"></span>
                  <span>Llenar Pantalla</span>
                </>
              )}
            </button>

            {/* Flechas de Navegación si hay más de 1 foto */}
            {todasLasFotos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/70 hover:bg-black text-white rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg"
                  title="Foto anterior"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/70 hover:bg-black text-white rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg"
                  title="Foto siguiente"
                >
                  <ChevronRight size={22} />
                </button>
                <span className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg border border-white/10">
                  {fotoActivaIdx + 1} / {todasLasFotos.length}
                </span>
              </>
            )}
          </div>

          {/* Carrusel de Miniaturas */}
          {todasLasFotos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {todasLasFotos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setFotoActivaIdx(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    fotoActivaIdx === idx ? 'border-[#ffb703] ring-2 ring-[#ffb703]/50 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Ficha Informativa del Viaje */}
          <div className="bg-[#07131e] border border-white/10 rounded-2xl p-5 space-y-4">
            
            {/* Metadatos Rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2.5">
                <MapPin size={18} className="text-[#1995ad] shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Destino</span>
                  <span className="font-bold text-white">{viaje.destino}</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2.5">
                <Calendar size={18} className="text-[#ffb703] shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Fecha</span>
                  <span className="font-bold text-white">{viaje.fecha_viaje}</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Users size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Delegación</span>
                  <span className="font-bold text-white">{viaje.cantidad_pasajeros} Viajeros</span>
                </div>
              </div>
            </div>

            {/* Reseña / Experiencia */}
            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#ffb703] mb-2 flex items-center gap-1.5">
                <Sparkles size={14} /> Reseña de la Experiencia
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {viaje.descripcion}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#07111a] flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Viaje verificado por <span className="font-bold text-white">Aguitours Las Capullanas</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
