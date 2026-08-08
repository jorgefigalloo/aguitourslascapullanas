import React, { useEffect, useState } from 'react';

export function Airplane3D() {
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animación del avión basada en la posición del scroll
  const translateX = Math.min(scrollPos * 1.8, 1200);
  const translateY = Math.sin(scrollPos * 0.01) * 30 - (scrollPos * 0.4);
  const rotateZ = Math.sin(scrollPos * 0.01) * 15;

  return (
    <div style={{
      position: 'absolute', top: '25%', left: '-100px', width: '220px', height: '120px',
      transform: `translate3d(${translateX}px, ${translateY}px, 0px) rotateZ(${rotateZ}deg) rotateY(15deg)`,
      transition: 'transform 0.1s linear', pointerEvents: 'none', zIndex: 15, filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))'
    }}>
      {/* SVG del Avión 3D Volando */}
      <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M495.2 240.8L350.5 106.6C341.3 98 329.1 93.3 316.5 93.3H264.4C255.4 93.3 248.8 101.6 250.7 110.4L282.8 256H143.6L102.7 197.6C98.4 191.5 91.4 187.9 83.9 187.9H44C32.9 187.9 24.8 198.1 27.2 208.9L44.8 288L27.2 367.1C24.8 377.9 32.9 388.1 44 388.1H83.9C91.4 388.1 98.4 384.5 102.7 378.4L143.6 320H282.8L250.7 465.6C248.8 474.4 255.4 482.7 264.4 482.7H316.5C329.1 482.7 341.3 478 350.5 469.4L495.2 335.2C516.3 315.6 516.3 260.4 495.2 240.8Z" fill="url(#plane-grad)" />
        <path d="M282.8 256H495.2C516.3 275.6 516.3 300 495.2 315L350.5 440H316.5L282.8 256Z" fill="rgba(255,255,255,0.2)" />
        <defs>
          <linearGradient id="plane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#1995ad" />
            <stop offset="100%" stopColor="#ffb703" />
          </linearGradient>
        </defs>
      </svg>
      {/* Estela de condensación (Jet trail) */}
      <div style={{
        position: 'absolute', top: '50%', right: '100%', width: '180px', height: '4px',
        background: 'linear-gradient(90deg, rgba(25,149,173,0.8), transparent)',
        borderRadius: '2px', filter: 'blur(2px)'
      }} />
    </div>
  );
}
