// Botón para mostrar solamente productos activos
const btnActivos = document.getElementById("btn-productos-activos");

// Obtener todos los productos
const productos = document.querySelectorAll(".card-producto");

// Evento del botón
btnActivos.addEventListener("click", () => {

    productos.forEach(producto => {

        // Si tiene la clase producto-activo, lo mostramos
        if (producto.classList.contains("producto-activo")) {
            producto.style.display = "block";
        } else {
            producto.style.display = "none";
        }

    });

});

const btnTodos = document.getElementById("btn-todos");

btnTodos.addEventListener("click", () => {

    productos.forEach(producto => {
        producto.style.display = "block";
    });

});


// Botón para mostrar solamente productos inactivos
const btnInactivos = document.getElementById("btn-productos-inactivos");

btnInactivos.addEventListener("click", () => {

    productos.forEach(producto => {

        // Si tiene la clase producto-inactivo, lo mostramos
        if (producto.classList.contains("producto-inactivo")) {
            producto.style.display = "block";
        } else {
            producto.style.display = "none";
        }

    });

});