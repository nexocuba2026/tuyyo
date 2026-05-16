$(document).ready(function() {
    const flipbook = $('#flipbook');
    flipbook.turn({
        width: 600,
        height: 400,
        autoCenter: true,
        display: 'double',
        acceleration: true
    });

    // Ajuste en móviles
    if (window.innerWidth < 700) {
        flipbook.turn('size', window.innerWidth * 0.9, (window.innerWidth * 0.9) / 1.5);
    }
});
