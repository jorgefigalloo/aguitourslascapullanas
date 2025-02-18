document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada correctamente');
});



// Activa/desactiva el menú al hacer clic en el botón
document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.menu').classList.toggle('active');
});

// Cierra el menú cuando se hace clic en un enlace
document.querySelectorAll('.menu li a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.menu').classList.remove('active');
    });
});



/* CARRUSEL  */ 


// Carrusel
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    let currentIndex = 0;

    function updateCarousel() {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    }

    // Eventos para los botones
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Cambio automático cada 5 segundos
    setInterval(showNext, 5000);
});



// Carrusel
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const indicators = document.querySelectorAll('.indicator');

    let currentIndex = 0;

    function updateCarousel() {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;

        // Actualiza los indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    }

    // Eventos para los botones
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Eventos para los indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });

    // Cambio automático cada 5 segundos
    setInterval(showNext, 5000);
});



/* PREGUNTAS EN NOSOTROS  */ 


// Funcionalidad para abrir/cerrar respuestas en la sección FAQ
document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;

            // Alternar la clase 'active' en la respuesta
            answer.classList.toggle('active');

            // Alternar el símbolo "+" o "-" en el botón
            if (answer.classList.contains('active')) {
                question.textContent = question.textContent.replace('+', '-');
            } else {
                question.textContent = question.textContent.replace('-', '+');
            }
        });
    });
});