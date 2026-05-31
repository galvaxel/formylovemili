

const tarjetaHoy = document.getElementById("hoy");

let indiceActual = 0;
let abierto = false;

function mostrarRecuerdo(indice) {

    const recuerdo = recuerdos[indice];

    const contenido = tarjetaHoy.querySelector(".contenido-recuerdo");

    switch (recuerdo.tipo) {

        case "texto":

            contenido.innerHTML = `
                <h3>${recuerdo.titulo}</h3>
                <p>${recuerdo.texto}</p>
            `;

            break;

        case "imagen":

            contenido.innerHTML = `
                <h3>${recuerdo.titulo}</h3>
                <img src="${recuerdo.imagen}">
            `;

            break;

        default:

            contenido.innerHTML = `
                <p>Tipo no soportado</p>
            `;
    }
}

tarjetaHoy.addEventListener("click", function() {

    if (abierto) return;

    abierto = true;

    mostrarRecuerdo(0);
});