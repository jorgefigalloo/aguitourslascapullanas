# 📋 DOCUMENTACIÓN DEL PROYECTO: AGUITOURS LAS CAPULLANAS

> **Estado del Proyecto:** Reconstrucción a Web App Dinámica 3D/Cinematic + CMS, RBAC, RLS y PDF Generator Completada  
> **Fecha de Actualización:** Agosto 2026  
> **Ubicación Local:** `c:\xampp\htdocs\aguitourslascapullanas`  
> **Servidor Dev:** `http://localhost:5173/` (Vite + React 18 + Framer Motion)  
> **Servidor Apache XAMPP:** `http://localhost:8085/aguitourslascapullanas/`  

---

## 1. 📌 Resumen General
**Aguitours Las Capullanas v2.5** es una Web App Dinámica de Turismo e Itinerarios construida con **React 18, Vite, Framer Motion (Cinematic Scroll & Parallax Depth), Lucide Icons, Supabase (Auth / PostgreSQL / RLS / CMS / Auditoría)** y backend PHP seguro.

Toda la información del sitio (portadas, títulos, badges flotantes, precios, cupos, itinerarios, enlaces de WhatsApp y PDFs de formularios) es **100% editable desde el Dashboard Administrativo**.

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
│   └── fase_seguridad_y_auditoria.sql  # [STANDALONE] Script de RLS estricto y triggers de auditoría
├── php/                                # [BACKEND PHP SEGURO]
│   ├── config/ (env.php, supabase.php, smtp.php)
│   ├── middleware/ (cors.php, rate_limit.php, sanitizer.php)
│   └── api/ (inscribirse_grupo.php)
└── src/                                # [CÓDIGO FUENTE REACT WEB APP]
    ├── lib/
    │   └── supabase.js                 # Cliente Supabase reutilizable
    ├── components/
    │   ├── Navbar.jsx                  # Navegación Glassmorphic 3D & User Status
    │   ├── Hero3D.jsx                  # Portada 3D Parallax con Zoom & Badges flotantes CMS
    │   ├── PaquetesGrupales.jsx        # Catálogo Bento Grid & Inscripciones en vivo
    │   ├── DestinosSection.jsx         # Galería Sticky de Scroll Horizontal & "Me Gusta"
    │   ├── AuthModal.jsx               # Login / Registro con selector de roles RBAC
    │   ├── ClientPortal.jsx            # Portal de Pasajero (Itinerarios, WhatsApp, PDF y Integrantes)
    │   ├── AdminDashboard.jsx          # Panel Admin Modularizado
    │   ├── ScrollProgressBar.jsx       # Barra Neón de Scroll Superior
    │   ├── admin/                      # [MÓDULOS DEL DASHBOARD ADMIN]
    │   │   ├── AdminAnalytics.jsx      # Métricas de ocupación e ingresos
    │   │   ├── AdminCMSModule.jsx      # Editor de textos y portadas del CMS
    │   │   ├── AdminDestinosModule.jsx # Gestor de destinos turísticos
    │   │   ├── AdminPaquetesModule.jsx # Gestor de paquetes e itinerarios
    │   │   ├── AdminUsuariosModule.jsx # Matriz de roles y usuarios RBAC
    │   │   └── AdminAuditoriaModule.jsx# Visor de logs inmutables de auditoría
    │   ├── destinos/                   # [MODALES DE DESTINOS]
    │   │   ├── CrearDestinoModal.jsx   # Registrar nuevo destino turístico
    │   │   └── EditarDestinoModal.jsx  # Editar y eliminar/desactivar destino
    │   └── paquetes/                   # [MODALES & GENERADOR DE PDF]
    │       ├── CrearPaqueteModal.jsx   # Publicar paquete con grupo de WhatsApp y PDF
    │       ├── EditarPaqueteModal.jsx  # Editar paquete e itinerarios
    │       └── ReportePdfModal.jsx     # Generador e impresor de Ficha PDF de Itinerario
    ├── styles/
    │   └── index.css                   # Sistema de diseño global & Glassmorphism
    ├── App.jsx                         # Componente principal
    └── main.jsx                        # Punto de montaje React
```

---

## 3. 🛡️ Medidas de Seguridad Backend & Supabase (5 Puntos Clave)

1. **Row Level Security (RLS) Estricto en Supabase:**
   - Aplicado en todas las tablas (`perfiles`, `inscripciones_grupo`, `paquetes_grupales`, `destinos_turisticos`, `cms_contenido`, `pagos`, `tabla_auditoria`).
   - Los clientes solo pueden leer y modificar sus propios datos e inscripciones.
2. **CORS Restringido:** Middleware `php/middleware/cors.php` valida dominios permitidos.
3. **Credenciales en Variables de Entorno:** Todas las llaves públicas y privadas se almacenan en `.env`.
4. **Rate Limiting por IP/Minuto:** Middleware `php/middleware/rate_limit.php` previene ataques por fuerza bruta o spam.
5. **Sanitización de Entradas:** Middleware `php/middleware/sanitizer.php` sanitiza inputs contra inyecciones XSS y SQLi.

---

## 4. 🚀 Instrucciones para Ejecutar en Local

1. Abrir terminal en la carpeta del proyecto:
   ```bash
   npm install
   npm run dev
   ```
2. La Web App abrirá en **`http://localhost:5173/`**.
3. **Script SQL de Seguridad:** Para aplicar RLS y Triggers de auditoría en Supabase, ejecuta el script en `database/fase_seguridad_y_auditoria.sql` dentro del Editor SQL del panel de Supabase.
