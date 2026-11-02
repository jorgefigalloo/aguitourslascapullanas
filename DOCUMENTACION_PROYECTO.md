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

## 5. 📸 Cloudflare R2 Object Storage & Galería (Arquitectura Dual)

- **Bucket:** `aguitourscapullanas`
- **URL Pública:** `https://pub-6782babd351c499982137c48af2c6241.r2.dev`
- **Firma AWS V4 Nativa:**
  1. **En Entorno de Desarrollo (Vite):** `src/lib/viteR2Plugin.js` intercepta las peticiones `/api/upload_r2` y `/php/api/upload_r2.php` directamente en Node.js, calcula la firma AWS Signature Version 4 con `crypto` nativo, sube el archivo a Cloudflare R2 y registra en Supabase `public.imagenes_galeria` **sin requerir Apache/XAMPP en ejecución**.
  2. **En Entorno de Producción (Apache/PHP):** `php/api/upload_r2.php` y `php/config/r2.php` implementan la firma V4 nativa en PHP puro sin dependencias para servidores compartidos o VPS.
- **Cliente Frontend Resiliente:** `src/lib/cloudflareR2.js` conecta de forma híbrida con reintento automático (`/api/upload_r2` -> `/php/api/upload_r2.php`).
- **Selector Reutilizable:** `SelectorImagenModal.jsx` permite alternar entre:
  1. Fotos en la nube Cloudflare R2
  2. Fotos predeterminadas locales del proyecto (`/images/...`)
  3. Carga directa drag & drop con barra de progreso
  4. Enlace URL externo

---

## 6. 🎓 Módulo: Viajes Realizados, Antecedentes, Visor de Fotos & Notificaciones

- **Scripts SQL:** 
  - `database/modulo_viajes_realizados_y_antecedentes.sql` (Viajes Realizados, Notificaciones y Triggers)
  - `database/fase_auditoria_y_seguridad_consolidada.sql` (**[NUEVO]** Auditoría inmutable integral en las 15 tablas funcionales del sistema, RLS estricto y permisos RBAC actualizados).
- **Tablas del Sistema (15 Tablas Funcionales con Auditoría 100% Cobertura + 1 Tabla de Logs):**
  1. `public.perfiles` (Gestión centralizada de usuarios staff y clientes/pasajeros)
  2. `public.paquetes_grupales`
  3. `public.destinos_turisticos`
  4. `public.inscripciones_grupo`
  5. `public.acompanantes_inscripcion`
  6. `public.cuotas_inscripcion`
  7. `public.pagos`
  8. `public.historial_pagos_caja`
  9. `public.solicitudes_cotizacion`
  10. `public.favoritos_usuario`
  11. `public.cms_contenido`
  12. `public.roles_sistema`
  13. `public.imagenes_galeria` (Cloudflare R2)
  14. `public.viajes_realizados` (Experiencias de delegaciones)
  15. `public.notificaciones` (Avisos del sistema)
  - `public.tabla_auditoria`: Registro inmutable de operaciones INSERT, UPDATE y DELETE.
- **Nuevo Componente Reutilizable:**
  - `src/components/common/VisorFotoModal.jsx`: Visor cinemático (`z-[1000000]`) para previsualizar fotos en su **proporción predeterminada original (contain)** o llenar marco (cover), zoom interactivo (50% a 250%), navegación con flechas/teclado, enlace a pestaña nueva, copia de URL directa y botón para **"⭐ Establecer como Portada Predeterminada"**.
- **Gestión Interactiva de Fotos en Modales de Viajes:**
  - `EditarViajeRealizadoModal.jsx` y `CrearViajeRealizadoModal.jsx`:
    - Portada interactiva: clic en la miniatura para verla en pantalla completa en visor predeterminado con badge dorado.
    - Álbum de fotos: clic en cualquier miniatura para abrirla en pantalla completa con tira de navegación.
    - Botón `⭐` en cada imagen del álbum para convertirla en portada predeterminada con un solo clic.
    - Badge visual persistente `⭐ Portada` en la foto que actualmente actúa como portada principal.
- **Matriz de Permisos RBAC (78 Permisos Totales en `src/lib/permisos.js`):**
  - Módulo Viajes Realizados & Antecedentes (7 permisos)
  - Módulo Galería Cloudflare R2 & Almacenamiento (5 permisos: ver, listar, subir, editar, eliminar)
  - Módulo Notificaciones & Avisos del Sistema (5 permisos: ver, listar, crear, bloquear, eliminar)
- **Directrices de Desarrollo & Skill del Proyecto:**
  - Definido en `.agents/skills/directrices-desarrollo-aguitours/SKILL.md` y `AGENTS.md`.
  - Testing manual reservado exclusivamente al usuario.
  - Scripts SQL entregados en archivos independientes para ejecución manual en Supabase.
  - Modularización inmediata de archivos extensos.
  - Plan de backend en Supabase por fases.

---

## 7. 🗺️ Plan de Backend en Supabase por Fases

| Fase | Alcance y Módulos | Estado |
| :--- | :--- | :--- |
| **Fase 1: Núcleo de Autenticación, Perfiles y RBAC** | `auth.users`, `public.perfiles`, `public.roles_sistema`, triggers de registro y roles. | ✅ Completada |
| **Fase 2: Catálogo Turístico & CMS Dinámico 3D** | `public.paquetes_grupales`, `public.destinos_turisticos`, `public.cms_contenido`. | ✅ Completada |
| **Fase 3: Clientes, Reservas & Cotizaciones** | `public.clientes`, `public.inscripciones_grupo`, `public.acompanantes_inscripcion`, `public.solicitudes_cotizacion`, `public.favoritos_usuario`. | ✅ Completada |
| **Fase 4: Pagos, Cuotas & Caja Libro Diario** | `public.pagos`, `public.cuotas_inscripcion`, `public.historial_pagos_caja`. | ✅ Completada |
| **Fase 5: Cloudflare R2, Galería & Antecedentes** | `public.imagenes_galeria`, `public.viajes_realizados`, `public.notificaciones`. | ✅ Completada |
| **Fase 6: Auditoría Inmutable & Seguridad RLS Consolidada** | `public.tabla_auditoria`, triggers en las 16 tablas y RLS estricto (`database/fase_auditoria_y_seguridad_consolidada.sql`). | 🚀 Lista para Ejecución |

---

## 8. 🚀 Instrucciones para Ejecutar en Local

1. Abrir terminal en la carpeta del proyecto:
   ```bash
   npm install
   npm run dev
   ```
2. La Web App abrirá en **`http://localhost:5173/`**.
3. **Scripts SQL en Supabase (Ejecución Manual por el Usuario):**
   - Ejecutar `database/fase_auditoria_y_seguridad_consolidada.sql` para activar la auditoría en las 15 tablas del sistema y los permisos RBAC actualizados.

---

## 9. 🌐 Arquitectura Híbrida Cloudflare R2: Local Dev vs Producción en Vercel

Para garantizar que la subida de imágenes y fotos funcione de manera idéntica tanto en local (Vite) como en producción (Vercel):

- **En Entorno Local (`npm run dev`):**
  - Gestionado por `src/lib/viteR2Plugin.js` directamente en el servidor de desarrollo de Vite. Intercepta `/api/upload_r2` y `/api/eliminar_r2`, firmando con AWS V4 y subiendo a R2 sin necesidad de Apache/PHP.
- **En Producción Vercel (`https://aguitourslascapullanas.vercel.app`):**
  - **Serverless Functions:**
    - `api/upload_r2.js`: Procesa multipart/form-data, firma con AWS Signature V4, sube al bucket R2 y registra en `public.imagenes_galeria`.
    - `api/eliminar_r2.js`: Firma AWS V4 para DELETE en R2 y borra el registro en Supabase.
  - **Enrutamiento y SPA (`vercel.json`):**
    - Enruta `/api/*` a las Serverless Functions de Node.js.
    - Redirige llamadas heredadas `/php/api/*.php` a `/api/*` de forma transparente.
    - Enruta rutas SPA a `/index.html`.



