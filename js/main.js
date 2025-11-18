// ============================================
// CARRUSEL DE IMÁGENES
// ============================================
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-fondo .slide');
  
  if (slides.length === 0) return;
  
  let index = 0;

  function cambiarSlide() {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
  }

  // Cambiar imagen cada 4 segundos
  setInterval(cambiarSlide, 4000);
}

// ============================================
// SMOOTH SCROLL PARA ENLACES INTERNOS
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Solo prevenir default si el href es más que solo "#"
      if (href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

// ============================================
// ACTIVAR LINK DEL NAVBAR SEGÚN SCROLL
// ============================================
function initNavbarActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar a');

  if (sections.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.scrollY >= (sectionTop - 100)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      if (href === `#${current}` || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  });
}

// ============================================
// TABS (Para página de Oportunidades)
// ============================================
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabButtons.length === 0) return;

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remover active de todos los botones y contenidos
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Activar el botón clickeado y su contenido
      button.classList.add('active');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// ============================================
// FILTROS DE EMPLEOS (Página Buscar)
// ============================================
function initFiltros() {
  const filtroButtons = document.querySelectorAll('.filtro-btn');
  const empleoCards = document.querySelectorAll('.empleo-card');

  if (filtroButtons.length === 0) return;

  filtroButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filtro = button.getAttribute('data-filtro');

      // Activar botón
      filtroButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filtrar empleos
      empleoCards.forEach(card => {
        if (filtro === 'todos') {
          card.style.display = 'block';
        } else {
          const tipo = card.getAttribute('data-tipo');
          card.style.display = tipo === filtro ? 'block' : 'none';
        }
      });
    });
  });
}

// ============================================
// FUNCIÓN DE BÚSQUEDA
// ============================================
function buscarEmpleos() {
  const searchJob = document.getElementById('searchJob');
  const searchLocation = document.getElementById('searchLocation');
  const searchCategory = document.getElementById('searchCategory');

  if (!searchJob) return;

  const job = searchJob.value.toLowerCase();
  const location = searchLocation ? searchLocation.value.toLowerCase() : '';
  const category = searchCategory ? searchCategory.value : '';

  console.log('Buscando:', { job, location, category });
  
  // Aquí puedes agregar la lógica de búsqueda real
  // Por ahora, solo mostramos una alerta
  if (job || location || category) {
    alert(`Buscando: ${job || 'Cualquier empleo'} en ${location || 'Cualquier ubicación'}`);
  } else {
    alert('Por favor, ingresa al menos un criterio de búsqueda');
  }
}

// Hacer la función disponible globalmente
window.buscarEmpleos = buscarEmpleos;

// ============================================
// ANIMACIÓN AL HACER SCROLL (Elementos aparecen)
// ============================================
function initScrollAnimation() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observar elementos que queremos animar
  const animatedElements = document.querySelectorAll('.card, .cat, .stat-card, .empleo-card, .oportunidad-card, .valor-card');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ============================================
// PAGINACIÓN (Página Buscar)
// ============================================
function initPaginacion() {
  const btnAnterior = document.querySelector('.btn-pag:first-child');
  const btnSiguiente = document.querySelector('.btn-pag:last-child');
  const numeros = document.querySelectorAll('.pag-num');

  if (!btnAnterior || !btnSiguiente) return;

  let paginaActual = 1;
  const totalPaginas = numeros.length;

  function actualizarPaginacion() {
    // Actualizar botones de número
    numeros.forEach((num, index) => {
      num.classList.toggle('active', index + 1 === paginaActual);
    });

    // Actualizar estado de botones anterior/siguiente
    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual === totalPaginas;

    // Scroll al inicio de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnAnterior.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      actualizarPaginacion();
    }
  });

  btnSiguiente.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      actualizarPaginacion();
    }
  });

  numeros.forEach((num, index) => {
    num.addEventListener('click', () => {
      paginaActual = index + 1;
      actualizarPaginacion();
    });
  });
}

// ============================================
// OBTENER PARÁMETROS DE URL (para filtros desde categorías)
// ============================================
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Si hay un parámetro de categoría en la URL, aplicar el filtro
function aplicarFiltroDesdeUrl() {
  const categoria = getUrlParameter('categoria');
  
  if (categoria) {
    const searchCategory = document.getElementById('searchCategory');
    if (searchCategory) {
      searchCategory.value = categoria;
      
      // Mostrar mensaje de que se filtró por categoría
      const buscador = document.querySelector('.buscador h2');
      if (buscador) {
        buscador.textContent = `🔍 Resultados para: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;
      }
    }
  }
}

// ============================================
// BOTÓN "VOLVER ARRIBA"
// ============================================
function initScrollToTop() {
  // Crear botón si no existe
  let btnTop = document.getElementById('btnScrollTop');
  
  if (!btnTop) {
    btnTop = document.createElement('button');
    btnTop.id = 'btnScrollTop';
    btnTop.innerHTML = '↑';
    btnTop.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
    `;
    document.body.appendChild(btnTop);

    btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mostrar/ocultar según scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btnTop.style.opacity = '1';
      btnTop.style.visibility = 'visible';
    } else {
      btnTop.style.opacity = '0';
      btnTop.style.visibility = 'hidden';
    }
  });
}

// ============================================
// CONTADOR ANIMADO PARA ESTADÍSTICAS
// ============================================
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  counters.forEach(counter => {
    const target = counter.textContent;
    const isPercentage = target.includes('%');
    const numericValue = parseInt(target.replace(/[^0-9]/g, ''));
    
    if (isNaN(numericValue)) return;

    let current = 0;
    const increment = numericValue / 50; // 50 pasos para la animación
    const timer = setInterval(() => {
      current += increment;
      
      if (current >= numericValue) {
        current = numericValue;
        clearInterval(timer);
      }
      
      if (isPercentage) {
        counter.textContent = Math.floor(current) + '%';
      } else {
        counter.textContent = Math.floor(current) + '+';
      }
    }, 30);
  });
}

// Usar Intersection Observer para animar cuando sea visible
function initCounterAnimation() {
  const statsSection = document.querySelector('.estadisticas, .estadisticas-sobre');
  
  if (!statsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

// ============================================
// INICIALIZAR TODO AL CARGAR LA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('EmpleaLocal - Sistema iniciado ✅');
  
  // Inicializar todas las funcionalidades
  initCarousel();
  initSmoothScroll();
  initNavbarActiveLink();
  initTabs();
  initFiltros();
  initScrollAnimation();
  initPaginacion();
  aplicarFiltroDesdeUrl();
  initScrollToTop();
  initCounterAnimation();
  
  console.log('Todas las funcionalidades cargadas correctamente 🚀');
});

// ============================================
// MANEJO DE ERRORES DE IMÁGENES
// ============================================
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    console.warn('Imagen no encontrada:', e.target.src);
    // Podrías agregar una imagen de placeholder aquí
    // e.target.src = 'imagenes/placeholder.png';
  }
}, true);

// ============================================
// EXPORTAR FUNCIONES ÚTILES
// ============================================
window.EmpleaLocal = {
  buscarEmpleos,
  version: '1.0.0',
  autor: 'EmpleaLocal Team'
};

console.log('EmpleaLocal v1.0.0 - Plataforma de empleos locales de Coracora 🏔️');