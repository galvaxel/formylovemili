
let abiertoHoyHoy = false;

function obtenerIndiceDelDia() {
    const inicio = new Date("2026-01-01");
    const hoy = new Date();

    const diff = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));

    return diff % recuerdos.length;
}

const tarjetaHoy = document.getElementById("hoy");

// click en HOY → se transforma en recuerdo
tarjetaHoy.addEventListener("click", function() {

    if (abiertoHoyHoy) return;

    const recuerdo = recuerdos[obtenerIndiceDelDia()];

    let contenidoHTML = "";

    if (recuerdo.tipo === "imagen") {
        contenidoHTML = `
            <img src="${recuerdo.imagen}">
        `;
    }

    if (recuerdo.tipo === "texto") {
        contenidoHTML = `
            <p>${recuerdo.texto}</p>
        `;
    }

    // 🔥 reemplaza toda la tarjeta HOY
    tarjetaHoy.innerHTML = contenidoHTML;

    abiertoHoyHoy = true;
});


const timer = document.getElementById("timer");

function tiempoHastaDesbloqueo() {
    const ahora = new Date();
    const objetivo = new Date();

    objetivo.setHours(19, 3, 0, 0);

    // si ya pasó hoy, pasa al día siguiente
    if (ahora > objetivo) {
        objetivo.setDate(objetivo.getDate() + 1);
    }

    return objetivo - ahora;
}

function actualizarTimer() {

    const ms = tiempoHastaDesbloqueo();

    const horas = Math.floor(ms / (1000 * 60 * 60));
    const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((ms % (1000 * 60)) / 1000);

    timer.innerHTML = `⏳ ${horas}h ${minutos}m ${segundos}s`;

    requestAnimationFrame(actualizarTimer);
}

actualizarTimer();