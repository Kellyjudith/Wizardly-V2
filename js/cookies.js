//=========================================
// COOKIES WIZARDLY
//=========================================

document.addEventListener("DOMContentLoaded", () => {

    const overlay = document.getElementById("cookie-overlay");
    const config = document.getElementById("config-modal");

    const aceptar = document.getElementById("aceptarCookies");
    const configurar = document.getElementById("configurarCookies");
    const guardar = document.getElementById("guardarCookies");

    //--------------------------------------------------
    // Mostrar aviso solo la primera vez
    //--------------------------------------------------

   // Mostrar siempre al entrar al Index

setTimeout(() => {
    overlay.classList.add("mostrar");
}, 700);

    //--------------------------------------------------
    // Abrir configuración
    //--------------------------------------------------

    configurar.addEventListener("click", () => {

        overlay.classList.remove("mostrar");

        config.classList.add("mostrar");

    });

    //--------------------------------------------------
    // Aceptar todas
    //--------------------------------------------------

    aceptar.addEventListener("click", () => {

        localStorage.setItem("cookiesWizardly", "aceptadas");

        overlay.classList.remove("mostrar");

    });

    //--------------------------------------------------
    // Guardar preferencias
    //--------------------------------------------------

    guardar.addEventListener("click", () => {

        localStorage.setItem("cookiesWizardly", "configuradas");

        config.classList.remove("mostrar");

    });

});