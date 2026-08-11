# 📋 DOCUMENTACIÓN DEL PROYECTO: AGUITOURS LAS CAPULLANAS

> **Estado del Proyecto:** Reconstrucción a Web App Dinámica 3D/Cinematic + Módulo de Clientes, Cotizador Personalizado, CMS, RBAC, RLS y Auditoría Completada  
> **Fecha de Actualización:** 11 de Agosto de 2026  
> **Ubicación Local:** `c:\xampp\htdocs\aguitourslascapullanas`  
> **Servidor Dev:** `http://localhost:5173/` (Vite + React 18 + Framer Motion)  
> **Servidor Apache XAMPP:** `http://localhost:8085/aguitourslascapullanas/`  

---

## 1. 📌 Resumen General
**Aguitours Las Capullanas v3.0** es una Web App Dinámica e Inmersiva para Agencia de Viajes y Turismo construida con **React 18, Vite, Framer Motion (Parallax & Depth 3D), Lucide Icons, Supabase (Auth / PostgreSQL / RLS / CMS / Auditoría BD)** y backend PHP seguro.

Toda la información del sitio es **100% editable desde el Dashboard Administrativo**, incluyendo paquetes, itinerarios, destinos, banners CMS, cotizaciones personalizadas y auditoría inmutable de cambios.

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
│   ├── agregar_campo_activo_perfiles.sql  # Script SQL para campo activo en perfiles
│   ├── solucion_login_y_usuarios_admin.sql # [NUEVO] Script SQL para login por username y actualización de clave admin
│   └── auditoria_y_rls_completa.sql    # [NUEVO] Script SQL completo de auditoría inmutable y RLS para todas las tablas
├── php/                                # [BACKEND PHP SEGURO]
│   ├── config/ (env.php, supabase.php, smtp.php)
│   ├── middleware/ (cors.php, rate_limit.php, sanitizer.php)
│   └── api/ (inscribirse_grupo.php)
└── src/                                # [CÓDIGO FUENTE REACT WEB APP]
    ├── lib/
    │   └── supabase.js                 # Cliente Supabase reutilizable
    ├── hooks/
    │   └── useInactivityTimeout.js     # Hook de timeout por inactividad (60 min / 1 hora)
    ├── components/
    │   ├── Navbar.jsx                  # Navegación Glassmorphic 3D con menú hamburguesa celular
    │   ├── Hero3D.jsx                  # Portada 3D Parallax con CTA Cotizar Paquete
    │   ├── PaquetesGrupales.jsx        # Catálogo Bento Grid & Inscripciones en vivo
    │   ├── DestinosSection.jsx         # Galería Sticky de Scroll Horizontal & "Me Gusta"
    │   ├── ClientPortal.jsx            # Contenedor del Dashboard de Pasajero VIP
    │   ├── AdminDashboard.jsx          # Panel Admin Modularizado
    │   ├── MisDatosModal.jsx           # Modal de actualización de datos y contraseña
    │   ├── ScrollProgressBar.jsx       # Barra Neón de Scroll Superior
    │   ├── auth/                       # [MÓDULO DE AUTENTICACIÓN]
    │   │   └── AuthModal.jsx           # Login / Registro con resolución de Username y roles RBAC
    │   ├── cliente/                    # [MÓDULOS DEL DASHBOARD DE CLIENTE]
    │   │   ├── ClientMisViajes.jsx     # Itinerarios inscritos, WhatsApp oficial y PDF
    │   │   ├── ClientFavoritos.jsx     # Paquetes y destinos guardados ("Me gusta")
    │   │   ├── ClientSolicitudesCotizacion.jsx # Cotizador a medida e historial
    │   │   └── ClientPerfilEditar.jsx  # Edición de perfil personal y cambio de contraseña
    │   ├── admin/                      # [MÓDULOS DEL DASHBOARD ADMIN]
    │   │   ├── AdminAnalytics.jsx      # Métricas de ocupación e ingresos
    │   │   ├── AdminClientesModule.jsx # Gestión de pasajeros inscritos y cupos
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
    │       ├── CrearUsuarioModal.jsx   # Alta de usuario con cliente Supabase aislado
    │       └── EditarUsuarioAdminModal.jsx # Edición de rol y reseteo de clave por Admin
    ├── styles/
    │   └── index.css                   # Sistema de diseño global & Glassmorphism
    ├── App.jsx                         # Componente principal de la aplicación
    └── main.jsx                        # Punto de montaje React
```

---

## 3. 🛡️ Medidas de Seguridad Backend & Supabase (5 Puntos Clave)

1. **Row Level Security (RLS) Estricto en Supabase:**
   - Aplicado en todas las tablas (`perfiles`, `inscripciones_grupo`, `paquetes_grupales`, `destinos_turisticos`, `cms_contenido`, `pagos`, `tabla_auditoria`, `favoritos_usuario`, `solicitudes_cotizacion`).
   - Cada cliente solo puede leer y modificar sus propios datos, favoritos y cotizaciones (`usuario_id = auth.uid()`).
2. **CORS Restringido:** Middleware `php/middleware/cors.php` valida dominios permitidos.
3. **Credenciales en Variables de Entorno:** Todas las llaves públicas y privadas se almacenan en `.env`.
4. **Rate Limiting por IP/Minuto:** Middleware `php/middleware/rate_limit.php` previene ataques por fuerza bruta o spam.
5. **Sanitización de Entradas:** Middleware `php/middleware/sanitizer.php` sanitiza inputs contra inyecciones XSS y SQLi.

---

## 4. ⌛ Control de Sesión e Inactividad (1 Hora)

- **Duración de Inactividad:** Cierre de sesión automático tras **60 minutos (1 hora)** sin interacción del usuario.
- **Persistencia en Re-apertura:** Se registra la última actividad en `localStorage.aguitours_last_active`. Si el navegador se reabre tras más de 1 hora de inactividad, la sesión se expira automáticamente con una notificación informativa.

---

## 5. 🚀 Instrucciones para Ejecutar en Local

1. Abrir terminal en la carpeta del proyecto:
   ```bash
   npm install
   npm run dev
   ```
2. La Web App abrirá en **`http://localhost:5173/`**.
3. **Script SQL para Tablas de Clientes & Cotizaciones:** Ejecutar el archivo `database/modulo_clientes_y_cotizaciones.sql` dentro del Editor SQL del panel de Supabase.
