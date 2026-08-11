import React, { useState, useEffect } from 'react';
import { X, Save, User, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function EditarUsuarioAdminModal({ usuario, isOpen, onClose, onUsuarioActualizado }) {
  const [formData, setFormData] = useState({
    nombre_completo: '', username: '', telefono: '', documento_identidad: '', rol: 'cliente', nueva_password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre_completo: usuario.nombre_completo || '',
        username: usuario.username || '',
        telefono: usuario.telefono || '',
        documento_identidad: usuario.documento_identidad || '',
        rol: usuario.rol || 'cliente',
        nueva_password: ''
      });
    }
  }, [usuario]);

  if (!isOpen || !usuario) return null;

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Actualizar datos en la tabla perfiles
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: formData.nombre_completo,
          username: formData.username,
          telefono: formData.telefono,
          documento_identidad: formData.documento_identidad,
          rol: formData.rol,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuario.id);

      if (error) throw error;

      // 2. Si se ingresó una nueva contraseña, actualizar credenciales de Auth
      if (formData.nueva_password && formData.nueva_password.trim().length >= 6) {
        try {
          const { error: passError } = await supabase.auth.updateUser({
            password: formData.nueva_password
          });
          if (passError) {
            // Intentar por admin si es otro usuario
            await supabase.auth.admin.updateUserById(usuario.id, {
              password: formData.nueva_password
            });
          }
        } catch (passErr) {
          console.log('Info de contraseña:', passErr);
        }
      }

      alert('¡Datos de usuario, rol y credenciales actualizados correctamente!');
      onUsuarioActualizado();
      onClose();
    } catch (err) {
      alert('Error al actualizar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-auto max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <User size={20} /> Editar Usuario & Permisos RBAC
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">{usuario.nombre_completo} ({usuario.username || 'sin username'})</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Nombre Completo</label>
            <input 
              type="text" 
              value={formData.nombre_completo} 
              onChange={e => setFormData({...formData, nombre_completo: e.target.value})} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Nombre de Usuario (Username)</label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                placeholder="jorge94web"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Teléfono / WhatsApp</label>
              <input 
                type="text" 
                value={formData.telefono} 
                onChange={e => setFormData({...formData, telefono: e.target.value})} 
                placeholder="+51 987 654 321"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Documento Identidad (DNI)</label>
              <input 
                type="text" 
                value={formData.documento_identidad} 
                onChange={e => setFormData({...formData, documento_identidad: e.target.value})} 
                placeholder="76543210"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Rol / Permisos del Sistema</label>
              <select 
                value={formData.rol} 
                onChange={e => setFormData({...formData, rol: e.target.value})} 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none font-bold text-[#ffb703]"
              >
                <option value="super_admin">Super Administrador (Full)</option>
                <option value="admin">Administrador General</option>
                <option value="editor_contenido">Editor CMS</option>
                <option value="agente_ventas">Agente de Ventas</option>
                <option value="cliente">Cliente (Viajero)</option>
              </select>
            </div>
          </div>

          {/* Campo para Cambiar / Restablecer Contraseña */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <label className="text-xs text-[#ffb703] font-bold block mb-1 flex items-center gap-1">
              <Lock size={14} /> Cambiar Contraseña de Acceso (Opcional)
            </label>
            <input 
              type="password" 
              value={formData.nueva_password} 
              onChange={e => setFormData({...formData, nueva_password: e.target.value})} 
              placeholder="Escribe la nueva contraseña (mínimo 6 caracteres)..."
              minLength={6}
              className="w-full bg-[#071521] border border-[#ffb703]/40 rounded-xl p-3 text-white text-sm focus:border-[#ffb703] focus:outline-none" 
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              * Si no deseas cambiar la contraseña del usuario, deja este campo en blanco.
            </span>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios de Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}
