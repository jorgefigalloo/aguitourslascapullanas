import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, MessageCircle, FileText, Users, ChevronDown, ChevronUp, ExternalLink, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ClientMisViajes({ user }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [grupoMiembros, setGrupoMiembros] = useState({});
  const [openItinerarioId, setOpenItinerarioId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      cargarMisViajes();
    }
  }, [user]);

  const cargarMisViajes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inscripciones_grupo')
        .select('*, paquetes_grupales(*)')
        .eq('usuario_id', user.id);

      if (data && data.length > 0) {
        setInscripciones(data);
        data.forEach(item => {
          if (item.paquetes_grupales?.id) {
            cargarMiembrosGrupo(item.paquetes_grupales.id);
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cargarMiembrosGrupo = async (paqueteId) => {
    try {
      const { data } = await supabase
        .from('inscripciones_grupo')
        .select('id, perfiles(nombre_completo, username, id)')
        .eq('paquete_id', paqueteId)
        .eq('estado', 'confirmado');

      if (data) {
        setGrupoMiembros(prev => ({
          ...prev,
          [paqueteId]: data.map(d => d.perfiles)
        }));
      }
    } catch (e) {
      console.log('Error al cargar grupo de viajeros:', e);
    }
  };

  return (
    <div>
      <h3 className="text-xl md:text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
        <Briefcase size={26} className="text-[#1995ad]" /> Mis Paquetes & Viajes Grupales Inscritos
      </h3>

      {loading ? (
        <div className="text-center p-12 text-gray-400">
          <p>Cargando tus itinerarios y grupo de WhatsApp...</p>
        </div>
      ) : inscripciones.length === 0 ? (
        <div className="bg-white/5 p-10 rounded-3xl text-center border border-white/10">
          <p className="text-gray-300 text-lg mb-3">Aún no estás inscrito en ningún paquete grupal.</p>
          <p className="text-gray-400 text-xs">Explora nuestro catálogo de paquetes grupales en el inicio y únete a un viaje inolvidable.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {inscripciones.map(item => {
            const pkg = item.paquetes_grupales;
            if (!pkg) return null;

            let itObj = pkg.itinerario;
            if (typeof itObj === 'string') {
              try { itObj = JSON.parse(itObj); } catch(e) { itObj = {}; }
            }

            const diasArray = Array.isArray(itObj) 
              ? itObj 
              : (Array.isArray(itObj?.dias) ? itObj.dias : []);

            const whatsappLink = (typeof itObj === 'object' && itObj?.whatsapp_url) || 'https://chat.whatsapp.com/ExclusivoAguitoursCapullanas';
            const pdfLink = (typeof itObj === 'object' && itObj?.pdf_formulario_url) || '/rutas.txt';
            const miembros = grupoMiembros[pkg.id] || [];
            const isOpenItinerario = openItinerarioId === pkg.id;

            return (
              <div 
                key={item.id} 
                className="bg-[#071521]/90 rounded-3xl border border-white/15 shadow-2xl overflow-hidden"
              >
                {/* Cabecera del Paquete Inscrito */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10">
                  <div>
                    <span className="text-[#1995ad] text-xs font-bold uppercase flex items-center gap-1.5 mb-1">
                      <MapPin size={14} /> {pkg.destino}
                    </span>
                    <h4 className="text-xl font-bold text-white m-0">{pkg.titulo}</h4>
                    <p className="text-xs text-gray-300 mt-1 flex items-center gap-3">
                      <span><Calendar size={14} className="inline mr-1" /> Fechas: {pkg.fecha_salida} al {pkg.fecha_retorno}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Cupo Confirmado
                    </span>
                  </div>
                </div>

                {/* Acciones Rápidas: WhatsApp + PDF Formulario */}
                <div className="p-5 bg-white/[0.02] flex flex-wrap gap-3 border-b border-white/10">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-5 py-3 rounded-2xl text-xs font-bold text-decoration-none flex items-center gap-2 shadow-lg shadow-emerald-900/30 hover:scale-[1.02] transition-transform"
                  >
                    <MessageCircle size={18} /> Unirme al Grupo Oficial de WhatsApp <ExternalLink size={14} />
                  </a>

                  <a
                    href={pdfLink}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="bg-[#ffb703]/20 border border-[#ffb703] text-[#ffc83b] px-5 py-3 rounded-2xl text-xs font-bold text-decoration-none flex items-center gap-2 hover:bg-[#ffb703] hover:text-black transition-colors"
                  >
                    <FileText size={18} /> Descargar Formulario / Ficha PDF <Download size={14} />
                  </a>
                </div>

                {/* Integrantes / Compañeros del Grupo */}
                <div className="p-5 border-b border-white/10">
                  <div className="text-xs font-bold text-[#ffb703] mb-3 flex items-center gap-2">
                    <Users size={16} /> Compañeros Exploradores del Grupo ({miembros.length} confirmados)
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {miembros.length > 0 ? (
                      miembros.map((m, idx) => (
                        <div 
                          key={idx}
                          className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-full text-xs font-bold text-gray-200 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                          {m?.nombre_completo || m?.username || 'Viajero Confirmado'}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 m-0">Cargando participantes del grupo...</p>
                    )}
                  </div>
                </div>

                {/* Desplegable Itinerario del Viaje */}
                <div className="p-5">
                  <button
                    onClick={() => setOpenItinerarioId(isOpenItinerario ? null : pkg.id)}
                    className="bg-transparent border-none text-[#1995ad] text-xs font-bold cursor-pointer flex items-center gap-2 p-0 hover:underline"
                  >
                    {isOpenItinerario ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    {isOpenItinerario ? 'Ocultar Itinerario del Viaje' : 'Ver Itinerario Completo del Viaje Día por Día'}
                  </button>

                  {isOpenItinerario && (
                    <div className="mt-4 flex flex-col gap-3">
                      {diasArray.length > 0 ? (
                        diasArray.map((diaItem, index) => (
                          <div key={index} className="bg-black/40 p-4 rounded-2xl border-l-4 border-[#ffb703]">
                            <div className="text-xs font-bold text-[#ffb703]">
                              {diaItem.dia || `Día ${index + 1}`}
                            </div>
                            <div className="text-sm font-bold text-white my-1">
                              {diaItem.titulo || diaItem.actividad || 'Actividades y Recorrido'}
                            </div>
                            <div className="text-xs text-gray-300 leading-relaxed">
                              {diaItem.detalle || diaItem.descripcion || 'Acompañamiento por guía certificado y traslado privado.'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-black/40 p-4 rounded-2xl border-l-4 border-[#1995ad]">
                          <div className="text-xs text-gray-300">
                            {pkg.descripcion}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-2">
                            * El itinerario exacto hora a hora será compartido a través del grupo oficial de WhatsApp antes de la fecha de salida.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
