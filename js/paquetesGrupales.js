/**
 * AGUITOURS LAS CAPULLANAS - LÓGICA DE PAQUETES GRUPALES Y FLUJO "UNIRME AL GRUPO"
 */

document.addEventListener('DOMContentLoaded', () => {
    cargarPaquetesGrupalesUI();
});

async function cargarPaquetesGrupalesUI() {
    const container = document.getElementById('paquetes-grid-container');
    if (!container) return;

    const paquetes = await obtenerPaquetesGrupales();

    if (!paquetes || paquetes.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px;">
                <i class="fas fa-map-marked-alt fa-3x" style="color: #ccc;"></i>
                <h3 style="margin-top: 15px; color: #555;">No hay paquetes grupales abiertos en este momento</h3>
                <p style="color: #777;">Vuelve pronto o contáctanos para armar un grupo personalizado.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    paquetes.forEach(pkg => {
        const porcentajeCupo = Math.round(((pkg.cupo_maximo - pkg.cupo_disponible) / pkg.cupo_maximo) * 100);
        const estaCompleto = pkg.cupo_disponible <= 0 || pkg.estado !== 'abierto';

        const card = document.createElement('div');
        card.className = 'paquete-card';
        card.innerHTML = `
            <div class="paquete-img-box">
                <img src="${pkg.imagen_portada || 'images/ciudades/fondo-destinos.png'}" alt="${pkg.titulo}">
                <span class="status-badge ${pkg.estado}">
                    ${pkg.estado === 'abierto' ? (pkg.cupo_disponible <= 3 ? `¡Últimos ${pkg.cupo_disponible} cupos!` : 'Abierto') : pkg.estado}
                </span>
            </div>
            <div class="paquete-content">
                <div class="paquete-destino"><i class="fas fa-map-marker-alt"></i> ${pkg.destino}</div>
                <h3 class="paquete-titulo">${pkg.titulo}</h3>
                
                <div class="paquete-fechas">
                    <i class="far fa-calendar-alt"></i> 
                    ${formatearFecha(pkg.fecha_salida)} al ${formatearFecha(pkg.fecha_retorno)}
                </div>

                <div class="cupo-box">
                    <div class="cupo-text-info">
                        <span>Cupos ocupados: ${pkg.cupo_maximo - pkg.cupo_disponible} de ${pkg.cupo_maximo}</span>
                        <span>${porcentajeCupo}%</span>
                    </div>
                    <div class="cupo-progress-bar">
                        <div class="cupo-progress-fill ${porcentajeCupo >= 90 ? 'full' : ''}" style="width: ${porcentajeCupo}%;"></div>
                    </div>
                </div>

                <p style="font-size: 13px; color: #555; margin-bottom: 20px; line-height: 1.4;">
                    ${pkg.descripcion.substring(0, 110)}...
                </p>

                <div class="paquete-footer">
                    <div class="paquete-precio">
                        <span class="precio-label">Precio por persona</span>
                        <span class="precio-val">S/ ${pkg.precio_persona.toFixed(2)}</span>
                    </div>
                    <button class="btn-unirme" data-id="${pkg.id}" ${estaCompleto ? 'disabled' : ''}>
                        <i class="fas fa-user-plus"></i> ${estaCompleto ? 'Agotado' : 'Unirme'}
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Agregar eventos a los botones de unirme
    document.querySelectorAll('.btn-unirme').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const paqueteId = e.currentTarget.getAttribute('data-id');
            await manejarFlujoInscripcion(paqueteId);
        });
    });
}

/**
 * Manejar el flujo de inscripción con verificación de autenticación
 */
async function manejarFlujoInscripcion(paqueteId) {
    const sesion = await obtenerSesionActiva();

    if (!sesion) {
        // Redirigir a login si no está autenticado
        alert('Para unirte a un grupo debes iniciar sesión o crear una cuenta primero.');
        abrirModalAuth('login');
        return;
    }

    const paquete = await obtenerDetallePaquete(paqueteId);
    if (!paquete) {
        alert('No se pudo encontrar la información del paquete.');
        return;
    }

    const confirmacion = confirm(`¿Deseas confirmar tu lugar en el grupo "${paquete.titulo}" por S/ ${paquete.precio_persona.toFixed(2)}?`);
    if (!confirmacion) return;

    // Ejecutar petición al endpoint PHP intermediario
    try {
        const response = await fetch('php/api/inscribirse_grupo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: sesion.user.id,
                paquete_id: paqueteId,
                access_token: sesion.session.access_token,
                user_email: sesion.user.email,
                user_nombre: sesion.perfil ? sesion.perfil.nombre_completo : 'Viajero',
                paquete_titulo: paquete.titulo
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('🎉 ¡Felicitaciones! Te has unido exitosamente al grupo. Revisa tu correo electrónico para ver los detalles.');
            cargarPaquetesGrupalesUI(); // Recargar barras de cupo en tiempo real
        } else {
            alert(`⚠️ Error: ${data.message}`);
        }
    } catch (err) {
        console.error('Error al conectarse con el servidor:', err);
        alert('Ocurrió un error al procesar la inscripción. Por favor intenta de nuevo.');
    }
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaStr;
}
