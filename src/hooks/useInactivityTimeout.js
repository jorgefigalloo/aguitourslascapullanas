import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

// Hook para cerrar sesión automáticamente tras 60 minutos (1 hora) de inactividad
export function useInactivityTimeout(user, onLogout, timeoutMinutes = 60) {
  const timerRef = useRef(null);
  const toast = useToast();

  const checkLastActive = () => {
    if (!user) return false;
    const lastActiveStr = localStorage.getItem('aguitours_last_active');
    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      const elapsedMinutes = (Date.now() - lastActive) / (1000 * 60);
      if (elapsedMinutes >= timeoutMinutes) {
        console.warn(`⌛ Sesión caducada por inactividad (${elapsedMinutes.toFixed(1)} min sin actividad).`);
        localStorage.removeItem('aguitours_last_active');
        supabase.auth.signOut().then(() => {
          toast.warning(`Tu sesión ha caducado por inactividad (${timeoutMinutes} min sin interacción). Por seguridad debes volver a ingresar.`, 'Sesión Expirada');
          if (onLogout) onLogout();
        });
        return true;
      }
    } else {
      localStorage.setItem('aguitours_last_active', Date.now().toString());
    }
    return false;
  };

  const resetTimer = () => {
    if (!user) return;
    localStorage.setItem('aguitours_last_active', Date.now().toString());

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      console.warn(`⌛ Sesión caducada por inactividad (${timeoutMinutes} min transcurridos).`);
      localStorage.removeItem('aguitours_last_active');
      await supabase.auth.signOut();
      toast.warning(`Tu sesión ha caducado por inactividad (${timeoutMinutes} min sin interacción). Por seguridad debes volver a ingresar.`, 'Sesión Expirada');
      if (onLogout) onLogout();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    const expired = checkLastActive();
    if (expired) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    resetTimer();

    const handleUserActivity = () => {
      resetTimer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLastActive();
      }
    };

    events.forEach(event => window.addEventListener(event, handleUserActivity));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);
}

