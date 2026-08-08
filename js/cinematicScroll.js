/**
 * AGUITOURS LAS CAPULLANAS - MOTOR DE SCROLL CINEMATOGRÁFICO (GSAP + SCROLLTRIGGER)
 * Parallax multicapa con scrub sincronizado 1:1, zoom de cámara y adaptabilidad mobile.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Registrar el plugin ScrollTrigger de GSAP
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        inicializarAnimacionesCinematograficas();
    } else {
        console.warn('GSAP o ScrollTrigger no cargados.');
    }
});

function inicializarAnimacionesCinematograficas() {
    const mm = gsap.matchMedia();

    // 1. CONFIGURACIÓN PARA DESKTOP Y PANTALLAS GRANDES (> 768px)
    mm.add("(min-width: 769px)", () => {
        
        // Timeline principal del Hero con Pin & Zoom Cinematográfico
        const heroTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#cinematic-hero-wrapper",
                start: "top top",
                end: "+=120%", // Extender la duración del scroll
                scrub: 1.2,    // Sensación suave de resistencia (camera feel)
                pin: true,     // Bloquear la pantalla mientras la animación transcurre
                anticipatePin: 1
            }
        });

        // Animación A: Zoom in de la imagen de fondo (de scale 0.75 a scale 1.2)
        heroTimeline.to("#hero-zoom-img", {
            scale: 1.25,
            ease: "none"
        }, 0);

        // Animación B: Movimiento y desvanecimiento progresivo del texto (Parallax 3D)
        heroTimeline.to("#hero-text-layer", {
            y: -150,
            opacity: 0,
            ease: "power1.out"
        }, 0);

        // Animación C: Animación de entrada fluida para las tarjetas de paquetes
        gsap.from(".paquete-card", {
            scrollTrigger: {
                trigger: "#paquetes-grid-container",
                start: "top 80%",
                end: "top 30%",
                scrub: 1
            },
            y: 80,
            opacity: 0,
            stagger: 0.15,
            duration: 1
        });
    });

    // 2. CONFIGURACIÓN OPTIMIZADA PARA DISPOSITIVOS MÓVILES (<= 768px)
    mm.add("(max-width: 768px)", () => {
        // Reducir la intensidad en móviles para mantener alto rendimiento a 60fps
        const mobileHeroTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#cinematic-hero-wrapper",
                start: "top top",
                end: "+=80%",
                scrub: 0.8,
                pin: true
            }
        });

        mobileHeroTimeline.to("#hero-zoom-img", {
            scale: 1.1,
            ease: "none"
        }, 0);

        mobileHeroTimeline.to("#hero-text-layer", {
            y: -60,
            opacity: 0.2,
            ease: "power1.out"
        }, 0);
    });
}
