<?php include 'includes/header.php'; ?>

<!-- Mensaje de Confirmación -->

<?php if (isset($_GET['status']) && $_GET['status'] == 'success'): ?>
    <div id="mensaje-exito" class="mensaje-exito">
        <p>Tu mensaje ha sido enviado correctamente. ¡Gracias por contactarnos!</p>
    </div>
<?php elseif (isset($_GET['status']) && $_GET['status'] == 'error'): ?>
    <div id="mensaje-error" class="mensaje-error">
        <p>Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.</p>
    </div>
<?php endif; ?>
<!-- Sección de Contacto -->
<section class="contacto-section">
    <div class="contacto-info">
        <h2>Contáctanos</h2>
        <p>Estamos aquí para ayudarte con cualquier pregunta o solicitud que tengas. ¡No dudes en contactarnos!</p>
        <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>Dirección: Urb. Bello Horizonte lote 2, Piura, Perú</span>
        </div>
        <div class="info-item">
            <i class="fas fa-phone"></i>
            <span>Teléfono: +51 957 673 925</span>
        </div>
        <div class="info-item">
            <i class="fas fa-envelope"></i>
            <span>Email: aguitourslascapullanas@hotmail.com</span>
        </div>
        <div class="info-item">
            <i class="fas fa-clock"></i>
            <span>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</span>
        </div>
        <!-- Botón de WhatsApp -->
        <a href="https://wa.me/957673925" class="cta-button whatsapp-button" target="_blank">
            <i class="fab fa-whatsapp"></i> Contáctanos por WhatsApp
        </a>
    </div>

    <div class="contacto-form">
        <h2>Envíanos un Mensaje</h2>
        <form action="includes/enviar.php" method="POST">
            <div class="form-group">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="mensaje">Mensaje:</label>
                <textarea id="mensaje" name="mensaje" rows="5" required></textarea>
            </div>
            <button type="submit" class="cta-button">Enviar Mensaje</button>
        </form>
    </div>
</section>

<script>
    // Ocultar el mensaje después de 10 segundos
    document.addEventListener('DOMContentLoaded', function () {
        const mensajeExito = document.getElementById('mensaje-exito');
        const mensajeError = document.getElementById('mensaje-error');

        const ocultarMensaje = (mensaje) => {
            if (mensaje) {
                setTimeout(() => {
                    mensaje.style.display = 'none';
                }, 10000); // 10 segundos
            }
        };

        ocultarMensaje(mensajeExito);
        ocultarMensaje(mensajeError);
    });
</script>
<?php include 'includes/footer.php'; ?>