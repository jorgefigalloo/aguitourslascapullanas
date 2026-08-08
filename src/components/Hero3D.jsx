import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Compass, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Hero3D({ onExplorarGrupales, onExplorarDestinos }) {
  const [cmsData, setCmsData] = useState({
    titulo: 'Explora el Mundo con Aguitours Las Capullanas',
    subtitulo: 'Vive la verdadera experiencia de viajes en grupos de turismo inmersivos y exclusivos',
    imagen_url: '/images/ciudades/fondo-destinos1.png'
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    cargarCmsHero();
  }, []);

  const cargarCmsHero = async () => {
    try {
      const { data } = await supabase.from('cms_contenido').select('*').eq('clave_seccion', 'hero_inicio').single();
      if (data) setCmsData(data);
    } catch (e) { console.log(e); }
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * -20;
    setMousePos({ x, y });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 40px 20px', overflow: 'hidden', background: '#071521'
      }}
    >
      {/* Fondo de Portada Limitado Exclusivamente a la Sección Hero */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${cmsData.imagen_url || '/images/ciudades/fondo-destinos1.png'})`,
        backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35,
        transform: `scale(1.08) translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
        transition: 'transform 0.1s ease-out', filter: 'brightness(0.7)'
      }} />

      {/* Degradado de Salida del Hero */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '180px',
        background: 'linear-gradient(to top, #071521 0%, transparent 100%)', pointerEvents: 'none'
      }} />

      {/* Tarjeta Hero */}
      <div className="perspective-container" style={{ zIndex: 10, maxWidth: '950px', width: '100%', textAlign: 'center' }}>
        <div 
          className="card-3d"
          style={{
            padding: '50px 40px',
            transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 30px rgba(25, 149, 173, 0.25)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{
              background: 'rgba(25, 149, 173, 0.2)', border: '1px solid #1995ad',
              color: '#a0f0ff', padding: '6px 18px', borderRadius: '30px',
              fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: '8px'
            }}>
              <Sparkles size={16} /> Experiencias Compartidas & Viajes Exclusivos
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display, Montserrat, serif', fontSize: '3.2rem', fontWeight: 900,
            lineHeight: 1.15, marginBottom: '20px', color: '#ffffff'
          }}>
            {cmsData.titulo}
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'rgba(244, 249, 250, 0.9)', maxWidth: '780px', margin: '0 auto 30px auto' }}>
            {cmsData.subtitulo}
          </p>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onExplorarGrupales} className="btn-gold-3d" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} /> Ver Paquetes Grupales <ArrowRight size={18} />
            </button>
            <button onClick={onExplorarDestinos} className="btn-primary-3d">
              <Compass size={18} /> Explorar Destinos
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
