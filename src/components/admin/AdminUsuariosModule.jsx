import React, { useState } from 'react';
import { Users, ShieldCheck, Key, UserCheck, Edit3, UserPlus, Search, Filter, ShieldPlus } from 'lucide-react';
import { EditarUsuarioAdminModal } from '../EditarUsuarioAdminModal';
import { EditarRolModal } from '../EditarRolModal';
import { CrearUsuarioModal } from '../usuarios/CrearUsuarioModal';
import { CrearRolModal } from '../CrearRolModal';

export function AdminUsuariosModule({ usuarios = [], rolesSistema = [], onActualizar }) {
  const [rbacSubTab, setRbacSubTab] = useState('usuarios');
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [rolAEditar, setRolAEditar] = useState(null);
  const [crearUsuarioOpen, setCrearUsuarioOpen] = useState(false);
  const [crearRolOpen, setCrearRolOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

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
    <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-headline text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck size={26} className="text-[#10b981]" /> Módulo RBAC - Usuarios y Matriz de Permisos
          </h3>
          <p className="text-xs text-gray-300 mt-1">Registra nuevos usuarios, crea roles personalizados y gestiona permisos del sistema</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {rbacSubTab === 'usuarios' ? (
            <button 
              onClick={() => setCrearUsuarioOpen(true)}
              className="btn-gold-3d text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <UserPlus size={18} /> Registrar Nuevo Usuario
            </button>
          ) : (
            <button 
              onClick={() => setCrearRolOpen(true)}
              className="btn-gold-3d text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <ShieldPlus size={18} /> Crear Nuevo Rol
            </button>
          )}

          <div className="flex gap-1.5 bg-[#071521] p-1.5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setRbacSubTab('usuarios')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${rbacSubTab === 'usuarios' ? 'bg-[#1995ad] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Usuarios ({usuariosFiltrados.length})
            </button>
            <button 
              onClick={() => setRbacSubTab('roles')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${rbacSubTab === 'roles' ? 'bg-[#1995ad] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Matriz de Roles ({rolesSistema.length})
            </button>
          </div>
        </div>
      </div>

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
                  <th className="p-4">Estado</th>
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
                  usuariosFiltrados.map(u => (
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
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
                          Activo
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => setUsuarioAEditar(u)} 
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={14} /> Editar Datos / Rol
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {rbacSubTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolesSistema.map(r => (
            <div key={r.id} className="bg-[#071521] border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Key size={16} className="text-[#ffb703]" /> {r.nombre}
                  </h4>
                  <span className="bg-white/10 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded">
                    {r.id}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-3">{r.descripcion}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Array.isArray(r.permisos) && r.permisos.map((p, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setRolAEditar(r)} 
                className="btn-gold-3d text-xs py-2 px-3 justify-center font-bold flex items-center gap-1 cursor-pointer w-full mt-2"
              >
                <Edit3 size={14} /> Configurar Permisos
              </button>
            </div>
          ))}
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
