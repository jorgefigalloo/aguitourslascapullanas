// Categorías de Permisos Granulares por Módulo (RBAC Matrix)
export const CATEGORIAS_PERMISOS = [
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
    categoria: '💵 Módulo Caja, Tesorería & Recaudaciones (Libro Diario)',
    items: [
      { id: 'caja_ver', label: 'Ver módulo de caja, totales e historial de cobros' },
      { id: 'caja_listar', label: 'Listar transacciones por fecha, mes y paquete' },
      { id: 'caja_cobrar', label: 'Registrar nuevos cobros de cuotas y recibos' },
      { id: 'caja_editar', label: 'Editar montos y métodos de pago registrados' },
      { id: 'caja_anular', label: 'Anular cobros extornando fondos (Auditoría de Anulación)' },
      { id: 'caja_exportar', label: 'Exportar libro diario de caja a PDF / Excel' }
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

export const TODOS_LOS_PERMISOS = CATEGORIAS_PERMISOS.flatMap(cat => cat.items.map(item => item.id));
