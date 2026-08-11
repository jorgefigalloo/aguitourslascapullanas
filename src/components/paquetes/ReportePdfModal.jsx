import React from 'react';
import { X, Printer, Download, MapPin, Calendar, Compass, ShieldCheck, MessageCircle, FileText } from 'lucide-react';

export function ReportePdfModal({ paquete, isOpen, onClose }) {
  if (!isOpen || !paquete) return null;

  let itObj = paquete.itinerario;
  if (typeof itObj === 'string') {
    try { itObj = JSON.parse(itObj); } catch(e) { itObj = {}; }
  }

  const diasArray = Array.isArray(itObj) 
    ? itObj 
    : (Array.isArray(itObj?.dias) ? itObj.dias : []);

  const whatsappLink = (typeof itObj === 'object' && itObj?.whatsapp_url) || 'https://chat.whatsapp.com/ExclusivoAguitoursCapullanas';
  const puntoPartidaText = (typeof itObj === 'object' && itObj?.punto_partida) || 'Plaza de Armas / Terminal Aéreo - 06:00 AM (Presentarse 30 minutos antes con DNI/Pasaporte)';
  const recomendacionesText = (typeof itObj === 'object' && itObj?.recomendaciones) || 'Ropa abrigadora, Bloqueador solar, Zapatillas de trekking, DNI o Pasaporte original';

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #reporte-print-area, #reporte-print-area * {
            visibility: visible;
          }
          #reporte-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #1b1c19 !important;
            padding: 20px !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Actions Bar (No Print) */}
        <div className="bg-[#040d16] p-4 border-b border-white/10 flex justify-between items-center no-print">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FileText size={18} className="text-[#ffb703]" /> Reporte PDF de Itinerario & Ficha de Viaje
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintPdf}
              className="btn-gold-3d text-xs py-2 px-4 flex items-center gap-2 font-bold cursor-pointer"
            >
              <Printer size={16} /> Descargar / Imprimir PDF
            </button>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white bg-white/10 rounded-full p-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="reporte-print-area" className="p-8 overflow-y-auto bg-white text-gray-900 rounded-b-3xl">
          
          {/* Header del Reporte */}
          <div className="flex justify-between items-center border-b-2 border-[#1995ad] pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#001e40] uppercase tracking-wide">
                Aguitours Las Capullanas
              </h1>
              <p className="text-xs text-gray-500 font-semibold">
                Agencia de Viajes & Turismo Grupal | Registro Oficial MINCETUR
              </p>
              <p className="text-xs text-[#1995ad] font-bold">
                contacto@aguitourslascapullanas.com | +51 987 654 321
              </p>
            </div>

            <div className="text-right">
              <span className="bg-[#001e40] text-[#ffb703] font-extrabold text-xs px-3 py-1.5 rounded-full uppercase">
                Ficha Oficial de Itinerario
              </span>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                Ref: CAP-{paquete.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Título & Datos Principales */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
            <span className="text-[#1995ad] font-bold text-xs uppercase tracking-wider block mb-1">
              📍 {paquete.destino}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{paquete.titulo}</h2>
            <p className="text-sm text-gray-600 mb-4">{paquete.descripcion}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-white p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 font-semibold block">Fecha de Salida:</span>
                <strong className="text-gray-800">{paquete.fecha_salida}</strong>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block">Fecha de Retorno:</span>
                <strong className="text-gray-800">{paquete.fecha_retorno}</strong>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block">Inversión por Persona:</span>
                <strong className="text-[#001e40] font-bold">S/ {parseFloat(paquete.precio_persona).toFixed(2)}</strong>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block">Estado del Grupo:</span>
                <strong className="text-emerald-600 font-bold uppercase">{paquete.estado}</strong>
              </div>
            </div>
          </div>

          {/* Punto de Partida & Recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-[#001e40] uppercase mb-2 flex items-center gap-1.5">
                <MapPin size={16} className="text-[#1995ad]" /> Punto de Partida & Concentración
              </h3>
              <p className="text-xs text-gray-700 font-medium">
                📍 {puntoPartidaText}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-amber-900 uppercase mb-2 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-amber-600" /> Qué Llevar & Recomendaciones
              </h3>
              <p className="text-xs text-gray-700 font-medium">
                🎒 {recomendacionesText}
              </p>
            </div>
          </div>

          {/* Itinerario Día por Día */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#001e40] border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <Compass size={18} className="text-[#1995ad]" /> Itinerario Detallado del Viaje
            </h3>

            <div className="space-y-3">
              {diasArray.length > 0 ? (
                diasArray.map((dia, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <span className="bg-[#1995ad] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                      {dia.dia || `Día ${idx + 1}`}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1 mb-1">
                      {dia.titulo || dia.actividad || `Recorrido y Actividades del Día ${idx + 1}`}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {dia.detalle || dia.descripcion || 'Traslados privados, guiado en español y asistencia permanente.'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-xs text-gray-700">
                  <p className="font-semibold text-gray-900 mb-1">Programa General del Paquete Grupal:</p>
                  <p>{paquete.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer & Grupo de WhatsApp */}
          <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <div>
              <p>© 2026 Agencia de Viajes Aguitours Las Capullanas. Todos los derechos reservados.</p>
            </div>

            <div className="no-print">
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <MessageCircle size={14} /> Grupo Oficial WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
