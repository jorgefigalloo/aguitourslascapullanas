import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Building2, UserCheck, MapPin, Calendar, 
  Users, Eye, Sparkles, ArrowRight, Camera, CheckCircle2, Award 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VerDetalleViajeModal } from './VerDetalleViajeModal';
import { GaleriaCompletaAntecedentesModal } from './GaleriaCompletaAntecedentesModal';

const VIAJES_FALLBACK = [
  {
    id: '1',
    titulo: 'Viaje de Promoción Bodas de Plata - Cusco Mágico & Machu Picchu',
    cliente_tipo: 'colegio',
    nombre_cliente: 'Colegio San Ignacio de Loyola',
    destino: 'Cusco & Valle Sagrado, Perú',
    fecha_viaje: 'Noviembre 2025',
    cantidad_pasajeros: 42,
    descripcion: 'Experiencia inolvidable para 42 estudiantes y profesores con guiado privado, tren panorámico a Aguas Calientes, hoteles 4 estrellas y seguridad integral 24 horas.',
    imagen_portada: '/images/ciudades/nacionales/cuzco.png',
    galeria: ['/images/ciudades/nacionales/cuzco.png', '/images/ciudades/fondo-destinos1.png'],
    destacado: true
  },
  {
    id: '2',
    titulo: 'Convención Anual & Team Building Playas del Norte',
    cliente_tipo: 'empresa',
    nombre_cliente: 'Corporación Backus & Johnston',
    destino: 'Máncora & Punta Sal, Perú',
    fecha_viaje: 'Diciembre 2025',
    cantidad_pasajeros: 65,
    descripcion: 'Evento corporativo de integración con actividades de liderazgo en playa, avistamiento de fauna marina, cena buffet gourmet y hospedaje frente al mar.',
    imagen_portada: '/images/ciudades/fondo-destinos1.png',
    galeria: ['/images/ciudades/fondo-destinos1.png', '/images/capullanas1.jpg'],
    destacado: true
  },
  {
    id: '3',
    titulo: 'Expedición Aventura & Naturaleza en Tarapoto',
    cliente_tipo: 'grupo_privado',
    nombre_cliente: 'Delegación Médica Regional Piura',
    destino: 'Tarapoto & Laguna Azul, Perú',
    fecha_viaje: 'Enero 2026',
    cantidad_pasajeros: 28,
    descripcion: 'Circuito exclusivo de relajación y ecoturismo: cataratas de Ahuashiyacu, navegación en Laguna Azul con almuerzo típico amazónico y transporte privado climatizado.',
    imagen_portada: '/images/ciudades/nacionales/tarapoto.png',
    galeria: ['/images/ciudades/nacionales/tarapoto.png', '/images/fondo-turismo.png'],
    destacado: true
  }
];

export function ViajesRealizadosSection() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'colegio' | 'empresa' | 'grupo_privado'
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [modalCompletoOpen, setModalCompletoOpen] = useState(false);

  useEffect(() => {
    cargarViajes();
  }, []);

  const cargarViajes = async () => {
    try {
      const { data, error } = await supabase
        .from('viajes_realizados')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setViajes(data);
      } else {
        setViajes(VIAJES_FALLBACK);
      }
    } catch (e) {
      console.warn('Cargando fallback de viajes realizados:', e);
      setViajes(VIAJES_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'colegio':
        return { label: 'Colegio / Promoción', icon: GraduationCap, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'empresa':
        return { label: 'Empresa / Corporativo', icon: Building2, bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'organizacion':
        return { label: 'Organización', icon: Building2, bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: 'Grupo Privado', icon: UserCheck, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
  };

  const viajesFiltrados = viajes.filter(v => {
    if (filtroTipo === 'todos') return true;
    return v.cliente_tipo === filtroTipo;
  });

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1280px] mx-auto w-full relative">
      
      {/* Encabezado de la Sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <p className="font-label-sm text-xs text-[#ffb703] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5">
            <Award size={16} /> Experiencias Comprobadas & Antecedentes
          </p>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Nuestros Viajes Realizados
          </h2>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            La confianza de colegios, delegaciones corporativas y familias es nuestro mayor respaldo. Descubre momentos reales y testimonios de quienes ya viajaron con nosotros.
          </p>
        </div>

        {/* Botón Ver Catálogo Completo */}
        <button
          onClick={() => setModalCompletoOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-lg shrink-0 self-start md:self-auto"
        >
          <Camera size={16} className="text-[#ffb703]" />
          Ver Catálogo Completo ({viajes.length})
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Métricas de Confianza */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#07131e]/90 border border-white/10 rounded-2xl p-4 text-center">
          <span className="text-2xl md:text-3xl font-extrabold text-[#ffb703] font-headline block">+1,500</span>
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Viajeros Felices</span>
        </div>
        <div className="bg-[#07131e]/90 border border-white/10 rounded-2xl p-4 text-center">
          <span className="text-2xl md:text-3xl font-extrabold text-[#1995ad] font-headline block">+45</span>
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Promociones Escolares</span>
        </div>
        <div className="bg-[#07131e]/90 border border-white/10 rounded-2xl p-4 text-center">
          <span className="text-2xl md:text-3xl font-extrabold text-purple-400 font-headline block">+30</span>
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Eventos Corporativos</span>
        </div>
        <div className="bg-[#07131e]/90 border border-white/10 rounded-2xl p-4 text-center">
          <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-headline block">100%</span>
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Seguridad y Respaldo</span>
        </div>
      </div>

      {/* Pestañas de Filtro por Categoría */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'todos', label: '🌟 Todos los Viajes' },
          { id: 'colegio', label: '🎓 Colegios & Promociones' },
          { id: 'empresa', label: '🏢 Empresas & Corporativo' },
          { id: 'grupo_privado', label: '👥 Grupos Privados & VIP' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltroTipo(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filtroTipo === cat.id
                ? 'bg-[#ffb703] text-black shadow-lg shadow-[#ffb703]/20 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grilla Bento / Cards de Viajes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {viajesFiltrados.slice(0, 6).map((viaje) => {
          const badge = getTipoBadge(viaje.cliente_tipo);
          const BadgeIcon = badge.icon;
          const totalFotos = 1 + (Array.isArray(viaje.galeria) ? viaje.galeria.length : 0);

          return (
            <article
              key={viaje.id}
              onClick={() => setViajeSeleccionado(viaje)}
              className="group bg-[#0b1724] border border-white/10 hover:border-[#1995ad]/60 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div>
                {/* Portada */}
                <div className="relative h-56 w-full overflow-hidden bg-black/50">
                  <img
                    src={viaje.imagen_portada}
                    alt={viaje.titulo}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1724] via-transparent to-black/30"></div>
                  
                  {/* Badge Categoría */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 shadow-md ${badge.bg}`}>
                      <BadgeIcon size={13} /> {badge.label}
                    </span>
                  </div>

                  {/* Contador de Fotos */}
                  <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                    <Camera size={13} className="text-[#ffb703]" /> {totalFotos} fotos
                  </span>
                </div>

                {/* Contenido */}
                <div className="p-5 space-y-2.5">
                  <p className="text-xs font-bold text-[#ffb703] tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> {viaje.nombre_cliente}
                  </p>
                  
                  <h3 className="font-headline text-lg font-bold text-white group-hover:text-[#1995ad] transition-colors line-clamp-2 leading-snug">
                    {viaje.titulo}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1 truncate"><MapPin size={13} className="text-[#1995ad]" /> {viaje.destino}</span>
                    <span className="flex items-center gap-1 shrink-0"><Calendar size={13} className="text-gray-400" /> {viaje.fecha_viaje}</span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed pt-1">
                    {viaje.descripcion}
                  </p>
                </div>
              </div>

              {/* Footer de Tarjeta */}
              <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 mt-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users size={14} className="text-emerald-400" /> {viaje.cantidad_pasajeros} Pasajeros
                </span>
                <span className="text-[#1995ad] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver Álbum <ArrowRight size={14} />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal Lightbox de Álbum y Fotos */}
      <VerDetalleViajeModal
        viaje={viajeSeleccionado}
        isOpen={!!viajeSeleccionado}
        onClose={() => setViajeSeleccionado(null)}
      />

      {/* Modal Catálogo Completo */}
      <GaleriaCompletaAntecedentesModal
        viajes={viajes}
        isOpen={modalCompletoOpen}
        onClose={() => setModalCompletoOpen(false)}
        onVerDetalle={(v) => {
          setModalCompletoOpen(false);
          setViajeSeleccionado(v);
        }}
      />
    </section>
  );
}
