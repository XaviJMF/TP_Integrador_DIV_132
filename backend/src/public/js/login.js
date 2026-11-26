// Obtener el botón
const btnAutocompletar = document.getElementById("btn-autocompletar");

// Obtener los inputs
const inputEmail = document.getElementById("emailUser");
const inputPassword = document.getElementById("passwordUser");

// Credenciales de un usuario registrado
btnAutocompletar.addEventListener("click", () => {

    inputEmail.value = "uno@uno.com";
    inputPassword.value = "uno";

});