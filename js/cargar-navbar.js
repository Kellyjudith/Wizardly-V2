fetch('/components/navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar-placeholder').innerHTML = html;

    // Marcar el link activo según la página actual
    const paginaActual = document.body.dataset.page;
    if (paginaActual) {
      const linkActivo = document.querySelector(`.menu a[data-page="${paginaActual}"]`);
      if (linkActivo) linkActivo.classList.add('active');
    }

    // Actualizar el contador 
    if (typeof actualizarContador === 'function') {
      actualizarContador();
    }

    document.dispatchEvent(new Event('navbarCargado'));
  })
  .catch(err => console.error('Error cargando el navbar:', err));