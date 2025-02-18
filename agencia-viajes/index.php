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
                            <img src="images/carrusel/cuzco.jpg" alt="Machu Picchu">
                            <div class="caption">Machu Picchu</div>
                        </div>
                        <div class="carousel-item">
                            <img src="images/carrusel/plaza-arequipa.jpg" alt="Arequipa">
                            <div class="caption">Arequipa</div>
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



                        <div class="carousel-indicators">
                <span class="indicator active" data-index="0"></span>
                <span class="indicator" data-index="1"></span>
                <span class="indicator" data-index="2"></span>
                <span class="indicator" data-index="3"></span>
                <span class="indicator" data-index="4"></span>
            </div>








    <section class="featured-destinations">
        <h2>Destinos Destacados Nacionales</h2>
        <div class="destinations-grid">
            <div class="destination-card">
                <img src="images/ciudades/nacionales/arequipa.png" alt="Arequipa">
                <h3>Arequipa</h3>
                <p>La ciudad del amor y la cultura.</p>
            </div>
            <div class="destination-card">
                <img src="images/ciudades/nacionales/cuzco.png" alt="Cuzco">
                <h3>Cuzco</h3>
                <p>La ciudad que nunca duerme.</p>
            </div>
            <div class="destination-card">
                <img src="images/ciudades/nacionales/tarapoto.png" alt="Tarapoto">
                <h3>Tarapoto</h3>
                <p>La fusión perfecta entre tradición y modernidad.</p>
            </div>
        </div>

        <br>
        <a href="destinos.php" class="btn">Ver Destinos</a> 
    </section>
</main>

<?php include 'includes/footer.php'; ?>