import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, UserPlus, Calendar, MapPin, CheckCircle2, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export function UnirmePaqueteModal({ paquete, isOpen, onClose, user, profile, onInscripcionExitosa }) {
  const toast = useToast();
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [acompanantes, setAcompanantes] = useState([]);
  const [cuposLibresReales, setCuposLibresReales] = useState(paquete?.cupo_disponible ?? 10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paquete) {
      setCantidadPersonas(1);
      setAcompanantes([]);
      cargarCuposReales();
    }
  }, [isOpen, paquete]);

  const cargarCuposReales = async () => {
    try {
      const { data } = await supabase
        .from('inscripciones_grupo')
        .select('cantidad_personas')
        .eq('paquete_id', paquete.id)
        .in('estado', ['confirmado', 'pendiente', 'pendiente_confirmacion_tarifa']);

      const totalInscritos = data ? data.reduce((sum, item) => sum + (item.cantidad_personas || 1), 0) : 0;
      const libres = Math.max(0, (paquete.cupo_maximo || 10) - totalInscritos);
      setCuposLibresReales(libres);

      if (paquete.cupo_disponible !== libres) {
        await supabase
          .from('paquetes_grupales')
          .update({ cupo_disponible: libres })
          .eq('id', paquete.id);
      }
    } catch (e) {
      console.error('Error al verificar cupos libres reales:', e);
    }
  };

  const handleCantidadChange = (num) => {
    const total = parseInt(num, 10) || 1;
    const maxDisponibles = cuposLibresReales || 1;
    const finalNum = Math.min(Math.max(1, total), maxDisponibles);

    setCantidadPersonas(finalNum);

    // Ajustar array de acompañantes (para personas 2..N)
    const numAcompanantes = finalNum - 1;
    if (numAcompanantes <= 0) {
      setAcompanantes([]);
    } else {
      const updated = [];
      for (let i = 0; i < numAcompanantes; i++) {
        updated.push(acompanantes[i] || { nombre_completo: '', documento_identidad: '', parentesco_nota: '' });
      }
      setAcompanantes(updated);
    }
  };

  const handleAcompananteChange = (index, field, value) => {
    const updated = [...acompanantes];
    updated[index] = { ...updated[index], [field]: value };
    setAcompanantes(updated);
  };

  if (!isOpen || !paquete) return null;

  const precioUnitario = parseFloat(paquete.precio_persona || 0);
  const precioTotalCalculado = precioUnitario * cantidadPersonas;
  const pctInicial = parseFloat(paquete.porcentaje_cuota_inicial || 50);
  const numCuotasConfigured = parseInt(paquete.numero_cuotas || 2);
  const diasPlazoInicial = parseInt(paquete.dias_limite_cuota_inicial || 5);

  const cuotaInicialCalculada = Math.round((precioTotalCalculado * (pctInicial / 100)) * 100) / 100;
  const saldoRestanteCalculado = Math.round((precioTotalCalculado - cuotaInicialCalculada) * 100) / 100;

  const handleConfirmarInscripcion = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Debes iniciar sesión para unirte al viaje.');
      return;
    }

    // Validar datos de acompañantes si hay más de 1 persona
    for (let i = 0; i < acompanantes.length; i++) {
      if (!acompanantes[i].nombre_completo.trim()) {
        toast.warning(`Ingresa el nombre completo del acompañante #${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Crear Registro en inscripciones_grupo
      const { data: inscData, error: insErr } = await supabase
        .from('inscripciones_grupo')
        .insert([{
          usuario_id: user.id,
          paquete_id: paquete.id,
          cantidad_personas: cantidadPersonas,
          precio_total: precioTotalCalculado,
          estado: 'confirmado',
          notas: cantidadPersonas > 1 ? `Titular con ${cantidadPersonas - 1} acompañante(s)` : 'Titular solo'
        }])
        .select()
        .single();

      if (insErr) throw insErr;

      const inscripcionId = inscData.id;

      // 2. Insertar Acompañantes en acompanantes_inscripcion (si aplica)
      if (acompanantes.length > 0) {
        const payloadAcompanantes = acompanantes.map(ac => ({
          inscripcion_id: inscripcionId,
          nombre_completo: ac.nombre_completo.trim(),
          documento_identidad: ac.documento_identidad.trim() || null,
          parentesco_nota: ac.parentesco_nota.trim() || 'Acompañante'
        }));

        const { error: acErr } = await supabase
          .from('acompanantes_inscripcion')
          .insert(payloadAcompanantes);

        if (acErr) console.warn('Error al guardar acompañantes:', acErr);
      }

      // 3. Crear Cronograma Dinámico de Cuotas según configuración del paquete
      const fechaHoy = new Date();
      const fechaCalculadaRelativa = new Date(fechaHoy.setDate(fechaHoy.getDate() + diasPlazoInicial)).toISOString().split('T')[0];
      const fechaVencCuota1 = paquete.fecha_limite_cuota_inicial || fechaCalculadaRelativa;
      
      const payloadCuotas = [];

      if (numCuotasConfigured === 1) {
        payloadCuotas.push({
          inscripcion_id: inscripcionId,
          numero_cuota: 1,
          concepto: 'Cuota Única (100%)',
          monto: precioTotalCalculado,
          fecha_vencimiento: fechaVencCuota1,
          estado: 'pendiente'
        });
      } else {
        // Cuota 1: Reserva / Inicial
        payloadCuotas.push({
          inscripcion_id: inscripcionId,
          numero_cuota: 1,
          concepto: `Cuota Inicial / Reserva (${pctInicial}%)`,
          monto: cuotaInicialCalculada,
          fecha_vencimiento: fechaVencCuota1,
          estado: 'pendiente'
        });

        // Restantes cuotas
        const numRestantes = numCuotasConfigured - 1;
        const montoPorRestante = Math.round((saldoRestanteCalculado / numRestantes) * 100) / 100;

        for (let i = 1; i <= numRestantes; i++) {
          const esUltima = i === numRestantes;
          const conceptoCuota = esUltima ? `Cuota Final (${100 - pctInicial}%)` : `Cuota #${i + 1}`;
          payloadCuotas.push({
            inscripcion_id: inscripcionId,
            numero_cuota: i + 1,
            concepto: conceptoCuota,
            monto: montoPorRestante,
            fecha_vencimiento: paquete.fecha_salida || null,
            estado: 'pendiente'
          });
        }
      }

      const { error: cuotaErr } = await supabase
        .from('cuotas_inscripcion')
        .insert(payloadCuotas);

      if (cuotaErr) console.warn('Error al crear cronograma de cuotas:', cuotaErr);

      // 4. Actualizar cupo_disponible en paquetes_grupales
      const nuevoDisponible = Math.max(0, (paquete.cupo_disponible || 1) - cantidadPersonas);
      await supabase
        .from('paquetes_grupales')
        .update({ cupo_disponible: nuevoDisponible })
        .eq('id', paquete.id);

      toast.success(
        `¡Reserva exitosa para ${cantidadPersonas} persona(s)! Tu cronograma de cuotas ha sido generado en tu Panel de Cliente.`,
        'Inscripción Registrada 🎉'
      );

      if (onInscripcionExitosa) onInscripcionExitosa();
      onClose();
    } catch (err) {
      toast.error('Error al realizar inscripción: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto max-h-[90vh] flex flex-col">

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0d2538] to-[#1995ad] p-6 text-white relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <span className="bg-[#1995ad]/20 text-[#1995ad] p-2.5 rounded-2xl border border-[#1995ad]/40">
              <UserPlus size={24} />
            </span>
            <div>
              <h3 className="font-headline text-lg font-bold text-white m-0">
                Confirmar Reserva y Datos de Pasajeros
              </h3>
              <p className="text-xs text-cyan-200 m-0 mt-0.5">
                {paquete.titulo} — {paquete.destino}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmarInscripcion} className="p-6 flex flex-col gap-5 overflow-y-auto">

          {/* Resumen del Viaje */}
          <div className="bg-[#071521] border border-white/10 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs text-gray-300">
            <div>
              <span className="text-gray-400 block">Fechas del Viaje:</span>
              <strong className="text-white flex items-center gap-1 mt-0.5">
                <Calendar size={14} className="text-[#ffb703]" /> {paquete.fecha_salida} al {paquete.fecha_retorno}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block">Precio por Persona:</span>
              <strong className="text-[#ffb703] text-sm">S/ {precioUnitario.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-gray-400 block">Cupos Libres:</span>
              <strong className="text-emerald-400 text-sm">{cuposLibresReales} disponibles</strong>
            </div>
          </div>

          {/* Selección de cantidad de personas */}
          <div>
            <label className="text-xs text-white font-bold block mb-1.5 flex items-center gap-1.5">
              <Users size={16} className="text-[#ffb703]" /> ¿Para cuántas personas deseas reservar?
            </label>
            <div className="flex items-center gap-3">
              <select
                value={cantidadPersonas}
                onChange={(e) => handleCantidadChange(e.target.value)}
                className="bg-[#071521] border border-[#1995ad]/50 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-[#1995ad] focus:outline-none cursor-pointer"
              >
                {Array.from({ length: Math.min(cuposLibresReales || 1, 10) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'persona (Titular)' : 'personas'}</option>
                ))}
              </select>
              <span className="text-xs text-gray-300">
                Total del Viaje: <strong className="text-[#ffb703] text-base">S/ {precioTotalCalculado.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Formulario de Acompañantes si cantidad > 1 */}
          {acompanantes.length > 0 && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-4">
              <div className="text-xs text-[#ffb703] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus size={16} /> Datos de los Acompañantes ({acompanantes.length})
              </div>

              {acompanantes.map((ac, idx) => (
                <div key={idx} className="bg-[#071521] p-3.5 rounded-xl border border-white/10 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold text-gray-300">Pasajero #{idx + 2} (Acompañante)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Nombre Completo *"
                        value={ac.nombre_completo}
                        onChange={(e) => handleAcompananteChange(idx, 'nombre_completo', e.target.value)}
                        required
                        className="w-full bg-[#0d2538] border border-white/15 rounded-lg p-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="DNI / Pasaporte / Documento"
                        value={ac.documento_identidad}
                        onChange={(e) => handleAcompananteChange(idx, 'documento_identidad', e.target.value)}
                        className="w-full bg-[#0d2538] border border-white/15 rounded-lg p-2.5 text-white text-xs focus:border-[#1995ad] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Plan de Cuotas Iniciales */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs">
            <strong className="text-amber-300 block mb-1 flex items-center gap-1.5">
              <DollarSign size={16} /> Cronograma de Pago ({numCuotasConfigured} {numCuotasConfigured === 1 ? 'Cuota' : 'Cuotas'}):
            </strong>
            <ul className="text-gray-300 space-y-1 ml-4 list-disc mt-2">
              {numCuotasConfigured === 1 ? (
                <li>
                  <strong>Pago Único (100%):</strong> S/ {precioTotalCalculado.toFixed(2)} (
                  {paquete.fecha_limite_cuota_inicial ? `Vence el ${paquete.fecha_limite_cuota_inicial}` : `Plazo de ${diasPlazoInicial} días para abonar`}
                  ).
                </li>
              ) : (
                <>
                  <li>
                    <strong>Cuota Inicial / Reserva ({pctInicial}%):</strong> S/ {cuotaInicialCalculada.toFixed(2)} (
                    {paquete.fecha_limite_cuota_inicial ? `Vence el ${paquete.fecha_limite_cuota_inicial}` : `Plazo de ${diasPlazoInicial} días hábiles para abonar`}
                    ).
                  </li>
                  <li><strong>Saldo Restante en {numCuotasConfigured - 1} cuota(s):</strong> S/ {saldoRestanteCalculado.toFixed(2)} (Vence el {paquete.fecha_salida || 'fecha de salida'}).</li>
                </>
              )}
            </ul>
            <p className="text-[10px] text-amber-200/80 mt-2">
              * Podrás ver el detalle completo de tu cronograma de cuotas en tu Panel de Cliente.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold-3d justify-center py-3.5 font-bold text-sm flex items-center gap-2 cursor-pointer mt-2"
          >
            <CheckCircle2 size={18} /> {loading ? 'Registrando Reserva...' : `Confirmar Reserva (${cantidadPersonas} Persona(s))`}
          </button>
        </form>

      </div>
    </div>,
    document.body
  );
}
