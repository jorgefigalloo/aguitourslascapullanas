import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Sparkles, ArrowRight, Star, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function DestinosSection({ user, onOpenAuth }) {
  const targetRef = useRef(null);
  const [destinos, setDestinos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [likedDestinos, setLikedDestinos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aguitours_liked_destinos') || '[]');
    } catch (e) { return []; }
  });

  // Scroll Horizontal animado con Framer Motion
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end']
  });

  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-60%']);

  useEffect(() => {
    cargarDestinos();
  }, []);

  const handleToggleLike = (destinoId) => {
    if (!user) {
      alert('Para guardar tus destinos favoritos debes iniciar sesión o registrarte primero.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const exists = likedDestinos.includes(destinoId);
    const updated = exists 
      ? likedDestinos.filter(id => id !== destinoId)
      : [...likedDestinos, destinoId];

    setLikedDestinos(updated);
    localStorage.setItem('aguitours_liked_destinos', JSON.stringify(updated));
  };

  const cargarDestinos = async () => {
    try {
      const { data, error } = await supabase.from('destinos_turisticos').select('*');
      if (data && data.length > 0) {
        setDestinos(data);
      } else {
        setDestinos([
          {
            id: '1',
            nombre: 'Arequipa',
            tipo: 'nacional',
            descripcion: 'Conocida como la Ciudad Blanca, hermosa arquitectura colonial rodeada de majestuosos volcanes.',
            imagen_portada: '/images/ciudades/nacionales/arequipa.png',
            badge: '🔥 Tendencia 2026'
          },
          {
            id: '2',
            nombre: 'Cusco y Machu Picchu',
            tipo: 'nacional',
            descripcion: 'El corazón del imperio Inca y una de las 7 maravillas del mundo moderno.',
            imagen_portada: '/images/ciudades/nacionales/cuzco.png',
            badge: '⭐ Maravilla del Mundo'
          },
          {
            id: '3',
            nombre: 'Tarapoto & Selva',
            tipo: 'nacional',
            descripcion: 'La ciudad de las palmeras, llena de cascadas de cristal, albergues ecoturísticos y aventura.',
            imagen_portada: '/images/ciudades/nacionales/tarapoto.png',
            badge: '🌿 Naturaleza Pura'
          },
          {
            id: '4',
            nombre: 'Máncora & Playas del Norte',
            tipo: 'nacional',
            descripcion: 'Sol todo el año, avistamiento de ballenas, nado con tortugas y la mejor gastronomía marina.',
            imagen_portada: '/images/ciudades/fondo-destinos1.png',
            badge: '🌊 Sol & Mar'
          },
          {
            id: '5',
            nombre: 'París & Museo del Louvre',
            tipo: 'internacional',
            descripcion: 'La ciudad de la luz, el arte, la alta costura e historia fascinante en cada rincón europeo.',
            imagen_portada: '/images/ciudades/internacionales/paris.jpg',
            badge: '✈️ Europa Exclusiva'
          }
        ]);
      }
    } catch (e) {
      console.log('Error al cargar destinos');
    }
  };

  const destinosFiltrados = filtro === 'todos' 
    ? destinos 
    : destinos.filter(d => d.tipo === filtro);

  return (
    <section 
      ref={targetRef} 
      style={{ 
        position: 'relative', 
        height: '300vh', 
        background: '#040d16', 
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Contenedor Sticky que se congela mientras haces scroll vertical */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          overflow: 'hidden',
          padding: '16px 0 20px 0'
        }}
      >
        {/* Cabecera de la Sección */}
        <div style={{ textAlign: 'center', marginBottom: '16px', padding: '0 20px', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span style={{
              background: 'rgba(255, 183, 3, 0.15)',
              border: '1px solid #ffb703',
              color: '#ffc83b',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={13} /> Desliza para explorar los mejores rincones
            </span>
          </motion.div>

          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vh, 2.2rem)', fontWeight: 900, color: '#fff', marginTop: '8px', marginBottom: '4px', fontFamily: 'Playfair Display, serif' }}>
            <Globe size={28} style={{ color: '#1995ad', verticalAlign: 'middle', marginRight: '8px' }} />
            Destinos Turísticos Destacados
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            Scroll interactivo a través de nuestros mejores circuitos de viaje
          </p>

          {/* Botones de Filtro */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
            {[
              { id: 'todos', label: 'Todos los Destinos' },
              { id: 'nacional', label: '🇵🇪 Nacionales' },
              { id: 'internacional', label: '🌎 Internacionales' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={filtro === f.id ? 'btn-gold-3d' : 'btn-primary-3d'}
                style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '25px', cursor: 'pointer' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Galería Cinemática de Scroll Horizontal */}
        <div style={{ width: '100%', overflow: 'hidden', padding: '10px 0' }}>
          <motion.div 
            style={{ x, display: 'flex', gap: '24px', width: 'max-content', paddingLeft: '5vw', paddingRight: '5vw' }}
          >
            <AnimatePresence mode="popLayout">
              {destinosFiltrados.map((d, index) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  style={{
                    width: 'clamp(290px, 22vw, 340px)',
                    height: 'clamp(340px, 48vh, 420px)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'rgba(7, 21, 33, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 20px rgba(25, 149, 173, 0.15)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                >
                  {/* Imagen de Fondo de Tarjeta */}
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
                    <img 
                      src={d.imagen_portada} 
                      alt={d.nombre} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        filter: 'brightness(0.7) contrast(1.15)',
                        transition: 'transform 0.5s ease-out'
                      }} 
                    />
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'linear-gradient(to top, rgba(4, 13, 22, 0.95) 0%, rgba(4, 13, 22, 0.35) 50%, transparent 100%)' 
                    }} />
                  </div>

                  {/* Header de la Tarjeta */}
                  <div style={{ position: 'relative', zIndex: 2, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      background: 'rgba(7, 21, 33, 0.75)', 
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(25, 149, 173, 0.5)', 
                      color: '#a0f0ff', 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      textTransform: 'uppercase' 
                    }}>
                      {d.badge || d.tipo}
                    </span>

                    <button 
                      onClick={() => handleToggleLike(d.id)}
                      style={{ 
                        background: likedDestinos.includes(d.id) ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.15)', 
                        backdropFilter: 'blur(8px)', 
                        border: likedDestinos.includes(d.id) ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.2)', 
                        borderRadius: '50%', 
                        width: '34px', 
                        height: '34px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: likedDestinos.includes(d.id) ? '#ef4444' : '#fff', 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      title={likedDestinos.includes(d.id) ? 'Te gusta este destino' : 'Dar me gusta'}
                    >
                      <Heart size={16} fill={likedDestinos.includes(d.id) ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  {/* Pie de la Tarjeta con Información */}
                  <div style={{ position: 'relative', zIndex: 2, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffb703', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                      <MapPin size={13} /> {d.tipo === 'nacional' ? 'Perú' : 'Internacional'}
                    </div>

                    <h3 style={{ fontSize: 'clamp(1.2rem, 2.5vh, 1.45rem)', fontWeight: 800, color: '#fff', marginBottom: '6px', lineHeight: 1.2 }}>
                      {d.nombre}
                    </h3>

                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.35, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {d.descripcion}
                    </p>

                    <button 
                      className="btn-gold-3d" 
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        fontSize: '12px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}
                    >
                      Explorar Circuito <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
