<?php include 'includes/header.php'; ?>

<main>

           



    <section class="hero">
        <h1>Bienvenido a Agencia de Viajes</h1>
        <p>Descubre los mejores destinos alrededor del mundo.</p>
        <a href="destinos.php" class="btn">Ver Destinos</a>
    </section>


    <section class="carousel-section">
                <h2>Explora Nuestros Destinos</h2>
                <div class="carousel-container">
                    <div class="carousel">
                        <div class="carousel-item active">
                            <img src="images/carrusel/desierto-ica.jpg" alt="Desierto de Ica">
                            <div class="caption">Desierto de Ica</div>
                        </div>
                        <div class="carousel-item">
                            <img src="images/carrusel/Machupichu.jpg" alt="Machu Picchu">
                            <div class="caption">Machu Picchu</div>
                        </div>
                        <div class="carousel-item">
                            <img src="images/carrusel/plaza-arequipa.jpg" alt="Plaza de Armas de Arequipa">
                            <div class="caption">Plaza de Armas de Arequipa</div>
                        </div>
                        <div class="carousel-item">
                            <img src="images/carrusel/mancora.jpg" alt="Máncora">
                            <div class="caption">Máncora</div>
                        </div>
                        <div class="carousel-item">
                            <img src="images/carrusel/Piura.jpg" alt="Piura">
                            <div class="caption">Piura</div>
                        </div>
                    </div>
                    <button class="carousel-btn prev">&#10094;</button>
                    <button class="carousel-btn next">&#10095;</button>
                </div>
            </section>











    <section class="featured-destinations">
        <h2>Destinos Destacados</h2>
        <div class="destinations-grid">
            <div class="destination-card">
                <img src="images/paris.jpg" alt="París">
                <h3>París</h3>
                <p>La ciudad del amor y la cultura.</p>
            </div>
            <div class="destination-card">
                <img src="images/new-york.jpg" alt="Nueva York">
                <h3>Nueva York</h3>
                <p>La ciudad que nunca duerme.</p>
            </div>
            <div class="destination-card">
                <img src="images/tokyo.jpg" alt="Tokio">
                <h3>Tokio</h3>
                <p>La fusión perfecta entre tradición y modernidad.</p>
            </div>
        </div>
    </section>
</main>

<?php include 'includes/footer.php'; ?>