/**
 * AGUITOURS LAS CAPULLANAS - MODAL DINÁMICO DE AUTENTICACIÓN
 * Inyecta el modal de inicio de sesión y registro en cualquier página del sitio.
 */

function crearModalAuthHTML() {
    if (document.getElementById('auth-modal-overlay')) return;

    const modalHTML = `
    <div id="auth-modal-overlay" class="auth-modal-overlay">
        <div class="auth-modal-card">
            <button class="auth-modal-close" id="auth-modal-close-btn">&times;</button>
            <div class="auth-header">
                <h2>Aguitours Las Capullanas</h2>
                <p>Tu portal de viajes y paquetes grupales</p>
            </div>
            
            <div class="auth-tabs">
                <button class="auth-tab-btn active" id="tab-login-btn">Iniciar Sesión</button>
                <button class="auth-tab-btn" id="tab-register-btn">Registrarse</button>
            </div>

            <div class="auth-body">
                <div id="auth-alert-msg" class="auth-alert"></div>

                <!-- Formulario de Login -->
                <form id="form-login">
                    <div class="auth-form-group">
                        <label for="login-email">Correo Electrónico</label>
                        <div class="auth-input-wrapper">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="login-email" class="auth-input" placeholder="ejemplo@correo.com" required>
                        </div>
                    </div>
                    <div class="auth-form-group">
                        <label for="login-password">Contraseña</label>
                        <div class="auth-input-wrapper">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="login-password" class="auth-input" placeholder="••••••••" required>
                        </div>
                    </div>
                    <button type="submit" class="btn-auth-submit" id="btn-submit-login">Ingresar</button>
                </form>

                <!-- Formulario de Registro -->
                <form id="form-register" style="display: none;">
                    <div class="auth-form-group">
                        <label for="reg-name">Nombre Completo</label>
                        <div class="auth-input-wrapper">
                            <i class="fas fa-user"></i>
                            <input type="text" id="reg-name" class="auth-input" placeholder="Juan Pérez" required>
                        </div>
                    </div>
                    <div class="auth-form-group">
                        <label for="reg-email">Correo Electrónico</label>
                        <div class="auth-input-wrapper">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="reg-email" class="auth-input" placeholder="ejemplo@correo.com" required>
                        </div>
                    </div>
                    <div class="auth-form-group">
                        <label for="reg-phone">Teléfono / WhatsApp</label>
                        <div class="auth-input-wrapper">
                            <i class="fas fa-phone"></i>
                            <input type="tel" id="reg-phone" class="auth-input" placeholder="+51 987 654 321">
                        </div>
                    </div>
                    <div class="auth-form-group">
                        <label for="reg-document">DNI / Pasaporte</label>
                        <div class="auth-input-wrapper">
                            <i class="fas fa-id-card"></i>
                            <input type="text" id="reg-document" class="auth-input" placeholder="12345678">
                        </div>
                    </div>
                    <div class="auth-form-group">
                        <label for="reg-password">Contraseña</label>
                        <div class="auth-input-wrapper">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="reg-password" class="auth-input" placeholder="Mínimo 6 caracteres" required>
                        </div>
                    </div>
                    <div class="auth-form-group">
                        <label>Tipo de Cuenta</label>
                        <div class="role-selector">
                            <label class="role-option selected" id="role-opt-cliente">
                                <input type="radio" name="reg-rol" value="cliente" checked> <i class="fas fa-user"></i> Viajero (Cliente)
                            </label>
                            <label class="role-option" id="role-opt-admin">
                                <input type="radio" name="reg-rol" value="admin"> <i class="fas fa-user-shield"></i> Administrador
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="btn-auth-submit" id="btn-submit-register">Crear Cuenta</button>
                </form>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    inicializarEventosModalAuth();
}

function abrirModalAuth(tab = 'login') {
    crearModalAuthHTML();
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
        cambiarTabAuth(tab);
    }
}

function cerrarModalAuth() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.remove('active');
}

function cambiarTabAuth(tab) {
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabReg = document.getElementById('tab-register-btn');
    const alertMsg = document.getElementById('auth-alert-msg');

    if (alertMsg) alertMsg.style.display = 'none';

    if (tab === 'login') {
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
    } else {
        formLogin.style.display = 'none';
        formRegister.style.display = 'block';
        tabLogin.classList.remove('active');
        tabReg.classList.add('active');
    }
}

function mostrarAlertaAuth(mensaje, tipo = 'error') {
    const alertMsg = document.getElementById('auth-alert-msg');
    if (!alertMsg) return;

    alertMsg.className = `auth-alert ${tipo}`;
    alertMsg.textContent = mensaje;
    alertMsg.style.display = 'block';
}

function inicializarEventosModalAuth() {
    document.getElementById('auth-modal-close-btn')?.addEventListener('click', cerrarModalAuth);

    document.getElementById('tab-login-btn')?.addEventListener('click', () => cambiarTabAuth('login'));
    document.getElementById('tab-register-btn')?.addEventListener('click', () => cambiarTabAuth('register'));

    // Selección visual de Rol
    const optCliente = document.getElementById('role-opt-cliente');
    const optAdmin = document.getElementById('role-opt-admin');

    optCliente?.addEventListener('click', () => {
        optCliente.classList.add('selected');
        optAdmin.classList.remove('selected');
        optCliente.querySelector('input').checked = true;
    });

    optAdmin?.addEventListener('click', () => {
        optAdmin.classList.add('selected');
        optCliente.classList.remove('selected');
        optAdmin.querySelector('input').checked = true;
    });

    // Submit Login
    document.getElementById('form-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-submit-login');

        btn.disabled = true;
        btn.textContent = 'Ingresando...';

        const res = await iniciarSesion(email, password);
        btn.disabled = false;
        btn.textContent = 'Ingresar';

        if (res.success) {
            mostrarAlertaAuth('¡Bienvenido! Redireccionando...', 'success');
            setTimeout(() => {
                cerrarModalAuth();
                if (res.perfil && res.perfil.rol === 'admin') {
                    window.location.href = 'admin-paquetes.html';
                } else {
                    window.location.reload();
                }
            }, 800);
        } else {
            mostrarAlertaAuth(res.error?.message || 'Error al iniciar sesión. Revisa tus credenciales.');
        }
    });

    // Submit Registro
    document.getElementById('form-register')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombreCompleto = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const telefono = document.getElementById('reg-phone').value;
        const documento = document.getElementById('reg-document').value;
        const password = document.getElementById('reg-password').value;
        const rol = document.querySelector('input[name="reg-rol"]:checked')?.value || 'cliente';

        const btn = document.getElementById('btn-submit-register');
        btn.disabled = true;
        btn.textContent = 'Creando cuenta...';

        const res = await registrarUsuario({ email, password, nombreCompleto, telefono, documento, rol });
        btn.disabled = false;
        btn.textContent = 'Crear Cuenta';

        if (res.success) {
            mostrarAlertaAuth('¡Cuenta creada con éxito! Iniciando sesión...', 'success');
            setTimeout(async () => {
                await iniciarSesion(email, password);
                cerrarModalAuth();
                if (rol === 'admin') {
                    window.location.href = 'admin-paquetes.html';
                } else {
                    window.location.reload();
                }
            }, 1000);
        } else {
            mostrarAlertaAuth(res.error?.message || 'No se pudo crear la cuenta.');
        }
    });
}
