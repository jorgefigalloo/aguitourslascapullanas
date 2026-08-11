import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, Users, MapPin, ShieldCheck, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Hero3D({ onExplorarGrupales, onExplorarDestinos }) {
  const containerRef = useRef(null);
  const [cmsData, setCmsData] = useState({
    titulo: 'Explora el Mundo con Aguitours Las Capullanas',
    subtitulo: 'Vive la verdadera experiencia de viajes en grupos de turismo inmersivos y exclusivos',
    imagen_url: '/images/ciudades/fondo-destinos1.png'
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Scroll Animations using Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [0.45, 0.1]);

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Differential Parallax for Floating Badges
  const badge1Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const badge2Y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const badge3Y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const smoothHeroY = useSpring(heroY, { stiffness: 90, damping: 20 });
  const smoothHeroScale = useSpring(heroScale, { stiffness: 90, damping: 20 });

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
    const x = (clientX / innerWidth - 0.5) * 16;
    const y = (clientY / innerHeight - 0.5) * -16;
    setMousePos({ x, y });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 20px 40px 20px',
        overflow: 'hidden',
        background: '#071521'
      }}
    >
      {/* Fondo Cinemático con Parallax + Zoom in al hacer scroll */}
      <motion.div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${cmsData.imagen_url || '/images/ciudades/fondo-destinos1.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          scale: bgScale,
          y: bgY,
          opacity: bgOpacity,
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          filter: 'brightness(0.75) contrast(1.1)'
        }} 
      />

      {/* Grid Neón de Fondo Animado */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(25, 149, 173, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      {/* Degradado de Salida del Hero */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '220px',
        background: 'linear-gradient(to top, #071521 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 5
      }} />

      {/* Badges Flotantes 3D (Parallax Multi-capa) */}
      <motion.div
        style={{
          position: 'absolute',
          top: '22%',
          left: '7%',
          y: badge1Y,
          zIndex: 8,
          background: 'rgba(7, 21, 33, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(25, 149, 173, 0.4)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          color: '#fff'
        }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        whileHover={{ scale: 1.05, borderColor: '#1995ad' }}
      >
        <div style={{ background: 'rgba(25, 149, 173, 0.25)', padding: '8px', borderRadius: '10px', color: '#1995ad' }}>
          <MapPin size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Próximas Salidas</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
            {cmsData.config_3d?.hero_badge_salidas || 'Máncora & Piura'}
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '8%',
          y: badge2Y,
          zIndex: 8,
          background: 'rgba(7, 21, 33, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 183, 3, 0.4)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          color: '#fff'
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        whileHover={{ scale: 1.05, borderColor: '#ffb703' }}
      >
        <div style={{ background: 'rgba(255, 183, 3, 0.25)', padding: '8px', borderRadius: '10px', color: '#ffb703' }}>
          <Star size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Calificación 4.9/5</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Experiencias Grupales</div>
        </div>
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          top: '30%',
          right: '12%',
          y: badge3Y,
          zIndex: 8,
          background: 'rgba(7, 21, 33, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#e2e8f0',
          fontSize: '12px',
          fontWeight: 700
        }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <ShieldCheck size={18} style={{ color: '#10b981' }} /> Agencia Registrada MINCETUR
      </motion.div>

      {/* Tarjeta Hero Principal con Parallax & Scale al Scroll */}
      <motion.div 
        className="perspective-container" 
        style={{ 
          zIndex: 10, 
          maxWidth: '950px', 
          width: '100%', 
          textAlign: 'center',
          y: smoothHeroY,
          scale: smoothHeroScale,
          opacity: heroOpacity
        }}
      >
        <div 
          className="card-3d"
          style={{
            padding: '50px 40px',
            transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(25, 149, 173, 0.3)',
            backdropFilter: 'blur(16px)',
            background: 'rgba(7, 21, 33, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
          >
            <span style={{
              background: 'rgba(25, 149, 173, 0.2)', 
              border: '1px solid #1995ad',
              color: '#a0f0ff', 
              padding: '6px 18px', 
              borderRadius: '30px',
              fontSize: '0.85rem', 
              fontWeight: 700, 
              textTransform: 'uppercase',
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 0 15px rgba(25, 149, 173, 0.4)'
            }}>
              <Sparkles size={16} /> Experiencias Compartidas & Viajes Exclusivos
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: 'Playfair Display, Montserrat, serif', 
              fontSize: '3.2rem', 
              fontWeight: 900,
              lineHeight: 1.15, 
              marginBottom: '20px', 
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}
          >
            {cmsData.titulo}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: '1.2rem', color: 'rgba(244, 249, 250, 0.9)', maxWidth: '780px', margin: '0 auto 30px auto' }}
          >
            {cmsData.subtitulo}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExplorarGrupales} 
              className="btn-gold-3d" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <Users size={18} /> Ver Paquetes Grupales <ArrowRight size={18} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExplorarDestinos} 
              className="btn-primary-3d"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Compass size={18} /> Explorar Destinos
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
