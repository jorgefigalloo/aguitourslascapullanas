import React, { useState, useEffect } from 'react';
import { Globe, Plus, Edit3, Trash2, MapPin, Heart, Users } from 'lucide-react';
import { CrearDestinoModal } from '../destinos/CrearDestinoModal';
import { EditarDestinoModal } from '../destinos/EditarDestinoModal';
import { VerLikesDestinoModal } from '../destinos/VerLikesDestinoModal';
import { supabase } from '../../lib/supabase';

export function AdminDestinosModule({ destinos = [], onActualizar }) {
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [destinoAEditar, setDestinoAEditar] = useState(null);
  const [destinoALikes, setDestinoALikes] = useState(null);
  const [likesCounts, setLikesCounts] = useState({});

  useEffect(() => {
    cargarContadoresLikes();
  }, [destinos]);

  const cargarContadoresLikes = async () => {
    try {
      const { data } = await supabase
        .from('favoritos_usuario')
        .select('destino_id')
        .eq('tipo', 'destino');

      if (data) {
        const counts = {};
        data.forEach(item => {
          if (item.destino_id) {
            counts[item.destino_id] = (counts[item.destino_id] || 0) + 1;
          }
        });
        setLikesCounts(counts);
      }
    } catch (e) {
      console.log('Error al contar likes de destinos:', e);
    }
  };

  return (
    <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2">
            <Globe size={26} className="text-[#1995ad]" /> Gestión de Destinos Turísticos ({destinos.length})
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            Administra las ciudades y atracciones disponibles para viajes nacionales e internacionales
          </p>
        </div>

        <button 
          onClick={() => setCrearModalOpen(true)} 
          className="btn-gold-3d text-xs font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus size={18} /> Registrar Nuevo Destino
        </button>
      </div>

      {/* Grid de Destinos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {destinos.map(d => {
          const totalLikes = likesCounts[d.id] || 0;

          return (
            <div 
              key={d.id} 
              className="bg-[#071521] border border-white/10 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-[#1995ad]/50 transition-all"
            >
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={d.imagen_portada} 
                  alt={d.nombre} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => { e.target.src = '/images/ciudades/fondo-destinos1.png'; }}
                />
                <span className="absolute top-3 left-3 bg-[#071521]/80 backdrop-blur-md text-[#1995ad] border border-[#1995ad]/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                  {d.tipo}
                </span>

                <button
                  onClick={() => setDestinoALikes(d)}
                  title="Ver nómina de usuarios que dieron Me Gusta"
                  className="absolute top-3 right-3 bg-red-950/90 hover:bg-red-900 backdrop-blur-md text-red-200 border border-red-500/50 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                >
                  <Heart size={12} className="fill-red-400 text-red-400" /> {totalLikes} Me Gusta (Ver)
                </button>
              </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-lg mb-1 flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#ffb703]" /> {d.nombre}
                </h4>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed mb-4">
                  {d.descripcion}
                </p>
              </div>

              <button
                onClick={() => setDestinoAEditar(d)}
                className="bg-white/10 hover:bg-[#1995ad] hover:text-white text-gray-200 border border-white/15 text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer w-full"
              >
                <Edit3 size={14} /> Editar / Eliminar Destino
              </button>
            </div>
          </div>
        );
      })}
      </div>

      {/* Modales */}
      <CrearDestinoModal 
        isOpen={crearModalOpen} 
        onClose={() => setCrearModalOpen(false)} 
        onDestinoCreado={onActualizar} 
      />

      <EditarDestinoModal 
        destino={destinoAEditar} 
        isOpen={!!destinoAEditar} 
        onClose={() => setDestinoAEditar(null)} 
        onDestinoActualizado={onActualizar} 
      />

      <VerLikesDestinoModal
        destino={destinoALikes}
        isOpen={!!destinoALikes}
        onClose={() => setDestinoALikes(null)}
      />
    </div>
  );
}
