import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, User, Mail, Phone, FileText, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function VerLikesDestinoModal({ destino, isOpen, onClose }) {
  const [likesList, setLikesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && destino) {
      cargarLikes();
    }
  }, [isOpen, destino]);

  const cargarLikes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favoritos_usuario')
        .select(`
          id,
          created_at,
          perfiles (
            id,
            nombre_completo,
            username,
            email,
            telefono,
            documento_identidad
          )
        `)
        .eq('destino_id', destino.id)
        .eq('tipo', 'destino')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLikesList(data || []);
    } catch (err) {
      console.error('Error al cargar likes del destino:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !destino) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative my-auto max-h-[85vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0d2538] to-[#1995ad] p-6 text-white text-left relative shrink-0 border-b border-white/10">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-red-500/20 text-red-400 p-2 rounded-xl border border-red-500/30">
              <Heart size={20} className="fill-red-500 text-red-500" />
            </span>
            <div>
              <h3 className="font-headline text-xl font-bold text-white m-0">
                Usuarios a los que les gusta "{destino.nombre}"
              </h3>
              <p className="text-xs text-gray-300 m-0">
                Total {likesList.length} viajero(s) han guardado este destino en sus favoritos
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm animate-pulse">
              Cargando lista de likes...
            </div>
          ) : likesList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white/5 rounded-2xl border border-white/10 p-6">
              <Heart size={32} className="mx-auto mb-2 opacity-30 text-red-400" />
              <p className="text-sm font-semibold text-white mb-1">Aún no hay "Me Gusta" en este destino</p>
              <p className="text-xs text-gray-400">Los clientes podrán darle Me Gusta desde la sección de destinos públicos.</p>
            </div>
          ) : (
            likesList.map((item) => {
              const p = item.perfiles || {};
              const fechaLike = item.created_at ? new Date(item.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

              return (
                <div 
                  key={item.id}
                  className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-base shrink-0">
                      {(p.nombre_completo || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        {p.nombre_completo || 'Usuario Registrado'}
                        <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-md font-mono">
                          @{p.username || 'sin_username'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-[#1995ad]" /> {p.email || 'Sin correo'}
                        </span>
                        {p.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-emerald-400" /> {p.telefono}
                          </span>
                        )}
                        {p.documento_identidad && (
                          <span className="flex items-center gap-1">
                            <FileText size={12} className="text-amber-400" /> DNI: {p.documento_identidad}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0 self-end sm:self-center bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Calendar size={12} className="text-red-400" /> {fechaLike}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar Nómina
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
