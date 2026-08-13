import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, MessageCircle, FileText, Users, ChevronDown, ChevronUp, ExternalLink, Download, Trash2, LogOut, DollarSign, UserPlus, Clock, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function ClientMisViajes({ user }) {
  const toast = useToast();
  const [inscripciones, setInscripciones] = useState([]);
  const [grupoMiembros, setGrupoMiembros] = useState({});
  const [cuotasMap, setCuotasMap] = useState({});
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
          cargarCuotasInscripcion(item.id);
        });
      } else {
        setInscripciones([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cargarCuotasInscripcion = async (inscripcionId) => {
    try {
      const { data } = await supabase
        .from('cuotas_inscripcion')
        .select('*')
        .eq('inscripcion_id', inscripcionId)
        .order('numero_cuota', { ascending: true });

      if (data) {
        setCuotasMap(prev => ({
          ...prev,
          [inscripcionId]: data
        }));
      }
    } catch (e) {
      console.log('Error al cargar cuotas:', e);
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

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, titulo: '', mensaje: '', onConfirmar: () => {} });

  const handleRetirarmeDelViaje = (item) => {
    setConfirmModal({
      isOpen: true,
      titulo: '¿Retirarme del Viaje?',
      mensaje: `¿Estás seguro de que deseas retirarte del paquete "${item.paquetes_grupales?.titulo}"? Tu cupo reservado se liberará.`,
      onConfirmar: () => ejecutarRetirarmeDelViaje(item)
    });
  };

  const ejecutarRetirarmeDelViaje = async (item) => {
    try {
      // 1. Cancelar inscripción
      const { error } = await supabase
        .from('inscripciones_grupo')
        .update({ estado: 'cancelado' })
        .eq('id', item.id);

      if (error) throw error;

      // 2. Liberar cupo en el paquete
      if (item.paquetes_grupales?.id) {
        await supabase
          .from('paquetes_grupales')
          .update({ cupo_disponible: item.paquetes_grupales.cupo_disponible + (item.cantidad_personas || 1) })
          .eq('id', item.paquetes_grupales.id);
      }

      toast.info('Te has retirado del viaje. Tu cupo ha sido liberado.', 'Reserva Cancelada');
      setConfirmModal({ isOpen: false, titulo: '', mensaje: '', onConfirmar: () => {} });
      cargarMisViajes();
    } catch (err) {
      toast.error('Error al retirarte del viaje: ' + err.message);
    }
  };

  const handleEliminarInscripcion = (item) => {
    setConfirmModal({
      isOpen: true,
      titulo: '¿Quitar del Historial?',
      mensaje: '¿Deseas quitar este historial de viaje de tu panel personal?',
      onConfirmar: () => ejecutarEliminarInscripcion(item)
    });
  };

  const ejecutarEliminarInscripcion = async (item) => {
    try {
      const { error } = await supabase
        .from('inscripciones_grupo')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Viaje removido de tu panel personal.', 'Historial Limpiado');
      setConfirmModal({ isOpen: false, titulo: '', mensaje: '', onConfirmar: () => {} });
      cargarMisViajes();
    } catch (err) {
      toast.error('Error al eliminar historial: ' + err.message);
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
                    <p className="text-xs text-gray-300 mt-1 flex items-center gap-3 flex-wrap">
                      <span><Calendar size={14} className="inline mr-1" /> Fechas: {pkg.fecha_salida} al {pkg.fecha_retorno}</span>
                      <span className="text-[#ffb703] font-bold">💰 S/ {parseFloat(pkg.precio_persona || 0).toFixed(2)} por persona</span>
                    </p>
                    {item.cantidad_personas > 0 && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        🎟️ {item.cantidad_personas} persona(s) inscrita(s) • Total: <strong className="text-emerald-400">S/ {parseFloat(item.precio_total || pkg.precio_persona * item.cantidad_personas || 0).toFixed(2)}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                      item.estado === 'confirmado' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                      item.estado === 'pendiente_confirmacion_tarifa' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse' :
                      item.estado === 'cancelado' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                      'bg-white/10 border-white/20 text-gray-300'
                    }`}>
                      <CheckCircle2 size={16} /> {
                        item.estado === 'confirmado' ? 'Cupo Confirmado' :
                        item.estado === 'pendiente_confirmacion_tarifa' ? '⏳ Tarifa en Revisión' :
                        item.estado === 'cancelado' ? 'Cancelado / Retirado' :
                        item.estado
                      }
                    </span>

                    {item.estado === 'cancelado' ? (
                      <button
                        onClick={() => handleEliminarInscripcion(item)}
                        className="bg-red-500/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        title="Quitar este historial de viaje cancelado de tu panel personal"
                      >
                        <Trash2 size={14} /> Quitar de Mi Perfil
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRetirarmeDelViaje(item)}
                        className="bg-white/10 hover:bg-red-500/30 border border-white/15 text-gray-300 hover:text-red-300 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Cancelar reserva y salirte de este grupo"
                      >
                        <LogOut size={14} /> Retirarme del Viaje
                      </button>
                    )}
                  </div>
                </div>

                {/* Cronograma de Cuotas y Estado de Pago del Cliente */}
                {cuotasMap[item.id] && cuotasMap[item.id].length > 0 && (
                  <div className="p-5 bg-black/30 border-b border-white/10">
                    <div className="text-xs font-bold text-emerald-400 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><DollarSign size={16} /> Cronograma de Cuotas & Estado Financiero:</span>
                      <span className="text-[11px] text-gray-400 font-normal">
                        Total Pagado: <strong className="text-emerald-300">S/ {
                          cuotasMap[item.id].filter(c => c.estado === 'pagado').reduce((s, c) => s + parseFloat(c.monto || 0), 0).toFixed(2)
                        }</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {cuotasMap[item.id].map(cuota => {
                        const esPagado = cuota.estado === 'pagado';
                        return (
                          <div key={cuota.id} className="bg-[#071521] border border-white/15 p-3 rounded-2xl flex flex-col justify-between gap-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[11px] font-bold text-white">Cuota #{cuota.numero_cuota}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                esPagado ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}>
                                {esPagado ? '🟢 Pagado' : '⏳ Pendiente'}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[#ffb703]">{cuota.concepto}</div>
                            <div className="flex justify-between items-center text-[11px] text-gray-400 border-t border-white/10 pt-2">
                              <span>Monto: <strong className="text-white">S/ {parseFloat(cuota.monto).toFixed(2)}</strong></span>
                              {cuota.fecha_vencimiento && <span><Calendar size={10} className="inline mr-1" />{cuota.fecha_vencimiento}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

      {/* Modal de Confirmación Sistema Personalizado */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100070] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md">
          <div className="bg-[#0d2538] border border-white/20 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-headline font-bold text-base text-white m-0">{confirmModal.titulo}</h4>
              <p className="text-xs text-gray-300 m-0 mt-2 leading-relaxed">{confirmModal.mensaje}</p>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, titulo: '', mensaje: '', onConfirmar: () => {} })}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirmar();
                }}
                className="bg-[#1995ad] hover:bg-[#1995ad]/80 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
