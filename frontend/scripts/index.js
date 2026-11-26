// ================================================================================
// VARIABLES GLOBALES

// ARRAY DE PRODUCTOS (solo los de la página actual: el backend filtra y pagina)
let listaProductos = [];
// VARIABLES PARA PAGINACION
let paginaActual = 1;
let totalPaginas = 1; // total de páginas que informa el backend (el backend pagina de a 10)

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
// BOTONES DE CONFIMAR ORDEN
const btnConfirmar = document.querySelector(".btn-confirm-order");
// BOTON DE GENERAR NUEVO PEDIDO
const btnNuevoPedido = document.querySelector(".btn-finish");

const btnCambiarNombre = document.getElementById("btn-change-name")

const pageInfo = document.getElementById("page-info");

const inputFiltro = document.querySelector(".input-filter");
const botonesCategoria = document.querySelectorAll(".catalog button");
// Categoría activa por defecto
let categoriaActiva = document.querySelector(".btn-category-active")?.value ?? "";
let textoBusqueda = (document.querySelector(".input-filter")?.value ?? "").toLowerCase().trim();


// Clave donde se guarda la preferencia de tema
const STORAGE_TEMA = "tema";
const btnTema = document.getElementById("btn-theme");

// Variable principal del carrito inicializada desde LocalStorage
let carrito = leerCarrito();

// ================================================================================

// ================================================================================
// LECTURAS

// Obtiene y limpia el nombre del cliente guardado en localStorage, o devuelve "" si no existe
function leerNombreUsuario() {
  try {
    // 1. Lee el valor guardado bajo STORAGE_USUARIO en localStorage
    const guardado = localStorage.getItem(STORAGE_USUARIO);

    // 2. Si existe un valor, quita espacios de los extremos; si no, devuelve cadena vacía
    return guardado ? guardado.trim() : "";
  } catch (error) {
    // 3. Registra el error en consola y devuelve "" para no romper las funciones que dependan de este dato
    console.error("Error al leer el nombre de usuario:", error);
    return "";
  }
}

// Recupera y parsea el carrito desde localStorage garantizando que siempre devuelva un array
function leerCarrito() {
  try {
    // 1. Busca el texto JSON guardado bajo storageCarrito y lo convierte a estructura de JS (o [] si no hay nada)
    const guardado = localStorage.getItem(storageCarrito);
    const parsed = guardado ? JSON.parse(guardado) : [];

    // 2. Devuelve el array solo si realmente es un Array; si no, devuelve []
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    
    // 3. Si el JSON está corrupto o falla localStorage, informa el error y devuelve un array vacío
    console.error("Error al leer el carrito de localStorage:", error);
    return [];
  }
}

// Calcula el importe total acumulado de todos los productos en el carrito
function calcularTotal() {
  // 1. Recorre carrito sumando (precio * cantidad) de cada ítem, convirtiendo valores a número con fallback 0
  return carrito.reduce((total, producto) => {
    const precio = Number(producto.price) || 0;
    const cantidad = Number(producto.cantidad) || 0;

    return total + (precio * cantidad);
  }, 0);
}

// Calcula la cantidad total de unidades sumadas en el carrito
function calcularUnidades() {
  // 1. Recorre carrito acumulando la cantidad numérica de cada producto (0 si falta o no es válida)
  return carrito.reduce((total, producto) => {
    return total + (Number(producto.cantidad) || 0);
  }, 0);
}

// Comprueba si existe un nombre de usuario guardado no vacío
function usuarioRegistrado() {
  // 1. Lee el nombre con leerNombreUsuario() y devuelve true si tiene al menos 1 carácter
  return leerNombreUsuario().length > 0;
}

// Comprueba si el pedido actual fue marcado como confirmado en localStorage
function pedidoConfirmado() {
  // 1. Compara exactamente el valor almacenado en STORAGE_PEDIDO_CONFIRMADO con el string "true"
  return localStorage.getItem(STORAGE_PEDIDO_CONFIRMADO) === "true";
}

// Valida si el usuario puede permanecer en la vista actual o lo redirige según su estado
function controlarAcceso() {
  // 1. Extrae el nombre del archivo HTML actual desde la ruta de la URL
  const rawPage = window.location.pathname.split("/").pop();
  const pagina = rawPage === "" ? "welcome.html" : rawPage; 

  // 2. Consulta el estado actual de registro de nombre y de confirmación de pedido
  const nombreValido = usuarioRegistrado();
  const confirmado = pedidoConfirmado();

  // 3. Si no hay nombre guardado y no está en welcome.html, redirige a bienvenida y cancela el inicio
  if (!nombreValido && pagina !== "welcome.html") {
    window.location.replace("/welcome.html");
    return false;
  }

  // 4. Si el pedido ya está confirmado y está en una ruta distinta de ticket.html o welcome.html, fuerza ticket.html
  if (confirmado && pagina !== "ticket.html" && pagina !== "welcome.html") {
    window.location.replace("/ticket.html");
    return false;
  }

  // 5. Si el pedido no está confirmado y se intenta entrar a ticket.html, redirige a carrito.html
  if (!confirmado && pagina === "ticket.html") {
    window.location.replace("/carrito.html");
    return false;
  }

  // 6. Si pasó todas las reglas de acceso, permite continuar cargando la vista
  return true;
}

// ================================================================================

// ================================================================================
// ESCRITURA

// Limpia y guarda el nombre del cliente en localStorage, devolviendo el valor final
function guardarNombreUsuario(nombre) {
  // 1. Verifica que nombre sea string y quita espacios sobrantes; si no, deja cadena vacía
  const limpio = typeof nombre === "string" ? nombre.trim() : "";

  // 2. Intenta guardar el nombre limpio bajo STORAGE_USUARIO y captura fallos de almacenamiento
  try {
    localStorage.setItem(STORAGE_USUARIO, limpio);
  } catch (error) {
    console.error("Error al guardar el nombre de usuario:", error);
  }

  // 3. Devuelve el nombre limpio para quien haya llamado a la función
  return limpio;
}

// Convierte el array carrito a texto JSON y lo persiste en localStorage
function guardarCarrito() {
  // 1. Intenta serializar y guardar carrito bajo storageCarrito protegiendo ante errores de storage
  try {
    localStorage.setItem(storageCarrito, JSON.stringify(carrito));
  } catch (error) {
    console.error("Error al guardar el carrito de localStorage:", error);
  }
}

// Agrega un producto por ID al carrito (o suma 1 si ya estaba) y refresca las vistas
function agregarCarrito(idProducto) {
  // 1. Busca el producto con ese ID dentro del catálogo cargado en listaProductos
  const p = listaProductos.find((prod) => Number(prod.id) === Number(idProducto));

  // 2. Si el producto no existe en listaProductos, corta para no insertar datos inválidos
  if (!p) return;

  // 3. Revisa si el producto ya está en carrito; si existe suma 1, si no crea un ítem nuevo con cantidad 1
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

  // 4. Guarda el carrito en localStorage y vuelve a dibujar carrito y grilla de productos
  guardarCarrito();
  mostrarCarrito();
  dibujarProductos();
}

// Elimina por completo un producto del carrito por ID y sincroniza las vistas
function quitarDelCarrito(idProducto) {
  // 1. Crea un nuevo array carrito excluyendo el producto cuyo ID coincida con idProducto
  carrito = carrito.filter((item) => Number(item.id) !== Number(idProducto));

  // 2. Persiste el cambio y actualiza la vista del carrito
  guardarCarrito();
  mostrarCarrito();

  // 3. Si existe la grilla de productos en la vista actual, redibuja la página para ocultar "Quitar"
  if (document.querySelector(".view-products")) {
    dibujarProductos();
  }
}

// Modifica la cantidad de un ítem del carrito (+1 o -1) y lo elimina si llega a 0
function cambiarCantidadCarrito(idProducto, delta) {
  // 1. Busca la posición (índice) del producto en el array carrito comparando el ID como número
  const index = carrito.findIndex((item) => Number(item.id) === Number(idProducto));

  // 2. Si el producto no existe en el carrito (findIndex devuelve -1), corta sin hacer cambios
  if (index === -1) return;

  // 3. Calcula la nueva cantidad sumando delta (+1 o -1) a la cantidad actual (1 por defecto si falta)
  const nuevaCantidad = (Number(carrito[index].cantidad) || 1) + delta;

  // 4. Si la cantidad queda en 0 o menos, borra el elemento del array; si no, actualiza su cantidad
  if (nuevaCantidad <= 0) {
    carrito.splice(index, 1);
  } else {
    carrito[index].cantidad = nuevaCantidad;
  }

  // 5. Guarda el estado actualizado en localStorage y vuelve a dibujar el carrito y sus totales
  guardarCarrito();
  mostrarCarrito();
}

// BOTONES DE REINICIAR / CAMBIAR NOMBRE - VISTAS CLIENTE
function reiniciarSesionCliente() {
  // 1. Vacía el array en memoria y elimina las claves guardadas en localStorage
  carrito = [];
  localStorage.removeItem(storageCarrito);
  localStorage.removeItem("localStorage");
  localStorage.removeItem(STORAGE_PEDIDO_CONFIRMADO);
  localStorage.removeItem(STORAGE_USUARIO);

  // 2. Persiste el carrito vacío y devuelve al usuario a la bienvenida
  guardarCarrito();
  window.location.href = "/welcome.html";
}

// ================================================================================

// ================================================================================
// VENTANA BIENVENIDA

// Pinta el nombre recibido en las etiquetas de saludo y ticket que existan en la vista actual
function crearMensajePorNombre(nombreVisible) {
  // 1. Busca el elemento del saludo general y lo actualiza si está presente en el DOM
  const saludoEl = document.getElementById("user-greeting");
  if (saludoEl) {
    saludoEl.textContent = `Hola, ${nombreVisible}`;
  }

  // 2. Busca el saludo principal del ticket y lo actualiza si existe
  const greetingsTicket = document.getElementById("user-greetings");
  if (greetingsTicket) {
    greetingsTicket.textContent = `¡Gracias, ${nombreVisible}!`;
  }

  // 3. Busca la etiqueta del cliente en el ticket y la actualiza si existe
  const userTicket = document.getElementById("user-ticket");
  if (userTicket) {
    userTicket.textContent = `Cliente: ${nombreVisible}`;
  }
}

// Lee el nombre guardado en localStorage (o usa "Usuario" por defecto) y actualiza los textos visibles
function actualizarSaludo() {
  // 1. Obtiene el nombre guardado o recurre a "Usuario" si está vacío
  const nombre = leerNombreUsuario() || "Usuario";

  // 2. Envía el nombre a crearMensajePorNombre para reflejarlo en las etiquetas de la vista
  crearMensajePorNombre(nombre);
}

// Sincroniza el input de nombre con el saludo inicial y la vista previa al escribir
function syncInputNombre() {
  // 1. Busca el campo de texto del nombre y refresca el saludo inicial
  const inputNombre = document.querySelector(".input-name");
  actualizarSaludo();

  // 2. Si la vista actual no tiene .input-name, corta la ejecución sin error
  if (!inputNombre) return;

  // 3. Si había un nombre guardado y el input está vacío, precarga ese valor
  const nombreGuardado = leerNombreUsuario();
  if (nombreGuardado && !inputNombre.value) {
    inputNombre.value = nombreGuardado;
  }

  // 4. Escucha cada tecla/cambio en el input para previsualizar el nombre sin guardar aún en localStorage
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

// ================================================================================

// VENTANA DE PRODUCTOS
// Lee la categoría activa y el texto del buscador, y pide la página 1 al backend
function filtrarProductos() {
  // 1. Lee la categoría del botón que tiene "-active" en su clase (usa data-category del HTML)
  const btnActivo = document.querySelector(".btn-category-active");
  categoriaActiva = btnActivo ? (btnActivo.dataset.category || "").toLowerCase().trim() : "";

  // 2. Lee el texto escrito en el input de búsqueda
  textoBusqueda = inputFiltro ? inputFiltro.value.toLowerCase().trim() : "";

  // 3. Al cambiar un filtro se vuelve a la página 1
  cargarPagina(1);
}

// Pide al backend la página indicada (ya filtrada y con solo productos activos) y la dibuja
async function cargarPagina(pagina) {
  try {
    // 1. Arma la URL con la página y, si hay, la categoría y la búsqueda
    let url = `http://localhost:3000/api/products/active?page=${pagina}`;
    if (categoriaActiva) {
      url += `&category=${categoriaActiva}`;
    }
    if (textoBusqueda) {
      url += `&search=${encodeURIComponent(textoBusqueda)}`;
    }

    // 2. Pide la página al backend
    const respuesta = await fetch(url);

    // 3. Verifica que el estado HTTP sea correcto (200-299) antes de leer el JSON
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    // 4. Guarda los productos de la página y los datos de paginación que informa el backend
    const data = await respuesta.json();
    listaProductos = Array.isArray(data.payload) ? data.payload : [];
    paginaActual = data.pagination.page;
    totalPaginas = data.pagination.totalPages;

    // 5. Dibuja las tarjetas y actualiza los botones de paginación
    dibujarProductos();
    actualizarControlesPaginacion();
  } catch (error) {
    // 6. Informa en consola si falla la red, el servidor o el parseo del JSON
    console.error("No se pudieron cargar los productos:", error);
  }
}

// Dibuja en .view-products los productos de la página actual (sin pedir nada al backend)
function dibujarProductos() {
  // 1. Busca el contenedor de productos y limpia su contenido anterior
  const viewProducts = document.querySelector(".view-products");
  if (!viewProducts) return;
  viewProducts.innerHTML = "";

  // 2. Recorre los productos de la página, agrega botón "Quitar" si ya está en carrito y suma la card al DOM
  listaProductos.forEach((p) => {
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

// Actualiza el indicador de página y habilita o deshabilita los botones anterior y siguiente
function actualizarControlesPaginacion() {
  // 1. Escribe el texto "Página X de Y" (el total lo informa el backend) si existe el elemento pageInfo
  if (pageInfo) {
    pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  }

  // 2. Deshabilita el botón anterior si estás en la primera página o antes
  if (btnPrevPage) {
    btnPrevPage.disabled = paginaActual <= 1;
  }

  // 3. Deshabilita el botón siguiente si estás en la última página o la superás
  if (btnNextPage) {
    btnNextPage.disabled = paginaActual >= totalPaginas;
  }
}

// ================================================================================

// ================================================================================
// VENTANA CARRITO

// Calcula total y unidades y actualiza los textos de resumen en carrito y ticket
function actualizarResumenPedido() {
    // 1. Calcula el monto total y la cantidad total de unidades del carrito
    const total = calcularTotal();
    const unidades = calcularUnidades();
    // 2. Busca los elementos donde se muestran el total, las unidades y el precio final
    const totalCarrito = document.querySelector(".cart-summary-total");
    const metaCarrito = document.querySelector(".cart-summary-meta");
    const totalTicket = document.getElementById("price");
    // 3. Actualiza el importe total de la vista del carrito si existe
    if (totalCarrito) {
        totalCarrito.textContent = `$${total.toFixed(2)}`;
    }
    // 4. Actualiza la cantidad total de unidades del resumen si existe
    if (metaCarrito) {
        metaCarrito.textContent = `Total | ${unidades} Unidades`;
    }
    // 5. Actualiza el total visible en el ticket si existe
    if (totalTicket) {
        totalTicket.textContent = `$${total.toFixed(2)}`;
    }
}

// Dibuja la lista resumida (.user-cart), las tarjetas detalladas (.products-cart) y actualiza el resumen del pedido
function mostrarCarrito() {
  // 1. Busca todos los contenedores de lista resumida en la vista actual (.user-cart)
  const listasCart = document.querySelectorAll(".user-cart");

  // 2. Si existe al menos una lista resumida, arma su HTML según haya ítems en carrito o esté vacío
  if (listasCart.length) {
    const contenido = carrito.length
      ? carrito
          .map(
            (item) =>
              `<li>${item.name} x${item.cantidad} — $${(item.price * item.cantidad).toFixed(2)}</li>`
          )
          .join("")
      : `<li>Tu carrito está vacío</li>`;

    // 3. Inserta el HTML generado en cada contenedor .user-cart encontrado
    listasCart.forEach((lista) => {
      lista.innerHTML = contenido;
    });
  }

  // 4. Busca los contenedores de tarjetas detalladas del carrito (.products-cart); si no hay ninguno, corta acá
  const viewProductsCart = document.querySelectorAll(".products-cart");
  if (!viewProductsCart.length) return;

  // 5. Recorre cada ítem del carrito: el catálogo viene paginado, así que se usan los datos guardados en el propio ítem
  const cardsHtml = carrito
    .map((itemCarrito) => {
      // 6. El ítem del carrito ya tiene id, nombre, precio e imagen
      const producto = itemCarrito;

      // 7. Calcula cantidad, precio unitario y subtotal formateado a 2 decimales
      const cantidad = Number(itemCarrito.cantidad) || 1;
      const precioUnitario = Number(producto.price) || 0;
      const subtotal = (precioUnitario * cantidad).toFixed(2);

      // 8. Devuelve el HTML de la tarjeta del carrito con botones para restar (-) o sumar (+) cantidad
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

  // 9. Si no se generó ninguna tarjeta (carrito vacío o listaProductos sin coincidencias), muestra mensaje de vacío
  const contenidoFinal = cardsHtml || `<p>Tu carrito está vacío</p>`;

  // 10. Escribe el HTML final dentro de cada contenedor .products-cart
  viewProductsCart.forEach((lista) => {
    lista.innerHTML = contenidoFinal;
  });

  // 11. Actualiza los textos de total y unidades del resumen del pedido
  actualizarResumenPedido();
}
// ================================================================================

// ================================================================================
// VENTANA TICKET

// Actualiza los datos propios de la vista del ticket (fecha, número, nombre y totales)
function actualizarTicket() {
    // 1. Obtiene el nombre del cliente guardado en localStorage
    const nombre = leerNombreUsuario();
    // 2. Crea un objeto con la fecha y hora actual del sistema
    const fecha = new Date();
    // 3. Busca en el DOM los elementos de fecha y número de ticket
    const fechaElemento = document.getElementById("datetime-ticket");
    const numeroTicket = document.getElementById("id-ticket");
    // 4. Si existe el elemento de fecha, muestra la fecha/hora formateada para Argentina
    if (fechaElemento) {
        fechaElemento.textContent = fecha.toLocaleString("es-AR");
    }
    // 5. Si existe el elemento del número de ticket, le asigna el identificador "M-001"
    if (numeroTicket) {
        numeroTicket.textContent = "M-001";
    }
    // 6. Pinta los mensajes con el nombre del cliente en las etiquetas de la vista
    crearMensajePorNombre(nombre);
    // 7. Calcula y actualiza el total y las unidades tanto en carrito como en ticket
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
  doc.text("PERCHA", 20, y);

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

// FORMULARIO - VENTANA BIENVENIDA
// Busca el formulario de bienvenida; si no existe (otras vistas) no hace nada
const formBienvenida = document.getElementById("welcome-form");
if (formBienvenida) {
  // El evento "submit" solo se dispara si el navegador validó el input (required y pattern)
  formBienvenida.addEventListener("submit", () => {
    // 1. Guarda el nombre del cliente (guardarNombreUsuario ya le quita los espacios sobrantes)
    guardarNombreUsuario(document.querySelector(".input-name").value);

    // 2. Limpia la marca de pedido confirmado de un pedido anterior
    localStorage.removeItem(STORAGE_PEDIDO_CONFIRMADO);

    // 3. No hace falta navegar: el action="menu.html" del formulario nos lleva al menú
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

// ----------------------------------------------------------------------

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

// EVENTOS DELEGADOS POR CLIC (BOTONES DINAMICOS Y DE ACCION)
// Escucha un único clic en document y detecta qué botón de acción fue presionado
document.addEventListener("click", (e) => {
  // 1. Agregar producto desde la vista del menú (.btn-add)
  const btnAdd = e.target.closest(".btn-add");
  if (btnAdd) {
    const idProducto = Number(btnAdd.dataset.id);
    agregarCarrito(idProducto);
    return;
  }

  // 2. Quitar producto completo desde la tarjeta del menú (.btn-remove)
  const btnRemove = e.target.closest(".btn-remove");
  if (btnRemove) {
    quitarDelCarrito(Number(btnRemove.dataset.id));
    return;
  }

  // 3. Incrementar cantidad de un ítem en el carrito (.btn-qty-inc)
  const btnInc = e.target.closest(".btn-qty-inc");
  if (btnInc) {
    cambiarCantidadCarrito(Number(btnInc.dataset.id), 1);
    return;
  }

  // 4. Decrementar cantidad de un ítem en el carrito (.btn-qty-dec)
  const btnDec = e.target.closest(".btn-qty-dec");
  if (btnDec) {
    cambiarCantidadCarrito(Number(btnDec.dataset.id), -1);
    return;
  }

  // 5. Descargar el ticket en PDF desde la vista del ticket (.btn-download)
  const btnDownload = e.target.closest(".btn-download");
  if (btnDownload) {
    imprimirTicket();
  }
});

if (btnNuevoPedido) {
  btnNuevoPedido.addEventListener("click", reiniciarSesionCliente);
}

if (btnCambiarNombre) {
  btnCambiarNombre.addEventListener("click", reiniciarSesionCliente);
}

window.addEventListener("pageshow", () => {
  controlarAcceso();
});

if (inputFiltro) {
  inputFiltro.addEventListener("input", () => {
    filtrarProductos();
  });
}

botonesCategoria.forEach((boton) => {
  boton.addEventListener("click", () => {
    // 1. Quita "-active" de todos los botones dejando la clase base ("btn-category")
    botonesCategoria.forEach((b) => {
      b.className = b.className.replace("-active", "");
    });

    // 2. Agrega "-active" al botón clickeado (queda "btn-category-active")
    if (!boton.className.endsWith("-active")) {
      boton.className = `${boton.className}-active`;
    }

    // 3. Filtra según el botón activo y el input
    filtrarProductos();
  });
});

// ================================================================================

// ================================================================================
// MODO OSCURO / CLARO

// Aplica el tema ("dark" o "light") en <html> y actualiza el texto del botón
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  if (btnTema) {
    btnTema.textContent = tema === "dark" ? "Modo claro" : "Modo oscuro";
  }
}

// Alterna entre claro y oscuro y guarda la elección en localStorage
function cambiarTema() {
  const nuevo = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_TEMA, nuevo);
  aplicarTema(nuevo);
}

if (btnTema) {
  btnTema.addEventListener("click", cambiarTema);
}

// Al cargar la página, usa el tema guardado (claro por defecto)
aplicarTema(localStorage.getItem(STORAGE_TEMA) || "light");

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

    // Carga la primera página de productos (solo existe en el menú; el carrito usa los datos guardados)
    if (document.querySelector(".view-products")) {
      filtrarProductos();
    }
    
    // Actualiza el ticket únicamente si estamos en ticket.html.
    actualizarTicket();


}

// ================================================================================

init()