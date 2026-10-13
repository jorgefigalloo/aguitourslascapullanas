import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { FlightIntro3D } from './components/FlightIntro3D';
import { PaquetesGrupales } from './components/PaquetesGrupales';
import { DestinosSection } from './components/DestinosSection';
import { ViajesRealizadosSection } from './components/antecedentes/ViajesRealizadosSection';
import { QuienesSomosSection } from './components/QuienesSomosSection';
import { ContactoSection } from './components/ContactoSection';
import { AuthModal } from './components/auth/AuthModal';
import { ClientPortal } from './components/ClientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { supabase } from './lib/supabase';
import './styles/index.css';

export default function App() {
  const [activeView, setActiveView] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/admin') || path.includes('/dashboard')) return 'admin';
    if (path.includes('/cliente') || path.includes('/perfil')) return 'mi-perfil';
    return 'inicio';
  });

  const [activeSection, setActiveSection] = useState('inicio');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [clientInitialTab, setClientInitialTab] = useState('mis-viajes');
  const [footerTexto, setFooterTexto] = useState('© 2026 Agencia de Viajes "Aguitours Las Capullanas". Todos los derechos reservados.');

  const navigateToView = (view, clientTab = 'mis-viajes') => {
    setActiveView(view);
    setClientInitialTab(clientTab);

    let targetPath = '/';
    if (view === 'admin') targetPath = '/admin';
    else if (view === 'mi-perfil') targetPath = '/cliente';

    window.history.pushState(null, '', targetPath);
  };

  const handleScrollToSection = (sectionId) => {
    setActiveSection(sectionId);

    if (activeView !== 'inicio') {
      setActiveView('inicio');
      window.history.pushState(null, '', '/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const navOffset = 64;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        const navOffset = 64;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (activeView !== 'inicio') return;

    const sections = ['inicio', 'grupales', 'destinos', 'antecedentes', 'nosotros', 'contacto'];
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      const navOffset = 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop - navOffset;
          if (scrollY >= top) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeView]);

  const handleCotizarClick = () => {
    if (user) {
      navigateToView('mi-perfil', 'cotizar');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error al cerrar sesión:', e);
    }
    localStorage.removeItem('aguitours_last_active');
    setUser(null);
    setProfile(null);
    navigateToView('inicio');
  };

  // Hook de inactividad: Cierra sesión tras 60 minutos (1 hora) sin interacción
  useInactivityTimeout(user, handleLogout, 60);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('⚠️ Error al obtener sesión de Supabase:', error.message);
          if (isMounted) {
            setUser(null);
            setProfile(null);
            setAppReady(true);
          }
          return;
        }

        if (session?.user) {
          // Verificar inactividad al abrir la app
          const lastActiveStr = localStorage.getItem('aguitours_last_active');
          if (lastActiveStr) {
            const lastActive = parseInt(lastActiveStr, 10);
            const elapsedMinutes = (Date.now() - lastActive) / (1000 * 60);
            if (elapsedMinutes >= 60) {
              console.warn(`⌛ Inactividad al iniciar app: transcurrieron ${elapsedMinutes.toFixed(1)} min. Cerrando sesión.`);
              localStorage.removeItem('aguitours_last_active');
              try { await supabase.auth.signOut(); } catch (_) {}
              if (isMounted) {
                setUser(null);
                setProfile(null);
                setAppReady(true);
              }
              return;
            }
          }

          if (isMounted) {
            setUser(session.user);
            await cargarPerfil(session.user);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('❌ Error crítico durante la inicialización de sesión:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        // SIEMPRE marcar la app como lista, haya o no sesión, haya o no error
        if (isMounted) {
          setAppReady(true);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        if (_event === 'SIGNED_IN') {
          // El usuario acaba de iniciar sesión activamente: reseteamos el reloj de inactividad
          localStorage.setItem('aguitours_last_active', Date.now().toString());
        } else {
          // Solo verificar inactividad si no es un evento de login reciente
          const lastActiveStr = localStorage.getItem('aguitours_last_active');
          if (lastActiveStr) {
            const lastActive = parseInt(lastActiveStr, 10);
            const elapsedMinutes = (Date.now() - lastActive) / (1000 * 60);
            if (elapsedMinutes >= 60) {
              localStorage.removeItem('aguitours_last_active');
              supabase.auth.signOut().catch(() => {});
              setUser(null);
              setProfile(null);
              return;
            }
          }
        }
        setUser(session.user);
        cargarPerfil(session.user);
        if (_event === 'PASSWORD_RECOVERY') {
          navigateToView('mi-perfil', 'mi-perfil');
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    cargarFooterCMS();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const cargarPerfil = async (authUser) => {
    try {
      const { data, error } = await supabase.from('perfiles').select('*').eq('id', authUser.id).single();
      
      if (error) {
        console.warn('⚠️ Error al cargar perfil del usuario:', error.message);
      }

      if (authUser.email === 'jorge94web@gmail.com' || authUser.id === 'ba15e491-47db-4a29-b710-7e5e24f3af97') {
        setProfile(data ? { ...data, rol: 'super_admin' } : {
          id: authUser.id,
          nombre_completo: 'Jorge Figallo',
          username: 'jorge94web',
          rol: 'super_admin'
        });
      } else if (data) {
        setProfile(data);
      }
    } catch (e) {
      console.warn('⚠️ Error al cargar perfil:', e);
    }
  };

  const cargarFooterCMS = async () => {
    try {
      const { data } = await supabase.from('cms_contenido').select('*').eq('clave_seccion', 'footer_texto').single();
      if (data && data.titulo) setFooterTexto(data.titulo);
    } catch (e) { console.log(e); }
  };

  // Proteger rutas /admin y /cliente cuando se cierra la sesión o expira por inactividad
  useEffect(() => {
    if (appReady && !user) {
      if (activeView === 'admin' || activeView === 'mi-perfil') {
        setActiveView('inicio');
        window.history.pushState(null, '', '/');
        setAuthModalOpen(true);
      }
    }
  }, [appReady, user, activeView]);

  // Si el usuario está autenticado y en el Panel Administrativo
  if (activeView === 'admin' && user) {
    return (
      <AdminDashboard 
        user={user} 
        profile={profile} 
        onBackToSite={() => navigateToView('inicio')} 
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#071521' }}>
      <ScrollProgressBar />
      {/* Intro Cinematográfica del Avión Grande con Logo Aguitours */}
      {showIntro && <FlightIntro3D onComplete={() => setShowIntro(false)} />}

      <Navbar 
        onOpenAuth={() => setAuthModalOpen(true)}
        activeView={activeView}
        activeSection={activeSection}
        setActiveView={navigateToView}
        onNavigateSection={handleScrollToSection}
        user={user}
        profile={profile}
        onLogout={handleLogout}
        onProfileUpdated={() => user && cargarPerfil(user)}
        onCotizarClick={handleCotizarClick}
      />

      <main style={{ flex: 1 }}>
        {(activeView === 'inicio' || ((activeView === 'admin' || activeView === 'mi-perfil') && !user)) && (
          <>
            <div id="inicio">
              <Hero3D 
                onExplorarGrupales={() => handleScrollToSection('grupales')}
                onExplorarDestinos={() => handleScrollToSection('destinos')}
                onCotizarClick={handleCotizarClick}
              />
            </div>
            <div id="grupales">
              <PaquetesGrupales user={user} profile={profile} onOpenAuth={() => setAuthModalOpen(true)} />
            </div>
            <div id="destinos">
              <DestinosSection user={user} onOpenAuth={() => setAuthModalOpen(true)} />
            </div>
            <div id="antecedentes">
              <ViajesRealizadosSection />
            </div>
            <div id="nosotros">
              <QuienesSomosSection />
            </div>
            <div id="contacto">
              <ContactoSection />
            </div>
          </>
        )}

        {activeView === 'mi-perfil' && user && (
          <ClientPortal 
            user={user} 
            profile={profile} 
            initialTab={clientInitialTab}
            onExplorarPaquetes={() => handleScrollToSection('grupales')}
          />
        )}
      </main>


      {/* Footer dinámico del CMS */}
      <footer style={{ background: '#040b12', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '30px', textAlign: 'center', fontSize: '13px', color: '#888' }}>
        <p>{footerTexto}</p>
      </footer>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(authUser) => {
          localStorage.setItem('aguitours_last_active', Date.now().toString());
          if (authUser) {
            setUser(authUser);
            cargarPerfil(authUser);
          }
        }}
      />
    </div>
  );
}

