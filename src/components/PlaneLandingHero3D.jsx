import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Compass, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function PlaneLandingHero3D({ onExplorarGrupales, onExplorarDestinos }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cmsData, setCmsData] = useState({
    titulo: 'Explora el Mundo con Aguitours Las Capullanas',
    subtitulo: 'Vive la verdadera experiencia de viajes en grupos de turismo inmersivos con diseño 3D',
    imagen_url: '/images/ciudades/fondo-destinos1.png'
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 400, 1); // 0 a 1 en los primeros 400px de scroll
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    cargarCmsHero();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cargarCmsHero = async () => {
    try {
      const { data } = await supabase.from('cms_contenido').select('*').eq('clave_seccion', 'hero_inicio').single();
      if (data) setCmsData(data);
    } catch (e) { console.log(e); }
  };

  // Cálculo de transformación 3D del avión acercándose a la cámara (Aterrizaje)
  const planeScale = 0.5 + scrollProgress * 2.8; // Se agranda de 0.5x a 3.3x
  const planeY = scrollProgress * 220; // Baja hacia el centro
  const planeOpacity = 1 - Math.max((scrollProgress - 0.8) * 5, 0); // Desaparece al pasar la cámara
  const bgScale = 1 + scrollProgress * 0.15;

  return (
    <div style={{ position: 'relative', height: '120vh', background: '#071521', overflow: 'hidden' }}>
      {/* Fondo de Cielo & Paisaje Parallax */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
          backgroundImage: `url(${cmsData.imagen_url || '/images/ciudades/fondo-destinos1.png'})`,
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4,
          transform: `scale(${bgScale})`, transition: 'transform 0.1s linear', zIndex: 1
        }}
      />

      {/* Capa de Nubes Flotantes Parallax */}
      <div style={{
        position: 'fixed', top: '10%', left: 0, width: '100%', height: '80vh',
        background: 'radial-gradient(ellipse at center, rgba(25,149,173,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 2
      }} />

      {/* Avión 3D Aterrizando / Acercándose con Scroll */}
      <div 
        style={{
          position: 'fixed', top: '15%', left: '50%',
          transform: `translate(-50%, ${planeY}px) scale(${planeScale}) rotateX(${15 - scrollProgress * 20}deg)`,
          opacity: planeOpacity, transition: 'transform 0.05s linear, opacity 0.1s ease',
          zIndex: 10, pointerEvents: 'none', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.8))'
        }}
      >
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '380px', height: '240px' }}>
          <g filter="url(#glow)">
            <path d="M495.2 240.8L350.5 106.6C341.3 98 329.1 93.3 316.5 93.3H264.4C255.4 93.3 248.8 101.6 250.7 110.4L282.8 256H143.6L102.7 197.6C98.4 191.5 91.4 187.9 83.9 187.9H44C32.9 187.9 24.8 198.1 27.2 208.9L44.8 288L27.2 367.1C24.8 377.9 32.9 388.1 44 388.1H83.9C91.4 388.1 98.4 384.5 102.7 378.4L143.6 320H282.8L250.7 465.6C248.8 474.4 255.4 482.7 264.4 482.7H316.5C329.1 482.7 341.3 478 350.5 469.4L495.2 335.2C516.3 315.6 516.3 260.4 495.2 240.8Z" fill="url(#plane-metal)" />
            <path d="M282.8 256H495.2C516.3 275.6 516.3 300 495.2 315L350.5 440H316.5L282.8 256Z" fill="rgba(255,255,255,0.3)" />
          </g>
          <defs>
            <linearGradient id="plane-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#1995ad" />
              <stop offset="100%" stopColor="#ffb703" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Tarjeta de Inicio Hero */}
      <div 
        className="perspective-container"
        style={{
          position: 'relative', zIndex: 12, height: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px'
        }}
      >
        <div 
          className="card-3d"
          style={{
            maxWidth: '920px', width: '100%', padding: '50px 40px', textAlignment: 'center',
            background: 'rgba(13, 37, 56, 0.85)', backdropFilter: 'blur(16px)',
            transform: `translateY(${scrollProgress * 50}px)`, opacity: 1 - scrollProgress * 0.5
          }}
        >
          <div className="flex justify-center mb-4">
            <span className="bg-[#1995ad]/20 border border-[#1995ad] text-[#a0f0ff] text-xs font-bold px-4 py-1.5 rounded-full uppercase flex items-center gap-1.5">
              <Sparkles size={15} /> Experiencias Compartidas & Turismo 3D
            </span>
          </div>

          <h1 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4 text-center leading-tight">
            {cmsData.titulo}
          </h1>

          <p className="font-body text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto text-center">
            {cmsData.subtitulo}
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={onExplorarGrupales} className="btn-gold-3d flex items-center gap-2">
              <Users size={18} /> Ver Paquetes Grupales <ArrowRight size={18} />
            </button>
            <button onClick={onExplorarDestinos} className="btn-primary-3d flex items-center gap-2">
              <Compass size={18} /> Explorar Destinos
            </button>
          </div>

          <div className="mt-8 text-xs text-gray-400 font-semibold tracking-wider uppercase text-center animate-bounce">
            Desliza hacia abajo para aterrizar en los destinos ↓
          </div>
        </div>
      </div>
    </div>
  );
}
