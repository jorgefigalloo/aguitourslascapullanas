import React, { useState } from 'react';
import { Users, ShieldCheck, Key, UserCheck, Edit3, UserPlus, Search, Filter, ShieldPlus, Power, Table, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EditarUsuarioAdminModal } from '../EditarUsuarioAdminModal';
import { EditarRolModal, CATEGORIAS_PERMISOS } from '../EditarRolModal';
import { CrearUsuarioModal } from '../usuarios/CrearUsuarioModal';
import { CrearRolModal } from '../CrearRolModal';

export function AdminUsuariosModule({ usuarios = [], rolesSistema = [], onActualizar, tienePermiso }) {
  const [rbacSubTab, setRbacSubTab] = useState('usuarios');
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [rolAEditar, setRolAEditar] = useState(null);
  const [crearUsuarioOpen, setCrearUsuarioOpen] = useState(false);
  const [crearRolOpen, setCrearRolOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  const canCreateUser = !tienePermiso || tienePermiso('usuarios_crear');
  const canEditUser = !tienePermiso || tienePermiso('usuarios_editar');
  const canBlockUser = !tienePermiso || tienePermiso('usuarios_bloquear');
  const canManageRoles = !tienePermiso || tienePermiso('usuarios_actualizar');

  const handleToggleEstadoActivo = async (usuario) => {
    const nuevoEstado = !(usuario.activo ?? true);
    const mensaje = nuevoEstado 
      ? `¿Deseas activar la cuenta de "${usuario.nombre_completo}"?`
      : `¿Deseas desactivar la cuenta de "${usuario.nombre_completo}"?`;

    if (!window.confirm(mensaje)) return;

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ activo: nuevoEstado })
        .eq('id', usuario.id);

      if (error) throw error;
      alert(`Usuario "${usuario.nombre_completo}" ${nuevoEstado ? 'ACTIVADO 🟢' : 'DESACTIVADO 🔴'} con éxito.`);
      if (onActualizar) onActualizar();
    } catch (err) {
      alert('Error al cambiar estado del usuario: ' + err.message);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const nombre = u.nombre_completo || '';
    const username = u.username || '';
    const dni = u.documento_identidad || '';

    const matchSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        dni.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRol = filtroRol === 'todos' || u.rol === filtroRol;

    return matchSearch && matchRol;
  });

  return (
    <div className="bg-[#0d2538] border border-white/15 p-6 md:p-8 rounded-3xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2 m-0">
            <ShieldCheck size={26} className="text-[#10b981]" /> Módulo RBAC - Usuarios, Roles y Permisos Granulares
          </h3>
          <p className="text-xs text-gray-300 mt-1 m-0">Gestiona usuarios del sistema, perfiles de roles y la matriz comparativa de permisos por módulo</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {rbacSubTab === 'usuarios' && canCreateUser && (
            <button 
              onClick={() => setCrearUsuarioOpen(true)}
              className="btn-gold-3d text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <UserPlus size={18} /> Registrar Nuevo Usuario
            </button>
          )}

          {(rbacSubTab === 'roles' || rbacSubTab === 'matriz') && canManageRoles && (
            <button 
              onClick={() => setCrearRolOpen(true)}
              className="btn-gold-3d text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <ShieldPlus size={18} /> Crear Nuevo Rol
            </button>
          )}

          <div className="flex gap-1 bg-[#071521] p-1.5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setRbacSubTab('usuarios')} 
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${rbacSubTab === 'usuarios' ? 'bg-[#1995ad] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <Users size={15} /> Usuarios ({usuariosFiltrados.length})
            </button>
            <button 
              onClick={() => setRbacSubTab('roles')} 
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${rbacSubTab === 'roles' ? 'bg-[#1995ad] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <Key size={15} /> Roles ({rolesSistema.length})
            </button>
            <button 
              onClick={() => setRbacSubTab('matriz')} 
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${rbacSubTab === 'matriz' ? 'bg-[#1995ad] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <Table size={15} /> Matriz Comparativa
            </button>
          </div>
        </div>
      </div>

      {/* PESTAÑA 1: GESTIÓN DE USUARIOS */}
      {rbacSubTab === 'usuarios' && (
        <>
          {/* Barra de Filtro y Búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-[#071521] p-4 rounded-2xl border border-white/10">
            <div className="md:col-span-8 relative">
              <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar usuario por nombre, username o DNI..."
                className="w-full bg-[#0d2538] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 relative flex items-center gap-2">
              <Filter size={16} className="text-[#ffb703] shrink-0" />
              <select
                value={filtroRol}
                onChange={e => setFiltroRol(e.target.value)}
                className="w-full bg-[#0d2538] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none cursor-pointer"
              >
                <option value="todos">Rol: Todos los Roles</option>
                {rolesSistema.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/15">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-[#071521] text-xs uppercase text-gray-300 border-b border-white/15">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">DNI / Teléfono</th>
                  <th className="p-4">Rol Asignado</th>
                  <th className="p-4">Estado Cuenta</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map(u => {
                    const isActivo = u.activo ?? true;

                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold flex items-center gap-2">
                          <UserCheck size={18} className="text-[#1995ad]" />
                          <div>
                            <div>{u.nombre_completo || 'Usuario'}</div>
                            <div className="text-xs text-gray-400 font-normal">{u.username || 'sin_username'}</div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{u.documento_identidad || 'N/A'} | {u.telefono || 'Sin tel'}</td>
                        <td className="p-4">
                          <span className="bg-[#1995ad]/20 border border-[#1995ad]/40 text-[#a0f0ff] text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {u.rol || 'cliente'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            isActivo 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}>
                            {isActivo ? '🟢 ACTIVO' : '🔴 INACTIVO'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {canEditUser && (
                              <button 
                                onClick={() => setUsuarioAEditar(u)} 
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                title="Editar Datos, Rol y Contraseña"
                              >
                                <Edit3 size={14} /> Editar Datos / Rol
                              </button>
                            )}

                            {canBlockUser && (
                              <button
                                onClick={() => handleToggleEstadoActivo(u)}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                                  isActivo 
                                    ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white' 
                                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-black'
                                }`}
                                title={isActivo ? 'Desactivar Cuenta de Usuario' : 'Activar Cuenta de Usuario'}
                              >
                                <Power size={14} /> {isActivo ? 'Desactivar' : 'Activar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PESTAÑA 2: GESTIÓN DE ROLES DEL SISTEMA */}
      {rbacSubTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolesSistema.map(r => {
            const countPermisos = Array.isArray(r.permisos) ? r.permisos.length : 0;
            return (
              <div key={r.id} className="bg-[#071521] border border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white text-base flex items-center gap-2 m-0">
                      <Key size={16} className="text-[#ffb703]" /> {r.nombre}
                    </h4>
                    <span className="bg-white/10 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded">
                      ID: {r.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3">{r.descripcion}</p>
                  
                  <div className="mb-3">
                    <div className="text-[11px] text-[#ffb703] font-bold mb-1">
                      Permisos Asignados ({countPermisos}/54):
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {Array.isArray(r.permisos) && r.permisos.map((p, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {canManageRoles && (
                  <button 
                    onClick={() => setRolAEditar(r)} 
                    className="btn-gold-3d text-xs py-2.5 px-3 justify-center font-bold flex items-center gap-1.5 cursor-pointer w-full mt-2"
                  >
                    <Edit3 size={15} /> Configurar Permisos del Rol
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PESTAÑA 3: MATRIZ VISUAL COMPARATIVA EN GRID */}
      {rbacSubTab === 'matriz' && (
        <div className="overflow-x-auto rounded-2xl border border-white/15">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#071521] text-gray-300 border-b border-white/15">
              <tr>
                <th className="p-4 text-sm font-bold min-w-[280px]">Permiso / Acción por Módulo</th>
                {rolesSistema.map(r => (
                  <th key={r.id} className="p-4 text-center min-w-[130px]">
                    <div className="font-bold text-white text-xs">{r.nombre}</div>
                    <div className="font-mono text-[10px] text-gray-400">[{r.id}]</div>
                    {canManageRoles && (
                      <button
                        onClick={() => setRolAEditar(r)}
                        className="mt-1 text-[10px] text-[#ffb703] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <Edit3 size={11} /> Editar
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {CATEGORIAS_PERMISOS.map((cat, idxCat) => (
                <React.Fragment key={idxCat}>
                  {/* Encabezado de Categoría */}
                  <tr className="bg-gradient-to-r from-[#003366]/80 to-[#1995ad]/50 border-t border-white/20">
                    <td colSpan={1 + rolesSistema.length} className="p-3 font-bold text-white text-xs uppercase tracking-wider">
                      {cat.categoria}
                    </td>
                  </tr>

                  {/* Filas de Permisos Granulares */}
                  {cat.items.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 pl-6 font-medium text-gray-200">
                        <div>{item.label}</div>
                        <div className="font-mono text-[10px] text-gray-400">{item.id}</div>
                      </td>
                      {rolesSistema.map(r => {
                        const tieneAcceso = Array.isArray(r.permisos) && (r.permisos.includes(item.id) || r.permisos.includes('all') || r.id === 'super_admin');
                        return (
                          <td key={r.id} className="p-3 text-center">
                            {tieneAcceso ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                <CheckCircle2 size={12} /> SÍ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-white/5 text-gray-500 border border-white/10 px-2.5 py-1 rounded-full text-[11px]">
                                <Circle size={12} /> NO
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrearUsuarioModal 
        isOpen={crearUsuarioOpen}
        onClose={() => setCrearUsuarioOpen(false)}
        onUsuarioCreado={onActualizar}
      />

      <CrearRolModal 
        isOpen={crearRolOpen}
        onClose={() => setCrearRolOpen(false)}
        onRolCreado={onActualizar}
      />

      <EditarUsuarioAdminModal 
        usuario={usuarioAEditar} 
        isOpen={!!usuarioAEditar} 
        onClose={() => setUsuarioAEditar(null)} 
        onUsuarioActualizado={onActualizar} 
        roles={rolesSistema} 
      />

      <EditarRolModal 
        rol={rolAEditar} 
        isOpen={!!rolAEditar} 
        onClose={() => setRolAEditar(null)} 
        onRolActualizado={onActualizar} 
      />
    </div>
  );
}
