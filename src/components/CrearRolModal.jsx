import React, { useState } from 'react';
import { X, ShieldPlus, Key, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Categorías de Permisos Granulares por Módulo (Ver, Listar, Crear, Editar, Actualizar, Bloquear, Eliminar)
const CATEGORIAS_PERMISOS = [
  {
    categoria: '🛡️ Módulo Usuarios del Sistema & Staff (RBAC)',
    items: [
      { id: 'usuarios_ver', label: 'Ver detalle de administradores y staff' },
      { id: 'usuarios_listar', label: 'Listar usuarios del sistema' },
      { id: 'usuarios_crear', label: 'Registrar nuevos usuarios / staff' },
      { id: 'usuarios_editar', label: 'Editar datos personales y contraseñas' },
      { id: 'usuarios_actualizar', label: 'Actualizar roles y matriz de permisos' },
      { id: 'usuarios_bloquear', label: 'Bloquear / Inactivar cuentas de staff' },
      { id: 'usuarios_eliminar', label: 'Eliminar usuarios del sistema' }
    ]
  },
  {
    categoria: '🧑‍💼 Módulo Clientes & Pasajeros VIP',
    items: [
      { id: 'clientes_ver', label: 'Ver expediente de pasajero/cliente' },
      { id: 'clientes_listar', label: 'Listar directorio de clientes registrados' },
      { id: 'clientes_crear', label: 'Registrar nuevo cliente manualmente' },
      { id: 'clientes_editar', label: 'Editar perfil y documento de cliente' },
      { id: 'clientes_actualizar', label: 'Actualizar estado de fidelización VIP' },
      { id: 'clientes_bloquear', label: 'Bloquear / Suspender cuenta de cliente' },
      { id: 'clientes_eliminar', label: 'Eliminar registro de cliente' }
    ]
  },
  {
    categoria: '✈️ Módulo Paquetes Turísticos Grupales',
    items: [
      { id: 'paquetes_ver', label: 'Ver ficha y itinerarios de paquetes' },
      { id: 'paquetes_listar', label: 'Listar catálogo de paquetes grupales' },
      { id: 'paquetes_crear', label: 'Publicar nuevos paquetes turísticos' },
      { id: 'paquetes_editar', label: 'Editar precios, cupos e itinerarios' },
      { id: 'paquetes_actualizar', label: 'Actualizar estado (abierto/completo/cerrado)' },
      { id: 'paquetes_bloquear', label: 'Desactivar / Ocultar paquete del catálogo' },
      { id: 'paquetes_eliminar', label: 'Eliminar paquetes turísticos' }
    ]
  },
  {
    categoria: '🌎 Módulo Destinos Turísticos',
    items: [
      { id: 'destinos_ver', label: 'Ver detalles de destino' },
      { id: 'destinos_listar', label: 'Listar catálogo de destinos' },
      { id: 'destinos_crear', label: 'Registrar nuevos destinos turísticos' },
      { id: 'destinos_editar', label: 'Editar información e imágenes' },
      { id: 'destinos_actualizar', label: 'Actualizar categoría y badges' },
      { id: 'destinos_bloquear', label: 'Desactivar / Inactivar destino' },
      { id: 'destinos_eliminar', label: 'Eliminar destinos turísticos' }
    ]
  },
  {
    categoria: '📝 Módulo CMS & Contenidos Web',
    items: [
      { id: 'cms_ver', label: 'Ver configuración de secciones web' },
      { id: 'cms_listar', label: 'Listar secciones y banners del CMS' },
      { id: 'cms_crear', label: 'Crear nuevas secciones CMS' },
      { id: 'cms_editar', label: 'Editar textos, títulos y subtítulos' },
      { id: 'cms_actualizar', label: 'Actualizar imágenes de portada 3D' },
      { id: 'cms_bloquear', label: 'Ocultar secciones en la web pública' },
      { id: 'cms_eliminar', label: 'Eliminar entradas del CMS' }
    ]
  },
  {
    categoria: '💬 Módulo Solicitudes & Cotizaciones a Medida',
    items: [
      { id: 'cotizaciones_ver', label: 'Ver detalles de cotizaciones' },
      { id: 'cotizaciones_listar', label: 'Listar solicitudes de cotización' },
      { id: 'cotizaciones_crear', label: 'Registrar solicitudes a medida' },
      { id: 'cotizaciones_editar', label: 'Editar itinerarios y presupuestos' },
      { id: 'cotizaciones_actualizar', label: 'Convertir cotización a paquete comercial' },
      { id: 'cotizaciones_bloquear', label: 'Rechazar / Archivar cotizaciones' },
      { id: 'cotizaciones_eliminar', label: 'Eliminar solicitudes de cotización' }
    ]
  },
  {
    categoria: '💳 Módulo Pagos e Inscripciones de Pasajeros',
    items: [
      { id: 'pagos_ver', label: 'Ver comprobantes e inscripciones' },
      { id: 'pagos_listar', label: 'Listar pasajeros e inscritos por viaje' },
      { id: 'pagos_crear', label: 'Registrar nueva inscripción / abono' },
      { id: 'pagos_editar', label: 'Editar montos y métodos de pago' },
      { id: 'pagos_actualizar', label: 'Aprobar o rechazar comprobantes de pago' },
      { id: 'pagos_bloquear', label: 'Cancelar inscripción de cliente' },
      { id: 'pagos_eliminar', label: 'Eliminar registros de pago' }
    ]
  },
  {
    categoria: '📊 Módulo Analytics, Reportes & Auditoría BD',
    items: [
      { id: 'analytics_ver', label: 'Ver métricas, ocupación e ingresos' },
      { id: 'analytics_exportar', label: 'Exportar reportes ejecutivos PDF / Excel' },
      { id: 'auditoria_ver', label: 'Ver logs inmutables de auditoría' },
      { id: 'auditoria_listar', label: 'Filtrar cambios por tabla y usuario' },
      { id: 'auditoria_exportar', label: 'Exportar bitácora de auditoría' }
    ]
  }
];

const TODOS_LOS_PERMISOS = CATEGORIAS_PERMISOS.flatMap(c => c.items.map(i => i.id));

export function CrearRolModal({ isOpen, onClose, onRolCreado }) {
  const [idRol, setIdRol] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState(['usuarios_ver', 'paquetes_ver']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const togglePermiso = (permisoId) => {
    if (permisosSeleccionados.includes(permisoId)) {
      setPermisosSeleccionados(permisosSeleccionados.filter(p => p !== permisoId));
    } else {
      setPermisosSeleccionados([...permisosSeleccionados, permisoId]);
    }
  };

  const handleMarcarTodos = () => {
    setPermisosSeleccionados(TODOS_LOS_PERMISOS);
  };

  const handleDesmarcarTodos = () => {
    setPermisosSeleccionados([]);
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);

    const slugId = idRol.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    try {
      const { error } = await supabase.from('roles_sistema').insert([{
        id: slugId,
        nombre: nombre,
        descripcion: descripcion,
        permisos: permisosSeleccionados
      }]);

      if (error) throw error;
      alert(`¡Nuevo rol "${nombre}" creado exitosamente!`);
      onRolCreado();
      onClose();
      setIdRol('');
      setNombre('');
      setDescripcion('');
      setPermisosSeleccionados(['usuarios_ver', 'paquetes_ver']);
    } catch (err) {
      alert('Error al crear rol: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071521]/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d2538] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1995ad] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={18} />
          </button>
          <h3 className="font-headline text-xl font-bold m-0 flex items-center justify-center gap-2">
            <ShieldPlus size={20} /> Crear Nuevo Rol de Personal (RBAC)
          </h3>
          <p className="text-xs opacity-90 m-0 mt-1">Define un nuevo rol personalizado con matriz granular de permisos</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleCrear} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Nombre del Rol</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={e => {
                  setNombre(e.target.value);
                  setIdRol(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }} 
                required 
                placeholder="ej: Supervisor de Viajes / Contable"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-bold block mb-1">Identificador Slug (ID)</label>
              <input 
                type="text" 
                value={idRol} 
                onChange={e => setIdRol(e.target.value)} 
                required 
                placeholder="ej: supervisor_viajes"
                className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm font-mono focus:border-[#1995ad] focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-300 font-bold block mb-1">Descripción del Rol</label>
            <textarea 
              rows={2}
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              required 
              placeholder="Descripción de responsabilidades del rol..."
              className="w-full bg-[#071521] border border-white/15 rounded-xl p-3 text-white text-sm focus:border-[#1995ad] focus:outline-none" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-[#ffb703] font-bold">
                Permisos Granulares ({permisosSeleccionados.length}/{TODOS_LOS_PERMISOS.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleMarcarTodos}
                  className="text-[11px] text-[#1995ad] hover:underline cursor-pointer"
                >
                  Marcar Todo
                </button>
                <span className="text-gray-500">|</span>
                <button
                  type="button"
                  onClick={handleDesmarcarTodos}
                  className="text-[11px] text-gray-400 hover:underline cursor-pointer"
                >
                  Desmarcar Todo
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {CATEGORIAS_PERMISOS.map((cat, idxCat) => (
                <div key={idxCat} className="bg-[#071521] border border-white/10 p-3 rounded-2xl">
                  <h4 className="text-xs font-bold text-white mb-2 pb-1 border-b border-white/10">
                    {cat.categoria}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cat.items.map(item => {
                      const checked = permisosSeleccionados.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => togglePermiso(item.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                            checked ? 'bg-[#1995ad]/20 border-[#1995ad] text-white' : 'bg-[#0d2538] border-white/10 text-gray-400'
                          }`}
                        >
                          <div className="shrink-0 text-[#ffb703]">
                            {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <div className="text-xs">
                            <span className="font-bold">{item.label}</span>{' '}
                            <span className="font-mono text-[10px] text-gray-400">({item.id})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold-3d justify-center py-3.5 mt-2 font-bold text-sm">
            <ShieldPlus size={18} /> {loading ? 'Creando...' : 'Crear Rol en el Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
