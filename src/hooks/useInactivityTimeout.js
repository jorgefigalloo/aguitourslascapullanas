import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Hook para cerrar sesión automáticamente tras 15 minutos de inactividad
export function useInactivityTimeout(user, onLogout, timeoutMinutes = 15) {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (user) {
      timerRef.current = setTimeout(async () => {
        alert('⌛ Tu sesión ha caducado por inactividad (15 minutos sin interacción).');
        await supabase.auth.signOut();
        if (onLogout) onLogout();
      }, timeoutMinutes * 60 * 1000);
    }
  };

  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Iniciar temporizador
    resetTimer();

    // Escuchar eventos de interacción del usuario
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);
}
