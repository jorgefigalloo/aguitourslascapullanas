import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Heart, Calendar, Package, MapPin, CheckCircle, Clock, ShieldCheck, Mail, Phone, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function VerDetalleClienteModal({ cliente, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('reservas'); // 'reservas' | 'favoritos'
  const [reservas, setReservas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && cliente) {
      cargarActividadCliente();
    }
  }, [isOpen, cliente]);

  const cargarActividadCliente = async () => {
    setLoading(true);
    try {
      // 1. Cargar reservas del cliente
      const { data: resData } = await supabase
        .from('inscripciones_grupo')
        .select('*, paquetes_grupales(titulo, destino, fecha_salida, precio_persona, imagen_portada)')
        .eq('usuario_id', cliente.id)
        .order('fecha_inscripcion', { ascending: false });

      if (resData) setReservas(resData);

      // 2. Cargar me gustas/favoritos del cliente (paquetes y destinos)
      const { data: favData } = await supabase
        .from('favoritos_usuario')
        .select('*, paquetes_grupales(titulo, destino, precio_persona), destinos_turisticos(nombre, tipo)')
        .eq('usuario_id', cliente.id)
        .order('created_at', { ascending: false });

      if (favData) setFavoritos(favData);
    } catch (err) {
      console.error('Error al cargar detalle del cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !cliente) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto max-h-[88vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0d2538] to-[#1995ad] p-6 text-white relative shrink-0 border-b border-white/10">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold text-[#ffb703] shrink-0">
              {(cliente.nombre_completo || 'C')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-white m-0 flex items-center gap-2">
                Expediente de {cliente.nombre_completo}
              </h3>
              <div className="text-xs text-gray-300 flex flex-wrap items-center gap-3 mt-1">
                <span>@{cliente.username || 'sin_username'}</span>
                <span>• {cliente.email || 'Sin correo'}</span>
                {cliente.telefono && <span>• Tel: {cliente.telefono}</span>}
              </div>
            </div>
          </div>

          {/* Sub-Tabs de Navegación */}
          <div className="flex items-center gap-3 mt-5 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveTab('reservas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reservas'
                  ? 'bg-[#1995ad] text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Package size={14} /> 🎟️ Viajes Inscritos ({reservas.length})
            </button>

            <button
              onClick={() => setActiveTab('favoritos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'favoritos'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Heart size={14} className="fill-current" /> ❤️ Me Gusta Guardados ({favoritos.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm animate-pulse">
              Cargando historial del cliente...
            </div>
          ) : activeTab === 'reservas' ? (
            reservas.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-white/5 rounded-2xl border border-white/10 p-6">
                <Package size={32} className="mx-auto mb-2 opacity-30 text-[#1995ad]" />
                <p className="text-sm font-semibold text-white mb-1">El cliente aún no se ha inscrito a ningún paquete</p>
              </div>
            ) : (
              reservas.map((r) => {
                const p = r.paquetes_grupales || {};
                return (
                  <div key={r.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <MapPin size={14} className="text-[#ffb703]" /> {p.titulo || 'Paquete Grupal'}
                      </h4>
                      <p className="text-xs text-gray-300 mt-0.5">{p.destino} • Salida: {p.fecha_salida || 'Por definir'}</p>
                      <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-3">
                        <span>🎟️ Personas: <strong>{r.cantidad_personas}</strong></span>
                        <span>💰 Total: <strong>S/ {parseFloat(r.precio_total || 0).toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${
                        r.estado === 'confirmado' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                        r.estado === 'pendiente_confirmacion_tarifa' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' :
                        'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}>
                        {r.estado === 'pendiente_confirmacion_tarifa' ? '⏳ Reevaluando Tarifa' : r.estado}
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            favoritos.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-white/5 rounded-2xl border border-white/10 p-6">
                <Heart size={32} className="mx-auto mb-2 opacity-30 text-red-400" />
                <p className="text-sm font-semibold text-white mb-1">El cliente aún no ha guardado me gusta</p>
              </div>
            ) : (
              favoritos.map((f) => {
                const esPaquete = f.tipo === 'paquete';
                const nombreItem = esPaquete ? (f.paquetes_grupales?.titulo || 'Paquete') : (f.destinos_turisticos?.nombre || 'Destino');
                const subItem = esPaquete ? f.paquetes_grupales?.destino : f.destinos_turisticos?.tipo;

                return (
                  <div key={f.id} className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <Heart size={16} className="text-red-400 fill-red-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">{nombreItem}</p>
                        <p className="text-[11px] text-gray-400">{subItem} ({esPaquete ? 'Paquete Grupal' : 'Destino Turístico'})</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2.5 py-1 rounded-lg">
                      {new Date(f.created_at).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                );
              })
            )
          )}
        </div>

        <div className="p-4 bg-black/20 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer">
            Cerrar Expediente
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
