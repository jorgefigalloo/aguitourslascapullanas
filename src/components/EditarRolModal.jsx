import React, { useState, useEffect } from 'react';
import { X, Save, Key, CheckSquare, Square, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { CATEGORIAS_PERMISOS, TODOS_LOS_PERMISOS } from '../lib/permisos';

export function EditarRolModal({ rolData, rol, isOpen, onClose, onRolActualizado }) {
  const toast = useToast();
  const targetRol = rolData || rol;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetRol) {
      setNombre(targetRol.nombre || '');
      setDescripcion(targetRol.descripcion || '');
      if (Array.isArray(targetRol.permisos)) {
        setPermisos(targetRol.permisos);
      }

      // Consultar la versión más reciente de la BD de Supabase al abrir
      supabase
        .from('roles_sistema')
        .select('*')
        .eq('id', targetRol.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data && Array.isArray(data.permisos)) {
            setPermisos(data.permisos);
            if (data.nombre) setNombre(data.nombre);
            if (data.descripcion) setDescripcion(data.descripcion);
          }
        });
    }
  }, [isOpen, targetRol]);

  if (!isOpen || !targetRol) return null;

  const togglePermiso = (permisoId) => {
    if (permisos.includes(permisoId)) {
      setPermisos(permisos.filter(p => p !== permisoId));
    } else {
      setPermisos([...permisos, permisoId]);
    }
  };

  const handleMarcarTodosGlobal = () => {
    setPermisos(TODOS_LOS_PERMISOS);
  };

  const handleDesmarcarTodosGlobal = () => {
    setPermisos([]);
  };

  // Marcar o desmarcar todos los permisos de un módulo específico
  const toggleModuloCompleto = (itemsModulo) => {
    const idsModulo = itemsModulo.map(i => i.id);
    const todosModuloMarcados = idsModulo.every(id => permisos.includes(id));

    if (todosModuloMarcados) {
      setPermisos(permisos.filter(p => !idsModulo.includes(p)));
    } else {
      const nuevosPermisos = new Set([...permisos, ...idsModulo]);
      setPermisos(Array.from(nuevosPermisos));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('roles_sistema')
        .upsert([{
          id: targetRol.id,
          nombre: nombre,
          descripcion: descripcion,
          permisos: permisos
        }], { onConflict: 'id' });

      if (error) throw error;
      toast.success(`Rol "${nombre}" y matriz de permisos actualizados correctamente.`, 'Rol Actualizado 🛡️');
      onRolActualizado();
      onClose();
    } catch (err) {
      toast.error('Error al guardar el rol: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const todosSeleccionadosGlobal = TODOS_LOS_PERMISOS.every(id => permisos.includes(id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative shrink-0">
          <div className="flex items-center gap-3">
            <Key size={22} className="text-[#ffb703]" />
            <div>
              <h3 className="font-headline text-lg font-bold m-0 text-white">
                Editar Rol & Matriz de Permisos: <span className="font-mono text-sm text-[#ffb703]">[{targetRol.id}]</span>
              </h3>
              <p className="text-[11px] opacity-90 m-0 mt-0.5">Habilita o deshabilita acciones por módulo ({permisos.length}/{TODOS_LOS_PERMISOS.length})</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              type="button"
              onClick={handleGuardar}
              disabled={loading}
              className="btn-gold-3d text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Save size={15} /> {loading ? 'Guardando...' : 'Guardar Permisos'}
            </button>

            <button 
              type="button"
              onClick={onClose} 
              className="text-white/80 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} className="p-6 flex flex-col gap-6 overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Nombre del Rol</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Descripción del Rol</label>
              <input 
                type="text" 
                value={descripcion} 
                onChange={e => setDescripcion(e.target.value)} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          {/* Matriz Granular de Permisos por Módulo */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs text-[#ffb703] font-bold block uppercase tracking-wider">
                Permisos Granulares ({permisos.length}/{TODOS_LOS_PERMISOS.length})
              </label>

              <button 
                type="button"
                onClick={todosSeleccionadosGlobal ? handleDesmarcarTodosGlobal : handleMarcarTodosGlobal}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all border border-white/15"
              >
                {todosSeleccionadosGlobal ? <Circle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
                {todosSeleccionadosGlobal ? 'Desmarcar Absolutamente Todo' : 'Marcar Absolutamente Todo'}
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {CATEGORIAS_PERMISOS.map(cat => {
                const idsModulo = cat.items.map(i => i.id);
                const todosModuloMarcados = idsModulo.every(id => permisos.includes(id));
                const algunosModuloMarcados = idsModulo.some(id => permisos.includes(id));

                return (
                  <div key={cat.categoria} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-[#1995ad] uppercase tracking-wider m-0">{cat.categoria}</h4>
                      
                      <button 
                        type="button"
                        onClick={() => toggleModuloCompleto(cat.items)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border ${todosModuloMarcados ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30' : 'bg-[#1995ad]/20 text-[#a0f0ff] border-[#1995ad]/40 hover:bg-[#1995ad]/30'}`}
                      >
                        {todosModuloMarcados ? 'Desmarcar Módulo' : 'Marcar Módulo Completo'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cat.items.map(item => {
                        const activo = permisos.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => togglePermiso(item.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition-all ${activo ? 'bg-[#1995ad]/20 border-[#1995ad] text-white' : 'bg-[#071521] border-white/10 text-gray-400 hover:border-white/20'}`}
                          >
                            {activo ? <CheckSquare size={16} className="text-[#1995ad] shrink-0" /> : <Square size={16} className="text-gray-500 shrink-0" />}
                            <span className="line-clamp-1">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Configuración de Rol'}
          </button>
        </form>
      </div>
    </div>
  );
}
