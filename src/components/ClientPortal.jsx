import React, { useState, useEffect } from 'react';
import { Briefcase, Heart, Sparkles, UserCheck, ShieldCheck, User } from 'lucide-react';
import { ClientMisViajes } from './cliente/ClientMisViajes';
import { ClientFavoritos } from './cliente/ClientFavoritos';
import { ClientSolicitudesCotizacion } from './cliente/ClientSolicitudesCotizacion';
import { ClientPerfilEditar } from './cliente/ClientPerfilEditar';
import { AlertaNuevaTarifaModal } from './cliente/AlertaNuevaTarifaModal';

export function ClientPortal({ user, profile, initialTab = 'mis-viajes', onExplorarPaquetes }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="max-w-7xl mx-auto mt-28 mb-16 px-4 sm:px-6 lg:px-8">
      {/* Banner de Bienvenida del Cliente */}
      <div className="bg-gradient-to-r from-[#071521] via-[#0b3c5d] to-[#0d5c75] border border-[#1995ad]/40 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#1995ad] to-[#ffb703] rounded-full flex items-center justify-center text-[#071521] shadow-lg shadow-[#ffb703]/30 shrink-0 font-extrabold text-2xl">
            {profile?.nombre_completo?.[0] || 'V'}
          </div>
          <div>
            <span className="bg-[#1995ad]/25 border border-[#1995ad] text-[#a0f0ff] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Portal del Pasajero VIP
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white m-0 mt-1">
              ¡Hola, {profile?.nombre_completo || 'Viajero Explorer'}!
            </h2>
            <p className="text-xs md:text-sm text-gray-300 m-0 mt-1">
              {user?.email} | Doc: {profile?.documento_identidad || 'No registrado'} | Rol: {profile?.rol || 'cliente'}
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center md:text-right shrink-0">
          <div className="text-xs text-[#ffb703] font-bold">Estado de Cuenta</div>
          <div className="text-lg font-black text-white">Pasajero Activo</div>
        </div>
      </div>

      {/* Alerta Interactiva de Recálculo de Tarifa Pendiente de Confirmación */}
      <AlertaNuevaTarifaModal user={user} />

      {/* Navegación por Pestañas del Dashboard del Cliente */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-white/10">
        {[
          { id: 'mis-viajes', label: 'Mis Viajes & Inscripciones', icon: Briefcase },
          { id: 'favoritos', label: 'Mis Favoritos Guardados', icon: Heart },
          { id: 'cotizar', label: 'Cotizar Paquete Personalizado', icon: Sparkles },
          { id: 'perfil', label: 'Editar Mi Perfil & Clave', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive 
                  ? 'bg-gradient-to-r from-[#1995ad] to-[#0d5c75] text-white border-[#1995ad] shadow-lg shadow-[#1995ad]/30' 
                  : 'bg-[#071521]/60 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#ffb703]' : 'text-gray-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Vista Activa del Cliente */}
      <div>
        {activeTab === 'mis-viajes' && (
          <ClientMisViajes user={user} />
        )}

        {activeTab === 'favoritos' && (
          <ClientFavoritos user={user} onExplorarPaquetes={onExplorarPaquetes} />
        )}

        {activeTab === 'cotizar' && (
          <ClientSolicitudesCotizacion user={user} profile={profile} />
        )}

        {activeTab === 'perfil' && (
          <ClientPerfilEditar user={user} profile={profile} />
        )}
      </div>
    </div>
  );
}
