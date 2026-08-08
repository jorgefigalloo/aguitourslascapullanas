# 📋 DOCUMENTACIÓN DEL PROYECTO: AGUITOURS LAS CAPULLANAS

> **Estado del Proyecto:** Reconstrucción a Web App 3D Dinámica + CMS y RBAC Completada  
> **Fecha de Actualización:** Agosto 2026  
> **Ubicación Local:** `c:\xampp\htdocs\aguitourslascapullanas`  
> **Servidor Dev:** `http://localhost:5173/` (Vite + React)  
> **Servidor Apache XAMPP:** `http://localhost:8085/aguitourslascapullanas/`  

---

## 1. 📌 Resumen General
**Aguitours Las Capullanas v2.0** es una Web App Dinámica construida con **React 18, Vite, Lucide Icons, Supabase (Auth/PostgreSQL/RLS/CMS)** y backend de notificaciones en **PHP (PHPMailer SMTP)**.

Toda la información del sitio web (títulos, descripciones, banners, precios de paquetes, cupos, itinerarios y galerías de imágenes) es **100% editable desde el Dashboard administrativo** sin modificar código fuente.

---

## 2. 📂 Estructura del Código

```
c:\xampp\htdocs\aguitourslascapullanas\
├── .env                                # Variables de entorno locales
├── package.json                        # Configuración de dependencias React + Vite
├── vite.config.js                      # Configuración de servidor dev y proxy PHP
├── index.html                          # Punto de entrada de la Web App
├── database/                           # [SCRIPTS SQL DE SUPABASE]
│   ├── supabase_schema.sql             # Esquema base, RLS, triggers y función atómica
│   ├── auditoria_y_seguridad.sql       # Registro y triggers de auditoría automática
│   └── cms_and_rbac_schema.sql         # [NUEVO] Tablas del CMS y Roles RBAC
├── php/                                # [BACKEND PHP SEGURO]
│   ├── config/ (env.php, supabase.php, smtp.php)
│   ├── middleware/ (cors.php, rate_limit.php, sanitizer.php)
│   └── api/ (inscribirse_grupo.php)
└── src/                                # [CÓDIGO FUENTE REACT WEB APP 3D]
    ├── lib/
    │   └── supabase.js                 # Cliente Supabase reutilizable
    ├── components/
    │   ├── Navbar.jsx                  # Navegación Glassmorphic 3D & User Status
    │   ├── Hero3D.jsx                  # Portada 3D Parallax con CMS dinámico
    │   ├── PaquetesGrupales.jsx        # Catálogo 3D dinámico & Reserva de cupos
    │   ├── DestinosSection.jsx         # Tarjetas 3D Tilt filtrables
    │   ├── AuthModal.jsx               # Login / Registro con selector de roles RBAC
    │   ├── ClientPortal.jsx            # Portal del Cliente ("Mis Viajes")
    │   └── AdminDashboard.jsx          # Panel Admin / Editor CMS & Auditoría
    ├── styles/
    │   └── index.css                   # Sistema de diseño 3D global & Glassmorphism
    ├── App.jsx                         # Componente principal
    └── main.jsx                        # Punto de montaje React
```

---

## 3. 👥 Sistema de Roles Granulares (RBAC)

1. **`super_admin`:** Acceso total a usuarios, auditoría, gestión de roles y CMS.
2. **`editor_contenido`:** Acceso al **Gestor CMS Dinámico** para editar títulos, banners y textos en tiempo real.
3. **`agente_ventas`:** Acceso a publicar y editar Paquetes Grupales y consultar pasajes inscritos.
4. **`cliente`:** Pasajero viajero con acceso al portal "Mis Viajes".

---

## 4. 🚀 Instrucciones para Ejecutar en Local

1. Abrir terminal en la carpeta del proyecto:
   ```bash
   npm install
   npm run dev
   ```
2. La Web App 3D abrirá en **`http://localhost:5173/`**.
