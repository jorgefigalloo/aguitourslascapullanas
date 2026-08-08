import React, { useState } from 'react';
import { User, LogOut, LayoutDashboard, Briefcase, Settings } from 'lucide-react';
import { MisDatosModal } from './MisDatosModal';

export function Navbar({ onOpenAuth, activeView, setActiveView, user, profile, onLogout, onProfileUpdated }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [misDatosOpen, setMisDatosOpen] = useState(false);

  const userRole = profile?.rol || 'super_admin'; // Fallback a super_admin si aun cargando

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'super_admin': return <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ml-1">Super Admin</span>;
      case 'editor_contenido': return <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ml-1">Editor CMS</span>;
      case 'agente_ventas': return <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ml-1">Ventas</span>;
      case 'admin': return <span className="bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ml-1">Admin</span>;
      default: return <span className="bg-green-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ml-1">Viajero</span>;
    }
  };

  const isAdminOrEditor = !profile || ['super_admin', 'admin', 'editor_contenido', 'agente_ventas'].includes(profile.rol);

  const displayName = profile?.nombre_completo || profile?.username || user?.email?.split('@')[0] || 'Jorge Figallo';

  return (
    <header className="fixed top-0 w-full z-50 bg-[#071521]/85 backdrop-blur-md border-b border-white/10 px-4 md:px-8 h-20 flex justify-between items-center transition-all">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('inicio')}>
        <img 
          src="/images/capullanas1.jpg" 
          alt="Aguitours Logo" 
          className="w-11 h-11 rounded-full border-2 border-[#1995ad] object-cover shadow-md"
        />
        <div>
          <h1 className="font-headline text-xl font-bold tracking-tight text-white m-0">Aguitours</h1>
          <p className="text-[11px] text-[#1995ad] font-semibold m-0 tracking-wider">Las Capullanas • Agencia de Viajes</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-5">
        <button 
          onClick={() => setActiveView('inicio')}
          className={`font-body text-sm font-semibold flex items-center gap-1.5 transition-colors ${activeView === 'inicio' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">explore</span> Inicio
        </button>

        <button 
          onClick={() => setActiveView('grupales')}
          className={`font-body text-sm font-semibold flex items-center gap-1.5 transition-colors ${activeView === 'grupales' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">groups</span> Paquetes Grupales
        </button>

        <button 
          onClick={() => setActiveView('destinos')}
          className={`font-body text-sm font-semibold flex items-center gap-1.5 transition-colors ${activeView === 'destinos' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">public</span> Destinos
        </button>

        <button 
          onClick={() => setActiveView('nosotros')}
          className={`font-body text-sm font-semibold flex items-center gap-1.5 transition-colors ${activeView === 'nosotros' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">info</span> Quiénes Somos
        </button>

        <button 
          onClick={() => setActiveView('contacto')}
          className={`font-body text-sm font-semibold flex items-center gap-1.5 transition-colors ${activeView === 'contacto' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">support_agent</span> Contacto
        </button>

        {/* Acceso directo a Panel Admin para SuperAdmin */}
        {user && isAdminOrEditor && (
          <button 
            onClick={() => setActiveView('admin')}
            className={`font-body text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${activeView === 'admin' ? 'bg-[#ffb703] text-black' : 'bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] hover:bg-[#ffb703] hover:text-black'}`}
          >
            <LayoutDashboard size={14} /> Panel Admin
          </button>
        )}

        {user ? (
          <div className="relative">
            {/* Botón Nombre de Usuario */}
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="btn-primary-3d text-xs px-4 py-2 flex items-center gap-2"
            >
              <User size={15} /> 
              <span className="font-bold">{displayName}</span>
              {getRoleBadge(userRole)}
            </button>

            {/* Dropdown de Opciones */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 bg-[#0d2538] border border-white/15 rounded-2xl w-64 shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/10 bg-black/20">
                  <p className="text-xs font-bold text-white m-0">{displayName}</p>
                  <p className="text-[11px] text-[#1995ad] m-0">{user.email}</p>
                </div>

                {isAdminOrEditor && (
                  <button 
                    onClick={() => { setActiveView('admin'); setDropdownOpen(false); }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-[#ffb703] hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-white/10"
                  >
                    <LayoutDashboard size={16} /> Portal Administrativo / CMS
                  </button>
                )}

                <button 
                  onClick={() => { setMisDatosOpen(true); setDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} className="text-[#1995ad]" /> Editar Mis Datos & Clave
                </button>

                <button 
                  onClick={() => { setActiveView('mi-perfil'); setDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Briefcase size={16} /> Mis Viajes & Inscripciones
                </button>

                <button 
                  onClick={() => { onLogout(); setDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-xs font-bold text-red-400 bg-red-900/20 hover:bg-red-900/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary-3d text-xs px-5 py-2.5">
            <User size={15} /> Ingresar / Registrarse
          </button>
        )}
      </nav>

      {/* Modal Editar Mis Datos & Clave */}
      <MisDatosModal 
        isOpen={misDatosOpen} 
        onClose={() => setMisDatosOpen(false)}
        user={user}
        profile={profile}
        onProfileUpdated={onProfileUpdated}
      />
    </header>
  );
}
