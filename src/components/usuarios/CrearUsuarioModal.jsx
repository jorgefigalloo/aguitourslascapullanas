import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Shield, Lock, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { supabase, tempAuthClient } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function CrearUsuarioModal({ isOpen, onClose, onUsuarioCreado, fixedRol, title }) {
  const targetRol = fixedRol || 'cliente';
  const modalTitle = title || (fixedRol === 'cliente' ? 'Registrar Nuevo Cliente Viajero' : 'Registrar Nuevo Usuario en el Sistema');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    username: '',
    telefono: '',
    documento_identidad: '',
    rol: targetRol
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validarPasswordSegura = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(pwd);
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!validarPasswordSegura(formData.password)) {
      toast.warning('La contraseña requiere mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*).', 'Requisitos de Contraseña');
      return;
    }

    setLoading(true);

    try {
      const cleanUsername = (formData.username || formData.email.split('@')[0]).toLowerCase().trim();
      const finalRol = fixedRol || formData.rol || 'cliente';

      // 1. Crear usuario en Supabase Auth con cliente temporal aislado
      const { data, error: authError } = await tempAuthClient.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombre_completo,
            username: cleanUsername,
            telefono: formData.telefono,
            rol: finalRol
          }
        }
      });

      if (authError) throw authError;

      if (data?.user) {
        // 2. Asegurar o actualizar perfil en la tabla perfiles usando el cliente principal del admin
        const { error: profileError } = await supabase.from('perfiles').upsert([{
          id: data.user.id,
          email: formData.email.trim().toLowerCase(),
          nombre_completo: formData.nombre_completo,
          username: cleanUsername,
          telefono: formData.telefono,
          documento_identidad: formData.documento_identidad,
          rol: finalRol,
          activo: true
        }]);

        if (profileError) console.log('Info de perfil:', profileError);
      }

      toast.success(`${fixedRol === 'cliente' ? 'Cliente' : 'Usuario'} "${formData.nombre_completo}" (${cleanUsername}) registrado exitosamente.`, 'Registro Exitoso');
      if (onUsuarioCreado) onUsuarioCreado();
      onClose();
      setFormData({
        email: '',
        password: '',
        nombre_completo: '',
        username: '',
        telefono: '',
        documento_identidad: '',
        rol: targetRol
      });
    } catch (err) {
      toast.error('Error al registrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
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
            <UserPlus size={20} /> {modalTitle}
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">
            {fixedRol === 'cliente' ? 'Crea credenciales de acceso para que el cliente ingrese a su sistema' : 'Crea credenciales de acceso y asigna un rol inicial'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleCrear} autoComplete="off" className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Correo Electrónico (Login)</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder="usuario@ejemplo.com"
                autoComplete="off"
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
                minLength={8}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
              <p className="text-[11px] text-amber-300 mt-2 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25 leading-snug">
                🔒 Requisito: Mínimo 8 caracteres, 1 mayúscula (A-Z), 1 minúscula (a-z), 1 número (0-9) y 1 símbolo especial (!@#$%^&*)
              </p>
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
              autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              {fixedRol ? (
                <div>
                  <label className="text-xs text-[#1995ad] font-bold block mb-1">Rol de Registro</label>
                  <div className="w-full bg-[#071521] border border-[#1995ad]/40 rounded-xl p-3 text-[#1995ad] text-sm font-bold flex items-center justify-between">
                    <span>Cliente (Viajero)</span>
                    <CheckCircle2 size={16} />
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <UserPlus size={18} /> {loading ? 'Registrando...' : (fixedRol === 'cliente' ? 'Registrar Cliente' : 'Registrar Usuario')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

