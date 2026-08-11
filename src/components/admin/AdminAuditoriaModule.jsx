import React from 'react';
import { Database, Clock, Activity } from 'lucide-react';

export function AdminAuditoriaModule({ auditorias = [] }) {
  return (
    <div className="bg-[#0d2538] border border-white/15 p-8 rounded-3xl shadow-xl">
      <h3 className="font-headline text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Database size={26} className="text-[#1995ad]" /> Registros de Auditoría Automática (Triggers Supabase)
      </h3>
      <p className="text-xs text-gray-300 mb-6">
        Historial inmutable de operaciones (INSERT, UPDATE, DELETE) registrado en tiempo real en la base de datos
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/15">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-[#071521] text-xs uppercase text-gray-300 border-b border-white/15">
            <tr>
              <th className="p-4">Fecha / Hora</th>
              <th className="p-4">Tabla Afectada</th>
              <th className="p-4">Operación</th>
              <th className="p-4">ID Usuario</th>
              <th className="p-4">Datos Registrados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 font-mono text-xs">
            {auditorias.map(a => (
              <tr key={a.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#ffb703]" />
                  {new Date(a.fecha).toLocaleString()}
                </td>
                <td className="p-4 font-bold text-[#1995ad]">{a.tabla_afectada}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    a.operacion === 'INSERT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    a.operacion === 'UPDATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {a.operacion}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{a.usuario_id ? a.usuario_id.slice(0, 8) + '...' : 'Sistema / Anon'}</td>
                <td className="p-4 max-w-xs truncate text-gray-400">
                  {JSON.stringify(a.datos_nuevos || a.datos_anteriores || {})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
