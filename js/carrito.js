// ============================================================
//  WIZARDLY — carrito.js
//  Manejo del carrito con localStorage
// ============================================================

const CLAVE = 'wizardly_carrito';

// ── Obtener carrito ──────────────────────────────────────────
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem(CLAVE)) || [];
}

// ── Guardar carrito ──────────────────────────────────────────
function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE, JSON.stringify(carrito));
    actualizarContador();
}

// ── Agregar producto ─────────────────────────────────────────
function agregarAlCarrito(producto, cantidad = 1) {
    const carrito = obtenerCarrito();
    const idx = carrito.findIndex(p => p.id === producto.id);

    if (idx >= 0) {
        carrito[idx].cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }

    guardarCarrito(carrito);
    mostrarToastCarrito(producto.nombre);
}

// ── Cambiar cantidad ─────────────────────────────────────────
function cambiarCantidad(id, delta) {
    const carrito = obtenerCarrito();
    const idx = carrito.findIndex(p => p.id === id);
    if (idx < 0) return;

    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);

    guardarCarrito(carrito);
}

// ── Eliminar producto ────────────────────────────────────────
function eliminarDelCarrito(id) {
    let carrito = obtenerCarrito().filter(p => p.id !== id);
    guardarCarrito(carrito);
}

// ── Vaciar carrito ───────────────────────────────────────────
function vaciarCarrito() {
    localStorage.removeItem(CLAVE);
    actualizarContador();
}

// ── Contador en el navbar ────────────────────────────────────
function actualizarContador() {
    const carrito = obtenerCarrito();
    const total   = carrito.reduce((s, p) => s + p.cantidad, 0);
    const badge   = document.getElementById('contador-carrito');
    if (!badge) return;

    badge.textContent = total;
    badge.style.display = total > 0 ? 'inline-flex' : 'none';
}

// ── Toast de confirmación ────────────────────────────────────
function mostrarToastCarrito(nombre) {
    let t = document.getElementById('toast-carrito');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast-carrito';
        t.className = 'toast-carrito';
        document.body.appendChild(t);
    }
    t.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>${nombre}</strong> agregado al carrito`;
    t.classList.add('visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('visible'), 3000);
}

// Inicializar contador al cargar cualquier página
document.addEventListener('DOMContentLoaded', actualizarContador);