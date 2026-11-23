
let listaProductos = []

async function cargarProductos() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/products/");
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const data = await respuesta.json();
    listaProductos = Array.isArray(data.payload) ? data.payload : [];

    ProductosPorPagina(1);
  } catch (error) {
    console.error("No se pudieron cargar los productos:", error);
  }
}

let paginaActual = 1;
const productosPorPagina = 10; // 2 filas x 5 columnas

function ProductosPorPagina(pagina) {
  // Obtiene y limpia la vista antes de procesarla
  const viewProducts = document.querySelector(".view-products");
  viewProducts.innerHTML= "";

  // Divide la cantidad de productos entre la cantidad de productos por pagina y aplica 0 para descartar decimales
  let totalPaginas = (listaProductos.length / productosPorPagina) | 0;
  if (listaProductos.length % productosPorPagina !== 0) {
      totalPaginas += 1;
  }

  // Fuerza una pagina en caso de no haber productos
  if (totalPaginas < 1) {
      totalPaginas = 1;
  }

  
  let paginaSolicitada = pagina;
  if (paginaSolicitada < 1) {
      paginaSolicitada = 1;
  }
  
  if (paginaSolicitada > totalPaginas) {
      paginaSolicitada = totalPaginas;
  }

  paginaActual = paginaSolicitada;
  actualizarControlesPaginacion(totalPaginas);

  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = listaProductos.slice(inicio, fin);

  productosPagina.forEach(p => {
      let card = `
          <div class="modal-card">
              <img src="${p.image}" alt="" class="product-img">
              <h1>${p.name}</h1>
              <p>${p.price}</p>
          </div>
      `;
      viewProducts.innerHTML += card
  })
}

const btnPrevPage = document.getElementById("btn-prev-page");
const btnNextPage = document.getElementById("btn-next-page");
const pageInfo = document.getElementById("page-info");

function actualizarControlesPaginacion(totalPaginas) {
  if (pageInfo) {
    pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  }
  if (btnPrevPage) {
    btnPrevPage.disabled = paginaActual <= 1;
  }
  if (btnNextPage) {
    btnNextPage.disabled = paginaActual >= totalPaginas;
  }
}

if (btnPrevPage) {
  btnPrevPage.addEventListener("click", () => {
    ProductosPorPagina(paginaActual - 1);
  });
}

if (btnNextPage) {
  btnNextPage.addEventListener("click", () => {
    ProductosPorPagina(paginaActual + 1);
  });
}

// MOSTRAR VISTAS - Unico Archivo HTML

const viewApp = ["welcome", "menu", "cart", "ticket"];
const botones = document.querySelectorAll(".nav-position button[data-vista]");
const secciones = document.querySelectorAll(".screen-view");

function mostrarVista(nombreVista) {
    const vistaActiva = viewApp.includes(nombreVista) ? nombreVista : "welcome";

    secciones.forEach((sec) => {
    sec.classList.toggle("active", sec.id === `view-${vistaActiva}`);
    });

    botones.forEach((btn) => {
    if (btn.dataset.vista === vistaActiva) {
        btn.setAttribute("aria-current", "page");
    } else {
        btn.removeAttribute("aria-current");
    }
    });

    const nuevoHash = `#${vistaActiva}`;
    if (window.location.hash !== nuevoHash) {
    history.pushState(null, "", nuevoHash);
    }
}

botones.forEach((btn) => {
    btn.addEventListener("click", () => mostrarVista(btn.dataset.vista));
});

window.addEventListener("popstate", () => {
    const vistaDesdeUrl = window.location.hash.replace("#", "");
    mostrarVista(vistaDesdeUrl);
});

// Carga inicial según el hash actual o "inicio" por defecto
mostrarVista(window.location.hash.replace("#", ""));


function init() {
    if (document.querySelector(".screen-view")) {
        mostrarVista(window.location.hash.replace("#", ""));
    }
    if (document.querySelector(".view-products")) {
        cargarProductos();
    }
}

init()