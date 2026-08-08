import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

export function FlightIntro3D({ onComplete }) {
  const [stage, setStage] = useState(0); // 0: Volando, 1: Despegando/Completado

  useEffect(() => {
    // Transición automática del despegue después de 3.5 segundos
    const timer = setTimeout(() => {
      setStage(1);
      setTimeout(onComplete, 800);
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'radial-gradient(circle at center, #0d3852 0%, #071521 100%)',
      zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: stage === 1 ? 0 : 1, transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: stage === 1 ? 'none' : 'auto', overflow: 'hidden'
    }}>
      {/* Nubes 3D Flotantes en segundo plano */}
      <div style={{
        position: 'absolute', width: '150%', height: '150%',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
        animation: 'cloudPulse 4s ease-in-out infinite'
      }} />

      {/* Avión 3D Grande con Logo Aguitours Volando entre Nubes */}
      <div style={{
        position: 'relative', width: '320px', height: '160px',
        animation: 'planeFlyIntro 3.2s cubic-bezier(0.25, 1, 0.5, 1) forwards'
      }}>
        {/* Avión SVG Premium */}
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.7))' }}>
          <path d="M495.2 240.8L350.5 106.6C341.3 98 329.1 93.3 316.5 93.3H264.4C255.4 93.3 248.8 101.6 250.7 110.4L282.8 256H143.6L102.7 197.6C98.4 191.5 91.4 187.9 83.9 187.9H44C32.9 187.9 24.8 198.1 27.2 208.9L44.8 288L27.2 367.1C24.8 377.9 32.9 388.1 44 388.1H83.9C91.4 388.1 98.4 384.5 102.7 378.4L143.6 320H282.8L250.7 465.6C248.8 474.4 255.4 482.7 264.4 482.7H316.5C329.1 482.7 341.3 478 350.5 469.4L495.2 335.2C516.3 315.6 516.3 260.4 495.2 240.8Z" fill="url(#intro-plane-grad)" />
          <defs>
            <linearGradient id="intro-plane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#1995ad" />
              <stop offset="100%" stopColor="#ffb703" />
            </linearGradient>
          </defs>
        </svg>

        {/* Logo Aguitours en la aleta trasera del avión */}
        <div style={{
          position: 'absolute', top: '18px', left: '60px', width: '38px', height: '38px',
          borderRadius: '50%', border: '2px solid #ffb703', overflow: 'hidden',
          boxShadow: '0 0 15px rgba(255,183,3,0.8)'
        }}>
          <img src="/images/capullanas1.jpg" alt="Logo Aguitours" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Texto de Bienvenida Dinámico */}
      <div style={{ textAlign: 'center', marginTop: '30px', zIndex: 10 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
          Aguitours Las Capullanas
        </h1>
        <p style={{ color: '#1995ad', fontSize: '1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Despegando hacia tu próximo destino...
        </p>
      </div>

      <button 
        onClick={() => { setStage(1); setTimeout(onComplete, 300); }} 
        style={{
          marginTop: '25px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', padding: '8px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: 700,
          cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
        }}
      >
        Saltar Intro →
      </button>

      <style>{`
        @keyframes planeFlyIntro {
          0% { transform: translate(-300px, 100px) scale(0.4) rotate(-10deg); }
          50% { transform: translate(0px, 0px) scale(1.1) rotate(2deg); }
          100% { transform: translate(400px, -150px) scale(1.6) rotate(15deg); }
        }
        @keyframes cloudPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
