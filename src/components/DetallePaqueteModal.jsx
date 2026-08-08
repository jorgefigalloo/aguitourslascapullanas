import React, { useState } from 'react';
import { X, Calendar, MapPin, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function DetallePaqueteModal({ paquete, isOpen, onClose, onUnirme }) {
  const [activeDay, setActiveDay] = useState(0);

  if (!isOpen || !paquete) return null;

  const itinerarioMuestra = paquete.itinerario && paquete.itinerario.length > 0 ? paquete.itinerario : [
    { 
      dia: 'D1', 
      titulo: 'Cusco – Tinki – Upis', 
      sub: 'Distancia: 12km • Tiempo: 5h',
      desc: 'Salimos temprano de Cusco rumbo al pueblo de Tinki. Iniciamos nuestra caminata ascendiendo gradualmente hacia el campamento de Upis a los pies del imponente glaciar del Ausangate.' 
    },
    { 
      dia: 'D2', 
      titulo: 'Upis – Paso Arapa – Laguna Pucacocha', 
      sub: 'Distancia: 15km • Tiempo: 7h',
      desc: 'Afrontamos el Paso Arapa (4,850m) disfrutando vistas espectaculares del desierto andino en contraste con el hielo y acampamos junto a la hermosa laguna Pucacocha.' 
    },
    { 
      dia: 'D3', 
      titulo: 'Pucacocha – Paso Palomani – Chillca', 
      sub: 'Distancia: 14km • Tiempo: 8h',
      desc: 'El día más desafiante. Cruzamos el Paso Palomani (5,200m), el punto más alto del trek con vistas panorámicas inolvidables.' 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Botón cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Hero Modal Header con Imagen Cinematográfica */}
        <div className="relative h-[320px] w-full overflow-hidden">
          <img src={paquete.imagen_portada} alt={paquete.titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2538] via-[#0d2538]/40 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 z-10">
            {/* Experience Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm text-xs font-bold border border-white/30">
                5 DÍAS / 4 NOCHES
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm text-xs font-bold border border-white/30">
                TREKKING
              </span>
              <span className="px-3 py-1 rounded-full bg-[#ffb703] text-black text-xs font-extrabold">
                GRUPO REDUCIDO
              </span>
            </div>

            <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-2">{paquete.titulo}</h2>
            <div className="flex items-center gap-2 text-[#1995ad] font-semibold text-sm">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>{paquete.destino.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {/* Card Flotante de Precio y Cupos */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">PRECIO POR PERSONA</span>
              <span className="font-headline text-3xl font-bold text-[#ffb703]">S/ {paquete.precio_persona.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">FECHA DE SALIDA</span>
              <span className="text-sm font-bold text-white">{paquete.fecha_salida}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">CUPOS DISPONIBLES</span>
              <span className="text-sm font-bold text-[#1995ad]">{paquete.cupo_disponible} de {paquete.cupo_maximo}</span>
            </div>
            <button 
              onClick={() => { onUnirme(paquete); onClose(); }} 
              className="btn-gold-3d text-sm font-bold px-6 py-3 rounded-full"
            >
              ¡Reservar mi Cupo!
            </button>
          </div>

          {/* Descripción */}
          <section className="mb-8">
            <h3 className="font-headline text-2xl font-bold text-white mb-3">Sobre esta expedición</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {paquete.descripcion}
            </p>
          </section>

          {/* Highlights Grid (Bento style) */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <span className="material-symbols-outlined text-[#1995ad] text-3xl mb-1">landscape</span>
              <div className="text-xs text-gray-400 uppercase font-bold">Altitud Máx.</div>
              <div className="text-white font-bold text-sm">5,200m</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <span className="material-symbols-outlined text-[#1995ad] text-3xl mb-1">hiking</span>
              <div className="text-xs text-gray-400 uppercase font-bold">Dificultad</div>
              <div className="text-white font-bold text-sm">Desafiante</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <span className="material-symbols-outlined text-[#1995ad] text-3xl mb-1">wb_sunny</span>
              <div className="text-xs text-gray-400 uppercase font-bold">Clima</div>
              <div className="text-white font-bold text-sm">Frío / Seco</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <span className="material-symbols-outlined text-[#1995ad] text-3xl mb-1">camping</span>
              <div className="text-xs text-gray-400 uppercase font-bold">Alojamiento</div>
              <div className="text-white font-bold text-sm">Campamento</div>
            </div>
          </section>

          {/* Accordion de Itinerario */}
          <section>
            <h3 className="font-headline text-2xl font-bold text-white mb-4">Itinerario Día a Día</h3>
            <div className="flex flex-col gap-3">
              {itinerarioMuestra.map((item, idx) => (
                <div key={idx} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                  <button 
                    onClick={() => setActiveDay(activeDay === idx ? -1 : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1995ad] text-white flex items-center justify-center font-bold text-sm">
                        {item.dia}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm md:text-base">{item.titulo}</h4>
                        {item.sub && <span className="text-xs text-gray-400">{item.sub}</span>}
                      </div>
                    </div>
                    {activeDay === idx ? <ChevronUp size={20} color="#1995ad" /> : <ChevronDown size={20} color="#aaa" />}
                  </button>

                  {activeDay === idx && (
                    <div className="p-4 pt-0 text-sm text-gray-300 border-t border-white/10 mt-2 leading-relaxed">
                      {item.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
