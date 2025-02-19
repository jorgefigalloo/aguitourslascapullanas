<?php include 'includes/header.php'; ?>

<main>
    <section class="nosotros-hero">
        <div class="nosotros-content">
            <h1>Sobre Nosotros</h1>
            <p>Bienvenido a Aguitours Las Capullanas, tu agencia de viajes confiable. Nos dedicamos a ofrecer experiencias únicas y memorables alrededor del mundo.</p>
        </div>
    </section>

    <!-- Contenedor con fondo -->
    <div class="fondo-turismo">
        <section class="mision-vision">
            <div class="container">
                <div class="mision">
                    <h2>Nuestra Misión</h2>
                    <p>Brindar experiencias de viaje excepcionales que superen las expectativas de nuestros clientes, combinando calidad, seguridad y servicio personalizado.</p>
                </div>
                <div class="vision">
                    <h2>Nuestra Visión</h2>
                    <p>Ser la agencia de viajes líder en el mercado, reconocida por nuestra innovación, compromiso con el cliente y sostenibilidad en todos nuestros servicios.</p>
                </div>
            </div>
        </section>

        <section class="valores">
            <h2>Nuestros Valores</h2>
            <ul class="valores-list">
                <li><strong>Calidad:</strong> Nos comprometemos a ofrecer servicios de alta calidad.</li>
                <li><strong>Innovación:</strong> Siempre buscamos nuevas formas de mejorar la experiencia de viaje.</li>
                <li><strong>Honestidad:</strong> Trabajamos con transparencia y ética en todas nuestras operaciones.</li>
                <li><strong>Pasión:</strong> Amamos lo que hacemos y lo reflejamos en cada detalle.</li>
            </ul>
        </section>




          <!-- Nueva Sección: Galería -->
          <section class="galeria-container">
            <div class="galeria">
                <h2>Nuestro Trabajo</h2>
                <p>Descubre algunas de las experiencias que hemos creado para nuestros clientes:</p>
                <div class="galeria-grid">
                    <div class="galeria-item" data-src="images/galeria/1.jpg">
                        <img src="images/galeria/1.jpg" alt="Experiencia 1">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/2.jpg">
                        <img src="images/galeria/2.jpg" alt="Experiencia 2">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/3.jpg">
                        <img src="images/galeria/3.jpg" alt="Experiencia 3">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/4.jpg">
                        <img src="images/galeria/4.jpg" alt="Experiencia 4">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/5.jpg">
                        <img src="images/galeria/5.jpg" alt="Experiencia 5">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/6.jpg">
                        <img src="images/galeria/6.jpg" alt="Experiencia 6">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/7.jpg">
                        <img src="images/galeria/7.jpg" alt="Experiencia 7">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/8.jpg">
                        <img src="images/galeria/8.jpg" alt="Experiencia 8">
                    </div>
                    <div class="galeria-item" data-src="images/galeria/9.jpg">
                        <img src="images/galeria/9.jpg" alt="Experiencia 9">
                    </div>
                </div>
            </div>
        </section>
        <!-- Modal para Vista Previa de Imágenes -->
        <div id="image-modal" class="modal">
            <span class="close">&times;</span>
            <img class="modal-content" id="modal-image">
            <div id="caption"></div>
        </div>









        <section class="equipo">
            <h2>Nuestro Equipo</h2>
            <div class="equipo-grid">
                <div class="equipo-member">
                    <img src="images/team/member.png" alt="Miembro 1">
                    <h3>Juan Pérez</h3>
                    <p>Fundador y CEO</p>
                </div>
                <div class="equipo-member">
                    <img src="images/team/member.png" alt="Miembro 2">
                    <h3>Maria López</h3>
                    <p>Gerente de Operaciones</p>
                </div>
                <div class="equipo-member">
                    <img src="images/team/member.png" alt="Miembro 3">
                    <h3>Carlos Ramírez</h3>
                    <p>Guía Turístico</p>
                </div>
            </div>
        </section>

        <section class="preguntas">
            <h2>Preguntas Frecuentes</h2>
            <div class="faq-container">
                <div class="faq-item">
                    <button class="faq-question">¿Qué servicios ofrece Aguitours Las Capullanas?</button>
                    <div class="faq-answer">
                        <p>Ofrecemos una amplia variedad de servicios, incluyendo paquetes turísticos personalizados, reservas de hoteles, vuelos y actividades en destino.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">¿Cómo puedo reservar un viaje?</button>
                    <div class="faq-answer">
                        <p>Puedes reservar un viaje a través de nuestro sitio web o contactándonos directamente por teléfono o correo electrónico. ¡Estamos aquí para ayudarte!</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">¿Cuáles son los métodos de pago aceptados?</button>
                    <div class="faq-answer">
                        <p>Aceptamos pagos mediante tarjeta de crédito/débito, transferencias bancarias y plataformas digitales como PayPal.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">¿Qué pasa si necesito cancelar mi reserva?</button>
                    <div class="faq-answer">
                        <p>Si necesitas cancelar tu reserva, ponte en contacto con nosotros lo antes posible. Las políticas de cancelación varían según el servicio contratado.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">¿Ofrecen asistencia durante el viaje?</button>
                    <div class="faq-answer">
                        <p>¡Sí! Contamos con un equipo de soporte disponible las 24 horas para resolver cualquier problema durante tu viaje.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</main>

<?php include 'includes/footer.php'; ?>