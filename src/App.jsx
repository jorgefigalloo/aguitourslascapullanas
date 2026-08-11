import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { FlightIntro3D } from './components/FlightIntro3D';
import { PaquetesGrupales } from './components/PaquetesGrupales';
import { DestinosSection } from './components/DestinosSection';
import { QuienesSomosSection } from './components/QuienesSomosSection';
import { ContactoSection } from './components/ContactoSection';
import { AuthModal } from './components/AuthModal';
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
    if (path.includes('/grupales')) return 'grupales';
    if (path.includes('/destinos')) return 'destinos';
    if (path.includes('/nosotros')) return 'nosotros';
    if (path.includes('/contacto')) return 'contacto';
    return 'inicio';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [footerTexto, setFooterTexto] = useState('© 2026 Agencia de Viajes "Aguitours Las Capullanas". Todos los derechos reservados.');

  const navigateToView = (view) => {
    setActiveView(view);
    let targetPath = '/';
    if (view === 'admin') targetPath = '/admin';
    else if (view === 'mi-perfil') targetPath = '/cliente';
    else if (view === 'grupales') targetPath = '/grupales';
    else if (view === 'destinos') targetPath = '/destinos';
    else if (view === 'nosotros') targetPath = '/nosotros';
    else if (view === 'contacto') targetPath = '/contacto';

    window.history.pushState(null, '', targetPath);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigateToView('inicio');
  };

  // Hook de inactividad: Cierra sesión tras 15 minutos sin interacción
  useInactivityTimeout(user, handleLogout, 15);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) cargarPerfil(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarPerfil(session.user);
      } else {
        setProfile(null);
      }
    });

    cargarFooterCMS();

    return () => subscription.unsubscribe();
  }, []);

  const cargarPerfil = async (authUser) => {
    try {
      const { data } = await supabase.from('perfiles').select('*').eq('id', authUser.id).single();
      
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
    } catch (e) { console.log(e); }
  };

  const cargarFooterCMS = async () => {
    try {
      const { data } = await supabase.from('cms_contenido').select('*').eq('clave_seccion', 'footer_texto').single();
      if (data && data.titulo) setFooterTexto(data.titulo);
    } catch (e) { console.log(e); }
  };

  // Si el usuario está en el Panel Administrativo
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
        setActiveView={navigateToView}
        user={user}
        profile={profile}
        onLogout={handleLogout}
        onProfileUpdated={() => user && cargarPerfil(user)}
      />

      <main style={{ flex: 1 }}>
        {activeView === 'inicio' && (
          <>
            <Hero3D 
              onExplorarGrupales={() => navigateToView('grupales')}
              onExplorarDestinos={() => navigateToView('destinos')}
            />
            <PaquetesGrupales user={user} profile={profile} onOpenAuth={() => setAuthModalOpen(true)} />
            <DestinosSection user={user} onOpenAuth={() => setAuthModalOpen(true)} />
            <QuienesSomosSection />
            <ContactoSection />
          </>
        )}

        {activeView === 'grupales' && (
          <div style={{ paddingTop: '80px' }}>
            <PaquetesGrupales user={user} profile={profile} onOpenAuth={() => setAuthModalOpen(true)} />
          </div>
        )}

        {activeView === 'destinos' && (
          <div style={{ paddingTop: '80px' }}>
            <DestinosSection user={user} onOpenAuth={() => setAuthModalOpen(true)} />
          </div>
        )}

        {activeView === 'nosotros' && (
          <div style={{ paddingTop: '80px' }}>
            <QuienesSomosSection />
          </div>
        )}

        {activeView === 'contacto' && (
          <div style={{ paddingTop: '80px' }}>
            <ContactoSection />
          </div>
        )}

        {activeView === 'mi-perfil' && user && (
          <ClientPortal user={user} profile={profile} />
        )}
      </main>

      {/* Footer dinámico del CMS */}
      <footer style={{ background: '#040b12', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '30px', textAlign: 'center', fontSize: '13px', color: '#888' }}>
        <p>{footerTexto}</p>
      </footer>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) cargarPerfil(session.user);
          });
        }}
      />
    </div>
  );
}
