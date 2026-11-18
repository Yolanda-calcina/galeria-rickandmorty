const URL_BASE = "https://rickandmortyapi.com/api/character";
let paginaActual = 1;
let totalPaginas = 42;

// Referencias a elementos del HTML
const contenedor = document.getElementById("contenedor-personajes");
const mensajeError = document.getElementById("mensaje-error");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const infoPagina = document.getElementById("info-pagina");

// Instancia del Modal de Bootstrap
const modalBootstrap = new bootstrap.Modal(document.getElementById("modalDetalle"));

// Función para obtener el punto de color según el estado
function obtenerPuntoEstado(status) {
    if (status === "Alive") return '<span class="punto-estado estado-alive"></span>';
    if (status === "Dead") return '<span class="punto-estado estado-dead"></span>';
    return '<span class="punto-estado estado-unknown"></span>';
}

// Función para convertir fecha ISO (2017-11-04T...) a dd/mm/aaaa
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getUTCDate()).padStart(2, "0");
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const anio = fecha.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
}

// 1. Cargar lista de personajes por página
async function cargarPersonajes(pagina) {
    try {
        mensajeError.classList.add("d-none");
        contenedor.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

        const respuesta = await fetch(`${URL_BASE}?page=${pagina}`);
        
        // Validar si la API respondió con error (ej. 404)
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        totalPaginas = datos.info.pages;

        mostrarTarjetas(datos.results);
        actualizarPaginacion(datos.info);

    } catch (error) {
        contenedor.innerHTML = "";
        mensajeError.textContent = "No se pudieron cargar los personajes. Intenta nuevamente más tarde.";
        mensajeError.classList.remove("d-none");
        console.error("Error al obtener personajes:", error);
    }
}

// 2. Dibujar las tarjetas en el HTML
function mostrarTarjetas(personajes) {
    contenedor.innerHTML = "";

    personajes.forEach(personaje => {
        const columna = document.createElement("div");
        columna.className = "col";

        columna.innerHTML = `
            <div class="card card-personaje h-100 text-light">
                <img src="${personaje.image}" class="card-img-top" alt="${personaje.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold mb-1">${personaje.name}</h5>
                    <p class="card-text small mb-3">
                        ${obtenerPuntoEstado(personaje.status)}${personaje.status} - ${personaje.species}
                    </p>
                    <p class="text-secondary small mb-0">Última ubicación:</p>
                    <p class="card-text small mb-3">${personaje.location.name}</p>
                    
                    <!-- mt-auto empuja el botón hasta el final para que todos queden alineados -->
                    <button class="btn btn-success w-100 mt-auto" onclick="verDetalle(${personaje.id})">
                        Detalle
                    </button>
                </div>
            </div>
        `;

        contenedor.appendChild(columna);
    });
}

// 3. Actualizar botones de Anterior y Siguiente
function actualizarPaginacion(info) {
    infoPagina.textContent = `Página ${paginaActual} de ${info.pages}`;
    btnAnterior.disabled = !info.prev;
    btnSiguiente.disabled = !info.next;
}

// 4. Consultar un personaje por ID y abrir el Modal (Imagen 3)
async function verDetalle(id) {
    try {
        const respuesta = await fetch(`${URL_BASE}/${id}`);
        if (!respuesta.ok) throw new Error("No se encontró el detalle del personaje");

        const p = await respuesta.json();

        // Llenar los datos dentro del Modal
        document.getElementById("modalTitulo").textContent = p.name;
        document.getElementById("modalImagen").src = p.image;
        document.getElementById("modalImagen").alt = p.name;
        document.getElementById("modalId").textContent = p.id;
        document.getElementById("modalEstado").innerHTML = `${obtenerPuntoEstado(p.status)}${p.status}`;
        document.getElementById("modalEspecie").textContent = p.species;
        document.getElementById("modalGenero").textContent = p.gender;
        // Si type viene vacío, mostrar "Sin tipo"
        document.getElementById("modalTipo").textContent = p.type ? p.type : "Sin tipo";
        document.getElementById("modalOrigen").textContent = p.origin.name;
        document.getElementById("modalUbicacion").textContent = p.location.name;
        // Cantidad de episodios (longitud del arreglo)
        document.getElementById("modalEpisodios").textContent = p.episode.length;
        // Fecha en formato dd/mm/aaaa
        document.getElementById("modalCreado").textContent = formatearFecha(p.created);

        // Mostrar la ventana modal
        modalBootstrap.show();

    } catch (error) {
        alert("Ocurrió un error al cargar los detalles del personaje.");
        console.error(error);
    }
}

// Eventos de los botones de paginación
btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarPersonajes(paginaActual);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

btnSiguiente.addEventListener("click", () => {
    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarPersonajes(paginaActual);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

// Iniciar cargando la página 1
cargarPersonajes(paginaActual);
