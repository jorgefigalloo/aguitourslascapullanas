import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DetallePaqueteModal } from './DetallePaqueteModal';
import { useToast } from '../context/ToastContext';

export function PaquetesGrupales({ user, profile, onOpenAuth }) {
  const toast = useToast();
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [selectedPaquete, setSelectedPaquete] = useState(null);

  useEffect(() => {
    cargarPaquetes();
  }, []);

  const cargarPaquetes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('paquetes_grupales')
        .select('*')
        .order('fecha_salida', { ascending: true });

      if (data && data.length > 0) {
        setPaquetes(data);
      } else {
        setPaquetes([
          {
            id: '11111111-1111-1111-1111-111111111111',
            titulo: 'Expedición Sagrada a Cusco',
            destino: 'Cusco, Perú',
            descripcion: 'Ocho días de inmersión cultural y paisajes espectaculares con guías expertos y alojamiento premium.',
            fecha_salida: '15-22 Nov',
            fecha_retorno: '22 Nov',
            precio_persona: 1250.00,
            cupo_maximo: 20,
            cupo_disponible: 8,
            estado: 'abierto',
            imagen_portada: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop'
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            titulo: 'Aventura en Dunas y Oasis',
            destino: 'Huacachina, Perú',
            descripcion: 'Paseo en carros tubulares, sandboard y atardecer mágico en el desierto de Ica.',
            fecha_salida: '01-04 Dic',
            fecha_retorno: '04 Dic',
            precio_persona: 450.00,
            cupo_maximo: 25,
            cupo_disponible: 15,
            estado: 'abierto',
            imagen_portada: 'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?q=80&w=800&auto=format&fit=crop'
          },
          {
            id: '33333333-3333-3333-3333-333333333333',
            titulo: 'Trekking Colores del Sur',
            destino: 'Vinicunca, Perú',
            descripcion: 'Vinicunca y Valle Rojo con campamento de lujo.',
            fecha_salida: '10-12 Ene',
            fecha_retorno: '12 Ene',
            precio_persona: 650.00,
            cupo_maximo: 12,
            cupo_disponible: 2,
            estado: 'abierto',
            imagen_portada: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=800&auto=format&fit=crop'
          },
          {
            id: '44444444-4444-4444-4444-444444444444',
            titulo: 'Misterios del Titicaca',
            destino: 'Puno, Perú',
            descripcion: 'Navegación premium y estancia en islas flotantes exclusivas.',
            fecha_salida: '05-09 Feb',
            fecha_retorno: '09 Feb',
            precio_persona: 820.00,
            cupo_maximo: 15,
            cupo_disponible: 10,
            estado: 'abierto',
            imagen_portada: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop'
          }
        ]);
      }
    } catch (e) {
      console.error('Error al cargar paquetes:', e);
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

  const handleUnirmeGrupo = async (paquete) => {
    if (!user) {
      toast.info('Para unirte a un grupo debes iniciar sesión o registrarte primero.', 'Acceso Requerido');
      onOpenAuth();
      return;
    }

    if ((paquete.cupo_disponible ?? 0) <= 0) {
      toast.warning('Este paquete ya no cuenta con cupos disponibles.', 'Cupos Agotados');
      return;
    }

    const confirmacion = window.confirm(`¿Confirmas tu lugar en "${paquete.titulo}" por S/ ${parseFloat(paquete.precio_persona).toFixed(2)}?`);
    if (!confirmacion) return;

    setSubmittingId(paquete.id);

    try {
      // 1. Intentar inscripción vía función RPC atómica
      const { data: rpcData, error: rpcError } = await supabase.rpc('fn_inscribir_usuario_paquete', {
        p_usuario_id: user.id,
        p_paquete_id: paquete.id,
        p_cantidad_personas: 1
      });

      if (!rpcError && rpcData) {
        toast.success('¡Felicitaciones! Te has unido exitosamente al grupo. Revisa tus viajes en tu panel de cliente.', 'Inscripción Confirmada 🎉');
        cargarPaquetes();
        return;
      }

      // 2. Fallback de inserción directa si la RPC aún no se ejecutó
      const { error: insErr } = await supabase
        .from('inscripciones_grupo')
        .insert({
          usuario_id: user.id,
          paquete_id: paquete.id,
          cantidad_personas: 1,
          precio_total: paquete.precio_persona,
          estado: 'confirmado'
        });

      if (insErr) throw insErr;

      // Descontar cupo en paquetes_grupales
      const nuevoCupo = Math.max(0, (paquete.cupo_disponible || 1) - 1);
      await supabase
        .from('paquetes_grupales')
        .update({
          cupo_disponible: nuevoCupo,
          estado: nuevoCupo === 0 ? 'completo' : paquete.estado
        })
        .eq('id', paquete.id);

      toast.success('Reserva completada con éxito. Revisa tu panel de cliente.', 'Inscripción Exitosa 🎉');
      cargarPaquetes();
    } catch (err) {
      toast.error('Ocurrió un error al procesar la solicitud: ' + (err.message || 'Error de conexión'));
    } finally {
      setSubmittingId(null);
    }
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
      ) : (
        /* Bento Grid 12 Columnas */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          {paquetes.map((pkg, idx) => {
            const porcentaje = Math.round(((pkg.cupo_maximo - pkg.cupo_disponible) / pkg.cupo_maximo) * 100);
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
                    <span className="bg-[#071521]/80 backdrop-blur-md text-white font-semibold text-xs px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
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
                    <p className="font-body text-sm text-gray-300 mb-4 max-w-lg line-clamp-2">{pkg.descripcion}</p>

                    {/* Barra de progreso de cupos Glassmorphic */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 w-full md:max-w-md">
                      <div className="flex justify-between text-xs font-semibold text-white mb-2">
                        <span>Cupos Disponibles</span>
                        <span className={pkg.cupo_disponible <= 3 ? 'text-red-400 font-bold' : 'text-[#ffb703]'}>
                          {pkg.cupo_maximo - pkg.cupo_disponible} / {pkg.cupo_maximo}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-[#1995ad] to-[#ffb703] rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#1995ad]">group</span> {pkg.cupo_maximo - pkg.cupo_disponible} exploradores confirmados
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
    </section>
  );
}
