import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function DestinosSection() {
  const [destinos, setDestinos] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    cargarDestinos();
  }, []);

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
            descripcion: 'Conocida como la Ciudad Blanca, hermosa arquitectura colonial rodeada de volcanes.',
            imagen_portada: '/images/ciudades/nacionales/arequipa.png'
          },
          {
            id: '2',
            nombre: 'Cusco y Machu Picchu',
            tipo: 'nacional',
            descripcion: 'El corazón del imperio Inca y una de las 7 maravillas del mundo moderno.',
            imagen_portada: '/images/ciudades/nacionales/cuzco.png'
          },
          {
            id: '3',
            nombre: 'Tarapoto',
            tipo: 'nacional',
            descripcion: 'La ciudad de las palmeras, llena de cascadas y naturaleza amazónica.',
            imagen_portada: '/images/ciudades/nacionales/tarapoto.png'
          },
          {
            id: '4',
            nombre: 'París y Louvre',
            tipo: 'internacional',
            descripcion: 'La ciudad de la luz, arte, cultura e historia europea.',
            imagen_portada: '/images/ciudades/internacionales/paris.jpg'
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
    <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
          <Globe size={30} style={{ color: '#ffb703', verticalAlign: 'middle', marginRight: '8px' }} />
          Destinos Turísticos Destacados
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)' }}>Explora nuestros viajes nacionales e internacionales</p>

        {/* Botones de Filtro */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={() => setFiltro('todos')} 
            className={filtro === 'todos' ? 'btn-gold-3d' : 'btn-primary-3d'}
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Todos los Destinos
          </button>
          <button 
            onClick={() => setFiltro('nacional')} 
            className={filtro === 'nacional' ? 'btn-gold-3d' : 'btn-primary-3d'}
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Nacionales
          </button>
          <button 
            onClick={() => setFiltro('internacional')} 
            className={filtro === 'internacional' ? 'btn-gold-3d' : 'btn-primary-3d'}
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Internacionales
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }} className="perspective-container">
        {destinosFiltrados.map(d => (
          <div key={d.id} className="card-3d" style={{ overflow: 'hidden' }}>
            <div style={{ height: '180px', overflow: 'hidden' }}>
              <img src={d.imagen_portada} alt={d.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1995ad', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                {d.tipo}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{d.nombre}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{d.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
