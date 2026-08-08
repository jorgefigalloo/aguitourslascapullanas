import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ClientPortal({ user, profile }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      cargarMisViajes();
    }
  }, [user]);

  const cargarMisViajes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inscripciones_grupo')
        .select('*, paquetes_grupales(*)')
        .eq('usuario_id', user.id);

      if (data) {
        setInscripciones(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '110px auto 60px auto', padding: '0 20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0d5c75, #1995ad)', padding: '30px', borderRadius: '20px',
        display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 15px 35px rgba(13,92,117,0.3)', marginBottom: '35px'
      }}>
        <div style={{ width: '70px', height: '70px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCheck size={36} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff' }}>{profile?.nombre_completo || 'Viajero'}</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: 0 }}>{user?.email} | Pasajero Registrado</p>
        </div>
      </div>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Briefcase size={22} color="#1995ad" /> Mis Grupos de Viaje Inscritos
      </h3>

      {loading ? (
        <p style={{ color: '#aaa' }}>Cargando tus viajes...</p>
      ) : inscripciones.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#ccc', marginBottom: '15px' }}>Aún no estás inscrito en ningún paquete grupal.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {inscripciones.map(item => {
            const pkg = item.paquetes_grupales;
            if (!pkg) return null;

            return (
              <div key={item.id} style={{
                background: '#0d2538', borderRadius: '14px', padding: '20px', borderLeft: '5px solid #1995ad',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
              }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>{pkg.titulo}</h4>
                  <p style={{ fontSize: '13px', color: '#aaa', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span><MapPin size={14} color="#1995ad" /> {pkg.destino}</span>
                    <span><Calendar size={14} color="#1995ad" /> {pkg.fecha_salida} al {pkg.fecha_retorno}</span>
                  </p>
                </div>

                <span style={{ background: 'rgba(46,125,50,0.2)', border: '1px solid #2e7d32', color: '#a5d6a7', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> {item.estado.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
