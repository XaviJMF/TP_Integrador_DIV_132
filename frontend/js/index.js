
// ================================================================================
// VARIABLES GLOBALES

// ARRAY DE PRODUCTOS
let listaProductos = []
// VARIABLES PARA PAGINACION
let paginaActual = 1;
const productosPorPagina = 10; // 2 filas x 5 columnas

// VARIABLES EN LocalStorage
// PEDIDO CONFIRMADO?
const STORAGE_PEDIDO_CONFIRMADO = "pedidoConfirmado";
// Nombre clave para guardar el nombre de usuario en el LocalStorage
const STORAGE_USUARIO = "username";
// Clave utilizada para persistir el carrito en LocalStorage
const storageCarrito = "localStorage";

// BOTONES
// BOTONES DE LA PAGINACION
const btnPrevPage = document.getElementById("btn-prev-page");
const btnNextPage = document.getElementById("btn-next-page");
const pageInfo = document.getElementById("page-info");

const btnMenu = document.getElementById("btn-menu");

const btnConfirmar = document.querySelector(".btn-confirm-order");

const btnNuevoPedido = document.querySelector(".btn-finish");

// Variable principal del carrito inicializada desde LocalStorage
let carrito = leerCarrito();

// ================================================================================

// ================================================================================
// LECTURAS

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

function calcularTotal() {
    return carrito.reduce((total, producto) => {
        const precio = Number(producto.price) || 0;
        const cantidad = Number(producto.cantidad) || 0;

        return total + (precio * cantidad);
    }, 0);
}

function calcularUnidades() {
    return carrito.reduce((total, producto) => {
        return total + (Number(producto.cantidad) || 0);
    }, 0);
}

// Comprueba si existe un nombre válido.
function usuarioRegistrado() {
    return leerNombreUsuario().length > 0;
}

// Comprueba si el pedido ya fue confirmado.
function pedidoConfirmado() {
    return localStorage.getItem(STORAGE_PEDIDO_CONFIRMADO) === "true";
}

// Controla el acceso según la página actual.
function controlarAcceso() {

    const pagina = window.location.pathname.split("/").pop();

    const nombreValido = usuarioRegistrado();
    const confirmado = pedidoConfirmado();

    // Sin nombre: solamente puede acceder a bienvenida.
    if (!nombreValido && pagina !== "welcome.html") {
        window.location.replace("welcome.html");
        return false;
    }

    // Con pedido confirmado: solamente puede acceder al ticket.
    if (confirmado && pagina !== "ticket.html" && pagina !== "welcome.html") {
        window.location.replace("ticket.html");
        return false;
    }

    // Sin pedido confirmado: no puede entrar directamente al ticket.
    if (!confirmado && pagina === "ticket.html") {
        window.location.replace("carrito.html");
        return false;
    }

    return true;
}

// ================================================================================

// ================================================================================
// ESCRITURA

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


function guardarCarrito() {
  try {
    // Serializa y guarda el estado actual del carrito en LocalStorage
    localStorage.setItem(storageCarrito, JSON.stringify(carrito));
  } catch (error) {
    console.error("Error al guardar el carrito de localStorage:", error);
  }
}

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
  ProductosPorPagina(paginaActual);
}

function quitarDelCarrito(idProducto) {
  carrito = carrito.filter((item) => Number(item.id) !== Number(idProducto));
  guardarCarrito();
  mostrarCarrito();

  if (document.querySelector(".view-products")) {
    ProductosPorPagina(paginaActual);
  }
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
// ================================================================================

// ================================================================================
// VENTANA BIENVENIDA

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

/*
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

*/

// VISTA DE MENU
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
  const itemEnCarrito = carrito.find((item) => Number(item.id) === Number(p.id));
  const btnQuitar = itemEnCarrito
    ? `<button type="button" data-id="${p.id}" class="btn-remove">Quitar</button>`
    : "";

  let card = `
    <div class="modal-card">
      <img src="${p.image}" alt="" class="product-img">
      <h2 class="product-title">${p.name}</h2>
      <p class="product-price">${p.price}</p>
      <button data-id="${p.id}" class="btn-add">Agregar +</button>
      ${btnQuitar}
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
// ================================================================================

// ================================================================================
// VENTANA CARRITO

function actualizarResumenPedido() {

    const total = calcularTotal();
    const unidades = calcularUnidades();

    const totalCarrito = document.querySelector(".cart-summary-total");
    const metaCarrito = document.querySelector(".cart-summary-meta");

    const totalTicket = document.getElementById("price");

    if (totalCarrito) {
        totalCarrito.textContent = `$${total.toFixed(2)}`;
    }

    if (metaCarrito) {
        metaCarrito.textContent = `Total | ${unidades} Unidades`;
    }

    if (totalTicket) {
        totalTicket.textContent = `$${total.toFixed(2)}`;
    }
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

  actualizarResumenPedido();
}
// ================================================================================

// ================================================================================
// VENTANA TICKET


function actualizarTicket() {

    const nombre = leerNombreUsuario();
    const total = calcularTotal();

    const fecha = new Date();

    const fechaElemento = document.getElementById("datetime-ticket");

    const numeroTicket = document.getElementById("id-ticket");

    if (fechaElemento) {
        fechaElemento.textContent = fecha.toLocaleString("es-AR");
    }

    if (numeroTicket) {
        numeroTicket.textContent = "M-001";
    }

    crearMensajePorNombre(nombre);

    actualizarResumenPedido();
}

function imprimirTicket(){
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF(); 

  const cliente = leerNombreUsuario() || "Invitado";
  const fechaTexto = "2020-20-20";
  const numeroOrden = "M-001";


  let y = 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("miga.", 20, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Ticket de pedido", 20, y + 6);

  // Número de orden y datos del cliente
  y += 20;
  doc.setFontSize(26);
  doc.text(numeroOrden, 20, y);

  y += 10;
  doc.setFontSize(11);
  doc.text(`Cliente: ${cliente}`, 20, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(fechaTexto, 20, y);

  // Separador
  y += 7;
  doc.setDrawColor(210);
  doc.line(20, y, 190, y);

  // Detalle de productos
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Detalle:", 20, y);

  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10.5);

  const idProductos = []
  
  carrito.forEach(producto => {

        idProductos.push(producto.id); // Llenamos el array de ids de productos (necesario para crear la venta despues)
        doc.text(`${producto.name} - ${producto.price}`, 20, y); // 20px derecha y valor del eje y

        // Al terminar la primer iteracion, incrementamos la posicion vertical para evitar solapamiento
        y += 10;
    });
    // Calculamos el valor total del ticket usando reduce
    const precioTotal = calcularTotal();

    // Separamos verticalmente los productos del total
    y += 10

    doc.setFontSize(25);
    doc.text(`TOTAL: $${precioTotal}`, 20, y);

    const fecha = new Date();
    const nombreTicket = `${STORAGE_USUARIO}_${fecha.toISOString()}`;

    // Imprimimos ticket de venta
    doc.save(`ticket-${nombreTicket}.pdf`);

    /*
    // Llamaremos a la funcion para registrar ventas
    registrarVenta(precioTotal, idProductos);
    */
}


// ================================================================================

// ----------------------------------------------------------------------
// EVENTOS

// BOTON MENU - VENTANA BIENVENIDA
// Verifica que el botón exista en el DOM antes de asociarle el evento de clic
if (btnMenu) {
  btnMenu.addEventListener("click", () => {
    // 1. Obtiene el input de nombre y limpia espacios en blanco a los extremos
    const inputNombre = document.querySelector(".input-name");
    const nombre = inputNombre.value.trim();

    // 2. Valida que el nombre no esté vacío; si falta, avisa, enfoca y corta
    if (!nombre) {
      alert("Por favor, ingresá tu nombre para continuar.");
      inputNombre.focus();
      return;
    }

    // 3. Guarda el nombre del cliente y limpia la marca de pedido confirmado anterior
    guardarNombreUsuario(nombre);
    localStorage.removeItem(STORAGE_PEDIDO_CONFIRMADO);

    // 4. Refresca el saludo visible y navega hacia la vista del menú
    actualizarSaludo();
    window.location.href = "menu.html";
  });
}

// ----------------------------------------------------------------------

// BOTONES DE PAGINACION - VENTANA MENU
// Verifica que exista el botón anterior y retrocede una página si es posible
if (btnPrevPage) {
  btnPrevPage.addEventListener("click", () => {
    ProductosPorPagina(paginaActual - 1);
  });
}

// Verifica que exista el botón siguiente y avanza una página si es posible
if (btnNextPage) {
  btnNextPage.addEventListener("click", () => {
    ProductosPorPagina(paginaActual + 1);
  });
}

// BOTONES DE AGREGAR O QUITAR DEL CARRITO - VENTANA MENU
// Delegación de eventos para agregar productos al carrito desde cualquier botón .btn-add
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add");
  if (!btn) return;

  const idProducto = Number(btn.dataset.id);
  agregarCarrito(idProducto);
});

document.addEventListener("click", (e) => {
  const btnRemove = e.target.closest(".btn-remove");
  if (!btnRemove) return;

  quitarDelCarrito(Number(btnRemove.dataset.id));
});

// ----------------------------------------------------------------------

// BOTONES DE INCREMENTAR O REDUCIR PRODUCTO EN CARRITO - VENTANA CARRITO
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

// BOTON DE CONFIRMAR PEDIDO - VENTANA CARRITO
// Verifica que exista el botón de confirmar antes de registrar el evento
if (btnConfirmar) {
  btnConfirmar.addEventListener("click", () => {
    // 1. Impide confirmar si el carrito está vacío
    if (carrito.length === 0) {
      alert("No podés confirmar un pedido vacío.");
      return;
    }

    // 2. Marca el pedido como confirmado en localStorage y pasa a la pantalla del ticket
    localStorage.setItem(STORAGE_PEDIDO_CONFIRMADO, "true");
    window.location.href = "ticket.html";
  });
}

// ----------------------------------------------------------------------

//  BOTON DE DESCARGAR TICKET EN PDF - VENTANA TICKET
document.addEventListener("click", (e) => {
  const btnDownload = e.target.closest(".btn-download");
  if (btnDownload) {
    imprimirTicket();
  }
});

// BOTON DE VOLVER A MENÚ/GENERAR NUEVO PEDIDO - VENTANA TICKET
// Verifica que exista el botón finalizar/nuevo pedido antes de asociar el clic
if (btnNuevoPedido) {
  btnNuevoPedido.addEventListener("click", () => {
    // 1. Vacía el array en memoria y elimina las claves guardadas en localStorage
    carrito = [];
    localStorage.removeItem(storageCarrito);
    localStorage.removeItem("localStorage");
    localStorage.removeItem(STORAGE_PEDIDO_CONFIRMADO);
    localStorage.removeItem(STORAGE_USUARIO);

    // 2. Persiste el carrito vacío y devuelve al usuario a la bienvenida
    guardarCarrito();
    window.location.href = "welcome.html";
  });
}

// ================================================================================

// ================================================================================
// INIT

function init() {

    // Primero verifica si el usuario puede acceder a esta página.
    if (!controlarAcceso()) return;

    // Sincroniza el nombre y los saludos.
    syncInputNombre();

    // Actualiza el saludo del usuario.
    actualizarSaludo();

    // Dibuja el carrito guardado.
    mostrarCarrito();

    // Carga productos
    cargarProductos();
    
    // Actualiza el ticket únicamente si estamos en ticket.html.
    actualizarTicket();


}

// ================================================================================

init()