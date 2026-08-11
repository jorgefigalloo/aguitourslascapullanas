import React, { useState } from 'react';
import { User, Lock, AtSign, Save, Phone, FileText, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ClientPerfilEditar({ user, profile, onProfileUpdated }) {
  const [nombreCompleto, setNombreCompleto] = useState(profile?.nombre_completo || '');
  const [telefono, setTelefono] = useState(profile?.telefono || '');
  const [documento, setDocumento] = useState(profile?.documento_identidad || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(profile?.fecha_nacimiento || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const validarPasswordSegura = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(pwd);
  };

  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      // Validaciones
      if (newPassword.trim().length > 0) {
        if (newPassword !== confirmPassword) {
          throw new Error('Las contraseñas ingresadas no coinciden.');
        }
        if (!validarPasswordSegura(newPassword)) {
          throw new Error('La nueva contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo especial (!@#$%^&*).');
        }
      }

      // 1. Actualizar perfil en public.perfiles
      const { error: perfilError } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: nombreCompleto,
          telefono: telefono,
          documento_identidad: documento,
          fecha_nacimiento: fechaNacimiento || null,
          username: username.toLowerCase().trim()
        })
        .eq('id', user.id);

      if (perfilError) throw perfilError;

      // 2. Actualizar clave si ingresó una
      if (newPassword.trim().length > 0) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      setMsg({ type: 'success', text: '¡Tus datos de perfil y credenciales se actualizaron correctamente!' });
      setNewPassword('');
      setConfirmPassword('');
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Error al actualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#071521]/90 border border-white/15 p-6 md:p-10 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1995ad] to-[#ffb703] flex items-center justify-center font-bold text-2xl text-[#071521] shadow-lg shadow-[#1995ad]/30">
          {nombreCompleto?.[0] || 'V'}
        </div>
        <div>
          <span className="bg-[#1995ad]/20 border border-[#1995ad] text-[#a0f0ff] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Gestión de Seguridad & Datos
          </span>
          <h3 className="text-2xl font-bold text-white m-0 mt-1">Configuración de Mi Cuenta</h3>
          <p className="text-xs text-gray-300 m-0">{user?.email}</p>
        </div>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold mb-6 ${
          msg.type === 'success' ? 'bg-emerald-900/40 border border-emerald-500 text-emerald-300' : 'bg-red-900/40 border border-red-500 text-red-300'
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleGuardarDatos} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-gray-200 block mb-1.5">Nombre Completo *</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input 
                type="text" 
                value={nombreCompleto}
                onChange={e => setNombreCompleto(e.target.value)}
                required
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-200 block mb-1.5">Nombre de Usuario (Username) *</label>
            <div className="relative">
              <AtSign size={18} className="absolute left-3.5 top-3.5 text-[#1995ad]" />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-bold text-gray-200 block mb-1.5">Teléfono Movil / WhatsApp</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-3.5 text-emerald-400" />
              <input 
                type="text" 
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+51 987 654 321"
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-200 block mb-1.5">Documento Identidad / DNI</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3.5 top-3.5 text-[#ffb703]" />
              <input 
                type="text" 
                value={documento}
                onChange={e => setDocumento(e.target.value)}
                placeholder="75849302"
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-200 block mb-1.5">Fecha de Nacimiento</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3.5 top-3.5 text-purple-400" />
              <input 
                type="date" 
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl py-3 pl-11 pr-4 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sección de Cambio de Contraseña */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-[#ffb703]" />
            <h4 className="text-sm font-bold text-[#ffb703] m-0">Cambiar Contraseña de Acceso</h4>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Deja estos campos vacíos si no deseas cambiar tu contraseña actual.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-200 block mb-1.5">Nueva Contraseña</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl p-3 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-200 block mb-1.5">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d2538] border border-white/15 rounded-2xl p-3 text-white text-xs focus:border-[#1995ad] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-gold-3d justify-center py-4 font-bold text-xs mt-2"
        >
          <Save size={18} /> {loading ? 'Guardando Cambios...' : 'Guardar Información y Contraseña'}
        </button>
      </form>
    </div>
  );
}
