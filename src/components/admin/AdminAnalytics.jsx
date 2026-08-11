import React from 'react';
import { Package, Users, DollarSign, Activity, TrendingUp, BarChart3 } from 'lucide-react';

export function AdminAnalytics({ paquetes = [], usuarios = [], auditorias = [] }) {
  const totalPaquetes = paquetes.length;
  const totalCupos = paquetes.reduce((acc, p) => acc + (p.cupo_maximo || 0), 0);
  const totalInscritos = paquetes.reduce((acc, p) => acc + ((p.cupo_maximo || 0) - (p.cupo_disponible || 0)), 0);
  const estimacionIngresos = paquetes.reduce((acc, p) => {
    const inscritos = (p.cupo_maximo || 0) - (p.cupo_disponible || 0);
    return acc + (inscritos * (p.precio_persona || 0));
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Tarjetas Kpis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d2538] border border-white/10 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="bg-[#1995ad]/20 p-3 rounded-xl color-[#1995ad] text-[#1995ad]">
            <Package size={28} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase">Paquetes Publicados</div>
            <div className="text-2xl font-black text-white">{totalPaquetes}</div>
          </div>
        </div>

        <div className="bg-[#0d2538] border border-white/10 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="bg-[#ffb703]/20 p-3 rounded-xl text-[#ffb703]">
            <Users size={28} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase">Pasajeros Confirmados</div>
            <div className="text-2xl font-black text-white">{totalInscritos} / {totalCupos}</div>
          </div>
        </div>

        <div className="bg-[#0d2538] border border-white/10 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400">
            <DollarSign size={28} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase">Ventas Estimadas</div>
            <div className="text-2xl font-black text-white">S/ {estimacionIngresos.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-[#0d2538] border border-white/10 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400">
            <Activity size={28} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase">Usuarios Registrados</div>
            <div className="text-2xl font-black text-white">{usuarios.length}</div>
          </div>
        </div>
      </div>

      {/* Resumen de Ocupación por Paquete */}
      <div className="bg-[#0d2538] border border-white/10 p-6 rounded-3xl shadow-xl">
        <h4 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-[#1995ad]" /> Ocupación de Cupos por Paquete
        </h4>

        <div className="space-y-4">
          {paquetes.map(pkg => {
            const inscritos = pkg.cupo_maximo - pkg.cupo_disponible;
            const porcentaje = Math.round((inscritos / pkg.cupo_maximo) * 100);

            return (
              <div key={pkg.id} className="bg-[#071521] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between text-xs font-bold text-white mb-1">
                  <span>{pkg.titulo} ({pkg.destino})</span>
                  <span className="text-[#ffb703]">{inscritos} / {pkg.cupo_maximo} cupos ({porcentaje}%)</span>
                </div>
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-[#1995ad] to-[#ffb703] rounded-full" style={{ width: `${porcentaje}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
