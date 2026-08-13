import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldPlus, Key, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { CATEGORIAS_PERMISOS, TODOS_LOS_PERMISOS } from '../lib/permisos';

export function CrearRolModal({ isOpen, onClose, onRolCreado }) {
  const toast = useToast();
  const [idRol, setIdRol] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState(['usuarios_ver', 'paquetes_ver']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const togglePermiso = (permisoId) => {
    if (permisosSeleccionados.includes(permisoId)) {
      setPermisosSeleccionados(permisosSeleccionados.filter(p => p !== permisoId));
    } else {
      setPermisosSeleccionados([...permisosSeleccionados, permisoId]);
    }
  };

  const handleMarcarTodos = () => {
    setPermisosSeleccionados(TODOS_LOS_PERMISOS);
  };

  const handleDesmarcarTodos = () => {
    setPermisosSeleccionados([]);
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);

    const slugId = idRol.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    try {
      const { error } = await supabase.from('roles_sistema').insert([{
        id: slugId,
        nombre: nombre,
        descripcion: descripcion,
        permisos: permisosSeleccionados
      }]);

      if (error) throw error;
      toast.success(`Nuevo rol "${nombre}" creado exitosamente.`, 'Rol Creado 🛡️');
      onRolCreado();
      onClose();
      setIdRol('');
      setNombre('');
      setDescripcion('');
      setPermisosSeleccionados(['usuarios_ver', 'paquetes_ver']);
    } catch (err) {
      toast.error('Error al crear rol: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <ShieldPlus size={20} /> Crear Nuevo Rol de Personal (RBAC)
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">Define un nuevo rol personalizado con matriz granular de permisos</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleCrear} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Nombre del Rol</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={e => {
                  setNombre(e.target.value);
                  setIdRol(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }} 
                required 
                placeholder="ej: Supervisor de Viajes / Contable"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Identificador Slug (ID)</label>
              <input 
                type="text" 
                value={idRol} 
                onChange={e => setIdRol(e.target.value)} 
                required 
                placeholder="ej: supervisor_viajes"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm font-mono focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Descripción del Rol</label>
            <textarea 
              rows={2}
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              required 
              placeholder="Descripción de responsabilidades del rol..."
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-[#ffb703] font-bold">
                Permisos Granulares ({permisosSeleccionados.length}/{TODOS_LOS_PERMISOS.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleMarcarTodos}
                  className="text-[11px] text-[#1995ad] hover:underline cursor-pointer"
                >
                  Marcar Todo
                </button>
                <span className="text-gray-500">|</span>
                <button
                  type="button"
                  onClick={handleDesmarcarTodos}
                  className="text-[11px] text-gray-400 hover:underline cursor-pointer"
                >
                  Desmarcar Todo
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {CATEGORIAS_PERMISOS.map((cat, idxCat) => (
                <div key={idxCat} className="bg-[#071521] border border-white/10 p-3 rounded-2xl">
                  <h4 className="text-xs font-bold text-white mb-2 pb-1 border-b border-white/10">
                    {cat.categoria}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cat.items.map(item => {
                      const checked = permisosSeleccionados.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => togglePermiso(item.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                            checked ? 'bg-[#1995ad]/20 border-[#1995ad] text-white' : 'bg-[#0d2538] border-white/10 text-gray-400'
                          }`}
                        >
                          <div className="shrink-0 text-[#ffb703]">
                            {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <div className="text-xs">
                            <span className="font-bold">{item.label}</span>{' '}
                            <span className="font-mono text-[10px] text-gray-400">({item.id})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <ShieldPlus size={18} /> {loading ? 'Creando...' : 'Crear Rol en el Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
