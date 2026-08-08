import React, { useState } from 'react';
import { X, User, Lock, AtSign, Save, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function MisDatosModal({ isOpen, onClose, user, profile, onProfileUpdated }) {
  const [nombreCompleto, setNombreCompleto] = useState(profile?.nombre_completo || '');
  const [telefono, setTelefono] = useState(profile?.telefono || '');
  const [documento, setDocumento] = useState(profile?.documento_identidad || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!isOpen || !user) return null;

  const validarPasswordSegura = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(pwd);
  };

  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      // 1. Actualizar datos en tabla public.perfiles
      const { error: perfilError } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: nombreCompleto,
          telefono: telefono,
          documento_identidad: documento,
          username: username.toLowerCase().trim()
        })
        .eq('id', user.id);

      if (perfilError) throw perfilError;

      // 2. Si ingresó una nueva contraseña, actualizarla en auth
      if (newPassword.trim().length > 0) {
        if (!validarPasswordSegura(newPassword)) {
          throw new Error('La nueva contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo especial (!@#$%^&*).');
        }

        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      setMsg({ type: 'success', text: '¡Tus datos y contraseña se actualizaron con éxito!' });
      onProfileUpdated();
      setTimeout(onClose, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Error al actualizar datos.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-auto max-h-[85vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <User size={20} /> Mis Datos Personales
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">Actualiza tu información de cuenta y credenciales</p>
        </div>

        {/* Body Modal con Scrollbar */}
        <form onSubmit={handleGuardarDatos} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {msg.text && (
            <div className={`p-3 rounded-xl text-xs font-bold ${msg.type === 'success' ? 'bg-emerald-900/40 border border-emerald-500 text-emerald-300' : 'bg-red-900/40 border border-red-500 text-red-300'}`}>
              {msg.text}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Nombre Completo</label>
            <input 
              type="text" 
              value={nombreCompleto} 
              onChange={e => setNombreCompleto(e.target.value)} 
              required 
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Nombre de Usuario (Username)</label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                className="w-full bg-[#071521] border border-white/15 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Teléfono</label>
              <input 
                type="text" 
                value={telefono} 
                onChange={e => setTelefono(e.target.value)} 
                placeholder="+51 987 654 321" 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Doc. Identidad / DNI</label>
              <input 
                type="text" 
                value={documento} 
                onChange={e => setDocumento(e.target.value)} 
                placeholder="75849302" 
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <label className="text-xs text-amber-400 font-bold block mb-1">
              Cambiar Contraseña (Dejar en blanco para mantener la actual)
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="•••••••• (Nueva contraseña)" 
                className="w-full bg-[#071521] border border-white/15 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
