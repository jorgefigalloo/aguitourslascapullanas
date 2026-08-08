import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Facebook, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ContactoSection() {
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const [cmsData, setCmsData] = useState({
    titulo: 'Estamos Listos para Planear tu Próximo Viaje',
    subtitulo: 'Escríbenos una consulta o comunícate directamente por WhatsApp con uno de nuestros asesores de viaje.',
    imagen_url: '',
    telefono: '+51 987 654 321',
    email: 'contacto@aguitourslascapullanas.com',
    direccion: 'Cusco & Piura, Perú',
    facebook_url: 'https://www.facebook.com/people/Aguitours-las-capullanas/100054386595848/'
  });

  useEffect(() => {
    cargarCMSContacto();
  }, []);

  const cargarCMSContacto = async () => {
    try {
      const { data } = await supabase
        .from('cms_contenido')
        .select('*')
        .eq('clave_seccion', 'contacto_info')
        .single();

      if (data) {
        let tel = '+51 987 654 321';
        let mail = 'contacto@aguitourslascapullanas.com';
        let dir = 'Cusco & Piura, Perú';
        let fb = 'https://www.facebook.com/people/Aguitours-las-capullanas/100054386595848/';

        if (data.cuerpo_texto) {
          const partes = data.cuerpo_texto.split('|');
          if (partes[0]) tel = partes[0].trim();
          if (partes[1]) mail = partes[1].trim();
          if (partes[2]) dir = partes[2].trim();
          if (partes[3]) fb = partes[3].trim();
        }

        setCmsData({
          titulo: data.titulo || 'Estamos Listos para Planear tu Próximo Viaje',
          subtitulo: data.subtitulo || 'Escríbenos una consulta o comunícate directamente por WhatsApp con uno de nuestros asesores de viaje.',
          imagen_url: data.imagen_url || '',
          telefono: tel,
          email: mail,
          direccion: dir,
          facebook_url: fb
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => {
      alert('¡Gracias por contactarnos! Un asesor de Aguitours Las Capullanas te responderá a la brevedad.');
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setEnviado(false);
    }, 500);
  };

  const abrirWhatsApp = () => {
    const cleanTel = cmsData.telefono.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent("¡Hola Aguitours Las Capullanas! Deseo información sobre sus paquetes turísticos.");
    window.open(`https://wa.me/${cleanTel || '51987654321'}?text=${msg}`, '_blank');
  };

  return (
    <section className="py-20 px-4 md:px-12 max-w-[1280px] mx-auto w-full">
      {/* Título & Subtítulo Principal */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[#1995ad] font-bold text-xs uppercase tracking-widest block mb-2">Ponte en contacto</span>
        <h2 className="font-headline text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {cmsData.titulo}
        </h2>
        <p className="font-body text-gray-300 text-base md:text-lg">
          {cmsData.subtitulo}
        </p>
      </div>

      {/* Banner Centrado Panorámico CMS */}
      {cmsData.imagen_url && (
        <div className="w-full max-w-5xl mx-auto mb-14 rounded-3xl overflow-hidden shadow-2xl border border-white/15 h-64 md:h-80 relative group">
          <img 
            src={cmsData.imagen_url} 
            alt="Oficina Aguitours" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071521] via-black/40 to-transparent flex items-end justify-between p-6 md:p-8">
            <div>
              <span className="bg-[#ffb703] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                Atención Presencial & Virtual
              </span>
              <h3 className="text-white text-xl md:text-2xl font-bold font-headline m-0">Oficina Principal de Viajes</h3>
              <p className="text-gray-300 text-xs md:text-sm m-0">Diseño de itinerarios turísticos a tu medida</p>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Sparkles size={16} className="text-[#ffb703]" />
              <span className="text-xs text-white font-bold">Respuesta Inmediata 24/7</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid de 2 Columnas: Tarjetas Informativas + Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
        
        {/* Columna Izquierda: Canales de Atención Directos */}
        <div className="md:col-span-5 flex flex-col gap-5 justify-between">
          
          {/* WhatsApp */}
          <div className="bg-[#0d2538] border border-white/15 p-6 rounded-3xl card-3d flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Atención WhatsApp</h4>
                <p className="text-sm text-gray-300 font-semibold">{cmsData.telefono}</p>
              </div>
            </div>
            <button 
              onClick={abrirWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <MessageCircle size={16} /> Chatear por WhatsApp Directo
            </button>
          </div>

          {/* Correo Electrónico */}
          <div className="bg-[#0d2538] border border-white/15 p-6 rounded-3xl card-3d">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffb703]/20 border border-[#ffb703] flex items-center justify-center text-[#ffb703] shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Correo Electrónico</h4>
                <p className="text-xs md:text-sm text-gray-300 font-semibold break-all">{cmsData.email}</p>
              </div>
            </div>
          </div>

          {/* Oficina & Redes Sociales */}
          <div className="bg-[#0d2538] border border-white/15 p-6 rounded-3xl card-3d flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-400 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Oficina Principal</h4>
                <p className="text-sm text-gray-300 font-semibold">{cmsData.direccion}</p>
              </div>
            </div>
            
            {cmsData.facebook_url && (
              <a 
                href={cmsData.facebook_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-3 rounded-full transition-all shadow-md"
              >
                <Facebook size={16} /> Visitar Facebook Oficial
              </a>
            )}
          </div>
        </div>

        {/* Columna Derecha: Formulario de Enviar Mensaje */}
        <div className="md:col-span-7 bg-[#0d2538] border border-white/15 p-8 rounded-3xl card-3d flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-2xl font-bold text-white mb-6">Envíanos un Mensaje</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  required 
                  placeholder="Juan Pérez"
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3.5 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required 
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-[#071521] border border-white/15 rounded-xl p-3.5 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">Teléfono / WhatsApp</label>
                  <input 
                    type="tel" 
                    value={formData.telefono} 
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    placeholder="+51 987 654 321"
                    className="w-full bg-[#071521] border border-white/15 rounded-xl p-3.5 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Mensaje o Destino de Interés</label>
                <textarea 
                  rows={4} 
                  value={formData.mensaje} 
                  onChange={e => setFormData({...formData, mensaje: e.target.value})}
                  required 
                  placeholder="Hola, me gustaría cotizar un viaje a Cusco en grupo..."
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-3.5 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={enviado}
                className="btn-gold-3d py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                <Send size={16} /> {enviado ? 'Enviando...' : 'Enviar Consulta'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
