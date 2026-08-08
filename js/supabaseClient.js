/**
 * AGUITOURS LAS CAPULLANAS - MODULO CLIENTE SUPABASE & AUTENTICACIÓN
 * Integración con Supabase Auth, PostgreSQL RLS y Roles (cliente / admin)
 */

const SUPABASE_URL = 'https://qmwukfmieqoqydgrrbct.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd3VrZm1pZXFvcXlkZ3JyYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDg1OTAsImV4cCI6MjEwMDM4NDU5MH0.wji4xmdM4KdJEywO77AVZh5q5CfXJXhdwpgohxz0kvU';

// Instancia global de Supabase
let supabase = null;

function getSupabaseClient() {
    if (!supabase) {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else if (typeof createClient === 'function') {
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    }
    return supabase;
}

/**
 * Registrar un nuevo usuario (Cliente o Admin)
 */
async function registrarUsuario({ email, password, nombreCompleto, telefono, documento, rol = 'cliente' }) {
    const client = getSupabaseClient();
    if (!client) return { error: { message: 'Supabase no inicializado' } };

    const { data, error } = await client.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                nombre_completo: nombreCompleto,
                telefono: telefono,
                documento_identidad: documento,
                rol: rol
            }
        }
    });

    if (error) return { success: false, error };
    return { success: true, data };
}

/**
 * Iniciar sesión de usuario
 */
async function iniciarSesion(email, password) {
    const client = getSupabaseClient();
    if (!client) return { error: { message: 'Supabase no inicializado' } };

    const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) return { success: false, error };

    const perfil = await obtenerPerfilUsuario(data.user.id);
    return { success: true, user: data.user, session: data.session, perfil };
}

/**
 * Cerrar sesión
 */
async function cerrarSesion() {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    window.location.reload();
}

/**
 * Obtener perfil extendido desde la tabla public.perfiles
 */
async function obtenerPerfilUsuario(userId) {
    const client = getSupabaseClient();
    if (!client || !userId) return null;

    try {
        const { data, error } = await client
            .from('perfiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    } catch (e) {
        return null;
    }
}

/**
 * Obtener la sesión activa del usuario
 */
async function obtenerSesionActiva() {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data: { session }, error } = await client.auth.getSession();
        if (error || !session) return null;

        const perfil = await obtenerPerfilUsuario(session.user.id);
        return {
            user: session.user,
            session: session,
            perfil: perfil,
            isAdmin: perfil ? perfil.rol === 'admin' : false
        };
    } catch (e) {
        return null;
    }
}

/**
 * Cargar listado público de paquetes grupales con datos por defecto de reserva
 */
async function obtenerPaquetesGrupales() {
    const client = getSupabaseClient();
    
    // Paquetes predeterminados para asegurar que la página nunca quede trabada en cargando
    const paquetesMuestra = [
        {
            id: '11111111-1111-1111-1111-111111111111',
            titulo: 'Cusco Imperial & Machu Picchu Grupal',
            destino: 'Cusco, Perú',
            descripcion: 'Únete a nuestro grupo exclusivo para descubrir la mística de Cusco, Valle Sagrado y Machu Picchu con guía privado.',
            fecha_salida: '2026-09-20',
            fecha_retorno: '2026-09-25',
            precio_persona: 1250.00,
            cupo_maximo: 15,
            cupo_disponible: 3,
            estado: 'abierto',
            imagen_portada: '../images/ciudades/nacionales/cuzco.png'
        },
        {
            id: '22222222-2222-2222-2222-222222222222',
            titulo: 'Ruta Blanca Arequipa y Colca',
            destino: 'Arequipa, Perú',
            descripcion: 'Aventura en la Ciudad Blanca y trekking por el Cañón del Colca en grupo.',
            fecha_salida: '2026-10-10',
            fecha_retorno: '2026-10-14',
            precio_persona: 890.00,
            cupo_maximo: 10,
            cupo_disponible: 5,
            estado: 'abierto',
            imagen_portada: '../images/ciudades/nacionales/arequipa.png'
        },
        {
            id: '33333333-3333-3333-3333-333333333333',
            titulo: 'Selva Tropical Tarapoto Mágico',
            destino: 'Tarapoto, Perú',
            descripcion: 'Cataratas de Ahuashiyacu, Laguna Azul y la calidez de la selva peruana en grupo.',
            fecha_salida: '2026-11-05',
            fecha_retorno: '2026-11-09',
            precio_persona: 750.00,
            cupo_maximo: 12,
            cupo_disponible: 12,
            estado: 'abierto',
            imagen_portada: '../images/ciudades/nacionales/tarapoto.png'
        }
    ];

    if (!client) return paquetesMuestra;

    try {
        const { data, error } = await client
            .from('paquetes_grupales')
            .select('*')
            .order('fecha_salida', { ascending: true });

        if (error || !data || data.length === 0) {
            return paquetesMuestra;
        }

        return data;
    } catch (e) {
        return paquetesMuestra;
    }
}

/**
 * Obtener detalle de un paquete por su ID
 */
async function obtenerDetallePaquete(paqueteId) {
    const client = getSupabaseClient();
    if (!client || !paqueteId) return null;

    try {
        const { data, error } = await client
            .from('paquetes_grupales')
            .select('*')
            .eq('id', paqueteId)
            .single();

        if (error) return null;
        return data;
    } catch (e) {
        return null;
    }
}

/**
 * Actualizar interfaz de usuario según estado de autenticación (Header / Navbar)
 */
async function actualizarUIAuth() {
    const sesion = await obtenerSesionActiva();
    const navMenu = document.querySelector('.menu');

    if (!navMenu) return;

    const authBtnExistente = document.getElementById('nav-auth-item');
    if (authBtnExistente) authBtnExistente.remove();

    const li = document.createElement('li');
    li.id = 'nav-auth-item';

    if (sesion) {
        const esAdmin = sesion.isAdmin;
        const nombreDisplay = sesion.perfil ? sesion.perfil.nombre_completo.split(' ')[0] : 'Mi Cuenta';
        
        li.innerHTML = `
            <div class="user-menu-dropdown">
                <button class="user-menu-btn">
                    <i class="fas fa-user-circle"></i> ${nombreDisplay} ${esAdmin ? '<span class="badge-admin">Admin</span>' : ''}
                </button>
                <div class="user-dropdown-content">
                    ${esAdmin ? '<a href="admin-paquetes.html"><i class="fas fa-cog"></i> Panel Admin</a>' : ''}
                    <a href="mi-perfil.html"><i class="fas fa-suitcase"></i> Mis Viajes</a>
                    <a href="#" id="btn-cerrar-sesion-nav"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>
        `;
        navMenu.appendChild(li);

        document.getElementById('btn-cerrar-sesion-nav')?.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    } else {
        li.innerHTML = `<a href="#" id="btn-open-auth-modal" class="btn-nav-auth"><i class="fas fa-user"></i> Ingresar / Registrarse</a>`;
        navMenu.appendChild(li);

        document.getElementById('btn-open-auth-modal')?.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalAuth();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getSupabaseClient();
    actualizarUIAuth();
});
