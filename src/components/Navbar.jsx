import React, { useState } from 'react';
import { User, LogOut, LayoutDashboard, Briefcase, Settings, Menu, X, Sparkles, Heart } from 'lucide-react';
import { MisDatosModal } from './MisDatosModal';

export function Navbar({ onOpenAuth, activeView, setActiveView, user, profile, onLogout, onProfileUpdated, onCotizarClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [misDatosOpen, setMisDatosOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = profile?.rol || 'cliente';

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'super_admin': return <span className="bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ml-1">Admin</span>;
      case 'editor_contenido': return <span className="bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ml-1">CMS</span>;
      case 'agente_ventas': return <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ml-1">Ventas</span>;
      case 'admin': return <span className="bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ml-1">Admin</span>;
      default: return null;
    }
  };

  const isAdminOrEditor = !profile || ['super_admin', 'admin', 'editor_contenido', 'agente_ventas'].includes(profile.rol);
  const displayName = profile?.nombre_completo || profile?.username || user?.email?.split('@')[0] || 'Usuario';

  const handleCotizarButton = () => {
    setMobileMenuOpen(false);
    if (onCotizarClick) {
      onCotizarClick();
    } else if (user) {
      setActiveView('mi-perfil');
    } else {
      onOpenAuth();
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#071521]/95 backdrop-blur-md border-b border-white/10 px-3 md:px-6 h-16 flex justify-between items-center transition-all">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setActiveView('inicio'); setMobileMenuOpen(false); }}>
        <img 
          src="/images/capullanas1.jpg" 
          alt="Aguitours Logo" 
          className="w-9 h-9 rounded-full border-2 border-[#1995ad] object-cover shadow-md"
        />
        <div>
          <h1 className="font-headline text-base md:text-lg font-bold tracking-tight text-white m-0 leading-tight">Aguitours</h1>
          <p className="text-[10px] text-[#1995ad] font-semibold m-0 tracking-wider hidden xl:block">Las Capullanas • Agencia de Viajes</p>
        </div>
      </div>

      {/* Nav Links Desktop */}
      <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
        <button 
          onClick={() => setActiveView('inicio')}
          className={`font-body text-xs xl:text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap px-2 py-1 ${activeView === 'inicio' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[18px]">explore</span> Inicio
        </button>

        <button 
          onClick={() => setActiveView('grupales')}
          className={`font-body text-xs xl:text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap px-2 py-1 ${activeView === 'grupales' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[18px]">groups</span> Paquetes Grupales
        </button>

        <button 
          onClick={() => setActiveView('destinos')}
          className={`font-body text-xs xl:text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap px-2 py-1 ${activeView === 'destinos' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[18px]">public</span> Destinos
        </button>

        <button 
          onClick={() => setActiveView('nosotros')}
          className={`font-body text-xs xl:text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap px-2 py-1 ${activeView === 'nosotros' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[18px]">info</span> Quiénes Somos
        </button>

        <button 
          onClick={() => setActiveView('contacto')}
          className={`font-body text-xs xl:text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap px-2 py-1 ${activeView === 'contacto' ? 'text-[#ffb703]' : 'text-white hover:text-[#1995ad]'}`}
        >
          <span className="material-symbols-outlined text-[18px]">support_agent</span> Contacto
        </button>

        {/* Botón Destacado: Cotizar Paquete Personalizado */}
        <button
          onClick={handleCotizarButton}
          className="bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-black font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles size={14} /> Cotizar
        </button>

        {user ? (
          <div className="relative">
            {/* Botón Nombre de Usuario */}
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="btn-primary-3d text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <User size={14} /> 
              <span className="font-bold max-w-[90px] xl:max-w-[120px] truncate">{displayName}</span>
              {getRoleBadge(userRole)}
            </button>

            {/* Dropdown de Opciones */}
            {dropdownOpen && (
              <div className="absolute right-0 top-11 bg-[#0d2538] border border-white/15 rounded-2xl w-64 shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/10 bg-black/20">
                  <p className="text-xs font-bold text-white m-0">{displayName}</p>
                  <p className="text-[11px] text-[#1995ad] m-0">{user.email}</p>
                </div>

                {isAdminOrEditor && (
                  <button 
                    onClick={() => { setActiveView('admin'); setDropdownOpen(false); }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-[#ffb703] hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-white/10 cursor-pointer bg-[#ffb703]/10"
                  >
                    <LayoutDashboard size={16} /> Portal Administrativo / CMS
                  </button>
                )}

                <button 
                  onClick={() => { setActiveView('mi-perfil'); setDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Briefcase size={16} className="text-[#1995ad]" /> Dashboard de Cliente / Mis Viajes
                </button>

                <button 
                  onClick={() => { setMisDatosOpen(true); setDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Settings size={16} className="text-gray-400" /> Editar Mis Datos & Clave
                </button>

                <button 
                  onClick={() => { onLogout(); setDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-xs font-bold text-red-400 bg-red-900/20 hover:bg-red-900/40 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary-3d text-xs px-4 py-1.5 cursor-pointer whitespace-nowrap">
            <User size={14} /> Ingresar
          </button>
        )}
      </nav>

      {/* Botón Menú Hamburguesa para Móviles */}
      <div className="flex lg:hidden items-center gap-3">
        <button
          onClick={handleCotizarButton}
          className="bg-[#ffb703] text-black font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md"
        >
          <Sparkles size={13} /> Cotizar
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2 rounded-xl bg-white/10 border border-white/15 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú Desplegable / Drawer en Celulares */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 bg-[#071521] border-b border-white/15 p-6 flex flex-col gap-4 shadow-2xl z-50 backdrop-blur-xl">
          <button 
            onClick={() => { setActiveView('inicio'); setMobileMenuOpen(false); }}
            className={`text-left text-sm font-bold p-3 rounded-xl flex items-center gap-3 ${activeView === 'inicio' ? 'bg-[#1995ad] text-white' : 'text-gray-200 bg-white/5'}`}
          >
            <span className="material-symbols-outlined">explore</span> Inicio
          </button>

          <button 
            onClick={() => { setActiveView('grupales'); setMobileMenuOpen(false); }}
            className={`text-left text-sm font-bold p-3 rounded-xl flex items-center gap-3 ${activeView === 'grupales' ? 'bg-[#1995ad] text-white' : 'text-gray-200 bg-white/5'}`}
          >
            <span className="material-symbols-outlined">groups</span> Paquetes Grupales
          </button>

          <button 
            onClick={() => { setActiveView('destinos'); setMobileMenuOpen(false); }}
            className={`text-left text-sm font-bold p-3 rounded-xl flex items-center gap-3 ${activeView === 'destinos' ? 'bg-[#1995ad] text-white' : 'text-gray-200 bg-white/5'}`}
          >
            <span className="material-symbols-outlined">public</span> Destinos
          </button>

          <button 
            onClick={() => { setActiveView('nosotros'); setMobileMenuOpen(false); }}
            className={`text-left text-sm font-bold p-3 rounded-xl flex items-center gap-3 ${activeView === 'nosotros' ? 'bg-[#1995ad] text-white' : 'text-gray-200 bg-white/5'}`}
          >
            <span className="material-symbols-outlined">info</span> Quiénes Somos
          </button>

          <button 
            onClick={() => { setActiveView('contacto'); setMobileMenuOpen(false); }}
            className={`text-left text-sm font-bold p-3 rounded-xl flex items-center gap-3 ${activeView === 'contacto' ? 'bg-[#1995ad] text-white' : 'text-gray-200 bg-white/5'}`}
          >
            <span className="material-symbols-outlined">support_agent</span> Contacto
          </button>

          {user && (
            <button 
              onClick={() => { setActiveView('mi-perfil'); setMobileMenuOpen(false); }}
              className={`text-left text-sm font-bold p-3 rounded-xl flex items-center gap-3 ${activeView === 'mi-perfil' ? 'bg-[#1995ad] text-white' : 'text-gray-200 bg-white/5'}`}
            >
              <Briefcase size={20} className="text-[#ffb703]" /> Portal del Cliente / Mis Viajes
            </button>
          )}

          {user && isAdminOrEditor && (
            <button 
              onClick={() => { setActiveView('admin'); setMobileMenuOpen(false); }}
              className="text-left text-sm font-bold p-3 rounded-xl bg-[#ffb703] text-black flex items-center gap-3"
            >
              <LayoutDashboard size={20} /> Panel Administrativo
            </button>
          )}

          {user ? (
            <button 
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="text-left text-sm font-bold p-3 rounded-xl bg-red-900/40 border border-red-500/40 text-red-300 flex items-center gap-3"
            >
              <LogOut size={20} /> Cerrar Sesión ({displayName})
            </button>
          ) : (
            <button 
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="btn-gold-3d py-3 justify-center text-xs font-bold"
            >
              <User size={18} /> Ingresar / Registrarse
            </button>
          )}
        </div>
      )}

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
