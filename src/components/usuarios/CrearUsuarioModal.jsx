import React, { useState } from 'react';
import { X, UserPlus, Shield, Lock, Mail, Phone, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CrearUsuarioModal({ isOpen, onClose, onUsuarioCreado }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    username: '',
    telefono: '',
    documento_identidad: '',
    rol: 'cliente'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombre_completo,
            telefono: formData.telefono,
            rol: formData.rol
          }
        }
      });

      if (authError) throw authError;

      if (data?.user) {
        // 2. Asegurar o actualizar perfil en la tabla perfiles
        const { error: profileError } = await supabase.from('perfiles').upsert([{
          id: data.user.id,
          nombre_completo: formData.nombre_completo,
          username: formData.username || formData.email.split('@')[0],
          telefono: formData.telefono,
          documento_identidad: formData.documento_identidad,
          rol: formData.rol
        }]);

        if (profileError) console.log('Info de perfil:', profileError);
      }

      alert('¡Usuario registrado exitosamente en el sistema!');
      onUsuarioCreado();
      onClose();
      setFormData({
        email: '',
        password: '',
        nombre_completo: '',
        username: '',
        telefono: '',
        documento_identidad: '',
        rol: 'cliente'
      });
    } catch (err) {
      alert('Error al registrar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative my-auto max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <UserPlus size={20} /> Registrar Nuevo Usuario en el Sistema
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">Crea credenciales de acceso y asigna un rol inicial</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleCrear} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Correo Electrónico (Login)</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder="usuario@ejemplo.com"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Contraseña de Acceso</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Nombre Completo</label>
            <input 
              type="text" 
              value={formData.nombre_completo} 
              onChange={e => setFormData({...formData, nombre_completo: e.target.value})} 
              required 
              placeholder="Juan Carlos Pérez"
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
                placeholder="juanperez"
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
              <label className="text-xs text-gray-300 font-bold block mb-1">Documento Identidad (DNI/Pasaporte)</label>
              <input 
                type="text" 
                value={formData.documento_identidad} 
                onChange={e => setFormData({...formData, documento_identidad: e.target.value})} 
                placeholder="76543210"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-[#ffb703] font-bold block mb-1">Rol / Permisos del Sistema</label>
              <select 
                value={formData.rol} 
                onChange={e => setFormData({...formData, rol: e.target.value})} 
                className="w-full bg-[#071521] border border-[#ffb703]/40 rounded-xl p-3 text-white text-sm focus:border-[#ffb703] focus:outline-none font-bold"
              >
                <option value="cliente">Cliente (Viajero)</option>
                <option value="agente_ventas">Agente de Ventas</option>
                <option value="editor_contenido">Editor CMS</option>
                <option value="admin">Administrador General</option>
                <option value="super_admin">Super Administrador (Full)</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <UserPlus size={18} /> {loading ? 'Registrando...' : 'Registrar Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}
