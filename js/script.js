// ── Partículas de estrellas en el hero ──
const canvas = document.getElementById('stardust');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function init() {
        stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.4 + 0.3,
            alpha: Math.random(),
            speed: Math.random() * 0.004 + 0.002,
            phase: Math.random() * Math.PI * 2
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            s.phase += s.speed;
            const a = (Math.sin(s.phase) + 1) / 2 * 0.7 + 0.1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(246, 213, 122, ${a})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); init(); });
    resize();
    init();
    draw();

    document.addEventListener("mousemove", function (e) {
        const sparkle = document.createElement("span");
        sparkle.classList.add("sparkle");
        sparkle.style.left = e.pageX + "px";
        sparkle.style.top = e.pageY + "px";
        document.body.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    });
}

function obtenerRutaPerfil() {
    return window.location.pathname.includes('/pages/') ? 'perfil.html' : 'pages/perfil.html';
}

function obtenerRutaLogin() {
    return window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
}

function actualizarNavbarUsuario() {
    const btnLogin = document.querySelector('.btn-login');
    if (!btnLogin) return;

    const estaLogueado = localStorage.getItem('usuarioLogueado') === 'true';
    const datosRaw = localStorage.getItem('usuarioDatos');
    let datosUsuario = null;

    try {
        datosUsuario = datosRaw ? JSON.parse(datosRaw) : null;
    } catch (error) {
        datosUsuario = null;
    }

    if (estaLogueado && datosUsuario?.nombre) {
        const nombre = String(datosUsuario.nombre).trim();
        const inicial = nombre.charAt(0).toUpperCase() || 'U';

        btnLogin.setAttribute('href', obtenerRutaPerfil());
        btnLogin.classList.add('btn-perfil-nav');
        btnLogin.innerHTML = `<span class="avatar-nav">${inicial}</span> Perfil`;
    } else {
        btnLogin.setAttribute('href', obtenerRutaLogin());
        btnLogin.classList.remove('btn-perfil-nav');
        btnLogin.innerHTML = 'Acceder';
    }
}

document.addEventListener('DOMContentLoaded', actualizarNavbarUsuario);
document.addEventListener('navbarCargado', actualizarNavbarUsuario);
window.addEventListener('storage', actualizarNavbarUsuario);