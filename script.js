//TARJETAS DE CARRUSELLL

const carrusel = document.getElementById("carrusel");

const MODO_PRUEBA = false;

const FECHA_INICIO_REAL = new Date(2026, 5, 12, 19, 3, 0);
const FECHA_INICIO_PRUEBA = new Date(2026, 4, 25, 19, 3, 0);

const FECHA_INICIO = MODO_PRUEBA ? FECHA_INICIO_PRUEBA : FECHA_INICIO_REAL;

// FIREBASE

const firebaseConfig = {
    apiKey: "AIzaSyAw0QwhQtwgXawEkeb550FtsgSxS-dABGo",
    authDomain: "mili-te-amomucho.firebaseapp.com",
    databaseURL: "https://mili-te-amomucho-default-rtdb.firebaseio.com",
    projectId: "mili-te-amomucho",
    storageBucket: "mili-te-amomucho.firebasestorage.app",
    messagingSenderId: "260667329582",
    appId: "1:260667329582:web:d71bb0cc52ad91af6be3bf"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const rachaRef = database.ref("racha/mili");

///LOGICA DE LO DE HOY

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

//MES PARA VIDAS DE RACHA!!

function obtenerMesActual() {
    const ahora = new Date();

    return `${ahora.getFullYear()}-${ahora.getMonth() + 1}`;
}

function crearPanelRacha() {
    if (document.getElementById("panel-racha")) return;

    const panel = document.createElement("div");

    panel.id = "panel-racha";

    panel.innerHTML = `
        <div class="racha-compacta">
            <span class="racha-icono">🔥</span>
            <span id="racha-numero">0</span>
        </div>

        <div class="racha-detalle">
            <div class="racha-linea">🔥 Racha: <span id="racha-numero-detalle">0</span></div>
            <div class="racha-linea">❤️ Vidas: <span id="vidas-numero">3</span>/3</div>
        </div>
    `;

    panel.addEventListener("click", function() {
        panel.classList.toggle("abierto");
    });

    document.body.appendChild(panel);
}

function actualizarPanelRacha(datos) {
    const rachaNumero = document.getElementById("racha-numero");
    const rachaNumeroDetalle = document.getElementById("racha-numero-detalle");
    const vidasNumero = document.getElementById("vidas-numero");

    if (!rachaNumero || !rachaNumeroDetalle || !vidasNumero) return;

    const racha = datos?.rachaActual ?? 0;
    const vidas = datos?.vidasRestantes ?? 3;

    rachaNumero.textContent = racha;
    rachaNumeroDetalle.textContent = racha;
    vidasNumero.textContent = vidas;
}

function escucharRacha() {
    crearPanelRacha();

    rachaRef.on("value", function(snapshot) {
        actualizarPanelRacha(snapshot.val());
    });
}

function registrarAperturaDeHoy(indiceHoy) {
    const mesActual = obtenerMesActual();

    rachaRef.transaction(function(datos) {

        if (!datos) {
            return {
                rachaActual: 1,
                ultimoIndiceCheck: indiceHoy,
                vidasRestantes: 3,
                mesVidas: mesActual
            };
        }

        if (datos.mesVidas !== mesActual) {
            datos.vidasRestantes = 3;
            datos.mesVidas = mesActual;
        }

        if (datos.ultimoIndiceCheck === indiceHoy) {
            return datos;
        }

        if (datos.ultimoIndiceCheck === null || datos.ultimoIndiceCheck === undefined) {
            datos.rachaActual = 1;
            datos.ultimoIndiceCheck = indiceHoy;
            return datos;
        }

        const diasSaltados = indiceHoy - datos.ultimoIndiceCheck - 1;

        if (diasSaltados <= 0) {
            datos.rachaActual = (datos.rachaActual || 0) + 1;
        } else {
            if (datos.vidasRestantes >= diasSaltados) {
                datos.vidasRestantes -= diasSaltados;
                datos.rachaActual = (datos.rachaActual || 0) + 1;
            } else {
                datos.rachaActual = 1;
                datos.vidasRestantes = 0;
            }
        }

        datos.ultimoIndiceCheck = indiceHoy;

        return datos;
    });
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
escucharRacha();
activarModoHoyInicial();
}

// CONVERSORES DE LINKS

function convertirYoutube(url) {
    if (!url) return "";

    try {
        const urlObj = new URL(url);

        if (urlObj.hostname.includes("youtu.be")) {
            return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
        }

        if (urlObj.pathname.includes("/shorts/")) {
            const id = urlObj.pathname.split("/shorts/")[1];
            return `https://www.youtube.com/embed/${id}`;
        }

        const id = urlObj.searchParams.get("v");

        if (id) {
            return `https://www.youtube.com/embed/${id}`;
        }

        return url;
    } catch {
        return "";
    }
}

function convertirSpotify(url) {
    if (!url) return "";

    return url.replace(
        "open.spotify.com/",
        "open.spotify.com/embed/"
    );
}

// SEGURIDAD / FALLBACKS

function escaparHTML(texto) {
    if (!texto) return "";

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function recuerdoError(mensaje = "Este recuerdo se escondió :(") {
    return `
        <div class="contenido-recuerdo recuerdo-error">
            <p>${mensaje}</p>
        </div>
    `;
}

// RENDER DE CONTENIDO

function renderContenido(item) {
    if (!item || !item.tipo) {
        return recuerdoError("Este pedacito del recuerdo está incompleto :(");
    }

    if (item.tipo === "imagen") {
        if (!item.imagen) return recuerdoError("Falta la imagen :(");

        return `<img src="${item.imagen}" alt="recuerdo">`;
    }

    if (item.tipo === "gif") {
        if (!item.gif) return recuerdoError("Falta el gif :(");

        return `<img src="${item.gif}" alt="gif del recuerdo">`;
    }

    if (item.tipo === "texto") {
        if (!item.texto) return recuerdoError("Falta el texto :(");

        return `<p>${escaparHTML(item.texto)}</p>`;
    }

    if (item.tipo === "video") {
        if (!item.video) return recuerdoError("Falta el video :(");

        return `
            <video controls>
                <source src="${item.video}" type="video/mp4">
            </video>
        `;
    }

    if (item.tipo === "spotify") {
        if (!item.url) return recuerdoError("Falta el link de Spotify :(");

        return `
            <iframe
                src="${convertirSpotify(item.url)}">
            </iframe>
        `;
    }

    if (item.tipo === "youtube") {
        if (!item.url) return recuerdoError("Falta el link de YouTube :(");

        return `
            <iframe
                src="${convertirYoutube(item.url)}"
                allowfullscreen>
            </iframe>
        `;
    }

    return recuerdoError(`Tipo de recuerdo no reconocido: ${escaparHTML(item.tipo)}`);
}

function mostrarRecuerdo(tarjeta, indice) {
    const recuerdo = recuerdos[indice];

    if (!recuerdo) {
        tarjeta.innerHTML = recuerdoError("Todavía no hay recuerdo para este día :(");
        return;
    }

    let contenidoHTML = "";

    if (recuerdo.tipo === "combo") {
        if (!Array.isArray(recuerdo.contenido)) {
            tarjeta.innerHTML = recuerdoError("Este combo está mal armado :(");
            return;
        }

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
        if (!recuerdo.imagen) {
            contenidoHTML = recuerdoError("Falta la imagen :(");
        } else {
            contenidoHTML = `
                <div class="contenido-recuerdo">
                    <img src="${recuerdo.imagen}" alt="recuerdo">
                </div>
                ${recuerdo.texto ? `<p>${escaparHTML(recuerdo.texto)}</p>` : ""}
            `;
        }
    }

    if (recuerdo.tipo === "gif") {
        if (!recuerdo.gif) {
            contenidoHTML = recuerdoError("Falta el gif :(");
        } else {
            contenidoHTML = `
                <div class="contenido-recuerdo">
                    <img src="${recuerdo.gif}" alt="gif del recuerdo">
                </div>
                ${recuerdo.texto ? `<p>${escaparHTML(recuerdo.texto)}</p>` : ""}
            `;
        }
    }

    if (recuerdo.tipo === "video") {
        if (!recuerdo.video) {
            contenidoHTML = recuerdoError("Falta el video :(");
        } else {
            contenidoHTML = `
                <div class="contenido-recuerdo">
                    <video controls>
                        <source src="${recuerdo.video}" type="video/mp4">
                    </video>
                </div>
                ${recuerdo.texto ? `<p>${escaparHTML(recuerdo.texto)}</p>` : ""}
            `;
        }
    }

    if (recuerdo.tipo === "texto") {
        if (!recuerdo.texto) {
            contenidoHTML = recuerdoError("Falta el texto :(");
        } else {
            contenidoHTML = `
                <div class="contenido-recuerdo">
                    <p>${escaparHTML(recuerdo.texto)}</p>
                </div>
            `;
        }
    }

    if (recuerdo.tipo === "spotify") {
        if (!recuerdo.url) {
            contenidoHTML = recuerdoError("Falta el link de Spotify :(");
        } else {
            contenidoHTML = `
                <div class="contenido-recuerdo">
                    <iframe
                        src="${convertirSpotify(recuerdo.url)}">
                    </iframe>
                </div>

                ${recuerdo.texto ? `<p>${escaparHTML(recuerdo.texto)}</p>` : ""}
            `;
        }
    }

    if (recuerdo.tipo === "youtube") {
        if (!recuerdo.url) {
            contenidoHTML = recuerdoError("Falta el link de YouTube :(");
        } else {
            contenidoHTML = `
                <div class="contenido-recuerdo">
                    <iframe
                        src="${convertirYoutube(recuerdo.url)}"
                        allowfullscreen>
                    </iframe>
                </div>

                ${recuerdo.texto ? `<p>${escaparHTML(recuerdo.texto)}</p>` : ""}
            `;
        }
    }

    if (!contenidoHTML) {
        contenidoHTML = recuerdoError(`Tipo de recuerdo no reconocido: ${escaparHTML(recuerdo.tipo)}`);
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

    registrarAperturaDeHoy(indiceHoy);
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