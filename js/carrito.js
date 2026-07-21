// ============================================================
//  WIZARDLY — carrito.js
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
    const total = carrito.reduce((s, p) => s + p.cantidad, 0);

    const badge = document.getElementById('contador-carrito');
    if (!badge) return;

    badge.textContent = total;
    badge.style.display = total > 0 ? 'inline-flex' : 'none';
}

// ── Toast de confirmación ────────────────────────────────────
function mostrarToastCarrito(nombre) {
    const enSubcarpeta = window.location.pathname.includes('/pages/');
    const rutaCarrito = enSubcarpeta ? 'carrito.html' : 'pages/carrito.html';

    let t = document.getElementById('toast-carrito');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast-carrito';
        t.className = 'toast-carrito';
        document.body.appendChild(t);
    }

    t.innerHTML = `
        <div class="toast-icono"><i class="fa-solid fa-circle-check"></i></div>
        <div class="toast-texto">
            <span class="toast-titulo">¡Agregado exitosamente!</span>
            <span class="toast-nombre">${nombre}</span>
        </div>
        <a href="${rutaCarrito}" class="toast-ver">Ver carrito →</a>
    `;

    t.classList.add('visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('visible'), 3500);
}

// ── Inicializar contador ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
});

// ============================================================
//  LÓGICA DE CUPONES DE DESCUENTO
// ============================================================

const PROMOCIONES = [
    {
        codigo: 'LUNA20',
        tipo: 'porcentaje',
        valor: 20,
        condiciones: {
            montoMinimo: 200,
            categorias: ['Pociones'],
            productos: []
        }
    },
    {
        codigo: '2X1AMULETO',
        tipo: '2x1',
        valor: 1,
        condiciones: {
            montoMinimo: 0,
            categorias: ['Amuletos'],
            productos: []
        }
    },
    {
        codigo: 'KITMAGO15',
        tipo: 'porcentaje',
        valor: 15,
        condiciones: {
            montoMinimo: 0,
            categorias: ['Varitas', 'Libros', 'Calderos'],
            productos: []
        }
    },
    {
        codigo: 'ENVIOGATIS',
        tipo: 'envio_gratis',
        valor: 0,
        condiciones: {
            montoMinimo: 500,
            categorias: [],
            productos: []
        }
    }
];

let cuponActivo = null;
let descuentoAplicado = 0;

// ── Validar cupón ─────────────────────────────────────────────
function validarCupon(codigo, carrito) {
    if (!Array.isArray(carrito) || carrito.length === 0) {
        return { valido: false, mensaje: 'Tu carrito está vacío, agrega productos primero', promo: null };
    }

    const promo = PROMOCIONES.find(p => p.codigo === codigo);
    if (!promo) {
        return { valido: false, mensaje: 'Código no válido.', promo: null };
    }

    const totalCarrito = carrito.reduce((sum, item) => sum + (Number(item.precio) || 0) * (Number(item.cantidad) || 0), 0);
    const categoriasEnCarrito = [...new Set(carrito.map(item => item.categoria).filter(Boolean))];

    if (codigo === 'LUNA20') {
        const pociones = carrito.filter(item => item.categoria === 'Pociones');
        const subtotalPociones = pociones.reduce((sum, item) => sum + (Number(item.precio) || 0) * (Number(item.cantidad) || 0), 0);
        if (pociones.length === 0 || subtotalPociones < 200) {
            return { valido: false, mensaje: 'Necesitas pociones por al menos $200 en tu carrito', promo: null };
        }
        return { valido: true, mensaje: 'Código aplicado correctamente.', promo };
    }

    if (codigo === '2X1AMULETO') {
        const totalAmuletos = carrito
            .filter(item => item.categoria === 'Amuletos')
            .reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);

        if (totalAmuletos < 2) {
            return { valido: false, mensaje: 'Necesitas al menos 2 amuletos en tu carrito', promo: null };
        }
        return { valido: true, mensaje: 'Código aplicado correctamente.', promo };
    }

    if (codigo === 'KITMAGO15') {
        const catsRequeridas = ['Varitas', 'Libros', 'Calderos'];
        const faltantes = catsRequeridas.filter(cat => !categoriasEnCarrito.includes(cat));
        if (faltantes.length > 0) {
            return { valido: false, mensaje: `Te falta agregar: ${faltantes.join(', ')}`, promo: null };
        }
        return { valido: true, mensaje: 'Código aplicado correctamente.', promo };
    }

    if (codigo === 'ENVIOGATIS') {
        if (totalCarrito < 500) {
            const faltante = (500 - totalCarrito).toFixed(2);
            return { valido: false, mensaje: `Necesitas $${faltante} más para aplicar este cupón`, promo: null };
        }
        return { valido: true, mensaje: 'Código aplicado correctamente.', promo };
    }

    return { valido: false, mensaje: 'Código no válido.', promo: null };
}

// ── Calcular descuento ────────────────────────────────────────
function calcularDescuento(carrito, promo) {
    let descuento = 0;

    if (promo.tipo === 'porcentaje') {
        const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
        descuento = (total * promo.valor) / 100;
    } else if (promo.tipo === '2x1') {
        const amuletos = carrito.filter(item => item.categoria === 'Amuletos');
        if (amuletos.length > 0) {
            amuletos.sort((a, b) => a.precio - b.precio);
            descuento = amuletos[0].precio;
        }
    } else if (promo.tipo === 'envio_gratis') {
        descuento = 0;
    }

    return descuento;
}

// ── Aplicar cupón desde el carrito ──────────────────────────
function aplicarCupon() {
    const input = document.getElementById('codigo-cupon');
    const mensajeEl = document.getElementById('mensaje-cupon');
    const codigo = input.value.trim().toUpperCase();

    if (!codigo) {
        mensajeEl.textContent = '⚠️ Ingresa un código.';
        mensajeEl.className = 'cupon-mensaje error';
        return;
    }

    const carrito = obtenerCarrito();
    const resultado = validarCupon(codigo, carrito);

    if (!resultado.valido) {
        mensajeEl.textContent = '❌ ' + resultado.mensaje;
        mensajeEl.className = 'cupon-mensaje error';
        cuponActivo = null;
        descuentoAplicado = 0;
        localStorage.setItem('codigo_promocional', codigo);
        renderCarrito();
        return;
    }

    const promo = resultado.promo;
    const descuento = calcularDescuento(carrito, promo);
    cuponActivo = codigo;
    descuentoAplicado = descuento;
    localStorage.setItem('codigo_promocional', codigo);
    mensajeEl.textContent = '✅ Código aplicado correctamente.';
    mensajeEl.className = 'cupon-mensaje exito';

    renderCarrito();
}

// ── Renderizar carrito──
function renderCarrito() {
    const carrito = obtenerCarrito();
    const lista = document.getElementById('carrito-lista');
    const btnPagar = document.getElementById('btn-pagar');
    const mensajeEl = document.getElementById('mensaje-cupon');

    if (!Array.isArray(carrito) || carrito.length === 0) {
        cuponActivo = null;
        descuentoAplicado = 0;
        localStorage.removeItem('codigo_promocional');

        if (mensajeEl) {
            mensajeEl.textContent = '';
            mensajeEl.className = 'cupon-mensaje';
        }

        lista.innerHTML = `
            <div class="carrito-vacio">
                <span class="vacio-icono">🧙‍♂️</span>
                <p>Tu carrito está vacío.</p>
                <a href="catalogo.html" class="btn-explorar">Explorar catálogo</a>
            </div>
        `;
        document.getElementById('resumen-subtotal').textContent = '$0.00 MXN';
        document.getElementById('resumen-total').textContent = '$0.00 MXN';
        document.getElementById('linea-descuento').style.display = 'none';
        document.getElementById('resumen-descuento-aplicado').style.display = 'none';
        document.getElementById('linea-envio').style.display = 'none';
        btnPagar.style.opacity = '0.4';
        btnPagar.style.pointerEvents = 'none';
        return;
    }

    const codigoGuardado = cuponActivo || localStorage.getItem('codigo_promocional');
    if (codigoGuardado) {
        const resultado = validarCupon(codigoGuardado, carrito);
        if (resultado.valido) {
            cuponActivo = codigoGuardado;
            descuentoAplicado = calcularDescuento(carrito, resultado.promo);
            if (mensajeEl) {
                mensajeEl.textContent = '✅ Código aplicado correctamente.';
                mensajeEl.className = 'cupon-mensaje exito';
            }
        } else {
            cuponActivo = null;
            descuentoAplicado = 0;
            localStorage.removeItem('codigo_promocional');

            if (mensajeEl) {
                let mensajeError = '❌ Cupón eliminado: ya no aplica con tu carrito actual';

                if (codigoGuardado === 'LUNA20') {
                    const pociones = carrito.filter(item => item.categoria === 'Pociones');
                    const subtotalPociones = pociones.reduce((sum, item) => sum + (Number(item.precio) || 0) * (Number(item.cantidad) || 0), 0);

                    if (pociones.length === 0) {
                        mensajeError = '❌ Necesitas pociones en tu carrito para aplicar LUNA20';
                    } else {
                        const faltante = (200 - subtotalPociones).toFixed(2);
                        mensajeError = `❌ Necesitas $${faltante} más en pociones para aplicar LUNA20`;
                    }
                } else if (codigoGuardado === '2X1AMULETO') {
                    mensajeError = '❌ Necesitas al menos 2 amuletos para aplicar 2X1AMULETO';
                } else if (codigoGuardado === 'KITMAGO15') {
                    const categoriasRequeridas = ['Varitas', 'Libros', 'Calderos'];
                    const categoriasEnCarrito = [...new Set(carrito.map(item => item.categoria).filter(Boolean))];
                    const faltantes = categoriasRequeridas.filter(cat => !categoriasEnCarrito.includes(cat));
                    mensajeError = `❌ Te falta agregar: ${faltantes.join(', ')} para KITMAGO15`;
                } else if (codigoGuardado === 'ENVIOGATIS') {
                    const subtotalActual = carrito.reduce((sum, item) => sum + (Number(item.precio) || 0) * (Number(item.cantidad) || 0), 0);
                    if (subtotalActual <= 0) {
                        mensajeError = '❌ Agrega productos por al menos $500 para envío gratis';
                    } else {
                        const faltante = (500 - subtotalActual).toFixed(2);
                        mensajeError = `❌ Necesitas $${faltante} más para el envío gratis`;
                    }
                }

                mensajeEl.textContent = mensajeError;
                mensajeEl.className = 'cupon-mensaje error';
            }
        }
    } else if (mensajeEl) {
        mensajeEl.textContent = '';
        mensajeEl.className = 'cupon-mensaje';
    }

    btnPagar.style.opacity = '1';
    btnPagar.style.pointerEvents = 'auto';
    lista.innerHTML = '';

    let subtotal = 0;

    carrito.forEach(item => {

        const precio = Number(item.precio) || 0;
        const cantidad = Number(item.cantidad) || 0;

        // Sumar al subtotal
        subtotal += precio * cantidad;

        const fila = document.createElement('div');
        fila.className = 'carrito-item';

        fila.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}">
        
        <div class="item-info">
            <h4>${item.nombre}</h4>
            <p class="item-precio">
                $${precio.toFixed(2)} MXN
            </p>
        </div>

        <div class="item-cantidad">
            <button onclick="accionCarrito(${item.id}, -1)">−</button>
            <span>${cantidad}</span>
            <button onclick="accionCarrito(${item.id}, 1)">+</button>
        </div>

        <p class="item-subtotal">
            $${(precio * cantidad).toFixed(2)}
        </p>

        <button class="item-eliminar" onclick="eliminarItem(${item.id})" title="Eliminar">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

        lista.appendChild(fila);
    });

    document.getElementById('resumen-subtotal').textContent = `$${subtotal.toFixed(2)} MXN`;

    // ── Descuento ──
    const lineaDescuento = document.getElementById('linea-descuento');
    const bloqueDescuento = document.getElementById('resumen-descuento-aplicado');

    if (lineaDescuento && bloqueDescuento) {
        if (descuentoAplicado > 0) {
            lineaDescuento.style.display = 'flex';
            document.getElementById('resumen-descuento').textContent = `-$${descuentoAplicado.toFixed(2)} MXN`;
            bloqueDescuento.style.display = 'block';
            document.getElementById('resumen-descuento-monto').textContent = `-$${descuentoAplicado.toFixed(2)}`;
            document.getElementById('resumen-total-con-descuento').textContent = `$${(subtotal - descuentoAplicado).toFixed(2)} MXN`;
        } else {
            lineaDescuento.style.display = 'none';
            bloqueDescuento.style.display = 'none';
        }
    }

    // ── Total final ──
    const totalFinal = Math.max(0, subtotal - descuentoAplicado);
    document.getElementById('resumen-total').textContent = `$${totalFinal.toFixed(2)} MXN`;

    // ── Envío: solo visible si aplica ENVIOGATIS con monto mínimo cumplido o subtotal >= 500 sin cupón ──
    const lineaEnvio = document.getElementById('linea-envio');
    const envioTexto = document.getElementById('envio-texto');

    if (lineaEnvio && envioTexto) {
        const mostrarEnvioGratis = (cuponActivo === 'ENVIOGATIS' && subtotal >= 500) || (!cuponActivo && subtotal >= 500);

        if (mostrarEnvioGratis) {
            lineaEnvio.style.display = 'flex';
            if (cuponActivo === 'ENVIOGATIS') {
                envioTexto.innerHTML = 'Gratis <span style="font-size:0.65rem; background:rgba(74,222,128,0.2); padding:2px 8px; border-radius:12px; margin-left:6px;">por promoción</span>';
            } else {
                envioTexto.textContent = 'Gratis';
            }
        } else {
            lineaEnvio.style.display = 'none';
        }
    }
}