import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Edit3, Plus, Users, Globe, ArrowLeft, Search, Bell, LogOut, CheckCircle, Clock, Calendar, ChevronRight, ChevronLeft, ShieldCheck, Database, Package, UserCheck, Sparkles, Menu, X, User, Settings, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MisDatosModal } from './MisDatosModal';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminPaquetesModule } from './admin/AdminPaquetesModule';
import { AdminCMSModule } from './admin/AdminCMSModule';
import { AdminDestinosModule } from './admin/AdminDestinosModule';
import { AdminUsuariosModule } from './admin/AdminUsuariosModule';
import { AdminAuditoriaModule } from './admin/AdminAuditoriaModule';
import { AdminClientesModule } from './admin/AdminClientesModule';
import { AdminSolicitudesModule } from './admin/AdminSolicitudesModule';

export function AdminDashboard({ user, profile, onBackToSite }) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [cmsSections, setCmsSections] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [rolesSistema, setRolesSistema] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [misDatosOpen, setMisDatosOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    cargarDatosCMS();
    cargarPaquetes();
    cargarDestinos();
    cargarUsuarios();
    cargarRolesSistema();
    cargarAuditoria();
  };

  const cargarDatosCMS = async () => {
    try {
      const { data } = await supabase.from('cms_contenido').select('*');
      if (data) setCmsSections(data);
    } catch (e) { console.log(e); }
  };

  const cargarPaquetes = async () => {
    try {
      const { data } = await supabase.from('paquetes_grupales').select('*').order('created_at', { ascending: false });
      if (data) setPaquetes(data);
    } catch (e) { console.log(e); }
  };

  const cargarDestinos = async () => {
    try {
      const { data } = await supabase.from('destinos_turisticos').select('*').order('created_at', { ascending: false });
      if (data) setDestinos(data);
    } catch (e) { console.log(e); }
  };

  const cargarUsuarios = async () => {
    try {
      const { data } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
      if (data) setUsuarios(data);
    } catch (e) { console.log(e); }
  };

  const cargarRolesSistema = async () => {
    try {
      const { data } = await supabase.from('roles_sistema').select('*');
      if (data) setRolesSistema(data);
    } catch (e) { console.log(e); }
  };

  const cargarAuditoria = async () => {
    try {
      const { data } = await supabase.from('tabla_auditoria').select('*').order('fecha', { ascending: false }).limit(25);
      if (data) setAuditorias(data);
    } catch (e) { console.log(e); }
  };

  const tienePermiso = (permisoId) => {
    if (!profile) return true; // Fallback
    if (profile.rol === 'super_admin') return true; // Solo Super Admin ignora la matriz
    const userRoleObj = rolesSistema.find(r => r.id === profile.rol);
    if (!userRoleObj || !Array.isArray(userRoleObj.permisos)) return false;
    return userRoleObj.permisos.includes(permisoId) || userRoleObj.permisos.includes('all');
  };

  const navItems = [
    { id: 'analytics', label: 'Métricas & Ventas', icon: LayoutDashboard, perm: 'analytics_ver' },
    { id: 'clientes', label: 'Clientes & Reservas', icon: UserCheck, perm: 'clientes_ver' },
    { id: 'cotizaciones', label: 'Cotizaciones A Medida', icon: Sparkles, perm: 'cotizaciones_ver' },
    { id: 'paquetes', label: 'Paquetes Grupales', icon: Package, perm: 'paquetes_ver' },
    { id: 'destinos', label: 'Destinos Turísticos', icon: Globe, perm: 'destinos_ver' },
    { id: 'cms', label: 'Gestión CMS', icon: Edit3, perm: 'cms_ver' },
    { id: 'rbac', label: 'Usuarios & Permisos', icon: ShieldCheck, perm: 'usuarios_ver' },
    { id: 'auditoria', label: 'Auditoría BD', icon: Database, perm: 'auditoria_ver' }
  ].filter(tab => tienePermiso(tab.perm));

  return (
    <div className="min-h-screen bg-[#071521] text-white font-body flex flex-col">
      
      {/* 👑 BARRA NAVEGACIÓN SUPERIOR (LOGO, USUARIO LOGUEADO & ACCIONES) */}
      <header className="sticky top-0 z-50 bg-[#040d16] border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between shadow-xl">
        
        {/* Izquierda: Logo & Título del Sistema */}
        <div className="flex items-center gap-3">
          <img src="/images/capullanas1.jpg" alt="Logo" className="w-9 h-9 rounded-full border border-[#ffb703] shadow-md shrink-0" />
          <div>
            <h2 className="font-headline font-bold text-base text-white m-0 tracking-wide flex items-center gap-2">
              Aguitours <span className="bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/40 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">Admin Panel</span>
            </h2>
          </div>
        </div>

        {/* Derecha: Desplegable de Usuario Logueado & Acciones Rápida */}
        <div className="flex items-center gap-3">
          {/* Menú Desplegable de Usuario */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 bg-[#071521] hover:bg-[#0d2538] border border-white/15 px-3 py-1.5 rounded-2xl shadow-inner transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1995ad] to-[#ffb703] text-[#071521] flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                {profile?.nombre_completo?.[0] || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white truncate max-w-[130px]">{profile?.nombre_completo || 'Administrador'}</div>
                <div className="text-[9px] text-[#ffb703] font-mono font-bold uppercase">{profile?.rol || 'Staff'}</div>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Opciones del Menú Desplegable */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d2538] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 text-white animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-white/10 flex items-center gap-3 bg-[#071521]/60 rounded-xl mb-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1995ad] to-[#ffb703] text-[#071521] flex items-center justify-center font-bold text-xs shrink-0">
                    {profile?.nombre_completo?.[0] || 'A'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{profile?.nombre_completo || 'Administrador'}</div>
                    <div className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@aguitours.com'}</div>
                    <span className="bg-[#ffb703]/20 border border-[#ffb703]/40 text-[#ffb703] text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                      {profile?.rol || 'staff'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setMisDatosOpen(true);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User size={15} className="text-[#ffb703]" /> Editar Mi Perfil & Clave
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onBackToSite();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Globe size={15} className="text-[#1995ad]" /> Volver al Sitio Principal
                </button>

                <div className="my-1 border-t border-white/10"></div>

                <button
                  onClick={async () => {
                    setUserDropdownOpen(false);
                    await supabase.auth.signOut();
                    if (onBackToSite) onBackToSite();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut size={15} /> Cerrar Sesión Segura
                </button>
              </div>
            )}
          </div>

          {/* Botón Móvil Hamburguesa */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden bg-[#1995ad] p-2 rounded-xl text-white shadow-md cursor-pointer ml-1"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* 📱 MENÚ DESPLEGABLE MOBILE (HAMBURGUESA) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-[#040d16]/98 backdrop-blur-md z-40 p-5 flex flex-col justify-between overflow-y-auto">
          <nav className="flex flex-col gap-2">
            <div className="text-[11px] text-[#ffb703] font-bold uppercase tracking-wider mb-1 px-2">Módulos del Sistema</div>
            {navItems.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                    isActive ? 'bg-[#1995ad] text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} /> {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/10 mt-6 flex flex-col gap-3">
            <button
              onClick={onBackToSite}
              className="w-full bg-white/10 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-white/15"
            >
              <ArrowLeft size={16} /> Volver al Sitio Web
            </button>
          </div>
        </div>
      )}

      {/* 💻 CONTENEDOR PRINCIPAL: SIDEBAR A LA IZQUIERDA & CONTENIDO A LA DERECHA */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* ⬅️ SIDEBAR IZQUIERDO CON MÓDULOS (VERTICAL) */}
        <aside className={`hidden md:flex bg-[#040d16] border-r border-white/10 p-4 flex-col justify-between shrink-0 h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              {!sidebarCollapsed && (
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Menú Principal</span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-xl transition-all ml-auto cursor-pointer"
                title={sidebarCollapsed ? 'Expandir Menú' : 'Achicar Menú'}
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            <nav className="flex flex-col gap-1.5">
              {navItems.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={sidebarCollapsed ? tab.label : ''}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                      sidebarCollapsed ? 'justify-center' : ''
                    } ${
                      isActive 
                        ? 'bg-[#1995ad] text-white shadow-lg shadow-[#1995ad]/30' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" /> 
                    {!sidebarCollapsed && <span>{tab.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ➡️ ÁREA DE CONTENIDO PRINCIPAL A LA DERECHA */}
        <main className="flex-1 p-4 md:p-10 overflow-y-auto">
          {activeTab === 'analytics' && (
            <AdminAnalytics paquetes={paquetes} usuarios={usuarios} auditorias={auditorias} tienePermiso={tienePermiso} />
          )}

          {activeTab === 'clientes' && (
            <AdminClientesModule tienePermiso={tienePermiso} />
          )}

          {activeTab === 'cotizaciones' && (
            <AdminSolicitudesModule tienePermiso={tienePermiso} />
          )}

          {activeTab === 'paquetes' && (
            <AdminPaquetesModule paquetes={paquetes} user={user} profile={profile} onActualizar={cargarTodo} tienePermiso={tienePermiso} />
          )}

          {activeTab === 'destinos' && (
            <AdminDestinosModule destinos={destinos} onActualizar={cargarTodo} tienePermiso={tienePermiso} />
          )}

          {activeTab === 'cms' && (
            <AdminCMSModule cmsSections={cmsSections} user={user} onActualizar={cargarTodo} tienePermiso={tienePermiso} />
          )}

          {activeTab === 'rbac' && (
            <AdminUsuariosModule usuarios={usuarios} rolesSistema={rolesSistema} onActualizar={cargarTodo} tienePermiso={tienePermiso} />
          )}

          {activeTab === 'auditoria' && (
            <AdminAuditoriaModule auditorias={auditorias} tienePermiso={tienePermiso} />
          )}
        </main>
      </div>

      {/* Modal para Editar Datos Personales y Contraseña del Usuario Logueado */}
      <MisDatosModal
        isOpen={misDatosOpen}
        onClose={() => setMisDatosOpen(false)}
        user={user}
        profile={profile}
        onProfileUpdated={cargarTodo}
      />
    </div>
  );
}

