// Obtener elementos del DOM
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const captionText = document.getElementById('caption');
const closeBtn = document.getElementsByClassName('close')[0];

// Abrir modal al hacer clic en una imagen
document.querySelectorAll('.galeria-item').forEach(item => {
    item.addEventListener('click', () => {
        modal.style.display = 'block';
        modalImg.src = item.getAttribute('data-src');
        captionText.innerHTML = item.querySelector('img').alt;
    });
});

// Cerrar modal al hacer clic en la "X"
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

// Cerrar modal al hacer clic fuera de la imagen
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};