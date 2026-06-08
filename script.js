//TARJETAS DE CARRUSELLL

const carrusel = document.getElementById("carrusel");

const MODO_PRUEBA = false;

const FECHA_INICIO_REAL = new Date(2026, 5, 12, 19, 3, 0);
const FECHA_INICIO_PRUEBA = new Date(2026, 4, 25, 19, 3, 0);

const FECHA_INICIO = MODO_PRUEBA ? FECHA_INICIO_PRUEBA : FECHA_INICIO_REAL;

const indiceHoyGuardado = localStorage.getItem("hoyAbierto");

function obtenerIndiceDelDia() {
    const ahora = new Date();

    const diff = Math.floor((ahora - FECHA_INICIO) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
        return 0;
    }

    return Math.min(diff, recuerdos.length - 1);
}

function obtenerFechaRecuerdo(indice) {
    const fecha = new Date(FECHA_INICIO);

    fecha.setDate(fecha.getDate() + indice);

    return fecha.toLocaleDateString("es-AR");
}

// DRAG + INERCIA DEL CARRUSEL

let estaArrastrando = false;
let arranqueX = 0;
let scrollArranque = 0;
let huboArrastre = false;

let ultimaX = 0;
let ultimoTiempo = 0;
let velocidad = 0;
let animacionInercia = null;

function scrollCentradoHoy() {
    const hoy = document.getElementById("hoy");

    if (!hoy) return 0;

    return hoy.offsetLeft - (carrusel.clientWidth / 2) + (hoy.offsetWidth / 2);
}

function centrarHoy(suave = true) {
    carrusel.scrollTo({
        left: scrollCentradoHoy(),
        behavior: suave ? "smooth" : "auto"
    });
}

function limiteScrollDerecha() {
    const tarjetaTimer = document.getElementById("timer")?.closest(".tarjeta");

    if (!tarjetaTimer) {
        return carrusel.scrollWidth - carrusel.clientWidth;
    }

    return tarjetaTimer.offsetLeft + tarjetaTimer.offsetWidth - carrusel.clientWidth + 80;
}

function limitarScroll(valor) {
    return Math.max(0, Math.min(valor, limiteScrollDerecha()));
}

function activarModoDeslizando() {
    document.body.classList.remove("modo-hoy");
    document.body.classList.add("modo-deslizando");
}

function volverAHoy() {
    document.body.classList.remove("modo-deslizando");
    document.body.classList.add("modo-hoy");

    setTimeout(() => {
        centrarHoy(true);
    }, 120);
}

function activarModoHoyInicial() {
    document.body.classList.remove("modo-deslizando");
    document.body.classList.add("modo-hoy");

    setTimeout(() => {
        centrarHoy(false);
    }, 120);
}

function crearBotonHome() {
    if (document.getElementById("boton-home")) return;

    const boton = document.createElement("button");

    boton.id = "boton-home";
    boton.textContent = "♡ HOY";

    boton.addEventListener("click", function() {
        volverAHoy();
    });

    document.body.appendChild(boton);
}

function ajustarSiEstaCercaDelCentro() {
    const centroHoy = scrollCentradoHoy();
    const distancia = Math.abs(carrusel.scrollLeft - centroHoy);

    if (distancia < 120) {
        centrarHoy(true);
    }
}

function aplicarInercia() {
    if (Math.abs(velocidad) < 0.15) {
        ajustarSiEstaCercaDelCentro();
        return;
    }

    let nuevoScroll = carrusel.scrollLeft - velocidad * 16;

    nuevoScroll = limitarScroll(nuevoScroll);

    carrusel.scrollLeft = nuevoScroll;

    velocidad *= 0.95;

    animacionInercia = requestAnimationFrame(aplicarInercia);
}

carrusel.addEventListener("mousedown", function(e) {
    if (e.button !== 0) return;

    if (animacionInercia) {
        cancelAnimationFrame(animacionInercia);
    }

    estaArrastrando = true;
    huboArrastre = false;

    arranqueX = e.pageX;
    scrollArranque = carrusel.scrollLeft;

    ultimaX = e.pageX;
    ultimoTiempo = Date.now();
    velocidad = 0;

    carrusel.classList.add("arrastrando");

    e.preventDefault();
});

window.addEventListener("mousemove", function(e) {
    if (!estaArrastrando) return;

    const movimiento = e.pageX - arranqueX;

    if (Math.abs(movimiento) > 6) {
        huboArrastre = true;
        activarModoDeslizando();
    }

    let nuevoScroll = scrollArranque - movimiento;

    nuevoScroll = limitarScroll(nuevoScroll);

    carrusel.scrollLeft = nuevoScroll;

    const ahora = Date.now();
    const diferenciaX = e.pageX - ultimaX;
    const diferenciaTiempo = ahora - ultimoTiempo;

    if (diferenciaTiempo > 0) {
        velocidad = diferenciaX / diferenciaTiempo;
    }

    ultimaX = e.pageX;
    ultimoTiempo = ahora;
});

window.addEventListener("mouseup", function() {
    if (!estaArrastrando) return;

    estaArrastrando = false;
    carrusel.classList.remove("arrastrando");

    aplicarInercia();

    setTimeout(() => {
        huboArrastre = false;
    }, 100);
});

carrusel.addEventListener("click", function(e) {
    if (huboArrastre) {
        e.preventDefault();
        e.stopPropagation();
    }
}, true);

// GENERAR TARJETAS

function generarTarjetas() {
    carrusel.innerHTML = "";

    carrusel.innerHTML += `
    <div class="espaciador"></div>
`;

    const indiceHoy = obtenerIndiceDelDia();

    // recuerdos viejos
    for (let i = 0; i < indiceHoy - 1; i++) {
        carrusel.innerHTML += `
            <div class="tarjeta recuerdo-bloqueado" data-indice="${i}">
                <h2>${obtenerFechaRecuerdo(i)}</h2>
                <div class="contenido-recuerdo">
                    <img src="assets/imagenes/portada.jpg">
                </div>
            </div>
        `;
    }

    // AYER
    if (indiceHoy > 0) {
        carrusel.innerHTML += `
            <div class="tarjeta" id="ayer">
                <h2>AYER</h2>
                <div class="contenido-recuerdo">
                    <img src="assets/imagenes/portada.jpg">
                </div>
            </div>
        `;
    }

    // HOY
    carrusel.innerHTML += `
        <div class="tarjeta" id="hoy">
            <h2>HOY</h2>
            <div class="contenido-recuerdo">
                🎀 Abrir 🎀
            </div>
        </div>
    `;

    // TIMER
    carrusel.innerHTML += `
        <div class="tarjeta">
            <div id="timer">⏳</div>
        </div>
    `;

    // ESPACIADOR DERECHO
    carrusel.innerHTML += `
        <div class="espaciador"></div>
    `;

    activarClicks();

    if (indiceHoyGuardado !== null && Number(indiceHoyGuardado) === indiceHoy) {
        const hoy = document.getElementById("hoy");

        if (hoy) {
            mostrarRecuerdo(hoy, indiceHoy);
        }
    }

    iniciarTimer();

crearBotonHome();
activarModoHoyInicial();
}

// CONVERSORES DE LINKS

function convertirYoutube(url) {
    const id = url.split("v=")[1];

    return `https://www.youtube.com/embed/${id}`;
}

function convertirSpotify(url) {
    return url.replace(
        "open.spotify.com/",
        "open.spotify.com/embed/"
    );
}

// RENDER DE CONTENIDO

function renderContenido(item) {
    if (item.tipo === "imagen") {
        return `<img src="${item.imagen}">`;
    }

    if (item.tipo === "gif") {
        return `<img src="${item.gif}">`;
    }

    if (item.tipo === "texto") {
        return `<p>${item.texto}</p>`;
    }

    if (item.tipo === "video") {
        return `
            <video controls>
                <source src="${item.video}" type="video/mp4">
            </video>
        `;
    }

    if (item.tipo === "spotify") {
        return `
            <iframe
                src="${convertirSpotify(item.url)}">
            </iframe>
        `;
    }

    if (item.tipo === "youtube") {
        return `
            <iframe
                src="${convertirYoutube(item.url)}"
                allowfullscreen>
            </iframe>
        `;
    }

    return "";
}

function mostrarRecuerdo(tarjeta, indice) {
    const recuerdo = recuerdos[indice];

    let contenidoHTML = "";

    if (recuerdo.tipo === "combo") {
    const contenido = recuerdo.contenido
        .map(item => renderContenido(item))
        .join("");

    const titulo = tarjeta.querySelector("h2")?.innerText || "";

    if (tarjeta.id === "hoy") {
        tarjeta.innerHTML = `
            <div class="contenido-combo contenido-combo-hoy">
                ${contenido}
            </div>
        `;
    } else {
        tarjeta.innerHTML = `
            <h2>${titulo}</h2>

            <div class="contenido-combo">
                ${contenido}
            </div>
        `;
    }

    return;
}

    if (recuerdo.tipo === "imagen") {
        contenidoHTML = `
            <div class="contenido-recuerdo">
                <img src="${recuerdo.imagen}">
            </div>
            ${recuerdo.texto ? `<p>${recuerdo.texto}</p>` : ""}
        `;
    }

    if (recuerdo.tipo === "gif") {
        contenidoHTML = `
            <div class="contenido-recuerdo">
                <img src="${recuerdo.gif}">
            </div>
            ${recuerdo.texto ? `<p>${recuerdo.texto}</p>` : ""}
        `;
    }

    if (recuerdo.tipo === "video") {
        contenidoHTML = `
            <div class="contenido-recuerdo">
                <video controls>
                    <source src="${recuerdo.video}" type="video/mp4">
                </video>
            </div>
            ${recuerdo.texto ? `<p>${recuerdo.texto}</p>` : ""}
        `;
    }

    if (recuerdo.tipo === "texto") {
        contenidoHTML = `
            <div class="contenido-recuerdo">
                <p>${recuerdo.texto}</p>
            </div>
        `;
    }

    if (recuerdo.tipo === "spotify") {
        contenidoHTML = `
            <div class="contenido-recuerdo">
                <iframe
                    src="${convertirSpotify(recuerdo.url)}">
                </iframe>
            </div>

            ${recuerdo.texto ? `<p>${recuerdo.texto}</p>` : ""}
        `;
    }

    if (recuerdo.tipo === "youtube") {
        contenidoHTML = `
            <div class="contenido-recuerdo">
                <iframe
                    src="${convertirYoutube(recuerdo.url)}"
                    allowfullscreen>
                </iframe>
            </div>

            ${recuerdo.texto ? `<p>${recuerdo.texto}</p>` : ""}
        `;
    }

    const titulo = tarjeta.querySelector("h2")?.innerText || "";

    if (tarjeta.id === "hoy") {
        tarjeta.innerHTML = `
            ${contenidoHTML}
        `;
    } else {
        tarjeta.innerHTML = `
            <h2>${titulo}</h2>
            ${contenidoHTML}
        `;
    }
}

// CLICKS DE TARJETAS

function activarClicks() {
    const indiceHoy = obtenerIndiceDelDia();

    const hoy = document.getElementById("hoy");

if (hoy) {
    hoy.addEventListener("click", () => {

        if (document.body.classList.contains("modo-deslizando")) {
            volverAHoy();
            return;
        }

        mostrarRecuerdo(hoy, indiceHoy);

        localStorage.setItem(
            "hoyAbierto",
            indiceHoy
        );
    });
}

    const ayer = document.getElementById("ayer");

    if (ayer && indiceHoy > 0) {
        ayer.addEventListener("click", () => {
            mostrarRecuerdo(ayer, indiceHoy - 1);
        });
    }

    const viejos = document.querySelectorAll(".recuerdo-bloqueado");

    viejos.forEach(tarjeta => {
        tarjeta.addEventListener("click", () => {
            const indice = Number(tarjeta.dataset.indice);

            mostrarRecuerdo(tarjeta, indice);
        });
    });
}

// TIMER

function tiempoHastaDesbloqueo() {
    const ahora = new Date();
    const objetivo = new Date();

    objetivo.setHours(19, 3, 0, 0);

    if (ahora > objetivo) {
        objetivo.setDate(objetivo.getDate() + 1);
    }

    return objetivo - ahora;
}

function iniciarTimer() {
    const timer = document.getElementById("timer");

    let indiceAnterior = obtenerIndiceDelDia();

    function actualizar() {
        const indiceActual = obtenerIndiceDelDia();

        if (indiceActual !== indiceAnterior) {
            localStorage.removeItem("hoyAbierto");
            generarTarjetas();
            return;
        }

        const ms = tiempoHastaDesbloqueo();

        const horas = Math.floor(ms / (1000 * 60 * 60));
        const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((ms % (1000 * 60)) / 1000);

        timer.innerHTML = `⏳ ${horas}h ${minutos}m ${segundos}s`;

        requestAnimationFrame(actualizar);
    }

    actualizar();
}

generarTarjetas();