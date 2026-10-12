import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DetallePaqueteModal } from './DetallePaqueteModal';
import { UnirmePaqueteModal } from './paquetes/UnirmePaqueteModal';
import { useToast } from '../context/ToastContext';

export function PaquetesGrupales({ user, profile, onOpenAuth }) {
  const toast = useToast();
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [selectedPaquete, setSelectedPaquete] = useState(null);
  const [paqueteAUnirme, setPaqueteAUnirme] = useState(null);
  const [inscritosCounts, setInscritosCounts] = useState({});

  useEffect(() => {
    cargarPaquetes();
  }, []);

  useEffect(() => {
    if (paquetes.length > 0) {
      cargarContadoresInscritos();
    }
  }, [paquetes]);

  const cargarContadoresInscritos = async () => {
    try {
      const counts = {};
      paquetes.forEach(p => { counts[p.id] = 0; });

      const { data } = await supabase
        .from('inscripciones_grupo')
        .select('paquete_id, cantidad_personas, estado')
        .in('estado', ['confirmado', 'pendiente', 'pendiente_confirmacion_tarifa']);

      if (data) {
        data.forEach(item => {
          if (item.paquete_id && counts[item.paquete_id] !== undefined) {
            counts[item.paquete_id] += (item.cantidad_personas || 1);
          }
        });
      }
      setInscritosCounts(counts);
    } catch (e) {
      console.log('Error al cargar contadores en catálogo público:', e);
    }
  };

  const cargarPaquetes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('paquetes_grupales')
        .select('*')
        .neq('estado', 'oculto')
        .order('fecha_salida', { ascending: true });

      if (error) {
        console.warn('Error al cargar paquetes desde la base de datos:', error.message);
        setPaquetes([]);
      } else {
        // Respetamos estrictamente la base de datos: si todos están ocultos, data es []
        setPaquetes(data || []);
      }
    } catch (e) {
      console.error('Error al cargar paquetes:', e);
      setPaquetes([]);
    } finally {
      setLoading(false);
    }
  };


  const [userFavorites, setUserFavorites] = useState([]);

  useEffect(() => {
    cargarPaquetes();
    if (user) cargarFavoritosUsuario();
  }, [user]);

  const cargarFavoritosUsuario = async () => {
    try {
      const { data } = await supabase
        .from('favoritos_usuario')
        .select('paquete_id')
        .eq('usuario_id', user.id)
        .eq('tipo', 'paquete');
      if (data) {
        setUserFavorites(data.map(f => f.paquete_id));
      }
    } catch (e) {
      console.log('Error al cargar favoritos:', e);
    }
  };

  const handleToggleFavorito = async (paqueteId) => {
    if (!user) {
      toast.info('Inicia sesión para guardar tus paquetes favoritos en tu perfil.', 'Acceso Requerido');
      onOpenAuth();
      return;
    }

    try {
      const isLiked = userFavorites.includes(paqueteId);
      
      if (isLiked) {
        await supabase
          .from('favoritos_usuario')
          .delete()
          .eq('usuario_id', user.id)
          .eq('paquete_id', paqueteId)
          .eq('tipo', 'paquete');
        setUserFavorites(prev => prev.filter(id => id !== paqueteId));
        toast.info('Paquete removido de tus favoritos.', 'Favoritos');
      } else {
        await supabase
          .from('favoritos_usuario')
          .insert({
            usuario_id: user.id,
            paquete_id: paqueteId,
            tipo: 'paquete'
          });
        setUserFavorites(prev => [...prev, paqueteId]);
        toast.success('¡Paquete guardado en tus favoritos!', 'Me Gusta ❤️');
      }
    } catch (err) {
      console.log('Error al actualizar favorito:', err);
    }
  };

  const handleUnirmeGrupo = (paquete) => {
    if (!user) {
      toast.info('Para unirte a un grupo debes iniciar sesión o registrarte primero.', 'Acceso Requerido');
      onOpenAuth();
      return;
    }

    if ((paquete.cupo_disponible ?? 0) <= 0) {
      toast.warning('Este paquete ya no cuenta con cupos disponibles.', 'Cupos Agotados');
      return;
    }

    setPaqueteAUnirme(paquete);
  };

  return (
    <section className="py-12 px-4 md:px-12 max-w-[1280px] mx-auto w-full">
      {/* Encabezado Hero Paquetes */}
      <div className="max-w-3xl mb-12">
        <p className="font-label-sm text-xs text-[#ffb703] uppercase tracking-widest mb-2 font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">stars</span> Experiencias Compartidas
        </p>
        <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4">
          Paquetes Grupales & VIP
        </h2>
        <p className="font-body text-base md:text-lg text-gray-300">
          Únete a exploradores con ideas afines. Aventuras cuidadosamente diseñadas en los destinos más impresionantes de Perú, ofreciendo lujo y autenticidad en compañía.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#1995ad]">progress_activity</span>
          <p className="mt-4 text-gray-400">Cargando las mejores expediciones grupales...</p>
        </div>
      ) : paquetes.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-3xl max-w-xl mx-auto my-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#ffb703]/10 border border-[#ffb703]/30 flex items-center justify-center mx-auto mb-4 text-[#ffb703] shadow-lg">
            <span className="material-symbols-outlined text-3xl">travel_explore</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 font-headline">
            Próximamente Nuevas Salidas Grupales
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            Actualmente todas las salidas grupales se encuentran cerradas o en preparación para las próximas temporadas. ¡Mantente atento a las nuevas fechas o solicita un itinerario a tu medida!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <span className="material-symbols-outlined text-base">support_agent</span>
            Consulta con nuestro equipo para viajes privados o fechas personalizadas
          </div>
        </div>
      ) : (
        /* Bento Grid 12 Columnas */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          {paquetes.map((pkg, idx) => {
            const inscritosReal = inscritosCounts[pkg.id] ?? 0;
            const cuposDisponiblesReales = Math.max(0, pkg.cupo_maximo - inscritosReal);
            const porcentaje = pkg.cupo_maximo > 0 ? Math.round((inscritosReal / pkg.cupo_maximo) * 100) : 0;
            const esDestacado = idx === 0; // El primer paquete ocupa 8 columnas Bento
            const colSpanClass = esDestacado ? 'md:col-span-8 h-[520px]' : idx === 1 ? 'md:col-span-4 h-[520px]' : 'md:col-span-6 h-[450px]';

            return (
              <article 
                key={pkg.id} 
                className={`${colSpanClass} group relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer card-3d border border-white/10 flex flex-col justify-between`}
              >
                {/* Imagen de fondo Parallax Hover */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={pkg.imagen_portada} 
                    alt={pkg.titulo} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071521]/95 via-[#071521]/40 to-transparent"></div>
                </div>

                {/* Badges superiores & Botón Me Gusta */}
                <div className="relative z-10 p-5 flex items-center justify-between w-full">
                  <div className="flex gap-2">
                    {esDestacado && (
                      <span className="bg-[#ffb703] text-black font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        Destacado
                      </span>
                    )}
                    <span className="bg-black/50 text-white font-semibold text-xs px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span> {pkg.fecha_salida}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorito(pkg.id);
                    }}
                    className="w-10 h-10 rounded-full bg-[#071521]/80 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition-all cursor-pointer shadow-lg z-20"
                    title={userFavorites.includes(pkg.id) ? 'Quitar de Favoritos' : 'Guardar en Me Gusta'}
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${userFavorites.includes(pkg.id) ? 'text-red-500' : 'text-white/80 hover:text-red-400'}`}>
                      {userFavorites.includes(pkg.id) ? 'favorite' : 'favorite'}
                    </span>
                  </button>
                </div>

                {/* Contenido Inferior de la Tarjeta */}
                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-end gap-4 mt-auto">
                  <div className="w-full md:w-auto flex-grow">
                    <div className="text-[#1995ad] font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span> {pkg.destino}
                    </div>
                    <h3 className="font-headline text-2xl md:text-3xl font-bold text-white mb-2">{pkg.titulo}</h3>
                    <p className="font-body text-sm text-gray-300 mb-3 max-w-lg line-clamp-2">{pkg.descripcion}</p>

                    {pkg.fecha_limite_inscripcion && (
                      <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <span>⏳ Inscripciones abiertas hasta el: <strong>{pkg.fecha_limite_inscripcion}</strong></span>
                      </div>
                    )}

                    {/* Barra de progreso de cupos Glassmorphic */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 w-full md:max-w-md">
                      <div className="flex justify-between text-xs font-semibold text-white mb-2">
                        <span>Cupos Disponibles</span>
                        <span className={cuposDisponiblesReales <= 3 ? 'text-red-400 font-bold' : 'text-[#ffb703]'}>
                          {cuposDisponiblesReales} de {pkg.cupo_maximo}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-[#1995ad] to-[#ffb703] rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#1995ad]">group</span> {inscritosReal} exploradores confirmados
                      </span>
                    </div>
                  </div>

                  {/* Acciones & Precio */}
                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                    <div className="text-white font-headline text-2xl font-bold">
                      S/ {pkg.precio_persona.toFixed(2)}<span className="text-xs font-normal text-gray-300"> /pp</span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => setSelectedPaquete(pkg)}
                        className="bg-white/15 backdrop-blur border border-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-white/30 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span> Ver Detalle
                      </button>
                      <button 
                        onClick={() => handleUnirmeGrupo(pkg)}
                        disabled={pkg.cupo_disponible <= 0 || submittingId === pkg.id}
                        className="btn-gold-3d text-xs px-5 py-2.5 rounded-full font-bold shadow-lg"
                      >
                        {submittingId === pkg.id ? 'Inscribiendo...' : (pkg.cupo_disponible <= 0 ? 'Agotado' : 'Unirme')}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle Completo del Paquete */}
      <DetallePaqueteModal 
        paquete={selectedPaquete}
        isOpen={!!selectedPaquete}
        onClose={() => setSelectedPaquete(null)}
        onUnirme={(pkg) => handleUnirmeGrupo(pkg)}
      />

      {/* Modal de Inscripción con Acompañantes y Cronograma de Cuotas */}
      {paqueteAUnirme && (
        <UnirmePaqueteModal
          paquete={paqueteAUnirme}
          isOpen={!!paqueteAUnirme}
          onClose={() => setPaqueteAUnirme(null)}
          user={user}
          profile={profile}
          onInscripcionExitosa={cargarPaquetes}
        />
      )}
    </section>
  );
}
