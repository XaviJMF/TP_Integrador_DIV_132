// ================================================================================
// VARIABLES GLOBALES
// Datos y referencias al DOM que se usan en todo el archivo.
// ================================================================================

// --------------------------------------------------------------------------------
// Catálogo y paginación
// --------------------------------------------------------------------------------

// Productos de la página actual (el backend ya los devuelve filtrados y paginados)
let listaProductos = [];
// Página que se está mostrando en el menú
let paginaActual = 1;
// Cantidad total de páginas, la informa el backend (pagina de a 10 productos)
let totalPaginas = 1;

// --------------------------------------------------------------------------------
// Claves de LocalStorage
// --------------------------------------------------------------------------------

// Marca "true" cuando el pedido ya fue confirmado
const STORAGE_PEDIDO_CONFIRMADO = "pedidoConfirmado";
// Nombre del cliente
const STORAGE_USUARIO = "username";
// Carrito guardado como texto JSON
const storageCarrito = "localStorage";

// --------------------------------------------------------------------------------
// Elementos del DOM
// Valen null si no existen en la página actual (cada HTML tiene solo algunos)
// --------------------------------------------------------------------------------

// Botones Anterior / Siguiente de la paginación (menu.html)
const btnPrevPage = document.getElementById("btn-prev-page");
const btnNextPage = document.getElementById("btn-next-page");
// Botón "Confirmar pedido" (carrito.html)
const btnConfirmar = document.querySelector(".btn-confirm-order");
// Botón "Hacer otro pedido" (ticket.html)
const btnNuevoPedido = document.querySelector(".btn-finish");

// Link "Cambiar nombre" del header
const btnCambiarNombre = document.getElementById("btn-change-name")

// Texto "Página X de Y"
const pageInfo = document.getElementById("page-info");

// Buscador y botones de categoría del menú
const inputFiltro = document.querySelector(".input-filter");
const botonesCategoria = document.querySelectorAll(".catalog button");

// Filtros actuales: se vuelven a leer del DOM en filtrarProductos()
let categoriaActiva = document.querySelector(".btn-category-active")?.value ?? "";
let textoBusqueda = (document.querySelector(".input-filter")?.value ?? "").toLowerCase().trim();

// Clave con el ID de la venta que devolvió el backend al confirmar el pedido
const STORAGE_ID_VENTA = "idVentaActual";

// Clave con el tema elegido ("light" o "dark") y botón para cambiarlo
const STORAGE_TEMA = "tema";
const btnTema = document.getElementById("btn-theme");

// Carrito en memoria, cargado desde LocalStorage al iniciar
let carrito = leerCarrito();

// ================================================================================

// ================================================================================
// LECTURAS
// Funciones que solo leen datos (LocalStorage o carrito) y devuelven un resultado.
// ================================================================================

// Devuelve el nombre del cliente guardado, o "" si no hay
function leerNombreUsuario() {
  try {
    // Lee el valor crudo desde LocalStorage
    const guardado = localStorage.getItem(STORAGE_USUARIO);

    // Si hay valor le saca los espacios de los extremos; si no, devuelve vacío
    return guardado ? guardado.trim() : "";
  } catch (error) {
    // Si LocalStorage falla, lo informa y devuelve "" para no romper el resto
    console.error("Error al leer el nombre de usuario:", error);
    return "";
  }
}

// Devuelve el carrito guardado como un array (siempre un array, aunque falle algo)
function leerCarrito() {
  try {
    // Lee el texto JSON y lo convierte en objeto; si no hay nada usa un array vacío
    const guardado = localStorage.getItem(storageCarrito);
    const parsed = guardado ? JSON.parse(guardado) : [];

    // Solo acepta el resultado si de verdad es un array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {

    // Si el JSON está roto o falla LocalStorage, lo informa y devuelve un array vacío
    console.error("Error al leer el carrito de localStorage:", error);
    return [];
  }
}

// Suma precio x cantidad de todos los productos del carrito
function calcularTotal() {
  // reduce va acumulando el importe de cada producto, empezando desde 0
  return carrito.reduce((total, producto) => {
    // Convierte a número; si no es válido usa 0 para no obtener NaN
    const precio = Number(producto.price) || 0;
    const cantidad = Number(producto.cantidad) || 0;

    // Suma el subtotal de este producto al acumulado
    return total + (precio * cantidad);
  }, 0);
}

// Suma las unidades de todos los productos del carrito
function calcularUnidades() {
  // reduce va acumulando las cantidades (0 si falta o no es válida)
  return carrito.reduce((total, producto) => {
    return total + (Number(producto.cantidad) || 0);
  }, 0);
}

// Indica si ya hay un nombre de cliente guardado
function usuarioRegistrado() {
  // Es true si el nombre tiene al menos un carácter
  return leerNombreUsuario().length > 0;
}

// Indica si el pedido ya fue confirmado
function pedidoConfirmado() {
  // LocalStorage guarda texto, por eso se compara con el string "true"
  return localStorage.getItem(STORAGE_PEDIDO_CONFIRMADO) === "true";
}

// Decide si el usuario puede quedarse en la página actual o hay que redirigirlo
// Devuelve true si puede seguir y false si se redirigió
function controlarAcceso() {
  // Toma el nombre del archivo de la URL (ej: "menu.html"); si está vacío, es la bienvenida
  const rawPage = window.location.pathname.split("/").pop();
  const pagina = rawPage === "" ? "welcome.html" : rawPage;

  // Consulta en qué estado está el cliente
  const nombreValido = usuarioRegistrado();
  const confirmado = pedidoConfirmado();

  // Sin nombre solo se puede estar en la bienvenida: cualquier otra página vuelve a ella
  if (!nombreValido && pagina !== "welcome.html") {
    window.location.replace("/welcome.html");
    return false;
  }

  // Con el pedido confirmado solo se puede ver el ticket (o la bienvenida)
  if (confirmado && pagina !== "ticket.html" && pagina !== "welcome.html") {
    window.location.replace("/ticket.html");
    return false;
  }

  // Sin pedido confirmado no se puede ver el ticket: vuelve al carrito
  if (!confirmado && pagina === "ticket.html") {
    window.location.replace("/carrito.html");
    return false;
  }

  // Si pasó todas las reglas, puede quedarse
  return true;
}

// ================================================================================

// ================================================================================
// ESCRITURA
// Funciones que modifican el nombre, el carrito o la sesión del cliente.
// ================================================================================

// Guarda el nombre del cliente y devuelve el nombre ya limpio
function guardarNombreUsuario(nombre) {
  // Se asegura de que sea texto y le saca los espacios de los extremos
  const limpio = typeof nombre === "string" ? nombre.trim() : "";

  // Lo guarda en LocalStorage; si falla, lo informa sin romper la página
  try {
    localStorage.setItem(STORAGE_USUARIO, limpio);
  } catch (error) {
    console.error("Error al guardar el nombre de usuario:", error);
  }

  // Devuelve el nombre limpio para quien llamó a la función
  return limpio;
}

// Guarda el carrito actual en LocalStorage
function guardarCarrito() {
  // Convierte el array a texto JSON y lo guarda; si falla, lo informa
  try {
    localStorage.setItem(storageCarrito, JSON.stringify(carrito));
  } catch (error) {
    console.error("Error al guardar el carrito de localStorage:", error);
  }
}

// Agrega un producto al carrito (o suma 1 si ya estaba) y actualiza las vistas
function agregarCarrito(idProducto) {
  // Busca el producto entre los de la página actual (comparando los ids como números)
  const p = listaProductos.find((prod) => Number(prod.id) === Number(idProducto));

  // Si no lo encuentra, corta para no guardar datos inválidos
  if (!p) return;

  // Si ya estaba en el carrito suma 1; si no, lo agrega con cantidad 1
  const existente = carrito.find((item) => Number(item.id) === Number(p.id));
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image, // se guarda para poder dibujar el carrito sin volver a pedir el catálogo
      cantidad: 1,
    });
  }

  // Guarda el carrito y redibuja el carrito y la grilla (para que aparezca "Quitar")
  guardarCarrito();
  mostrarCarrito();
  dibujarProductos();
}

// Saca un producto del carrito por completo y actualiza las vistas
function quitarDelCarrito(idProducto) {
  // Se queda con todos los ítems menos el que tiene ese id
  carrito = carrito.filter((item) => Number(item.id) !== Number(idProducto));

  // Guarda el cambio y redibuja el carrito
  guardarCarrito();
  mostrarCarrito();

  // Si estamos en el menú, redibuja la grilla para que desaparezca el botón "Quitar"
  if (document.querySelector(".view-products")) {
    dibujarProductos();
  }
}

// Suma o resta 1 a la cantidad de un ítem; si llega a 0 lo elimina
function cambiarCantidadCarrito(idProducto, delta) {
  // Busca la posición del ítem en el array
  const index = carrito.findIndex((item) => Number(item.id) === Number(idProducto));

  // Si no está en el carrito (findIndex devuelve -1), no hace nada
  if (index === -1) return;

  // Calcula la nueva cantidad sumando delta (+1 o -1) a la actual
  const nuevaCantidad = (Number(carrito[index].cantidad) || 1) + delta;

  // Si queda en 0 o menos elimina el ítem; si no, actualiza la cantidad
  if (nuevaCantidad <= 0) {
    carrito.splice(index, 1);
  } else {
    carrito[index].cantidad = nuevaCantidad;
  }

  // Guarda y redibuja el carrito con los totales nuevos
  guardarCarrito();
  mostrarCarrito();
}

// Borra todos los datos del cliente y vuelve a la bienvenida (nuevo pedido / cambiar nombre)
function reiniciarSesionCliente() {
  // Vacía el carrito en memoria y borra las claves guardadas en LocalStorage
  carrito = [];
  localStorage.removeItem(storageCarrito);
  localStorage.removeItem("localStorage");
  localStorage.removeItem(STORAGE_PEDIDO_CONFIRMADO);
  localStorage.removeItem(STORAGE_USUARIO);

  // Guarda el carrito vacío y redirige a la bienvenida
  guardarCarrito();
  window.location.href = "/welcome.html";
}

// ================================================================================

// ================================================================================
// VENTANA BIENVENIDA
// Nombre y saludo del cliente (el saludo se muestra en todas las páginas).
// ================================================================================

// Escribe el nombre en los textos de saludo y de ticket que existan en la página
function crearMensajePorNombre(nombreVisible) {
  // Saludo del header ("Hola, nombre")
  const saludoEl = document.getElementById("user-greeting");
  if (saludoEl) {
    saludoEl.textContent = `Hola, ${nombreVisible}`;
  }

  // Mensaje de agradecimiento del ticket
  const greetingsTicket = document.getElementById("user-greetings");
  if (greetingsTicket) {
    greetingsTicket.textContent = `¡Gracias, ${nombreVisible}!`;
  }

  // Línea "Cliente: nombre" dentro del ticket
  const userTicket = document.getElementById("user-ticket");
  if (userTicket) {
    userTicket.textContent = `Cliente: ${nombreVisible}`;
  }
}

// Muestra el nombre guardado en los saludos (o "Usuario" si no hay uno)
function actualizarSaludo() {
  // Usa el nombre guardado o "Usuario" como valor por defecto
  const nombre = leerNombreUsuario() || "Usuario";

  // Lo escribe en los textos de la página
  crearMensajePorNombre(nombre);
}

// Conecta el input de nombre con el saludo: lo precarga y muestra una vista previa al escribir
function syncInputNombre() {
  // Busca el input de nombre y deja el saludo inicial listo
  const inputNombre = document.querySelector(".input-name");
  actualizarSaludo();

  // Si esta página no tiene ese input, termina sin error
  if (!inputNombre) return;

  // Si ya había un nombre guardado y el input está vacío, lo precarga
  const nombreGuardado = leerNombreUsuario();
  if (nombreGuardado && !inputNombre.value) {
    inputNombre.value = nombreGuardado;
  }

  // Al escribir, actualiza el saludo en vivo (sin guardar todavía en LocalStorage)
  inputNombre.addEventListener("input", () => {
    const preview = inputNombre.value.trim() || "Usuario";
    crearMensajePorNombre(preview);
  });
}


// ================================================================================

// ================================================================================
// VENTANA DE PRODUCTOS (MENÚ)
// El backend filtra y pagina: el frontend pide una página por vez y la dibuja.
// ================================================================================

// Lee los filtros (categoría y búsqueda) y pide la página 1 al backend
function filtrarProductos() {
  // La categoría sale del botón marcado como activo (atributo data-category del HTML)
  const btnActivo = document.querySelector(".btn-category-active");
  categoriaActiva = btnActivo ? (btnActivo.dataset.category || "").toLowerCase().trim() : "";

  // El texto de búsqueda sale del input
  textoBusqueda = inputFiltro ? inputFiltro.value.toLowerCase().trim() : "";

  // Al cambiar un filtro siempre se vuelve a la primera página
  cargarPagina(1);
}

// Pide al backend una página de productos activos (con los filtros actuales) y la dibuja
async function cargarPagina(pagina) {
  try {
    // Arma la URL con la página y, solo si hay, la categoría y la búsqueda
    let url = `http://localhost:3000/api/products/active?page=${pagina}`;
    if (categoriaActiva) {
      url += `&category=${categoriaActiva}`;
    }
    if (textoBusqueda) {
      // encodeURIComponent protege los espacios y caracteres especiales del texto
      url += `&search=${encodeURIComponent(textoBusqueda)}`;
    }

    // Hace la petición al backend y espera la respuesta
    const respuesta = await fetch(url);

    // Si el servidor respondió con error (404, 500, etc.), salta al catch
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    // Guarda los productos de la página y los datos de paginación que envía el backend
    const data = await respuesta.json();
    listaProductos = Array.isArray(data.payload) ? data.payload : [];
    paginaActual = data.pagination.page;
    totalPaginas = data.pagination.totalPages;

    // Dibuja las tarjetas y actualiza los botones de paginación
    dibujarProductos();
    actualizarControlesPaginacion();
  } catch (error) {
    // Si falla la red, el servidor o el JSON, lo informa en consola
    console.error("No se pudieron cargar los productos:", error);
  }
}

// Dibuja las tarjetas de la página actual (no pide nada al backend)
function dibujarProductos() {
  // Busca el contenedor; si esta página no lo tiene, termina. Si lo tiene, lo vacía
  const viewProducts = document.querySelector(".view-products");
  if (!viewProducts) return;
  viewProducts.innerHTML = "";

  // Arma una tarjeta por cada producto de la página
  listaProductos.forEach((p) => {
    // Si el producto ya está en el carrito, agrega también el botón "Quitar"
    const itemEnCarrito = carrito.find((item) => Number(item.id) === Number(p.id));
    const btnQuitar = itemEnCarrito
      ? `<button type="button" data-id="${p.id}" class="btn-remove">Quitar</button>`
      : "";

    // HTML de la tarjeta (el data-id permite saber qué producto se tocó)
    let card = `
      <div class="modal-card">
        <img src="${p.image}" alt="" class="product-img">
        <h2 class="product-title">${p.name}</h2>
        <p class="product-price">${p.price}</p>
        <button data-id="${p.id}" class="btn-add">Agregar +</button>
        ${btnQuitar}
      </div>
    `;
    // Suma la tarjeta al contenedor
    viewProducts.innerHTML += card;
  });
}

// Actualiza el texto "Página X de Y" y activa o desactiva Anterior / Siguiente
function actualizarControlesPaginacion() {
  // Escribe la página actual y el total que informó el backend
  if (pageInfo) {
    pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  }

  // "Anterior" queda deshabilitado en la primera página
  if (btnPrevPage) {
    btnPrevPage.disabled = paginaActual <= 1;
  }

  // "Siguiente" queda deshabilitado en la última página
  if (btnNextPage) {
    btnNextPage.disabled = paginaActual >= totalPaginas;
  }
}

// ================================================================================

// ================================================================================
// VENTANA CARRITO
// Resumen del pedido, tarjetas del carrito y registro de la venta en la base de datos.
// ================================================================================

// Actualiza los textos de total y unidades en el carrito y en el ticket
function actualizarResumenPedido() {
    // Calcula el importe total y la cantidad de unidades
    const total = calcularTotal();
    const unidades = calcularUnidades();
    // Busca dónde se muestran (cada uno existe solo en su página)
    const totalCarrito = document.querySelector(".cart-summary-total");
    const metaCarrito = document.querySelector(".cart-summary-meta");
    const totalTicket = document.getElementById("price");
    // Total del resumen del carrito
    if (totalCarrito) {
        totalCarrito.textContent = `$${total.toFixed(2)}`;
    }
    // Texto "Total | N Unidades" del resumen
    if (metaCarrito) {
        metaCarrito.textContent = `Total | ${unidades} Unidades`;
    }
    // Total que se muestra en el ticket
    if (totalTicket) {
        totalTicket.textContent = `$${total.toFixed(2)}`;
    }
}

// Dibuja la lista resumida, las tarjetas del carrito y actualiza el resumen
function mostrarCarrito() {
  // Busca las listas resumidas (una por cada .user-cart que haya en la página)
  const listasCart = document.querySelectorAll(".user-cart");

  // Si hay alguna, arma un <li> por producto, o un aviso si el carrito está vacío
  if (listasCart.length) {
    const contenido = carrito.length
      ? carrito
          .map(
            (item) =>
              `<li>${item.name} x${item.cantidad} — $${(item.price * item.cantidad).toFixed(2)}</li>`
          )
          .join("")
      : `<li>Tu carrito está vacío</li>`;

    // Escribe ese HTML en cada lista encontrada
    listasCart.forEach((lista) => {
      lista.innerHTML = contenido;
    });
  }

  // Busca el contenedor de tarjetas del carrito; si esta página no lo tiene, termina
  const viewProductsCart = document.querySelectorAll(".products-cart");
  if (!viewProductsCart.length) return;

  // Arma una tarjeta por cada ítem del carrito
  // (el catálogo viene paginado, así que se usan los datos guardados en el propio ítem)
  const cardsHtml = carrito
    .map((itemCarrito) => {
      // El ítem ya trae id, nombre, precio e imagen
      const producto = itemCarrito;

      // Calcula cantidad, precio unitario y subtotal con 2 decimales
      const cantidad = Number(itemCarrito.cantidad) || 1;
      const precioUnitario = Number(producto.price) || 0;
      const subtotal = (precioUnitario * cantidad).toFixed(2);

      // HTML de la tarjeta, con los botones - y + para cambiar la cantidad
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

  // Si no se armó ninguna tarjeta (carrito vacío), muestra un aviso
  const contenidoFinal = cardsHtml || `<p>Tu carrito está vacío</p>`;

  // Escribe el resultado en cada contenedor de tarjetas
  viewProductsCart.forEach((lista) => {
    lista.innerHTML = contenidoFinal;
  });

  // Actualiza el total y las unidades del resumen
  actualizarResumenPedido();
}

// --------------------------------------------------------------------------------
// Ventas: registro del pedido en el backend y número de ticket
// --------------------------------------------------------------------------------

// Devuelve el id de la venta guardado en LocalStorage ("" si no hay)
function obtenerIdVenta() {
  return localStorage.getItem(STORAGE_ID_VENTA) || "";
}

// Pregunta al backend por las ventas (vienen ordenadas de la más nueva a la más vieja)
// y devuelve el id de la última. Se usa si el POST no devolvió el id.
async function obtenerUltimoIdVenta() {
  try {
    // Pide el listado de ventas
    const respuesta = await fetch("http://localhost:3000/api/sales/");
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    // Toma la primera venta del listado (la más reciente) y devuelve su id
    const data = await respuesta.json();
    const ultimaVenta = Array.isArray(data.payload) ? data.payload[0] : null;
    return ultimaVenta?.id ?? "";
  } catch (error) {
    // Si algo falla, lo informa y devuelve vacío
    console.error("Error al obtener el último ID de venta:", error);
    return "";
  }
}

// Arma el número de ticket a partir del id de la venta (ej: id 5 -> "P-05")
function formatearNumeroTicket() {
  const id = obtenerIdVenta();
  return id ? `P-0${id}` : "Sin ID";
}

// Envía la venta al backend (POST /api/sales/) y devuelve su respuesta, o null si falla
async function registrarVenta() {
  try {
    // Con el carrito vacío no hay nada que registrar
    if (carrito.length === 0) return null;

    // Datos de la venta: fecha de hoy (AAAA-MM-DD), total, nombre del cliente
    // y los ids de los productos para la tabla intermedia
    const fecha = new Date();
    const payloadVenta = {
      date: fecha.toISOString().slice(0, 10),
      total_price: Number(calcularTotal().toFixed(2)),
      user_name: leerNombreUsuario() || "Invitado",
      products: carrito.map((item) => Number(item.id)),
    };

    // Envía los datos como JSON
    const respuesta = await fetch("http://localhost:3000/api/sales/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadVenta),
    });

    // Si el servidor respondió con error, salta al catch
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    // Devuelve lo que respondió el backend (se espera el id de la venta nueva)
    const data = await respuesta.json();
    console.log("Respuesta POST /api/sales/:", data);
    return data;
  } catch (error) {
    // Si falla algo, lo informa y devuelve null para que quien llama lo detecte
    console.error("Error al registrar la venta:", error);
    return null;
  }
}

// ================================================================================

// ================================================================================
// VENTANA TICKET
// Datos del ticket en pantalla y descarga en PDF.
// ================================================================================

// Completa los datos del ticket: fecha, número, nombre y totales
function actualizarTicket() {
    // Nombre del cliente guardado
    const nombre = leerNombreUsuario();
    // Fecha y hora actuales
    const fecha = new Date();
    // Busca dónde mostrar la fecha y el número (solo existen en ticket.html)
    const fechaElemento = document.getElementById("datetime-ticket");
    const numeroTicket = document.getElementById("id-ticket");
    // Muestra la fecha con el formato de Argentina
    if (fechaElemento) {
        fechaElemento.textContent = fecha.toLocaleString("es-AR");
    }
    // Muestra el número de ticket armado con el id de la venta
    if (numeroTicket) {
      numeroTicket.textContent = formatearNumeroTicket();
    }
    // Escribe el nombre del cliente en los mensajes del ticket
    crearMensajePorNombre(nombre);
    // Actualiza el total y las unidades
    actualizarResumenPedido();
}

// Genera y descarga el ticket en PDF (usa la librería jsPDF cargada en ticket.html)
function imprimirTicket() {
  // Toma jsPDF de la librería y crea un documento nuevo
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Datos que se imprimen: cliente, fecha, número de ticket y nombre del archivo
  const cliente = leerNombreUsuario() || "Invitado";
  const fecha = new Date();
  const fechaTexto = fecha.toLocaleString("es-AR");
  const numeroOrden = formatearNumeroTicket();
  const idArchivo = obtenerIdVenta() || "venta";

  // "y" es la posición vertical actual: se va sumando para escribir cada línea más abajo
  let y = 22;
  // Título del negocio
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("PERCHA", 20, y);

  // Subtítulo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Ticket de pedido", 20, y + 6);

  // Número de ticket en tamaño grande
  y += 20;
  doc.setFontSize(26);
  doc.text(numeroOrden, 20, y);

  // Nombre del cliente
  y += 10;
  doc.setFontSize(11);
  doc.text(`Cliente: ${cliente}`, 20, y);

  // Fecha y hora
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(fechaTexto, 20, y);

  // Línea separadora
  y += 7;
  doc.setDrawColor(210);
  doc.line(20, y, 190, y);

  // Título de la lista de productos
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Detalle:", 20, y);

  // Estilo de las líneas de productos
  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10.5);

  // Una línea por producto; baja 10 unidades en cada una para que no se pisen
  carrito.forEach((producto) => {
    const cantidad = Number(producto.cantidad) || 1;
    doc.text(`${producto.name} x${cantidad} — $${producto.price}`, 20, y);
    y += 10;
  });

  // Total del pedido, separado de la lista
  const precioTotal = calcularTotal();
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text(`TOTAL: $${precioTotal.toFixed(2)}`, 20, y);

  // Descarga el PDF con el id de la venta en el nombre
  doc.save(`ticket-${idArchivo}.pdf`);
}


// ================================================================================

// ----------------------------------------------------------------------
// EVENTOS
// Acá se conectan los botones e inputs con las funciones de arriba.
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Formulario de bienvenida
// ----------------------------------------------------------------------

// Busca el formulario; si no existe (otras páginas) no hace nada
const formBienvenida = document.getElementById("welcome-form");
if (formBienvenida) {
  // "submit" solo se dispara si el navegador validó el input (required y pattern)
  formBienvenida.addEventListener("submit", () => {
    // Guarda el nombre (guardarNombreUsuario ya le saca los espacios sobrantes)
    guardarNombreUsuario(document.querySelector(".input-name").value);

    // Borra la marca de pedido confirmado de un pedido anterior
    localStorage.removeItem(STORAGE_PEDIDO_CONFIRMADO);

    // No hace falta navegar: el action="menu.html" del formulario nos lleva al menú
  });
}

// ----------------------------------------------------------------------
// Paginación del menú
// ----------------------------------------------------------------------

// Si existe el botón "Anterior", pide la página de atrás al backend
if (btnPrevPage) {
  btnPrevPage.addEventListener("click", () => {
    cargarPagina(paginaActual - 1);
  });
}

// Si existe el botón "Siguiente", pide la página de adelante al backend
if (btnNextPage) {
  btnNextPage.addEventListener("click", () => {
    cargarPagina(paginaActual + 1);
  });
}

// ----------------------------------------------------------------------
// Confirmar pedido (carrito)
// ----------------------------------------------------------------------

// Solo se registra el evento si la página tiene el botón de confirmar
if (btnConfirmar) {
  btnConfirmar.addEventListener("click", async () => {
    // No se puede confirmar un pedido vacío
    if (carrito.length === 0) {
      alert("No podés confirmar un pedido vacío.");
      return;
    }

    // Pide confirmación mostrando las unidades y el total
    const totalTexto = calcularTotal().toFixed(2);
    const unidadesTexto = calcularUnidades();
    const seguro = confirm(
      `¿Estás seguro de confirmar este pedido?\nUnidades: ${unidadesTexto}\nTotal: $${totalTexto}`
    );

    // Si toca "Cancelar", no manda nada ni cambia de pantalla
    if (!seguro) return;

    // Registra la venta en el backend; si falla, avisa y se queda en el carrito
    const resultado = await registrarVenta();
    if (!resultado) {
      alert("No se pudo registrar la venta en la base de datos.");
      return;
    }

    // Busca el id de la venta en la respuesta (el backend puede llamarlo de distintas formas)
    let idNuevo = resultado.saleId ?? resultado.id ?? resultado.insertId ?? "";
    // Si la respuesta no lo trajo, lo consulta pidiendo la última venta
    if (String(idNuevo).trim() === "" && typeof obtenerUltimoIdVenta === "function") {
      idNuevo = await obtenerUltimoIdVenta();
    }

    // Guarda el id para armar el número de ticket; si no hay, borra el anterior
    if (String(idNuevo).trim() !== "") {
      localStorage.setItem(STORAGE_ID_VENTA, String(idNuevo));
    } else {
      localStorage.removeItem(STORAGE_ID_VENTA);
    }

    // Marca el pedido como confirmado y pasa al ticket
    localStorage.setItem(STORAGE_PEDIDO_CONFIRMADO, "true");
    window.location.href = "ticket.html";
  });
}

// ----------------------------------------------------------------------
// Clics delegados (botones que se crean dinámicamente)
// ----------------------------------------------------------------------

// Un solo listener en document detecta cuál botón se tocó
// (necesario porque las tarjetas se crean después de cargar la página)
document.addEventListener("click", (e) => {
  // "Agregar +" en el menú: suma el producto al carrito
  const btnAdd = e.target.closest(".btn-add");
  if (btnAdd) {
    const idProducto = Number(btnAdd.dataset.id);
    agregarCarrito(idProducto);
    return;
  }

  // "Quitar" en el menú: saca el producto completo del carrito
  const btnRemove = e.target.closest(".btn-remove");
  if (btnRemove) {
    quitarDelCarrito(Number(btnRemove.dataset.id));
    return;
  }

  // "+" en el carrito: suma una unidad
  const btnInc = e.target.closest(".btn-qty-inc");
  if (btnInc) {
    cambiarCantidadCarrito(Number(btnInc.dataset.id), 1);
    return;
  }

  // "-" en el carrito: resta una unidad
  const btnDec = e.target.closest(".btn-qty-dec");
  if (btnDec) {
    cambiarCantidadCarrito(Number(btnDec.dataset.id), -1);
    return;
  }

  // Botón de descarga en el ticket: genera el PDF
  const btnDownload = e.target.closest(".btn-download");
  if (btnDownload) {
    imprimirTicket();
  }
});

// ----------------------------------------------------------------------
// Reinicio de sesión, acceso, buscador y categorías
// ----------------------------------------------------------------------

// "Hacer otro pedido" y "Cambiar nombre" borran los datos y vuelven a la bienvenida
if (btnNuevoPedido) {
  btnNuevoPedido.addEventListener("click", reiniciarSesionCliente);
}

if (btnCambiarNombre) {
  btnCambiarNombre.addEventListener("click", reiniciarSesionCliente);
}

// Al mostrar la página (también al volver con el botón "Atrás") revalida el acceso
window.addEventListener("pageshow", () => {
  controlarAcceso();
});

// Cada vez que se escribe en el buscador, vuelve a pedir productos al backend
if (inputFiltro) {
  inputFiltro.addEventListener("input", () => {
    filtrarProductos();
  });
}

// Botones de categoría: el activo lleva la clase "btn-category-active"
botonesCategoria.forEach((boton) => {
  boton.addEventListener("click", () => {
    // Le quita "-active" a todos, dejándolos con la clase base "btn-category"
    botonesCategoria.forEach((b) => {
      b.className = b.className.replace("-active", "");
    });

    // Le agrega "-active" solo al botón tocado
    if (!boton.className.endsWith("-active")) {
      boton.className = `${boton.className}-active`;
    }

    // Pide los productos de la categoría elegida
    filtrarProductos();
  });
});

// ================================================================================

// ================================================================================
// MODO OSCURO / CLARO
// El tema se aplica con el atributo data-theme en <html>; el CSS cambia los colores según su valor.
// ================================================================================

// Aplica el tema y actualiza el texto del botón
function aplicarTema(tema) {
  // Pone data-theme="dark" o "light" en <html>
  document.documentElement.setAttribute("data-theme", tema);
  // El botón muestra a qué tema va a cambiar
  if (btnTema) {
    btnTema.textContent = tema === "dark" ? "Modo claro" : "Modo oscuro";
  }
}

// Cambia al otro tema y recuerda la elección
function cambiarTema() {
  // Si estaba en oscuro pasa a claro, y al revés
  const nuevo = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  // Guarda la elección para las próximas visitas
  localStorage.setItem(STORAGE_TEMA, nuevo);
  aplicarTema(nuevo);
}

// Conecta el botón de tema (si existe en la página)
if (btnTema) {
  btnTema.addEventListener("click", cambiarTema);
}

// Al cargar la página usa el tema guardado (claro si no hay ninguno)
aplicarTema(localStorage.getItem(STORAGE_TEMA) || "light");

// ================================================================================

// ================================================================================
// INIT
// Punto de arranque: se ejecuta una vez al cargar la página.
// ================================================================================

function init() {

    // Primero verifica si el usuario puede estar en esta página (si no, redirige y corta)
    if (!controlarAcceso()) return;

    // Deja el input de nombre y los saludos sincronizados
    syncInputNombre();

    // Muestra el nombre guardado en los saludos
    actualizarSaludo();

    // Dibuja el carrito guardado
    mostrarCarrito();

    // Pide la primera página de productos (solo hay grilla en el menú; el carrito usa los datos guardados)
    if (document.querySelector(".view-products")) {
      filtrarProductos();
    }

    // Completa los datos del ticket (solo tiene efecto en ticket.html)
    actualizarTicket();


}

// ================================================================================

init()
