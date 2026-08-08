import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Edit3, Plus, Users, Save, Database, Trash2, ShieldCheck, 
  UserCheck, Package, DollarSign, Activity, TrendingUp, BarChart3, Globe, 
  ArrowLeft, Search, Bell, LogOut, CheckCircle, Clock, Calendar, ChevronRight, RefreshCw, Key, PlusCircle, Image as ImageIcon, Link2, Folder
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EditarPaqueteModal } from './EditarPaqueteModal';
import { CrearPaqueteModal } from './CrearPaqueteModal';
import { EditarUsuarioAdminModal } from './EditarUsuarioAdminModal';
import { EditarRolModal } from './EditarRolModal';

// Opciones de Imágenes Predeterminadas Locales
const GALERIA_PREDETERMINADA = [
  { label: 'Logo Aguitours Principal', url: '/images/capullanas1.jpg' },
  { label: 'Portada Hero Destinos', url: '/images/ciudades/fondo-destinos1.png' },
  { label: 'Nosotros / Quiénes Somos', url: '/images/nosotros-hero.png' },
  { label: 'Cusco & Machu Picchu', url: '/images/ciudades/nacionales/cuzco.png' },
  { label: 'Arequipa Ciudad Blanca', url: '/images/ciudades/nacionales/arequipa.png' },
  { label: 'Tarapoto Selva', url: '/images/ciudades/nacionales/tarapoto.png' },
  { label: 'París Internacional', url: '/images/ciudades/internacionales/francia.png' }
];

const IMAGENES_PREDETERMINADAS_CMS = {
  navbar_brand: '/images/capullanas1.jpg',
  hero_inicio: '/images/ciudades/fondo-destinos1.png',
  quienes_somos: '/images/nosotros-hero.png',
  mision_vision: '/images/nosotros-hero.png',
  contacto_info: '/images/nosotros-hero.png',
  footer_texto: '/images/capullanas1.jpg'
};

export function AdminDashboard({ user, profile, onBackToSite }) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [rbacSubTab, setRbacSubTab] = useState('usuarios');
  const [cmsSections, setCmsSections] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [rolesSistema, setRolesSistema] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selector de Tipo de Imagen en CMS: 'local' (predeterminada) | 'url' (enlace externo)
  const [tipoOrigenImagen, setTipoOrigenImagen] = useState('local');

  // Modales
  const [paqueteAEditar, setPaqueteAEditar] = useState(null);
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [rolAEditar, setRolAEditar] = useState(null);

  // Formulario nuevo destino
  const [nuevoDestino, setNuevoDestino] = useState({
    nombre: '', tipo: 'nacional', descripcion: '', imagen_portada: '/images/ciudades/nacionales/cuzco.png'
  });

  // Estado edición CMS
  const [cmsEditando, setCmsEditando] = useState({
    clave_seccion: 'hero_inicio',
    titulo: '', subtitulo: '', cuerpo_texto: '', imagen_url: '/images/ciudades/fondo-destinos1.png'
  });

  // Campos desglosados para Contacto
  const [contactoCampos, setContactoCampos] = useState({
    telefono: '+51 987 654 321',
    email: 'contacto@aguitourslascapullanas.com',
    direccion: 'Cusco & Piura, Perú',
    facebook_url: 'https://www.facebook.com/people/Aguitours-las-capullanas/100054386595848/'
  });

  const userRole = profile?.rol || 'super_admin';

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
      if (data && data.length > 0) {
        setCmsSections(data);
        const hero = data.find(s => s.clave_seccion === 'hero_inicio') || data[0];
        const defaultImg = hero.imagen_url || IMAGENES_PREDETERMINADAS_CMS[hero.clave_seccion] || '/images/ciudades/fondo-destinos1.png';
        setCmsEditando({ ...hero, imagen_url: defaultImg });
        setTipoOrigenImagen(defaultImg.startsWith('http') ? 'url' : 'local');
      }
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
      const { data } = await supabase.from('destinos_turisticos').select('*');
      if (data) setDestinos(data);
    } catch (e) { console.log(e); }
  };

  const cargarUsuarios = async () => {
    try {
      const { data } = await supabase.from('perfiles').select('*');
      if (data) setUsuarios(data);
    } catch (e) { console.log(e); }
  };

  const cargarRolesSistema = async () => {
    try {
      const { data } = await supabase.from('roles_sistema').select('*');
      if (data && data.length > 0) {
        setRolesSistema(data);
      } else {
        setRolesSistema([
          { id: 'super_admin', nombre: 'Super Administrador', descripcion: 'Acceso total a todos los módulos y gestión de permisos.' },
          { id: 'admin', nombre: 'Administrador General', descripcion: 'Gestión de contenidos, paquetes y clientes.' },
          { id: 'editor_contenido', nombre: 'Editor CMS', descripcion: 'Edición de textos y fotos de la web.' },
          { id: 'agente_ventas', nombre: 'Agente de Ventas', descripcion: 'Gestión de inscripciones y paquetes grupales.' },
          { id: 'cliente', nombre: 'Cliente Viajero', descripcion: 'Reserva de cupos y consulta de sus viajes.' }
        ]);
      }
    } catch (e) { console.log(e); }
  };

  const cargarAuditoria = async () => {
    try {
      const { data } = await supabase.from('tabla_auditoria').select('*').order('fecha', { ascending: false }).limit(20);
      if (data) setAuditorias(data);
    } catch (e) { console.log(e); }
  };

  // Al seleccionar sección en el combo CMS
  const handleSeleccionarSeccionCMS = (seccionKey) => {
    const found = cmsSections.find(s => s.clave_seccion === seccionKey);
    const imagenPredeterminada = IMAGENES_PREDETERMINADAS_CMS[seccionKey] || '/images/capullanas1.jpg';

    if (found) {
      const imagenActual = found.imagen_url && found.imagen_url.trim() !== '' ? found.imagen_url : imagenPredeterminada;
      setCmsEditando({ ...found, imagen_url: imagenActual });
      setTipoOrigenImagen(imagenActual.startsWith('http') ? 'url' : 'local');
      
      if (seccionKey === 'contacto_info' && found.cuerpo_texto) {
        const partes = found.cuerpo_texto.split('|');
        setContactoCampos({
          telefono: partes[0] ? partes[0].trim() : '+51 987 654 321',
          email: partes[1] ? partes[1].trim() : 'contacto@aguitourslascapullanas.com',
          direccion: partes[2] ? partes[2].trim() : 'Cusco & Piura, Perú',
          facebook_url: partes[3] ? partes[3].trim() : 'https://www.facebook.com/people/Aguitours-las-capullanas/100054386595848/'
        });
      }
    } else {
      setCmsEditando({ 
        clave_seccion: seccionKey, 
        titulo: '', 
        subtitulo: '', 
        cuerpo_texto: '', 
        imagen_url: imagenPredeterminada 
      });
      setTipoOrigenImagen('local');
    }
  };

  const handleGuardarCMS = async (e) => {
    e.preventDefault();
    setLoading(true);

    let cuerpoFinal = cmsEditando.cuerpo_texto;
    if (cmsEditando.clave_seccion === 'contacto_info') {
      cuerpoFinal = `${contactoCampos.telefono}|${contactoCampos.email}|${contactoCampos.direccion}|${contactoCampos.facebook_url}`;
    }

    const imagenFinal = cmsEditando.imagen_url && cmsEditando.imagen_url.trim() !== '' 
      ? cmsEditando.imagen_url 
      : (IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg');

    try {
      const { error } = await supabase
        .from('cms_contenido')
        .upsert([{
          clave_seccion: cmsEditando.clave_seccion,
          titulo: cmsEditando.titulo,
          subtitulo: cmsEditando.subtitulo,
          cuerpo_texto: cuerpoFinal,
          imagen_url: imagenFinal,
          creado_por: user.id
        }], { onConflict: 'clave_seccion' });

      if (error) throw error;
      alert('¡Sección CMS actualizada con éxito!');
      cargarDatosCMS();
    } catch (err) {
      alert('Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarRol = async (targetUserId, nuevoRol) => {
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ rol: nuevoRol })
        .eq('id', targetUserId);

      if (error) throw error;
      alert(`¡Rol de usuario actualizado a ${nuevoRol}!`);
      cargarUsuarios();
    } catch (err) {
      alert('Error al cambiar rol.');
    }
  };

  const handleCrearDestino = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('destinos_turisticos').insert([nuevoDestino]);
      if (error) throw error;
      alert('¡Nuevo destino registrado exitosamente!');
      setNuevoDestino({ nombre: '', tipo: 'nacional', descripcion: '', imagen_portada: '/images/ciudades/nacionales/cuzco.png' });
      cargarDestinos();
    } catch (err) {
      alert('Error al registrar destino.');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrarPaquete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este paquete de viajes?')) return;
    try {
      await supabase.from('paquetes_grupales').delete().eq('id', id);
      cargarPaquetes();
    } catch (e) { alert(e.message); }
  };

  const handleReiniciarCuposBD = async () => {
    if (!window.confirm('¿Deseas reiniciar los cupos disponibles al 100% en todos los paquetes para probar las inscripciones en vivo?')) return;
    try {
      for (const p of paquetes) {
        await supabase
          .from('paquetes_grupales')
          .update({ cupo_disponible: p.cupo_maximo })
          .eq('id', p.id);
      }
      alert('¡Cupos reiniciados con éxito! Ahora los usuarios pueden unirse en vivo.');
      cargarPaquetes();
    } catch (e) {
      alert('Error al reiniciar cupos.');
    }
  };

  const totalVentasEstimadas = paquetes.reduce((acc, p) => acc + ((p.cupo_maximo - p.cupo_disponible) * p.precio_persona), 0);
  const totalCuposVendidos = paquetes.reduce((acc, p) => acc + (p.cupo_maximo - p.cupo_disponible), 0);
  const totalCuposTotales = paquetes.reduce((acc, p) => acc + p.cupo_maximo, 0) || 1;
  const tasaOcupacion = Math.round((totalCuposVendidos / totalCuposTotales) * 100);

  return (
    <div className="min-h-screen bg-[#040d16] text-white flex flex-col md:flex-row font-body">
      
      {/* SIDEBAR FIJO STICKY */}
      <aside className="w-full md:w-64 bg-[#071521] border-r border-white/10 p-6 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto z-40">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img src="/images/capullanas1.jpg" alt="Logo" className="w-10 h-10 rounded-full border border-[#ffb703] object-cover" />
            <div>
              <h1 className="font-headline text-lg font-bold text-white m-0">Aguitours Admin</h1>
              <span className="text-[10px] text-[#ffb703] font-bold uppercase tracking-wider">SuperAdmin Portal</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === 'analytics' ? 'bg-[#ffb703] text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <BarChart3 size={18} /> Dashboard & Reportes
            </button>

            <button 
              onClick={() => setActiveTab('cms')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === 'cms' ? 'bg-[#ffb703] text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <Edit3 size={18} /> Módulo CMS Contenidos
            </button>

            <button 
              onClick={() => setActiveTab('paquetes')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === 'paquetes' ? 'bg-[#ffb703] text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <Package size={18} /> Módulo Paquetes Grupales
            </button>

            <button 
              onClick={() => setActiveTab('destinos')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === 'destinos' ? 'bg-[#ffb703] text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <Globe size={18} /> Módulo Destinos
            </button>

            <button 
              onClick={() => setActiveTab('clientes')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === 'clientes' ? 'bg-[#ffb703] text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <Users size={18} /> Módulo Clientes CRM
            </button>

            <button 
              onClick={() => setActiveTab('rbac')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === 'rbac' ? 'bg-[#ffb703] text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <ShieldCheck size={18} /> Roles & Permisos RBAC
            </button>

            <button 
              onClick={() => setActiveTab('auditoria')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${activeTab === 'auditoria' ? 'bg-[#ffb703] text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}
            >
              <Database size={18} /> Bitácora Auditoría
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <button 
            onClick={onBackToSite}
            className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={16} /> Volver al Sitio Web
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-[#071521]/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-xl font-bold text-white m-0">Panel Administrativo</h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              ● Sistema En Línea
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-white">{profile?.nombre_completo || 'Jorge Figallo'}</span>
            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Super Admin</span>
          </div>
        </header>

        <main className="p-8 flex-1">

          {/* MÓDULO 1: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0d2538] border border-white/15 p-6 rounded-3xl relative overflow-hidden shadow-xl">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ingresos Estimados</span>
                  <h3 className="text-3xl font-extrabold text-[#ffb703] mt-1">S/ {totalVentasEstimadas.toFixed(2)}</h3>
                  <span className="text-xs text-emerald-400 font-semibold mt-2 block">+18.4% este mes</span>
                </div>

                <div className="bg-[#0d2538] border border-white/15 p-6 rounded-3xl relative overflow-hidden shadow-xl">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cupos Confirmados</span>
                  <h3 className="text-3xl font-extrabold text-[#1995ad] mt-1">{totalCuposVendidos} exploradores</h3>
                  <span className="text-xs text-gray-300 font-semibold mt-2 block">En {paquetes.length} paquetes activos</span>
                </div>

                <div className="bg-[#0d2538] border border-white/15 p-6 rounded-3xl relative overflow-hidden shadow-xl">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tasa Ocupación</span>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{tasaOcupacion}%</h3>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${tasaOcupacion}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#0d2538] border border-white/15 p-6 rounded-3xl relative overflow-hidden shadow-xl">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Usuarios Registrados</span>
                  <h3 className="text-3xl font-extrabold text-purple-400 mt-1">{usuarios.length}</h3>
                  <span className="text-xs text-purple-300 font-semibold mt-2 block">Sincronizados en el Sistema</span>
                </div>
              </div>

              {/* Gráfico Ocupación */}
              <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
                <h3 className="font-headline text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-[#1995ad]" /> Ocupación por Paquete Grupal (%)
                </h3>
                <div className="flex flex-col gap-5">
                  {paquetes.map(pkg => {
                    const porcentaje = Math.round(((pkg.cupo_maximo - pkg.cupo_disponible) / pkg.cupo_maximo) * 100);
                    return (
                      <div key={pkg.id}>
                        <div className="flex justify-between text-xs font-bold text-white mb-2">
                          <span>{pkg.titulo} ({pkg.destino})</span>
                          <span className="text-[#ffb703]">{porcentaje}% ({pkg.cupo_maximo - pkg.cupo_disponible}/{pkg.cupo_maximo} cupos)</span>
                        </div>
                        <div className="w-full h-3 bg-[#071521] rounded-full overflow-hidden border border-white/10">
                          <div className="h-full bg-gradient-to-r from-[#1995ad] to-[#ffb703] rounded-full" style={{ width: `${porcentaje}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO 2: CMS CONTENIDOS CON SELECTOR INTUITIVO DE IMAGEN */}
          {activeTab === 'cms' && (
            <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
              <h3 className="font-headline text-2xl font-bold text-white mb-6">Módulo CMS - Editar Cualquier Sección del Sitio Web</h3>
              
              <form onSubmit={handleGuardarCMS} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">Sección del Sitio A Modificar</label>
                  <select 
                    value={cmsEditando.clave_seccion} 
                    onChange={e => handleSeleccionarSeccionCMS(e.target.value)} 
                    className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none"
                  >
                    <option value="navbar_brand">Navegación & Marca (navbar_brand)</option>
                    <option value="hero_inicio">Portada Hero Principal (hero_inicio)</option>
                    <option value="quienes_somos">Sección Quiénes Somos (quienes_somos)</option>
                    <option value="mision_vision">Misión y Visión (mision_vision)</option>
                    <option value="contacto_info">Información de Contacto (contacto_info)</option>
                    <option value="footer_texto">Pie de Página / Copyright (footer_texto)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">Título Principal</label>
                  <input 
                    type="text" 
                    value={cmsEditando.titulo || ''} 
                    onChange={e => setCmsEditando({...cmsEditando, titulo: e.target.value})} 
                    required 
                    className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">Subtítulo / Bajada</label>
                  <input 
                    type="text" 
                    value={cmsEditando.subtitulo || ''} 
                    onChange={e => setCmsEditando({...cmsEditando, subtitulo: e.target.value})} 
                    className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
                  />
                </div>

                {/* SELECTOR INTUITIVO DE TIPO DE IMAGEN */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <label className="text-xs text-gray-300 font-bold block mb-2">Seleccionar Origen de Imagen</label>
                  
                  <div className="flex gap-4 mb-4">
                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${tipoOrigenImagen === 'local' ? 'bg-[#ffb703] text-black border-[#ffb703]' : 'bg-[#071521] text-gray-300 border-white/15'}`}>
                      <input 
                        type="radio" 
                        name="origen_imagen" 
                        value="local" 
                        checked={tipoOrigenImagen === 'local'} 
                        onChange={() => {
                          setTipoOrigenImagen('local');
                          const defaultImg = IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg';
                          setCmsEditando({ ...cmsEditando, imagen_url: defaultImg });
                        }}
                        className="hidden" 
                      />
                      <Folder size={16} /> Imagen Predeterminada (Local)
                    </label>

                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${tipoOrigenImagen === 'url' ? 'bg-[#ffb703] text-black border-[#ffb703]' : 'bg-[#071521] text-gray-300 border-white/15'}`}>
                      <input 
                        type="radio" 
                        name="origen_imagen" 
                        value="url" 
                        checked={tipoOrigenImagen === 'url'} 
                        onChange={() => setTipoOrigenImagen('url')}
                        className="hidden" 
                      />
                      <Link2 size={16} /> Enlace Web Externo (URL)
                    </label>
                  </div>

                  {tipoOrigenImagen === 'local' ? (
                    <div>
                      <label className="text-xs text-gray-400 font-bold block mb-1">Elegir de la Galería Predeterminada</label>
                      <select 
                        value={cmsEditando.imagen_url} 
                        onChange={e => setCmsEditando({...cmsEditando, imagen_url: e.target.value})}
                        className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm"
                      >
                        {GALERIA_PREDETERMINADA.map(g => (
                          <option key={g.url} value={g.url}>{g.label} ({g.url})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-gray-400 font-bold block mb-1">Pegar URL de Imagen Externa</label>
                      <input 
                        type="text" 
                        value={cmsEditando.imagen_url || ''} 
                        onChange={e => setCmsEditando({...cmsEditando, imagen_url: e.target.value})} 
                        placeholder="https://t4.ftcdn.net/jpg/02/46/37/67/360_F_246376798_49h6I2aAFpjysGaAuOTdc8zGmDY4Yv5S.jpg"
                        className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
                      />
                    </div>
                  )}

                  {/* Vista Previa de la Imagen */}
                  <div className="mt-3 rounded-xl overflow-hidden h-36 border border-white/15 relative bg-black/40">
                    <img 
                      src={cmsEditando.imagen_url || IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg'} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = IMAGENES_PREDETERMINADAS_CMS[cmsEditando.clave_seccion] || '/images/capullanas1.jpg'; }}
                    />
                    <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <ImageIcon size={12} /> Vista Previa en Vivo ({tipoOrigenImagen === 'local' ? 'Local' : 'Externa'})
                    </span>
                  </div>
                </div>

                {/* Si es la sección contacto_info, ofrecer campos individuales claros */}
                {cmsEditando.clave_seccion === 'contacto_info' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <div>
                      <label className="text-xs text-gray-300 font-bold block mb-1">📞 Teléfono / WhatsApp de Atención</label>
                      <input 
                        type="text" 
                        value={contactoCampos.telefono} 
                        onChange={e => setContactoCampos({...contactoCampos, telefono: e.target.value})}
                        className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300 font-bold block mb-1">✉️ Correo Electrónico de Contacto</label>
                      <input 
                        type="email" 
                        value={contactoCampos.email} 
                        onChange={e => setContactoCampos({...contactoCampos, email: e.target.value})}
                        className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300 font-bold block mb-1">📍 Oficina Principal / Ubicación</label>
                      <input 
                        type="text" 
                        value={contactoCampos.direccion} 
                        onChange={e => setContactoCampos({...contactoCampos, direccion: e.target.value})}
                        className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300 font-bold block mb-1">🌐 Enlace Facebook Oficial</label>
                      <input 
                        type="text" 
                        value={contactoCampos.facebook_url} 
                        onChange={e => setContactoCampos({...contactoCampos, facebook_url: e.target.value})}
                        className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-gray-300 font-bold block mb-1">Cuerpo de Texto</label>
                    <textarea 
                      rows={5} 
                      value={cmsEditando.cuerpo_texto || ''} 
                      onChange={e => setCmsEditando({...cmsEditando, cuerpo_texto: e.target.value})} 
                      className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" 
                    />
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-gold-3d text-sm font-bold py-3 mt-2">
                  <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          )}

          {/* MÓDULO 3: PAQUETES GRUPALES */}
          {activeTab === 'paquetes' && (
            <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-6">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-white m-0">Gestión de Paquetes Grupales ({paquetes.length})</h3>
                  <p className="text-xs text-gray-400 m-0 mt-1">Crea, edita y administra los cupos e itinerarios de viajes</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setCrearModalOpen(true)}
                    className="btn-primary-3d text-xs px-5 py-2.5 flex items-center gap-2 font-bold"
                  >
                    <PlusCircle size={16} /> + Publicar Nuevo Paquete
                  </button>

                  <button 
                    onClick={handleReiniciarCuposBD}
                    className="bg-[#1995ad]/20 border border-[#1995ad] text-[#a0f0ff] hover:bg-[#1995ad] hover:text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 transition-all"
                  >
                    <RefreshCw size={14} /> Reiniciar Cupos al 100%
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead>
                    <tr className="bg-white/5 text-[#1995ad] uppercase font-bold">
                      <th className="p-3">Imagen</th>
                      <th className="p-3">Título</th>
                      <th className="p-3">Destino</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">Cupos (Inscritos/Max)</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paquetes.map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <img 
                            src={p.imagen_portada} 
                            alt={p.titulo} 
                            className="w-14 h-10 rounded-lg object-cover border border-white/15 shadow-sm"
                            onError={(e) => { e.target.src = '/images/ciudades/fondo-destinos.png'; }}
                          />
                        </td>
                        <td className="p-3 font-semibold text-white">{p.titulo}</td>
                        <td className="p-3">{p.destino}</td>
                        <td className="p-3 font-bold text-[#ffb703]">S/ {p.precio_persona}</td>
                        <td className="p-3 font-bold">
                          <span className={p.cupo_disponible <= 3 ? 'text-red-400' : 'text-emerald-400'}>
                            {p.cupo_maximo - p.cupo_disponible} / {p.cupo_maximo}
                          </span>
                        </td>
                        <td className="p-3 flex items-center gap-3">
                          <button 
                            onClick={() => setPaqueteAEditar(p)} 
                            className="bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] hover:bg-[#ffb703] hover:text-black font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-all"
                          >
                            <Edit3 size={14} /> Editar
                          </button>

                          <button 
                            onClick={() => handleBorrarPaquete(p.id)} 
                            className="text-red-400 hover:text-red-300 font-bold p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MÓDULO 4: DESTINOS TURÍSTICOS */}
          {activeTab === 'destinos' && (
            <div className="flex flex-col gap-8">
              <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
                <h3 className="font-headline text-2xl font-bold text-white mb-6">Registrar Nuevo Destino Turístico</h3>
                <form onSubmit={handleCrearDestino} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre Destino (ej: Arequipa)" value={nuevoDestino.nombre} onChange={e => setNuevoDestino({...nuevoDestino, nombre: e.target.value})} required className="bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" />
                  <select value={nuevoDestino.tipo} onChange={e => setNuevoDestino({...nuevoDestino, tipo: e.target.value})} className="bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm">
                    <option value="nacional">Nacional (Perú)</option>
                    <option value="internacional">Internacional</option>
                  </select>
                  <input type="text" placeholder="Ruta Imagen Portada" value={nuevoDestino.imagen_portada} onChange={e => setNuevoDestino({...nuevoDestino, imagen_portada: e.target.value})} className="md:col-span-2 bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" />
                  <textarea placeholder="Descripción del destino..." value={nuevoDestino.descripcion} onChange={e => setNuevoDestino({...nuevoDestino, descripcion: e.target.value})} rows={3} className="md:col-span-2 bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm" />
                  <button type="submit" disabled={loading} className="md:col-span-2 btn-gold-3d justify-center py-3.5">
                    {loading ? 'Guardando...' : 'Registrar Destino'}
                  </button>
                </form>
              </div>

              {/* Listado de Destinos */}
              <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
                <h3 className="font-headline text-xl font-bold text-white mb-4">Destinos Registrados ({destinos.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {destinos.map(d => (
                    <div key={d.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#1995ad]">{d.tipo}</span>
                        <h4 className="font-bold text-white text-base mb-1">{d.nombre}</h4>
                        <p className="text-xs text-gray-300 line-clamp-2">{d.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO 5: CLIENTES & USUARIOS */}
          {activeTab === 'clientes' && (
            <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
              <h3 className="font-headline text-2xl font-bold text-white mb-6">Directorio de Clientes & Usuarios ({usuarios.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead>
                    <tr className="bg-white/5 text-[#1995ad] uppercase font-bold">
                      <th className="p-3">ID / Código</th>
                      <th className="p-3">Nombre Completo</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Documento DNI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(c => (
                      <tr key={c.id} className="border-b border-white/5">
                        <td className="p-3 font-mono text-[#ffb703]">CLI-{c.id.substring(0,6).toUpperCase()}</td>
                        <td className="p-3 font-semibold text-white">{c.nombre_completo}</td>
                        <td className="p-3 text-gray-400">{c.username || 'sin username'}</td>
                        <td className="p-3 font-bold text-emerald-400">{c.rol}</td>
                        <td className="p-3">{c.telefono || '-'}</td>
                        <td className="p-3">{c.documento_identidad || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MÓDULO 6: ROLES & PERMISOS CON BOTÓN PARA EDITAR USUARIOS Y ROLES */}
          {activeTab === 'rbac' && (
            <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
              
              <div className="flex gap-4 border-b border-white/10 mb-6">
                <button 
                  onClick={() => setRbacSubTab('usuarios')} 
                  className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${rbacSubTab === 'usuarios' ? 'border-[#ffb703] text-[#ffb703]' : 'border-transparent text-gray-400'}`}
                >
                  <Users size={16} /> Asignación de Roles a Usuarios
                </button>

                <button 
                  onClick={() => setRbacSubTab('roles')} 
                  className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${rbacSubTab === 'roles' ? 'border-[#ffb703] text-[#ffb703]' : 'border-transparent text-gray-400'}`}
                >
                  <Key size={16} /> Definición de Roles del Sistema
                </button>
              </div>

              {/* Sub-Tab 1: Gestión de Usuarios */}
              {rbacSubTab === 'usuarios' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead>
                      <tr className="bg-white/5 text-[#1995ad] uppercase font-bold">
                        <th className="p-3">Usuario</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Teléfono</th>
                        <th className="p-3">DNI</th>
                        <th className="p-3">Rol Actual</th>
                        <th className="p-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 font-semibold text-white">{u.nombre_completo}</td>
                          <td className="p-3 text-gray-400">{u.username || '-'}</td>
                          <td className="p-3 text-gray-300">{u.telefono || '-'}</td>
                          <td className="p-3 text-gray-300">{u.documento_identidad || '-'}</td>
                          <td className="p-3 font-bold text-amber-400">{u.rol}</td>
                          <td className="p-3 flex items-center gap-3">
                            <button 
                              onClick={() => setUsuarioAEditar(u)}
                              className="bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] hover:bg-[#ffb703] hover:text-black font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-xs"
                            >
                              <Edit3 size={14} /> Editar Usuario & Permiso
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-Tab 2: Definición y Edición de Roles */}
              {rbacSubTab === 'roles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rolesSistema.map(r => (
                    <div key={r.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                            {r.id}
                          </span>
                          <button 
                            onClick={() => setRolAEditar(r)}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Edit3 size={12} /> Editar Rol & Permisos
                          </button>
                        </div>
                        <h4 className="font-bold text-white text-base mb-1">{r.nombre}</h4>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">{r.descripcion}</p>
                      </div>

                      {/* Insignias de Permisos Habilitados */}
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                        {Array.isArray(r.permisos) && r.permisos.map(p => (
                          <span key={p} className="bg-[#1995ad]/20 border border-[#1995ad]/30 text-[#a0f0ff] text-[9px] font-bold px-2 py-0.5 rounded-md">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* MÓDULO 7: AUDITORÍA */}
          {activeTab === 'auditoria' && (
            <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
              <h3 className="font-headline text-2xl font-bold text-white mb-6">Bitácora de Auditoría de Cambios</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead>
                    <tr className="bg-white/5 text-[#1995ad] uppercase font-bold">
                      <th className="p-3">Tabla Afectada</th>
                      <th className="p-3">Operación</th>
                      <th className="p-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditorias.map(a => (
                      <tr key={a.id} className="border-b border-white/5">
                        <td className="p-3 font-semibold text-white">{a.tabla_afectada}</td>
                        <td className={`p-3 font-bold ${a.operacion === 'DELETE' ? 'text-red-400' : 'text-emerald-400'}`}>{a.operacion}</td>
                        <td className="p-3 text-gray-400">{a.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal Flotante para Publicar Nuevo Paquete */}
      <CrearPaqueteModal 
        isOpen={crearModalOpen}
        onClose={() => setCrearModalOpen(false)}
        onPaqueteCreado={cargarPaquetes}
        userId={user?.id}
      />

      {/* Modal Flotante para Editar Paquete Grupal */}
      <EditarPaqueteModal 
        paquete={paqueteAEditar}
        isOpen={!!paqueteAEditar}
        onClose={() => setPaqueteAEditar(null)}
        onPaqueteActualizado={cargarPaquetes}
      />

      {/* Modal Flotante para Editar Usuario y Permisos */}
      <EditarUsuarioAdminModal 
        usuario={usuarioAEditar}
        isOpen={!!usuarioAEditar}
        onClose={() => setUsuarioAEditar(null)}
        onUsuarioActualizado={cargarUsuarios}
      />

      {/* Modal Flotante para Editar Configuración de Rol */}
      <EditarRolModal 
        rolData={rolAEditar}
        isOpen={!!rolAEditar}
        onClose={() => setRolAEditar(null)}
        onRolActualizado={cargarRolesSistema}
      />

    </div>
  );
}
