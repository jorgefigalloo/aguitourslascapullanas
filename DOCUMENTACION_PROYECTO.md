# 📋 DOCUMENTACIÓN DEL PROYECTO: AGUITOURS LAS CAPULLANAS

> **Estado del Proyecto:** Reconstrucción a Web App Dinámica 3D/Cinematic + Módulo de Clientes, Cotizador Personalizado, CMS, RBAC, RLS, Auditoría Inmutable, Recálculo de Tarifas, Ocultar Paquetes, Nómina de Likes y Toast Notifications  
> **Fecha de Actualización:** 13 de Agosto de 2026  
> **Ubicación Local:** `c:\xampp\htdocs\aguitourslascapullanas`  
> **Servidor Dev:** `http://localhost:5173/` (Vite + React 18 + Framer Motion)  
> **Servidor Apache XAMPP:** `http://localhost:8085/aguitourslascapullanas/`  

---

## 1. 📌 Resumen General
**Aguitours Las Capullanas v3.0** es una Web App Dinámica e Inmersiva para Agencia de Viajes y Turismo construida con **React 18, Vite, Framer Motion (Parallax & Depth 3D), Lucide Icons, Supabase (Auth / PostgreSQL / RLS / CMS / Auditoría BD)** y backend PHP seguro.

Toda la información del sitio es **100% editable desde el Dashboard Administrativo**, incluyendo paquetes, itinerarios, destinos, banners CMS, cotizaciones personalizadas, recálculo de tarifas, visibilidad de borradores, nómina de likes y auditoría inmutable de cambios.

---

## 2. 📂 Estructura Modular del Código

```
c:\xampp\htdocs\aguitourslascapullanas\
├── .env                                # Variables de entorno locales (API keys & Config)
├── package.json                        # Configuración de dependencias (Framer Motion, Lucide, Supabase)
├── vite.config.js                      # Configuración del servidor dev y proxy PHP
├── index.html                          # Punto de entrada HTML5
├── database/                           # [SCRIPTS SQL DE SUPABASE]
│   ├── supabase_schema.sql             # Esquema base, RLS y función atómica de inscripción
│   ├── cms_and_rbac_schema.sql         # Tablas del CMS y Roles RBAC
│   ├── fase_seguridad_y_auditoria.sql  # RLS estricto y triggers de auditoría
│   ├── modulo_clientes_y_cotizaciones.sql # Script SQL para favoritos, cotizaciones, RLS y triggers
│   ├── agregar_columna_email_perfiles.sql # Script SQL para columna email en perfiles
│   ├── solucion_definitiva_perfiles_y_trigger.sql # Trigger handle_new_user y sync perfiles
│   ├── actualizar_email_rpc.sql         # RPC admin_actualizar_email_usuario y desvinculación de duplicados
│   ├── script_inscripciones_y_favoritos.sql # Inscripción atómica fn_inscribir_usuario_paquete, toggle favorito y RLS
│   ├── script_auditoria_todas_las_tablas.sql # Triggers automáticos de auditoría para las 10 tablas del sistema
│   ├── script_tarea_13_agosto.sql       # RPC fn_recalcular_tarifa_cerrar_paquete, fn_responder_nueva_tarifa_cliente, estado 'oculto' y RLS
│   └── script_tarea_13_agosto_parte2.sql # [NUEVO] Columna fecha_limite_inscripcion, acompanantes_inscripcion, cuotas_inscripcion, triggers auditoría y RLS
├── php/                                # [BACKEND PHP SEGURO]
│   ├── config/ (env.php, supabase.php, smtp.php)
│   ├── middleware/ (cors.php, rate_limit.php, sanitizer.php)
│   └── api/ (inscribirse_grupo.php)
└── src/                                # [CÓDIGO FUENTE REACT WEB APP]
    ├── context/
    │   └── ToastContext.jsx            # [NUEVO] Sistema Global de Notificaciones Toast (Glassmorphism z-[100000])
    ├── lib/
    │   ├── supabase.js                 # Cliente Supabase principal y cliente tempAuthClient aislado
    │   └── permisos.js                 # [NUEVO] Matriz centralizada de permisos RBAC por categorías
    ├── hooks/
    │   └── useInactivityTimeout.js     # Hook de timeout por inactividad (60 min / 1 hora con visibilidad)
    ├── components/
    │   ├── Navbar.jsx                  # Navegación Glassmorphic 3D con menú hamburguesa celular
    │   ├── Hero3D.jsx                  # Portada 3D Parallax con CTA Cotizar Paquete
    │   ├── PaquetesGrupales.jsx        # Catálogo Bento Grid & Inscripciones en vivo (Filtra borradores ocultos)
    │   ├── DestinosSection.jsx         # Galería Sticky de Scroll Horizontal & "Me Gusta"
    │   ├── ClientPortal.jsx            # Contenedor del Dashboard de Pasajero VIP (Con banner de nueva tarifa)
    │   ├── cliente/
    │   │   ├── ClientMisViajes.jsx
    │   │   ├── ClientFavoritos.jsx
    │   │   ├── ClientSolicitudesCotizacion.jsx
    │   │   ├── ClientPerfilEditar.jsx
    │   │   ├── AlertaNuevaTarifaModal.jsx # [NUEVO] Alerta de recálculo de tarifas para el pasajero (Aceptar/Rechazar)
    │   │   └── VerDetalleClienteModal.jsx # [NUEVO] Expediente de cliente (Reservas & Me Gusta guardados)
    │   ├── destinos/
    │   │   ├── CrearDestinoModal.jsx
    │   │   ├── EditarDestinoModal.jsx
    │   │   └── VerLikesDestinoModal.jsx   # [NUEVO] Nómina de usuarios que dieron Me Gusta por destino
    │   ├── paquetes/
    │   │   ├── DetallePaqueteModal.jsx
    │   │   ├── ReportePdfModal.jsx
    │   │   ├── VerInscritosModal.jsx
    │   │   └── RecalcularTarifaModal.jsx # [NUEVO] Modal Admin para cierre de grupo y recálculo de tarifa por persona
```jsx        # Catálogo Bento Grid & Inscripciones en vivo
    │   ├── DestinosSection.jsx         # Galería Sticky de Scroll Horizontal & "Me Gusta"
    │   ├── ClientPortal.jsx            # Contenedor del Dashboard de Pasajero VIP
    │   ├── AdminDashboard.jsx          # Panel Admin Modularizado
    │   ├── MisDatosModal.jsx           # Modal de datos personales (Portal con React createPortal)
    │   ├── ScrollProgressBar.jsx       # Barra Neón de Scroll Superior
    │   ├── auth/                       # [MÓDULO DE AUTENTICACIÓN]
    │   │   └── AuthModal.jsx           # Login / Registro con resolución de Username y roles RBAC (z-99999)
    │   ├── cliente/                    # [MÓDULOS DEL DASHBOARD DE CLIENTE]
    │   │   ├── ClientMisViajes.jsx     # Itinerarios inscritos, WhatsApp oficial y PDF
    │   │   ├── ClientFavoritos.jsx     # Paquetes y destinos guardados ("Me gusta")
    │   │   ├── ClientSolicitudesCotizacion.jsx # Cotizador a medida e historial
    │   │   └── ClientPerfilEditar.jsx  # Edición de perfil personal y cambio de contraseña
    │   ├── admin/                      # [MÓDULOS DEL DASHBOARD ADMIN]
    │   │   ├── AdminAnalytics.jsx      # Métricas de ocupación e ingresos
    │   │   ├── AdminClientesModule.jsx # Gestión de pasajeros inscritos y cupos (Soporta rol cliente y null)
    │   │   ├── AdminSolicitudesModule.jsx # Gestión y conversión de cotizaciones en paquetes
    │   │   ├── AdminPaquetesModule.jsx # Gestor de paquetes e itinerarios
    │   │   ├── AdminDestinosModule.jsx # Gestor de destinos turísticos
    │   │   ├── AdminCMSModule.jsx      # Editor de textos y portadas del CMS
    │   │   ├── AdminUsuariosModule.jsx # Matriz de roles y usuarios RBAC
    │   │   └── AdminAuditoriaModule.jsx# Visor de logs inmutables de auditoría
    │   ├── destinos/                   # [MODALES DE DESTINOS]
    │   │   ├── CrearDestinoModal.jsx   # Registrar nuevo destino turístico
    │   │   └── EditarDestinoModal.jsx  # Editar y eliminar/desactivar destino
    │   ├── paquetes/                   # [MODALES & GENERADOR DE PDF]
    │   │   ├── CrearPaqueteModal.jsx   # Publicar paquete con grupo de WhatsApp y PDF
    │   │   ├── EditarPaqueteModal.jsx  # Editar paquete e itinerarios
    │   │   └── ReportePdfModal.jsx     # Generador e impresor de Ficha PDF de Itinerario
    │   └── usuarios/                   # [MODALES DE USUARIOS RBAC]
    │       ├── CrearUsuarioModal.jsx   # Alta de usuario con validación de clave y React Portal
    │       └── EditarUsuarioAdminModal.jsx # Edición de rol y reseteo de clave por Admin
    ├── styles/
    │   └── index.css                   # Sistema de diseño global & Glassmorphism
    ├── App.jsx                         # Componente principal de la aplicación
    └── main.jsx                        # Punto de montaje React
```

---

## 3. 🛡️ Medidas de Seguridad Backend & Supabase (5 Puntos Clave)

1. **Row Level Security (RLS) Estricto en Supabase:**
   - Aplicado en las 15 tablas (`perfiles`, `inscripciones_grupo`, `paquetes_grupales`, `destinos_turisticos`, `cms_contenido`, `pagos`, `tabla_auditoria`, `favoritos_usuario`, `solicitudes_cotizacion`, `cuotas_inscripcion`, `acompanantes_inscripcion`, `historial_pagos_caja`, `imagenes_galeria`, `viajes_realizados`, `notificaciones`).
   - Cada cliente solo puede leer y modificar sus propios datos, favoritos y cotizaciones (`usuario_id = auth.uid()`).
2. **Políticas de Contraseña Segura:**
   - En el registro de clientes y usuarios del sistema, la contraseña requiere:
     - Mínimo 8 caracteres
     - Al menos 1 letra mayúscula (A-Z)
     - Al menos 1 letra minúscula (a-z)
     - Al menos 1 número (0-9)
     - Al menos 1 símbolo especial (`!@#$%^&*`)
3. **CORS Restringido & Rate Limiting:** 
   - `php/middleware/cors.php`: Valida orígenes autorizados.
   - `php/middleware/rate_limit.php`: Límite de 60 peticiones por minuto por dirección IP.
4. **Credenciales Sensibles en Variables de Entorno (.env):** 
   - Tokens de Supabase y credenciales de **Cloudflare R2 Object Storage** (`CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, bucket `aguitourscapullanas` y URL pública `r2.dev`) aisladas en `.env`.
5. **Sanitización de Entradas:** Middleware `php/middleware/sanitizer.php` sanitiza inputs contra inyecciones XSS y SQLi.

---

## 4. ⌛ Control de Sesión e Inactividad (1 Hora)

- **Duración de Inactividad:** Cierre de sesión automático tras **60 minutos (1 hora)** sin interacción del usuario.
- **Protección en Inicio de Sesión:** El temporizador se reinicia inmediatamente a `Date.now()` en cada login exitoso, evitando cierres falsos por sesiones previas.
- **Persistencia en Re-apertura:** Se registra la última actividad en `localStorage.aguitours_last_active`. Si el navegador se reabre tras más de 1 hora de inactividad, la sesión se expira automáticamente con notificación de seguridad.

---

## 5. 📸 Cloudflare R2 Object Storage & Galería

- **Bucket:** `aguitourscapullanas`
- **URL Pública:** `https://pub-6782babd351c499982137c48af2c6241.r2.dev`
- **Firma AWS V4 Nativa:** `php/config/r2.php` realiza uploads directos a R2 usando firma HMAC-SHA256 en PHP puro sin dependencias externas.
- **Selector Reutilizable:** `SelectorImagenModal.jsx` permite alternar entre:
  1. Fotos en la nube Cloudflare R2
  2. Fotos predeterminadas locales del proyecto (`/images/...`)
  3. Carga directa drag & drop con barra de progreso
  4. Enlace URL externo

---

## 6. 🎓 Nuevo Módulo: Viajes Realizados, Antecedentes & Notificaciones

- **Script SQL:** `database/modulo_viajes_realizados_y_antecedentes.sql`
- **Tablas Creadas:**
  - `public.viajes_realizados`: Colegios, Empresas, Organizaciones, Grupos Privados y Familias con fotos en Cloudflare R2 y galería fotográfica.
  - `public.notificaciones`: Sistema de avisos para usuarios y clientes con RLS.
- **Auditoría Integral (15 Tablas):** Triggers automáticos conectados a `public.tabla_auditoria` para todas las tablas del sistema.
- **Componentes Públicos:**
  - `src/components/antecedentes/ViajesRealizadosSection.jsx`: Sección principal en el Home con filtros interactivos por categoría (Colegios/Promociones, Empresas, Grupos Privados, Familias), contadores de viajeros, tarjetas con efecto hover y badges Cloudflare R2.
  - `src/components/antecedentes/VerDetalleViajeModal.jsx`: Visor Lightbox cinemático con carrusel fotográfico, tira de miniaturas, información de delegación, fecha, destino y reseña.
  - `src/components/antecedentes/GaleriaCompletaAntecedentesModal.jsx`: Catálogo completo con buscador en tiempo real y selector de delegaciones.
- **Componentes Administrativos:**
  - `src/components/admin/antecedentes/AdminAntecedentesModule.jsx`: Dashboard de administración con métricas de viajeros atendidos, búsqueda rápida, toggle directo de "Destacado en Inicio" (⭐) y visibilidad pública.
  - `src/components/admin/antecedentes/CrearViajeRealizadoModal.jsx`: Registro de nuevas experiencias con integración al selector de Cloudflare R2 y carga múltiple de imágenes de álbum.
  - `src/components/admin/antecedentes/EditarViajeRealizadoModal.jsx`: Edición completa, gestión de fotos del álbum y eliminación segura.
- **Navegación Fluida (Single Page Scroll):**
  - Enlace "Experiencias" en Navbar de escritorio y menú móvil que realiza desplazamiento suave hacia `#antecedentes` sin recargar ni desmontar vistas.

---

## 7. 🚀 Instrucciones para Ejecutar en Local

1. Abrir terminal en la carpeta del proyecto:
   ```bash
   npm install
   npm run dev
   ```
2. La Web App abrirá en **`http://localhost:5173/`**.
3. **Scripts SQL en Supabase:**
   - Ejecutar `database/modulo_galeria_imagenes_r2.sql` (Galería Cloudflare R2)
   - Ejecutar `database/modulo_viajes_realizados_y_antecedentes.sql` (Viajes Realizados, Notificaciones y Triggers de Auditoría)


