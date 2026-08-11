import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Edit3, Plus, Users, Globe, ArrowLeft, Search, Bell, LogOut, CheckCircle, Clock, Calendar, ChevronRight, ShieldCheck, Database, Package, UserCheck, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-[#071521] text-white font-body flex flex-col md:flex-row">
      {/* Sidebar de Navegación Lateral Fijo (Sticky) */}
      <aside className="w-full md:w-64 bg-[#040d16] border-r border-white/10 p-6 flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto z-40">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img src="/images/capullanas1.jpg" alt="Logo" className="w-10 h-10 rounded-full border border-[#ffb703]" />
            <div>
              <h2 className="font-headline font-bold text-sm text-white m-0">Aguitours Admin</h2>
              <span className="text-[10px] text-[#1995ad] font-extrabold uppercase">Panel de Control</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive ? 'bg-[#1995ad] text-white shadow-lg shadow-[#1995ad]/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] flex items-center justify-center font-bold text-xs">
              {profile?.nombre_completo?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{profile?.nombre_completo || 'Administrador'}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={onBackToSite}
            className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/15"
          >
            <ArrowLeft size={16} /> Volver al Sitio Web
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
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
  );
}

