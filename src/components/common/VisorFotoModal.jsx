import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ChevronLeft, ChevronRight, Maximize2, Minimize2, 
  ExternalLink, Copy, Check, Star, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function VisorFotoModal({ 
  isOpen, 
  onClose, 
  fotoActual, 
  listaFotos = [], 
  indiceInicial = 0,
  fotoPortadaActual = '',
  onSetPortada = null,
  titulo = 'Vista Previa de Imagen'
}) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);
  const [ajuste, setAjuste] = useState('contain'); // 'contain' para proporción predeterminada original | 'cover'
  const [zoomNivel, setZoomNivel] = useState(1);

  // Normalizar array de fotos
  const todasLasFotos = listaFotos.length > 0 
    ? listaFotos 
    : (fotoActual ? [fotoActual] : []);

  const [indiceActivo, setIndiceActivo] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (indiceInicial >= 0 && indiceInicial < todasLasFotos.length) {
        setIndiceActivo(indiceInicial);
      } else if (fotoActual) {
        const idx = todasLasFotos.indexOf(fotoActual);
        setIndiceActivo(idx >= 0 ? idx : 0);
      } else {
        setIndiceActivo(0);
      }
      setAjuste('contain');
      setZoomNivel(1);
      setCopiado(false);
    }
  }, [isOpen, fotoActual, indiceInicial, listaFotos.length]);

  // Soporte de atajos de teclado (ESC, Flechas)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && todasLasFotos.length > 1) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && todasLasFotos.length > 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, indiceActivo, todasLasFotos.length]);

  if (!isOpen || todasLasFotos.length === 0) return null;

  const urlFotoActual = todasLasFotos[indiceActivo];
  const esPortadaActual = fotoPortadaActual && fotoPortadaActual === urlFotoActual;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setIndiceActivo(prev => (prev === 0 ? todasLasFotos.length - 1 : prev - 1));
    setZoomNivel(1);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setIndiceActivo(prev => (prev === todasLasFotos.length - 1 ? 0 : prev + 1));
    setZoomNivel(1);
  };

  const handleCopiarEnlace = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(urlFotoActual);
      setCopiado(true);
      toast.success('Enlace de la imagen copiado al portapapeles.');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error('No se pudo copiar el enlace.');
    }
  };

  const handleEstablecerPortada = (e) => {
    e.stopPropagation();
    if (onSetPortada) {
      onSetPortada(urlFotoActual);
      toast.success('¡Foto asignada como portada predeterminada! ⭐', 'Portada Actualizada');
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[1000000] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[88vh] bg-[#07131e] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra Superior de Herramientas */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0d233a] via-[#091927] to-[#07131e] gap-2">
          
          {/* Título y Contador */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#ffb703] shrink-0">
              <ImageIcon size={16} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {titulo}
                </span>
                {todasLasFotos.length > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-gray-300 font-mono">
                    {indiceActivo + 1} / {todasLasFotos.length}
                  </span>
                )}
                {esPortadaActual && (
                  <span className="px-2 py-0.5 rounded-full bg-[#ffb703]/20 border border-[#ffb703]/50 text-[#ffb703] text-[10px] font-bold flex items-center gap-1">
                    <Star size={10} className="fill-[#ffb703]" /> Portada Predeterminada
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-mono truncate max-w-xs sm:max-w-md m-0">
                {urlFotoActual}
              </p>
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Botón: Establecer como Portada Predeterminada */}
            {onSetPortada && (
              <button
                type="button"
                onClick={handleEstablecerPortada}
                disabled={esPortadaActual}
                title={esPortadaActual ? 'Ya es la foto de portada predeterminada' : 'Establecer como portada principal del viaje'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  esPortadaActual 
                    ? 'bg-[#ffb703]/15 text-[#ffb703] border border-[#ffb703]/30 cursor-default opacity-80' 
                    : 'bg-[#ffb703] hover:bg-amber-400 text-black shadow-lg shadow-[#ffb703]/20'
                }`}
              >
                <Star size={13} className={esPortadaActual ? 'fill-[#ffb703]' : ''} />
                <span className="hidden sm:inline">
                  {esPortadaActual ? 'Portada Activa' : 'Hacer Portada Predeterminada'}
                </span>
              </button>
            )}

            {/* Alternar proporción predeterminada (contain) vs expandir (cover) */}
            <button
              type="button"
              onClick={() => setAjuste(prev => prev === 'contain' ? 'cover' : 'contain')}
              className="p-2 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
              title={ajuste === 'contain' ? 'Proporción predeterminada (Completa sin recortar)' : 'Llenar recuadro (Recortar)'}
            >
              {ajuste === 'contain' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>

            {/* Abrir en pestaña nueva */}
            <a
              href={urlFotoActual}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
              title="Abrir imagen original en nueva pestaña"
            >
              <ExternalLink size={16} />
            </a>

            {/* Copiar Enlace */}
            <button
              type="button"
              onClick={handleCopiarEnlace}
              className="p-2 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
              title="Copiar enlace de la foto"
            >
              {copiado ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>

            {/* Cerrar Visor */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white bg-red-600/20 hover:bg-red-600 border border-red-500/30 rounded-xl transition-all cursor-pointer ml-1"
              title="Cerrar visor (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Lienzo Principal de Visualización */}
        <div className="relative flex-1 bg-[#030a10] overflow-hidden flex items-center justify-center p-3 sm:p-6 group select-none">
          
          {/* Fondo blur atmosférico para fotografías en modo contain */}
          {ajuste === 'contain' && (
            <img 
              src={urlFotoActual} 
              alt="" 
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-125 pointer-events-none"
            />
          )}

          {/* Imagen Interactiva */}
          <img 
            src={urlFotoActual} 
            alt={titulo} 
            style={{ transform: `scale(${zoomNivel})` }}
            className={`relative z-10 max-w-full max-h-full rounded-xl transition-all duration-300 shadow-2xl ${
              ajuste === 'contain' 
                ? 'object-contain' 
                : 'object-cover w-full h-full'
            }`}
            onError={(e) => { 
              e.target.src = '/images/ciudades/fondo-destinos1.png'; 
            }}
          />

          {/* Botón Anterior */}
          {todasLasFotos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105 cursor-pointer"
              title="Foto anterior (←)"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Botón Siguiente */}
          {todasLasFotos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105 cursor-pointer"
              title="Foto siguiente (→)"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Control Flotante de Zoom */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/75 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setZoomNivel(prev => Math.max(0.5, prev - 0.25))}
              className="text-xs text-gray-300 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
              title="Reducir zoom"
            >
              -
            </button>
            <span className="text-[11px] font-mono text-white/90 min-w-10 text-center">
              {Math.round(zoomNivel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomNivel(prev => Math.min(2.5, prev + 0.25))}
              className="text-xs text-gray-300 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
              title="Aumentar zoom"
            >
              +
            </button>
            {zoomNivel !== 1 && (
              <button
                type="button"
                onClick={() => setZoomNivel(1)}
                className="text-[10px] text-[#ffb703] hover:underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tira Inferior de Miniaturas si hay múltiples fotos */}
        {todasLasFotos.length > 1 && (
          <div className="p-3 bg-[#061019] border-t border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {todasLasFotos.map((url, idx) => {
              const esActiva = idx === indiceActivo;
              const esPortada = fotoPortadaActual && fotoPortadaActual === url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIndiceActivo(idx);
                    setZoomNivel(1);
                  }}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    esActiva 
                      ? 'border-[#ffb703] scale-105 shadow-md shadow-[#ffb703]/30' 
                      : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/40'
                  }`}
                >
                  <img 
                    src={url} 
                    alt={`Miniatura ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                  />
                  {esPortada && (
                    <div className="absolute top-0.5 right-0.5 bg-[#ffb703] text-black p-0.5 rounded-full shadow">
                      <Star size={8} className="fill-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
