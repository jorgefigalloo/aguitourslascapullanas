import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Shield, Lock, Mail, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export function EditarUsuarioAdminModal({ usuario, isOpen, onClose, onUsuarioActualizado, fixedRol, isClientModule }) {
  const toast = useToast();
  const isClienteOnly = isClientModule || fixedRol === 'cliente' || usuario?.rol === 'cliente';

  const [formData, setFormData] = useState({
    email: '', nombre_completo: '', username: '', telefono: '', documento_identidad: '', fecha_nacimiento: '', rol: 'cliente', activo: true, nueva_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        email: usuario.email || '',
        nombre_completo: usuario.nombre_completo || '',
        username: usuario.username || '',
        telefono: usuario.telefono || '',
        documento_identidad: usuario.documento_identidad || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        rol: isClienteOnly ? 'cliente' : (usuario.rol || 'cliente'),
        activo: usuario.activo ?? true,
        nueva_password: ''
      });
    }
  }, [usuario, isClienteOnly]);

  if (!isOpen || !usuario) return null;

  const handleEnviarCorreoActivacion = async () => {
    const targetEmail = formData.email.trim();
    if (!targetEmail) {
      toast.warning('Este usuario no tiene un correo electrónico válido registrado.');
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/`
      });

      if (error) throw error;
      toast.success(`Correo de activación enviado con éxito a "${targetEmail}". El cliente podrá configurar su clave desde el enlace.`, 'Correo Enviado');
    } catch (err) {
      toast.error('Error al enviar correo de activación: ' + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanUsername = (formData.username || '').toLowerCase().trim();
      const cleanEmail = (formData.email || '').trim();
      const finalRol = isClienteOnly ? 'cliente' : formData.rol;

      // 1. Actualizar correo en auth.users vía RPC administrativa si cambió el email
      if (cleanEmail) {
        const { error: rpcEmailErr } = await supabase.rpc('admin_actualizar_email_usuario', {
          p_target_user_id: usuario.id,
          p_new_email: cleanEmail
        });
        if (rpcEmailErr) {
          console.warn('Info RPC actualizar email:', rpcEmailErr);
        }
      }

      // 2. Actualizar datos en la tabla perfiles
      const updateData = {
        email: cleanEmail,
        nombre_completo: formData.nombre_completo,
        username: cleanUsername,
        telefono: formData.telefono,
        documento_identidad: formData.documento_identidad,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        rol: finalRol,
        activo: formData.activo,
        updated_at: new Date().toISOString()
      };

      let { error } = await supabase
        .from('perfiles')
        .update(updateData)
        .eq('id', usuario.id);

      // Fallback si la columna email aún no ha sido agregada a perfiles en Supabase
      if (error && (error.message.includes('email') || error.code === 'PGRST204' || error.status === 400)) {
        delete updateData.email;
        const { error: retryErr } = await supabase
          .from('perfiles')
          .update(updateData)
          .eq('id', usuario.id);

        if (retryErr) throw retryErr;
      } else if (error) {
        throw error;
      }

      // 3. Si se ingresó una nueva contraseña, actualizar credenciales de Auth vía RPC administrativa
      if (formData.nueva_password && formData.nueva_password.trim() !== '') {
        const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!regexPassword.test(formData.nueva_password)) {
          toast.warning('La nueva contraseña no cumple los requisitos: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo especial (!@#$%^&*).', 'Requisitos de Contraseña');
          setLoading(false);
          return;
        }

        const { error: rpcErr } = await supabase.rpc('admin_cambiar_password_usuario', {
          p_target_user_id: usuario.id,
          p_new_password: formData.nueva_password
        });

        if (rpcErr) {
          console.warn('Info RPC cambiar password:', rpcErr);
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser?.user?.id === usuario.id) {
            await supabase.auth.updateUser({ password: formData.nueva_password });
          }
        }
      }

      toast.success(`Datos, correo, fecha de nacimiento, estado y clave de "${formData.nombre_completo}" actualizados correctamente.`, 'Perfil Actualizado');
      if (onUsuarioActualizado) onUsuarioActualizado();
      onClose();
    } catch (err) {
      toast.error('Error al actualizar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
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
            <User size={20} /> {isClienteOnly ? 'Editar Datos del Cliente Viajero' : 'Editar Usuario & Permisos RBAC'}
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">{usuario.nombre_completo} ({usuario.username || usuario.email || 'Cliente'})</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} autoComplete="off" className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Nombre Completo</label>
            <input 
              type="text" 
              value={formData.nombre_completo} 
              onChange={e => setFormData({...formData, nombre_completo: e.target.value})} 
              required 
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
                placeholder="jorge94web"
                autoComplete="off"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Correo Electrónico (Login)</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="usuario@ejemplo.com"
                autoComplete="off"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none font-bold text-[#1995ad]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">DNI / Documento</label>
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
              <label className="text-xs text-gray-300 font-bold block mb-1">F. Nacimiento</label>
              <input 
                type="date" 
                value={formData.fecha_nacimiento} 
                onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} 
                autoComplete="off"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {isClienteOnly ? (
                <div>
                  <label className="text-xs text-[#1995ad] font-bold block mb-1">Rol de Usuario</label>
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
                    className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none font-bold text-[#ffb703]"
                  >
                    <option value="super_admin">Super Administrador (Full)</option>
                    <option value="admin">Administrador General</option>
                    <option value="editor_contenido">Editor CMS</option>
                    <option value="agente_ventas">Agente de Ventas</option>
                    <option value="cliente">Cliente (Viajero)</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Estado de Cuenta</label>
              <select 
                value={formData.activo ? 'true' : 'false'} 
                onChange={e => setFormData({...formData, activo: e.target.value === 'true'})} 
                className={`w-full border rounded-xl p-3 text-sm focus:outline-none font-bold ${formData.activo ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-red-950/40 border-red-500/50 text-red-300'}`}
              >
                <option value="true">🟢 Cuenta Activa (Acceso Permitido)</option>
                <option value="false">🔴 Cuenta Suspendida / Inactiva (Acceso Denegado)</option>
              </select>
            </div>
          </div>

          {/* Botón para Enviar Correo de Activación / Restablecimiento */}
          <div className="bg-[#1995ad]/10 border border-[#1995ad]/30 p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white font-bold m-0 flex items-center gap-1">
                <Mail size={14} className="text-[#1995ad]" /> Enviar Correo de Activación
              </p>
              <p className="text-[11px] text-gray-400 m-0">Envía un enlace al cliente para que cree o active su clave</p>
            </div>
            <button
              type="button"
              onClick={handleEnviarCorreoActivacion}
              disabled={sendingEmail}
              className="bg-[#1995ad] text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-[#1995ad]/80 transition-colors whitespace-nowrap"
            >
              <Send size={14} /> {sendingEmail ? 'Enviando...' : 'Enviar Correo'}
            </button>
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
              placeholder="•••••••• (Nueva contraseña)"
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-[#071521] border border-[#ffb703]/40 rounded-xl p-3 text-white text-sm focus:border-[#ffb703] focus:outline-none" 
            />
            <span className="text-[11px] text-amber-300 mt-2 block font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25 leading-snug">
              🔒 Requisito: Mínimo 8 caracteres, 1 mayúscula (A-Z), 1 minúscula (a-z), 1 número (0-9) y 1 símbolo especial (!@#$%^&*)
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">
              * Si no deseas cambiar la contraseña del usuario, deja este campo en blanco.
            </span>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios de Usuario'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

