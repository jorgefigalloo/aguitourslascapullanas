import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, UserCheck, MessageCircle, FileText, Users, ChevronDown, ChevronUp, ExternalLink, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ClientPortal({ user, profile }) {
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

        // Cargar compañeros para cada paquete inscrito
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
      console.log('Error al cargar grupo de viajero:', e);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '110px auto 60px auto', padding: '0 20px' }}>
      {/* Banner de Bienvenida del Cliente */}
      <div style={{
        background: 'linear-gradient(135deg, #071521, #0d5c75)', 
        border: '1px solid rgba(25, 149, 173, 0.4)',
        padding: '30px', 
        borderRadius: '24px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', 
        marginBottom: '35px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '75px', 
            height: '75px', 
            background: 'linear-gradient(135deg, #1995ad, #ffb703)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255,183,3,0.4)'
          }}>
            <UserCheck size={38} color="#071521" />
          </div>
          <div>
            <span style={{ background: 'rgba(25, 149, 173, 0.25)', border: '1px solid #1995ad', color: '#a0f0ff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              Portal del Pasajero VIP
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '4px 0 0 0', color: '#fff' }}>
              {profile?.nombre_completo || 'Viajero Explorer'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              {user?.email} | Documento: {profile?.documento_identidad || 'No registrado'}
            </p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '16px', textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#ffb703', fontWeight: 700 }}>Total de Viajes Inscritos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{inscripciones.length} Paquetes</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Briefcase size={24} color="#1995ad" /> Mis Paquetes & Viajes Grupales
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          <p>Cargando tus itinerarios y grupo de WhatsApp...</p>
        </div>
      ) : inscripciones.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '50px 30px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '15px' }}>Aún no estás inscrito en ningún paquete grupal.</p>
          <p style={{ color: '#666', fontSize: '13px' }}>Explora nuestro catálogo de paquetes grupales en el inicio y únete a un viaje inolvidable.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
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
                style={{
                  background: 'rgba(7, 21, 33, 0.85)', 
                  borderRadius: '24px', 
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                  overflow: 'hidden'
                }}
              >
                {/* Cabecera del Paquete Inscrito */}
                <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <span style={{ color: '#1995ad', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <MapPin size={14} /> {pkg.destino}
                    </span>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>{pkg.titulo}</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Fechas: {pkg.fecha_salida} al {pkg.fecha_retorno}</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      border: '1px solid #10b981', 
                      color: '#34d399', 
                      padding: '6px 16px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 800, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}>
                      <CheckCircle2 size={16} /> Cupo Confirmado
                    </span>
                  </div>
                </div>

                {/* Acciones Rápidas: WhatsApp + PDF Formulario */}
                <div style={{ padding: '20px 25px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '15px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      color: '#fff',
                      padding: '12px 22px',
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 20px rgba(37, 211, 102, 0.3)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <MessageCircle size={18} /> Unirme al Grupo Oficial de WhatsApp <ExternalLink size={14} />
                  </a>

                  <a
                    href={pdfLink}
                    target="_blank"
                    rel="noreferrer"
                    download
                    style={{
                      background: 'rgba(255, 183, 3, 0.15)',
                      border: '1px solid #ffb703',
                      color: '#ffc83b',
                      padding: '12px 22px',
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FileText size={18} /> Descargar Formulario / Ficha PDF <Download size={14} />
                  </a>
                </div>

                {/* Integrantes / Compañeros del Grupo */}
                <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffb703', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} /> Compañeros Exploradores del Grupo ({miembros.length} confirmados)
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {miembros.length > 0 ? (
                      miembros.map((m, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                          {m?.nombre_completo || m?.username || 'Viajero Confirmado'}
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Cargando participantes del grupo...</p>
                    )}
                  </div>
                </div>

                {/* Desplegable Itinerario del Viaje */}
                <div style={{ padding: '15px 25px' }}>
                  <button
                    onClick={() => setOpenItinerarioId(isOpenItinerario ? null : pkg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1995ad',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: 0
                    }}
                  >
                    {isOpenItinerario ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    {isOpenItinerario ? 'Ocultar Itinerario del Viaje' : 'Ver Itinerario Completo del Viaje Día por Día'}
                  </button>

                  {isOpenItinerario && (
                    <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {diasArray.length > 0 ? (
                        diasArray.map((diaItem, index) => (
                          <div key={index} style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '14px', borderLeft: '3px solid #ffb703' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffb703' }}>
                              {diaItem.dia || `Día ${index + 1}`}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '2px 0 4px 0' }}>
                              {diaItem.titulo || diaItem.actividad || 'Actividades y Recorrido'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4 }}>
                              {diaItem.detalle || diaItem.descripcion || 'Acompañamiento por guía certificado y traslado privado.'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '14px', borderLeft: '3px solid #1995ad' }}>
                          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                            {pkg.descripcion}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
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
