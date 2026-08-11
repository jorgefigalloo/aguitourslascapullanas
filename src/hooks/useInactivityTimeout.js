import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Hook para cerrar sesión automáticamente tras 60 minutos (1 hora) de inactividad
export function useInactivityTimeout(user, onLogout, timeoutMinutes = 60) {
  const timerRef = useRef(null);

  const checkLastActiveOnLoad = () => {
    if (!user) return false;
    const lastActiveStr = localStorage.getItem('aguitours_last_active');
    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      const elapsedMinutes = (Date.now() - lastActive) / (1000 * 60);
      if (elapsedMinutes >= timeoutMinutes) {
        alert(`⌛ Tu sesión ha caducado por inactividad (más de ${timeoutMinutes} minutos sin interacción).`);
        supabase.auth.signOut().then(() => {
          localStorage.removeItem('aguitours_last_active');
          if (onLogout) onLogout();
        });
        return true;
      }
    }
    localStorage.setItem('aguitours_last_active', Date.now().toString());
    return false;
  };

  const resetTimer = () => {
    if (!user) return;
    localStorage.setItem('aguitours_last_active', Date.now().toString());

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      alert(`⌛ Tu sesión ha caducado por inactividad (${timeoutMinutes} minutos sin interacción).`);
      await supabase.auth.signOut();
      localStorage.removeItem('aguitours_last_active');
      if (onLogout) onLogout();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('aguitours_last_active');
      return;
    }

    const expired = checkLastActiveOnLoad();
    if (expired) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    resetTimer();

    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [user]);
}

