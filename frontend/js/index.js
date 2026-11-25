
// ARRAY DE PRODUCTOS
let listaProductos = []

// BOTONES DE LA PAGINACION
const btnPrevPage = document.getElementById("btn-prev-page");
const btnNextPage = document.getElementById("btn-next-page");
const pageInfo = document.getElementById("page-info");

// VARIABLES PARA PAGINACION
let paginaActual = 1;
const productosPorPagina = 10; // 2 filas x 5 columnas

// ARRAY DE VISTAS Y BOTONES DEL NAV
const viewApp = ["welcome", "menu", "cart", "ticket"];
const botones = document.querySelectorAll(".nav-position button[data-vista]");
const secciones = document.querySelectorAll(".screen-view");


// BIENVENIDA - GUARDAR Y ACTUALIZAR NOMBRE ENTRE LAS VISTAS

// Nombre clave para guardar el nombre de usuario en el LocalStorage
const STORAGE_USUARIO = "username";

function guardarNombreUsuario(nombre) {
  // VALIDACION: Comprueba que sea de tipo string, nuevamente elimina espacios en caso de ser String
  const limpio = typeof nombre === "string" ? nombre.trim() : "";
  try {
    // Guarda el resultado en el LocalStorage
    localStorage.setItem(STORAGE_USUARIO, limpio);
  } catch (error) {
    console.error("Error al guardar el nombre de usuario:", error);
  }
  return limpio;
}

function leerNombreUsuario() {
  try {
    // Verifica que exista un String asociado al valor de "username"
    const guardado = localStorage.getItem(STORAGE_USUARIO);
    // VALIDACION: En caso de ser verdadero quita los espacios sobrantes de los extremos, y en caso de que no exista lo devuelve vacio
    return guardado ? guardado.trim() : "";
  } catch (error) {
    console.error("Error al leer el nombre de usuario:", error);
    // Devuelve String Vacio para las funciones que llaman a esta no den un fallo
    return "";
  }
}

// Obtiene las etiquetas de las vistas y las guarda en variantes para luego validarlas e imprimir los mensajes que se necesitan segun la vista
function crearMensajePorNombre(nombreVisible) {
  const saludoEl = document.getElementById("user-greeting");
  if (saludoEl) {
    saludoEl.textContent = `Hola, ${nombreVisible}`;
  }
  const greetingsTicket = document.getElementById("user-greetings");
  if (greetingsTicket) {
    greetingsTicket.textContent = `¡Gracias, ${nombreVisible}!`;
  }
  const userTicket = document.getElementById("user-ticket");
  if (userTicket) {
    userTicket.textContent = `Cliente: ${nombreVisible}`;
  }
}

function actualizarSaludo() {
  // Recupera el nombre guardado en LocalStorage
  const nombre = leerNombreUsuario() || "Usuario";
  crearMensajePorNombre(nombre);
}

function syncInputNombre() {
  // Obtiene el input y llama a la funcion de actualizarSaludo para poner un nombre en el header y valida que exista
  const inputNombre = document.querySelector(".input-name");
  actualizarSaludo();
  if (!inputNombre) return;

  //Si ya habia un nombre preguardado, lo muestra en el input
  const nombreGuardado = leerNombreUsuario();
  if (nombreGuardado && !inputNombre.value) {
    inputNombre.value = nombreGuardado;
  }

  // Mientras escribe, muestra vista previa en el saludo/ticket sin guardar aún en LocalStorage
  inputNombre.addEventListener("input", () => {
    const preview = inputNombre.value.trim() || "Usuario";
    crearMensajePorNombre(preview);
  });
}

// Guarda el boton "Ver el menú" de la vista de bienvenida para validar que exista y luego verificar si se intearctua
const btnMenu = document.getElementById("btn-menu");
if (btnMenu) {
  btnMenu.addEventListener("click", (e) => {
    const inputNombre = document.querySelector(".input-name");
    // Guarda el nombre en LocalStorage recién al apretar "Ver el menú"
    const nombre = guardarNombreUsuario(inputNombre ? inputNombre.value : "");
    if (inputNombre) {
      inputNombre.value = nombre;
    }
    actualizarSaludo();

    // Si estás en la vista de un solo HTML con #view-menu, evita navegar a menu.html; si no, deja que navegue entre archivos HTML
    if (document.getElementById("view-menu")) {
      e.preventDefault();
      if (typeof mostrarVista === "function") {
        mostrarVista("menu");
      }
    }

    return nombre;
  });
}

// MENU



// VISTA DE PRODUCTOS
async function cargarProductos() {
  try {
    // Solicita el listado de productos al endpoint del backend
    const respuesta = await fetch("http://localhost:3000/api/products/");
    // VALIDACION: Comprueba que la respuesta HTTP sea exitosa antes de parsear el JSON
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const data = await respuesta.json();
    // VALIDACION: Asegura que listaProductos sea un array aunque data.payload venga vacío o con otro formato
    listaProductos = Array.isArray(data.payload) ? data.payload : [];

    // Renderiza la primera página del catálogo y sincroniza el carrito una vez cargados los productos
    ProductosPorPagina(1); 
    mostrarCarrito();
  } catch (error) {
    console.error("No se pudieron cargar los productos:", error);
  }
}

function ProductosPorPagina(pagina) {
  // Obtiene y limpia la vista antes de procesarla
  const viewProducts = document.querySelector(".view-products");
  // VALIDACION: Evita fallar si la vista de productos no existe en la página o vista actual
  if (!viewProducts) return;
  viewProducts.innerHTML = "";

  // Divide la cantidad de productos entre la cantidad de productos por pagina y aplica 0 para descartar decimales
  // y generá el total de páginas.
  let totalPaginas = (listaProductos.length / productosPorPagina) | 0;
  // VALIDACION: Suma una página extra si hay productos sobrantes que no completan la grilla
  if (listaProductos.length % productosPorPagina !== 0) {
    totalPaginas += 1;
  }

  // Fuerza una pagina en caso de no haber productos
  if (totalPaginas < 1) {
    totalPaginas = 1;
  }

  // Evita que sobrepase los limites de la pagina, ya sea adelante o atras
  let paginaSolicitada = pagina;
  if (paginaSolicitada < 1) {
    paginaSolicitada = 1;
  }

  if (paginaSolicitada > totalPaginas) {
    paginaSolicitada = totalPaginas;
  }

  paginaActual = paginaSolicitada;
  actualizarControlesPaginacion(totalPaginas);

  // Calcula los indices que tomará de la Lista de productos los cuales mostrara en la vista
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = listaProductos.slice(inicio, fin);

  // Recorre cada producto de la pagina actual y genera su card en HTML, por ultimo lo agrega a la vista
  productosPagina.forEach((p) => {
    let card = `
      <div class="modal-card">
        <img src="${p.image}" alt="" class="product-img">
        <h2 class="product-title">${p.name}</h2>
        <p class="product-price">${p.price}</p>
        <button data-id="${p.id}" class="btn-add">Agregar +</button>
      </div>
    `;
    viewProducts.innerHTML += card;
  });
}

function actualizarControlesPaginacion(totalPaginas) {
  // Si existe generá el texto de la ubicacion actual
  if (pageInfo) {
    pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  }
  // En caso de estar en la primera pagina se desactiva el boton para no retroceder más
  if (btnPrevPage) {
    btnPrevPage.disabled = paginaActual <= 1;
  }
  // En caso de estar en la ultima pagina se desactiva el boton para no avanzar más
  if (btnNextPage) {
    btnNextPage.disabled = paginaActual >= totalPaginas;
  }
}

// Segun el boton que clickee el usuario avanza (se incrementa) o retrocede (se resta) a la pagina actual para navegar entre pagians
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

// CARRITO

// Clave utilizada para persistir el carrito en LocalStorage
const storageCarrito = "localStorage";

function leerCarrito() {
  try {
    // Recupera el carrito guardado en LocalStorage
    const guardado = localStorage.getItem(storageCarrito);
    const parsed = guardado ? JSON.parse(guardado) : [];
    // VALIDACION: Asegura que el valor parseado sea un array para evitar fallos en .map() o .find()
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error al leer el carrito de localStorage:", error);
    // Devuelve array vacío para que el resto de la aplicación siga funcionando sin romperse
    return [];
  }
}

function guardarCarrito() {
  try {
    // Serializa y guarda el estado actual del carrito en LocalStorage
    localStorage.setItem(storageCarrito, JSON.stringify(carrito));
  } catch (error) {
    console.error("Error al guardar el carrito de localStorage:", error);
  }
}

// Variable principal del carrito inicializada desde LocalStorage
let carrito = leerCarrito();

// Delegación de eventos para agregar productos al carrito desde cualquier botón .btn-add
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add");
  if (!btn) return;

  const idProducto = Number(btn.dataset.id);
  agregarCarrito(idProducto);
});

function agregarCarrito(idProducto) {
  // Busca el producto seleccionado en el catálogo cargado en memoria
  const p = listaProductos.find((prod) => Number(prod.id) === Number(idProducto));
  // VALIDACION: Si no existe el producto en listaProductos, corta para no agregar datos inválidos
  if (!p) return;

  // Verifica si el producto ya está en el carrito para sumar cantidad o crear un nuevo ítem
  const existente = carrito.find((item) => Number(item.id) === Number(p.id));
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: p.id,
      name: p.name,
      price: p.price,
      cantidad: 1,
    });
  }

  guardarCarrito();
  mostrarCarrito();
}

function mostrarCarrito() {
  // Actualiza las listas resumidas del carrito (.user-cart) si existen en la vista actual
  const listasCart = document.querySelectorAll(".user-cart");
  if (listasCart.length) {
    const contenido = carrito.length
      ? carrito
          .map(
            (item) =>
              `<li>${item.name} x${item.cantidad} — $${(item.price * item.cantidad).toFixed(2)}</li>`
          )
          .join("")
      : `<li>Tu carrito está vacío</li>`;

    listasCart.forEach((lista) => {
      lista.innerHTML = contenido;
    });
  }

  // Renderiza las tarjetas detalladas del carrito (.products-cart) cruzando con listaProductos
  const viewProductsCart = document.querySelectorAll(".products-cart");
  if (!viewProductsCart.length) return;

  const cardsHtml = carrito
    .map((itemCarrito) => {
      const producto = listaProductos.find(
        (p) => Number(p.id) === Number(itemCarrito.id)
      );
      // VALIDACION: Omite el ítem si aún no se cargó o no existe en listaProductos
      if (!producto) return "";

      const cantidad = Number(itemCarrito.cantidad) || 1;
      const precioUnitario = Number(producto.price) || 0;
      const subtotal = (precioUnitario * cantidad).toFixed(2);

      return `
        <div class="modal-card cart-card">
          <img src="${producto.image ?? ""}" alt="${producto.name ?? ""}" class="product-img">
          <h2 class="product-title">${producto.name ?? ""}</h2>
          <p class="product-price">$${precioUnitario.toFixed(2)} — Subtotal: $${subtotal}</p>
          <div class="qty-controls">
            <button type="button" class="btn-qty-dec" data-id="${producto.id}">-</button>
            <span class="qty-value">${cantidad}</span>
            <button type="button" class="btn-qty-inc" data-id="${producto.id}">+</button>
          </div>
        </div>
      `;
    })
    .join("");

  const contenidoFinal = cardsHtml || `<p>Tu carrito está vacío</p>`;

  viewProductsCart.forEach((lista) => {
    lista.innerHTML = contenidoFinal;
  });
}

// Modifica la cantidad de un ítem del carrito (+1 o -1) y lo elimina si llega a 0
function cambiarCantidadCarrito(idProducto, delta) {
  const index = carrito.findIndex((item) => Number(item.id) === Number(idProducto));
  // VALIDACION: Sale si el producto no se encuentra dentro del carrito
  if (index === -1) return;

  const nuevaCantidad = (Number(carrito[index].cantidad) || 1) + delta;

  if (nuevaCantidad <= 0) {
    // Elimina el producto del carrito cuando la cantidad baja de 1
    carrito.splice(index, 1);
  } else {
    carrito[index].cantidad = nuevaCantidad;
  }

  guardarCarrito();
  mostrarCarrito();
}

// Delegación de eventos para incrementar (+) o decrementar (-) cantidades en las tarjetas del carrito
document.addEventListener("click", (e) => {
  const btnInc = e.target.closest(".btn-qty-inc");
  if (btnInc) {
    cambiarCantidadCarrito(Number(btnInc.dataset.id), 1);
    return;
  }

  const btnDec = e.target.closest(".btn-qty-dec");
  if (btnDec) {
    cambiarCantidadCarrito(Number(btnDec.dataset.id), -1);
  }
});

// TICKET







// MOSTRAR VISTAS - En unico Archivo HTML


function mostrarVista(nombreVista) {
  // VALIDACION: Si la vista solicitada no está permitida en viewApp, vuelve a "welcome" por defecto
  const vistaActiva = viewApp.includes(nombreVista) ? nombreVista : "welcome";

  // Activa solo la sección correspondiente a la vista seleccionada y oculta las demás
  secciones.forEach((sec) => {
    sec.classList.toggle("active", sec.id === `view-${vistaActiva}`);
  });

  // Marca el botón activo para accesibilidad y estilos según data-vista
  botones.forEach((btn) => {
    if (btn.dataset.vista === vistaActiva) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  // Actualiza el hash de la URL sin recargar la página si es distinto al actual
  const nuevoHash = `#${vistaActiva}`;
  if (window.location.hash !== nuevoHash) {
    history.pushState(null, "", nuevoHash);
  }
}

// Asocia el clic de cada botón de navegación a su vista correspondiente (data-vista)
botones.forEach((btn) => {
  btn.addEventListener("click", () => mostrarVista(btn.dataset.vista));
});

// Escucha los botones Atrás/Adelante del historial para mostrar la vista del hash actual
window.addEventListener("popstate", () => {
  const vistaDesdeUrl = window.location.hash.replace("#", "");
  mostrarVista(vistaDesdeUrl);
});

// Carga inicial según el hash actual o "welcome" por defecto
mostrarVista(window.location.hash.replace("#", ""));


// CARRITO (FALTA IMPRIMIR PDF)
const boton_imprimir = document.getElementById("boton-imprimir");
boton_imprimir.addEventListener("click", imprimirTicket);

function imprimirTicket(){
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF(); 

  let y = 20;
  doc.setFontSize(20);
  doc.text("TICKET DE TU COMPRA: ", 20, y );
  y += 20;

  doc.setFontSize(14);
  /*
  storageCarrito.forEach(producto => {

        idProductos.push(producto.id); // Llenamos el array de ids de productos (necesario para crear la venta despues)

        doc.text(`${producto.name} - ${producto.price}`, 20, y); // 20px derecha y valor del eje y

        // Al terminar la primer iteracion, incrementamos la posicion vertical para evitar solapamiento
        y += 10;
    });
    // Calculamos el valor total del ticket usando reduce
    const precioTotal = carrito.reduce((acumulador, producto) => acumulador + parseInt(producto.price), 0);

    // Separamos verticalmente los productos del total
    y += 10

    doc.text(`TOTAL: $${precioTotal}`, 20, y);

    const fecha = new Date();
    const nombreTicket = `${nombreUsuario}_${fecha.toISOString()}`;

    // Imprimimos ticket de venta
    doc.save(`ticket-${nombreTicket}.pdf`);

    // Llamaremos a la funcion para registrar ventas
    registrarVenta(precioTotal, idProductos);
    */
}

// TICKET (FALTA IMPRIMIR PDF)


// INIT

function init() {
  // Sincroniza el input de nombre, rellena el valor guardado si existe y actualiza saludos/ticket
  syncInputNombre();
  // Dibuja el carrito inicial con lo persistido en localStorage (y se refresca al cargar productos)
  mostrarCarrito();

  // VALIDACION: Solo activa el router todas las vistas existen en secciones con clase .screen-view en el DOM
  if (document.querySelector(".screen-view")) {
    mostrarVista(window.location.hash.replace("#", ""));
  }

  // VALIDACION: Solo pide productos al backend si existe el contenedor .view-products en la vista actual
  if (document.querySelector(".view-products")) {
    cargarProductos();
  }
}

init()