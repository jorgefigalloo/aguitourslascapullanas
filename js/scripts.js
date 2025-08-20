document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada correctamente');

    // ----------------------
    // Funcionalidad del Menú
    // ----------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    if (menuToggle && menu) {
        // Activa/desactiva el menú al hacer clic en el botón
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        // Cierra el menú cuando se hace clic en un enlace
        document.querySelectorAll('.menu li a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
            });
        });
    }


    // ----------------------
    // Carrusel de la página de inicio
    // ----------------------
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const indicators = document.querySelectorAll('.indicator');

    if (carousel && items.length > 0) {
        let currentIndex = 0;

        function updateCarousel() {
            const offset = -currentIndex * 100;
            carousel.style.transform = `translateX(${offset}%)`;

            if (indicators.length > 0) {
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentIndex);
                });
            }
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % items.length;
            updateCarousel();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel();
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', showNext);
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', showPrev);
        }

        if (indicators.length > 0) {
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    currentIndex = index;
                    updateCarousel();
                });
            });
        }

        setInterval(showNext, 5000);
    }


    // ----------------------
    // Funcionalidad de preguntas frecuentes (FAQ)
    // ----------------------
    const faqQuestions = document.querySelectorAll('.faq-question');

    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                answer.classList.toggle('active');

                // Alternar el símbolo "+" o "-" en el botón
                const symbol = question.querySelector('span');
                if (symbol) {
                    symbol.textContent = answer.classList.contains('active') ? '-' : '+';
                }
            });
        });
    }

    // ----------------------
    // Funcionalidad de Modales (Destinos)
    // ----------------------
    const imagePreviews = document.querySelectorAll('.image-preview');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    if (imagePreviews.length > 0 && modals.length > 0) {
        // Abrir modal al hacer clic en la imagen
        imagePreviews.forEach((preview, index) => {
            preview.addEventListener('click', (e) => {
                e.preventDefault();
                modals[index].style.display = 'block';
            });
        });

        // Cerrar modal al hacer clic en la "X"
        closeButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                modals[index].style.display = 'none';
            });
        });

        // Cerrar modal al hacer clic fuera de la imagen
        window.addEventListener('click', (e) => {
            modals.forEach((modal) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
});