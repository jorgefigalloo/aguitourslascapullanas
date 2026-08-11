import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, Trash2, ExternalLink, Package, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ClientFavoritos({ user, onExplorarPaquetes }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      cargarFavoritos();
    }
  }, [user]);

  const cargarFavoritos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favoritos_usuario')
        .select('*, paquetes_grupales(*), destinos_turisticos(*)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setFavoritos(data);
      }
    } catch (e) {
      console.error('Error al cargar favoritos:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarFavorito = async (favId) => {
    try {
      const { error } = await supabase
        .from('favoritos_usuario')
        .delete()
        .eq('id', favId);

      if (error) throw error;
      setFavoritos(prev => prev.filter(f => f.id !== favId));
    } catch (err) {
      alert('Error al eliminar favorito: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2 m-0">
            <Heart size={26} className="text-red-500 fill-red-500" /> Mis Paquetes & Destinos Guardados ({favoritos.length})
          </h3>
          <p className="text-xs text-gray-300 mt-1 m-0">
            Tus experiencias y destinos preferidos listos para cotizar o inscribirte
          </p>
        </div>

        <button
          onClick={cargarFavoritos}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-xl border border-white/15 transition-all cursor-pointer"
        >
          Actualizar Lista
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-gray-400">
          <p>Cargando tus elementos favoritos...</p>
        </div>
      ) : favoritos.length === 0 ? (
        <div className="bg-white/5 p-10 rounded-3xl text-center border border-white/10">
          <Heart size={48} className="text-gray-500 mx-auto mb-3 opacity-40" />
          <p className="text-gray-300 text-lg mb-2">Aún no has guardado ningún paquete o destino en tus favoritos.</p>
          <p className="text-gray-400 text-xs mb-6">Explora nuestro catálogo de experiencias y haz clic en el icono de corazón para guardarlos aquí.</p>
          <button
            onClick={onExplorarPaquetes}
            className="btn-gold-3d text-xs px-6 py-3 font-bold inline-flex items-center gap-2"
          >
            <Package size={16} /> Explorar Paquetes Grupales
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favoritos.map(fav => {
            const isPaquete = fav.tipo === 'paquete';
            const itemObj = isPaquete ? fav.paquetes_grupales : fav.destinos_turisticos;

            if (!itemObj) return null;

            return (
              <div 
                key={fav.id}
                className="bg-[#071521]/90 rounded-3xl border border-white/15 overflow-hidden shadow-xl flex flex-col justify-between hover:border-[#1995ad]/60 transition-all"
              >
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={itemObj.imagen_portada || '/images/hero-bg.jpg'} 
                    alt={isPaquete ? itemObj.titulo : itemObj.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071521] via-transparent to-black/40" />
                  
                  <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    isPaquete ? 'bg-[#1995ad] text-white' : 'bg-[#ffb703] text-black'
                  }`}>
                    {isPaquete ? 'Paquete Grupal' : 'Destino Turístico'}
                  </span>

                  <button
                    onClick={() => handleEliminarFavorito(fav.id)}
                    className="absolute top-3 right-3 bg-red-900/60 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-all border border-red-500/40"
                    title="Quitar de favoritos"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="text-lg font-bold text-white m-0 drop-shadow-md">
                      {isPaquete ? itemObj.titulo : itemObj.nombre}
                    </h4>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    {isPaquete ? (
                      <>
                        <p className="text-xs text-[#1995ad] font-bold flex items-center gap-1.5 mb-2">
                          <MapPin size={14} /> {itemObj.destino}
                        </p>
                        <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                          {itemObj.descripcion}
                        </p>
                        <div className="flex justify-between items-center text-xs pt-3 border-t border-white/10">
                          <span className="text-gray-400">Precio Persona:</span>
                          <span className="text-[#ffb703] font-black text-base">S/ {parseFloat(itemObj.precio_persona).toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-[#ffb703] font-bold uppercase flex items-center gap-1.5 mb-2">
                          <Globe size={14} /> Tipo: {itemObj.tipo}
                        </p>
                        <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                          {itemObj.descripcion}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                    <button
                      onClick={onExplorarPaquetes}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/15 flex items-center gap-1.5 transition-all"
                    >
                      Ver Opciones <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
