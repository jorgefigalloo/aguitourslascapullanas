import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, User, Phone, FileText, ArrowRight, ShieldCheck, CheckCircle2, AtSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const toast = useToast();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State del formulario
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documento, setDocumento] = useState('');
  const [rol, setRol] = useState('cliente');

  if (!isOpen) return null;

  const validarPasswordSegura = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(pwd);
  };

  const resetForm = () => {
    setLoginInput('');
    setPassword('');
    setNombreCompleto('');
    setUsername('');
    setEmail('');
    setTelefono('');
    setDocumento('');
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const cleanInput = loginInput.trim();
      let targetEmail = cleanInput;

      if (!cleanInput.includes('@')) {
        // 1. Intentar resolver el correo mediante la función RPC obtener_email_por_username
        const { data: foundEmail, error: rpcError } = await supabase
          .rpc('obtener_email_por_username', { p_username: cleanInput.toLowerCase() });

        if (!rpcError && foundEmail) {
          targetEmail = foundEmail;
        } else {
          // 2. Si el RPC falla, consultar directamente en perfiles por username o email
          const { data: profile } = await supabase
            .from('perfiles')
            .select('id, username, email')
            .or(`username.ilike.${cleanInput},email.ilike.${cleanInput}`)
            .maybeSingle();

          if (profile?.email) {
            targetEmail = profile.email;
          } else {
            throw new Error(`El usuario "${cleanInput}" no existe o no tiene un correo asignado. Verifica tu nombre de usuario o ingresa con tu correo registrado.`);
          }
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: targetEmail, 
        password 
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('El correo de este usuario está pendiente de confirmación. Revisa tu bandeja o solicita un correo de activación.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu correo/username y contraseña.');
        }
        throw error;
      }

      // Verificar si la cuenta fue suspendida o inactivada por el Admin
      if (data?.user) {
        const { data: userProfile } = await supabase
          .from('perfiles')
          .select('activo')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userProfile && userProfile.activo === false) {
          await supabase.auth.signOut();
          throw new Error('🔴 Tu cuenta se encuentra SUSPENDIDA o INACTIVA. Ponte en contacto con la agencia Aguitours para reactivar tu acceso.');
        }
      }

      resetForm();
      if (onAuthSuccess) onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!validarPasswordSegura(password)) {
      setErrorMsg('La contraseña no cumple los requisitos: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*).');
      setLoading(false);
      return;
    }

    try {
      const cleanUsername = (username || email.split('@')[0]).toLowerCase().trim();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            telefono: telefono,
            documento_identidad: documento,
            username: cleanUsername,
            rol: rol || 'cliente'
          }
        }
      });

      if (error) throw error;

      // Crear fila en tabla perfiles de supabase
      if (data?.user) {
        await supabase.from('perfiles').upsert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          nombre_completo: nombreCompleto,
          telefono: telefono,
          documento_identidad: documento,
          username: cleanUsername,
          rol: 'cliente',
          activo: true
        });

        // Notificar al cliente y redirigir al formulario de inicio de sesión
        toast.success(`Hemos enviado un correo de activación a "${email.trim()}". Revisa tu bandeja de entrada o spam para confirmar e iniciar sesión.`, '¡Cuenta Creada!');
        resetForm();
        setIsRegisterMode(false); // Redirigir automáticamente a Iniciar Sesión
        return;
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md">
      {/* Contenedor Principal del Modal */}
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative flex min-h-[560px]">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X size={20} />
        </button>

        {/* ---------------------------------------------------------------------------------- */}
        {/* LADO IZQUIERDO DE FONDO: FORMULARIO DE INICIAR SESIÓN */}
        {/* ---------------------------------------------------------------------------------- */}
        <div className="w-1/2 p-8 md:p-10 flex flex-col justify-center bg-[#0d2538] z-10">
          <div className="max-w-sm mx-auto w-full">
            <h3 className="font-headline text-2xl font-bold text-white mb-1">Iniciar Sesión</h3>
            <p className="text-xs text-gray-400 mb-6">Ingresa con tu correo o nombre de usuario</p>

            {errorMsg && !isRegisterMode && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded-xl text-xs mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Correo Electrónico o Username</label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    value={loginInput} 
                    onChange={e => setLoginInput(e.target.value)} 
                    required 
                    placeholder="ejemplo@correo.com o mi_usuario" 
                    className="w-full bg-[#071521] border border-white/15 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="w-full bg-[#071521] border border-white/15 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary-3d justify-center py-3.5 mt-2">
                {loading ? 'Validando...' : 'Ingresar al Sistema'}
              </button>
            </form>
          </div>
        </div>

        {/* ---------------------------------------------------------------------------------- */}
        {/* LADO DERECHO DE FONDO: FORMULARIO DE REGISTRO */}
        {/* ---------------------------------------------------------------------------------- */}
        <div className="w-1/2 p-8 md:p-10 flex flex-col justify-center bg-[#0d2538] z-10">
          <div className="max-w-sm mx-auto w-full">
            <h3 className="font-headline text-2xl font-bold text-white mb-1">Crear Cuenta Segura</h3>
            <p className="text-xs text-gray-400 mb-4">Ingresa tus datos para registrarte</p>

            {errorMsg && isRegisterMode && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded-xl text-xs mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={nombreCompleto} 
                  onChange={e => setNombreCompleto(e.target.value)} 
                  required 
                  placeholder="Juan Pérez" 
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-2.5 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Username (Nombre de usuario)</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  placeholder="mi_usuario" 
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-2.5 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  placeholder="ejemplo@correo.com" 
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-2.5 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">
                  Contraseña de Acceso
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength={8}
                  placeholder="••••••••" 
                  className="w-full bg-[#071521] border border-white/15 rounded-xl p-2.5 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
                />
                <p className="text-[11px] text-amber-300 mt-2 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25 leading-snug">
                  🔒 Requisito: Mínimo 8 caracteres, 1 mayúscula (A-Z), 1 minúscula (a-z), 1 número (0-9) y 1 símbolo especial (!@#$%^&*)
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
                {loading ? 'Creando cuenta...' : 'Crear Cuenta Segura'}
              </button>
            </form>
          </div>
        </div>

        {/* ---------------------------------------------------------------------------------- */}
        {/* PANEL DESLIZANTE DE LA EMPRESA (PANEL DE DESPLAZAMIENTO CARRUSEL 50% ANCHO) */}
        {/* ---------------------------------------------------------------------------------- */}
        <div 
          className="absolute top-0 bottom-0 left-1/2 w-1/2 bg-gradient-to-br from-[#003366] via-[#0d2538] to-[#071521] p-8 md:p-10 flex flex-col justify-between z-30 transition-transform duration-700 ease-in-out border-l border-white/15 shadow-2xl"
          style={{
            transform: isRegisterMode ? 'translateX(-100%)' : 'translateX(0%)',
            borderRight: isRegisterMode ? '1px solid rgba(255,255,255,0.15)' : 'none',
            borderLeft: isRegisterMode ? 'none' : '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/images/capullanas1.jpg" 
                alt="Aguitours Logo" 
                className="w-14 h-14 rounded-full border-2 border-[#ffb703] object-cover shadow-xl"
              />
              <div>
                <h3 className="font-headline text-2xl font-bold text-white m-0">Aguitours</h3>
                <p className="text-xs text-[#1995ad] font-bold tracking-wider m-0 uppercase">Las Capullanas • Agencia de Viajes</p>
              </div>
            </div>

            <span className="bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase inline-flex items-center gap-1 mb-4">
              <Sparkles size={14} /> Tu Portal Exclusivo de Viajes
            </span>

            <h4 className="font-headline text-2xl font-bold text-white mb-3">
              {isRegisterMode ? '¡Bienvenido a Aguitours!' : '¡Vive la Experiencia Aguitours!'}
            </h4>
            
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {isRegisterMode 
                ? 'Regístrate para reservar cupos en salidas grupales, acceder a itinerarios VIP y administrar tus viajes de forma segura.'
                : 'Inicia sesión para gestionar tus paquetes turísticos, revisar itinerarios y explorar promociones exclusivas en los mejores destinos.'
              }
            </p>
          </div>

          {/* Botón de Desplazamiento del Carrusel */}
          <div className="pt-6 border-t border-white/10 mt-auto">
            <p className="text-xs text-gray-400 mb-3">
              {isRegisterMode ? '¿Ya tienes una cuenta registrada?' : '¿No tienes una cuenta aún?'}
            </p>
            <button 
              type="button"
              onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorMsg(''); }} 
              className="btn-gold-3d text-xs font-bold w-full justify-center py-3 flex items-center gap-2 shadow-xl hover:scale-102 transition-transform"
            >
              {isRegisterMode ? (
                <> <ArrowLeft size={16} /> Ir a Iniciar Sesión </>
              ) : (
                <> Registrarse Ahora <ArrowRight size={16} /> </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
