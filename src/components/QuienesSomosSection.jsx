import React, { useState, useEffect } from 'react';
import { Target, Eye, Award, HeartHandshake } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function QuienesSomosSection() {
  const [data, setData] = useState({
    titulo: 'Conoce Nuestra Historia y Pasión por El Turismo',
    subtitulo: 'Más de 10 años creando recuerdos inolvidables y conectando viajeros apasionados.',
    cuerpo_texto: 'En Aguitours Las Capullanas nos dedicamos a ofrecer experiencias de viaje seguras, auténticas y enriquecedoras en los destinos más hermosos de Perú y el mundo.',
    imagen_url: '/images/nosotros-hero.png'
  });

  useEffect(() => {
    cargarNosotros();
  }, []);

  const cargarNosotros = async () => {
    try {
      const { data: res } = await supabase
        .from('cms_contenido')
        .select('*')
        .eq('clave_seccion', 'quienes_somos')
        .single();
      
      if (res) setData(res);
    } catch (e) { console.log(e); }
  };

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1280px] mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        
        {/* Imagen Corporativa Auto-Ajustable Completa sin Recortes */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 card-3d bg-[#040d16]/90 p-3 flex items-center justify-center min-h-[380px]">
          <img 
            src={data.imagen_url || '/images/nosotros-hero.png'} 
            alt="Nosotros Aguitours" 
            className="w-full h-auto max-h-[420px] object-contain rounded-2xl transition-transform duration-500 hover:scale-102" 
            onError={(e) => { e.target.src = '/images/nosotros-hero.png'; }}
          />
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
            <span className="bg-[#ffb703] text-black font-extrabold text-xs px-4 py-1.5 rounded-full uppercase shadow-lg border border-black/20">
              Agencia de Viajes Confiable
            </span>
          </div>
        </div>

        {/* Texto Informativo Sincronizado con CMS */}
        <div>
          <span className="text-[#1995ad] font-bold text-xs uppercase tracking-widest block mb-2">¿Quiénes Somos?</span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {data.titulo}
          </h2>
          <p className="font-body text-gray-300 text-base md:text-lg mb-6 leading-relaxed">
            {data.subtitulo}
          </p>
          <p className="font-body text-gray-400 text-sm leading-relaxed mb-8">
            {data.cuerpo_texto}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <Award className="text-[#ffb703]" size={28} />
              <div>
                <h4 className="font-bold text-white text-sm">Calidad Garantizada</h4>
                <p className="text-xs text-gray-400">Guías profesionales</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <HeartHandshake className="text-[#1995ad]" size={28} />
              <div>
                <h4 className="font-bold text-white text-sm">Atención Personalizada</h4>
                <p className="text-xs text-gray-400">Soporte 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Misión y Visión Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl card-3d">
          <div className="w-12 h-12 rounded-2xl bg-[#1995ad]/20 border border-[#1995ad] flex items-center justify-center text-[#1995ad] mb-4">
            <Target size={24} />
          </div>
          <h3 className="font-headline text-2xl font-bold text-white mb-3">Nuestra Misión</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Brindar paquetes turísticos grupales y privados con los más altos estándares de calidad, garantizando seguridad, confort y experiencias culturales auténticas para cada viajero.
          </p>
        </div>

        <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl card-3d">
          <div className="w-12 h-12 rounded-2xl bg-[#ffb703]/20 border border-[#ffb703] flex items-center justify-center text-[#ffb703] mb-4">
            <Eye size={24} />
          </div>
          <h3 className="font-headline text-2xl font-bold text-white mb-3">Nuestra Visión</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Consolidarnos como la agencia de viajes líder en turismo en grupo a nivel nacional e internacional, reconocida por la innovación tecnológica y el servicio de excelencia.
          </p>
        </div>
      </div>
    </section>
  );
}
