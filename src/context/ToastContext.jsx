import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', title = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type, title };
    
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Máximo 5 notificaciones en pantalla

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: (msg, title = '¡Operación Exitosa!') => addToast(msg, 'success', title),
    error: (msg, title = 'Ocurrió un Problema') => addToast(msg, 'error', title),
    info: (msg, title = 'Notificación del Sistema') => addToast(msg, 'info', title),
    warning: (msg, title = 'Advertencia') => addToast(msg, 'warning', title),
    show: addToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed top-5 right-5 z-[100000] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
          {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            const isError = t.type === 'error';
            const isWarning = t.type === 'warning';

            return (
              <div
                key={t.id}
                className={`pointer-events-auto rounded-2xl p-4 shadow-2xl backdrop-blur-md border transition-all duration-300 transform translate-x-0 animate-in fade-in slide-in-from-top-4 flex items-start gap-3 relative overflow-hidden ${
                  isSuccess
                    ? 'bg-[#0d2538]/95 border-emerald-500/50 text-white shadow-emerald-950/40'
                    : isError
                    ? 'bg-[#18080a]/95 border-red-500/50 text-white shadow-red-950/40'
                    : isWarning
                    ? 'bg-[#1c1404]/95 border-amber-500/50 text-white shadow-amber-950/40'
                    : 'bg-[#071521]/95 border-[#1995ad]/50 text-white shadow-cyan-950/40'
                }`}
              >
                {/* Accent Indicator Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isSuccess
                      ? 'bg-emerald-400'
                      : isError
                      ? 'bg-red-500'
                      : isWarning
                      ? 'bg-amber-400'
                      : 'bg-[#1995ad]'
                  }`}
                />

                {/* Icon */}
                <div className="shrink-0 mt-0.5 ml-1">
                  {isSuccess && <CheckCircle2 className="text-emerald-400 w-5 h-5" />}
                  {isError && <XCircle className="text-red-400 w-5 h-5" />}
                  {isWarning && <AlertTriangle className="text-amber-400 w-5 h-5" />}
                  {!isSuccess && !isError && !isWarning && <Info className="text-[#1995ad] w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden pr-4">
                  {t.title && (
                    <div className="font-headline font-bold text-xs uppercase tracking-wider mb-0.5 text-white/90">
                      {t.title}
                    </div>
                  )}
                  <div className="text-xs text-gray-200 leading-snug break-words">
                    {t.message}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg p-1 shrink-0 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback seguro si se llama fuera de un ToastProvider
    return {
      success: (msg) => console.log('Toast Success:', msg),
      error: (msg) => console.error('Toast Error:', msg),
      info: (msg) => console.log('Toast Info:', msg),
      warning: (msg) => console.warn('Toast Warning:', msg),
      show: (msg) => console.log('Toast Show:', msg)
    };
  }
  return context;
}
