// ============================================
// JOBS CONTROLLER - Controlador de Empleos
// Gestiona la búsqueda, filtrado y postulación a empleos
// ============================================

const JobsController = {
  // Estado del controlador
  allJobs: [],
  filteredJobs: [],
  currentUser: null,
  expandedJobs: new Set(),
  
  // Elementos del DOM (se cachean para mejor performance)
  elements: {
    searchQuery: null,
    categoryFilter: null,
    typeFilter: null,
    jobsList: null,
    resultsCount: null,
    authLink: null
  },

  /**
   * Inicializar controlador de empleos
   */
  init() {
    console.log('🔍 Inicializando JobsController...');
    
    this.currentUser = AuthController.getCurrentUser();
    this.cacheElements();
    this.updateAuthLink();
    this.loadJobs();
    this.setupEventListeners();
    this.checkUrlParameters();
    
    console.log('✅ JobsController inicializado');
  },

  /**
   * Cachear referencias a elementos del DOM
   */
  cacheElements() {
    this.elements = {
      searchQuery: document.getElementById('searchQuery'),
      categoryFilter: document.getElementById('categoryFilter'),
      typeFilter: document.getElementById('typeFilter'),
      jobsList: document.getElementById('jobsList'),
      resultsCount: document.getElementById('resultsCount'),
      authLink: document.getElementById('authLink')
    };
  },

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const { searchQuery, categoryFilter, typeFilter } = this.elements;

    if (searchQuery) {
      searchQuery.addEventListener('input', () => this.filterJobs());
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.filterJobs());
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', () => this.filterJobs());
    }
  },

  /**
   * Actualizar enlace de autenticación en navbar
   */
  updateAuthLink() {
    const { authLink } = this.elements;
    
    if (!authLink) return;

    if (this.currentUser) {
      authLink.innerHTML = `
        <a href="dashboard.html" style="color: #667eea; font-weight: 600;">
          👤 ${this.escapeHtml(this.currentUser.name)}
        </a>
      `;
    } else {
      authLink.innerHTML = '<a href="login.html">Login</a>';
    }
  },

  /**
   * Cargar empleos desde storage
   */
  loadJobs() {
    console.log('📥 Cargando empleos...');
    
    this.allJobs = StorageManager.getJobs();
    this.filteredJobs = [...this.allJobs];
    
    console.log(`✅ ${this.allJobs.length} empleos cargados`);
    
    this.displayJobs();
  },

  /**
   * Filtrar empleos según criterios de búsqueda
   */
  filterJobs() {
    const { searchQuery, categoryFilter, typeFilter } = this.elements;

    const filters = {
      query: searchQuery ? searchQuery.value : '',
      category: categoryFilter ? categoryFilter.value : '',
      type: typeFilter ? typeFilter.value : ''
    };

    console.log('🔍 Aplicando filtros:', filters);

    this.filteredJobs = StorageManager.searchJobs(filters);
    this.displayJobs();
  },

  /**
   * Mostrar empleos en la página
   */
  displayJobs() {
    const { jobsList, resultsCount } = this.elements;

    if (!jobsList) {
      console.error('❌ Elemento jobsList no encontrado');
      return;
    }

    // Actualizar contador de resultados
    this.updateResultsCount();

    // Si no hay empleos, mostrar estado vacío
    if (this.filteredJobs.length === 0) {
      jobsList.innerHTML = this.renderEmptyState();
      return;
    }

    // Renderizar empleos
    const jobsHTML = this.filteredJobs
      .map(job => this.renderJobCard(job))
      .join('');

    jobsList.innerHTML = jobsHTML;
  },

  /**
   * Actualizar contador de resultados
   */
  updateResultsCount() {
    const { resultsCount } = this.elements;
    
    if (!resultsCount) return;

    const count = this.filteredJobs.length;
    resultsCount.textContent = `${count} ${count === 1 ? 'empleo encontrado' : 'empleos encontrados'}`;
  },

  /**
   * Renderizar tarjeta de empleo
   */
  renderJobCard(job) {
    const isExpanded = this.expandedJobs.has(job.id);
    const hasApplied = this.currentUser && StorageManager.hasApplied(job.id, this.currentUser.id);
    
    const typeBadgeClass = this.getTypeBadgeClass(job.type);
    const jobDate = this.formatDate(job.createdAt);
    
    return `
      <div class="job-card-custom" data-job-id="${job.id}">
        <div class="job-card-header">
          <div style="flex: 1;">
            <h3 class="job-card-title">${this.escapeHtml(job.title)}</h3>
            <p class="job-company">🏢 ${this.escapeHtml(job.company)}</p>
          </div>
          <span class="type-badge ${typeBadgeClass}">${this.escapeHtml(job.type)}</span>
        </div>
        
        <p class="job-description">${this.escapeHtml(job.description)}</p>
        
        <div class="job-meta-row">
          <span class="job-meta-item">📍 ${this.escapeHtml(job.location)}</span>
          <span class="job-meta-item job-salary">💰 ${this.escapeHtml(job.salary)}</span>
          <span class="job-meta-item">📂 ${this.getCategoryLabel(job.category)}</span>
        </div>
        
        ${isExpanded && job.requirements ? this.renderJobDetails(job) : ''}
        
        <div class="job-card-footer">
          <span class="job-date">📅 ${jobDate}</span>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button onclick="JobsController.toggleDetails('${job.id}')" class="btn-details">
              👁️ ${isExpanded ? 'Ver menos' : 'Ver más'}
            </button>
            <button 
              onclick="JobsController.applyToJob('${job.id}')" 
              class="btn-apply"
              ${hasApplied ? 'disabled' : ''}
            >
              ${hasApplied ? '✅ Ya postulaste' : '📨 Postular'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renderizar detalles expandidos del empleo
   */
  renderJobDetails(job) {
    return `
      <div class="job-details-expanded">
        <div class="job-requirements">
          <h4>📋 Requisitos:</h4>
          <p>${this.escapeHtml(job.requirements)}</p>
        </div>
        <p class="job-publisher-info">
          Publicado por <strong>${this.escapeHtml(job.employerName)}</strong>
        </p>
      </div>
    `;
  },

  /**
   * Renderizar estado vacío
   */
  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No se encontraron empleos</h3>
        <p>Intenta ajustar tus filtros de búsqueda</p>
      </div>
    `;
  },

  /**
   * Alternar detalles de un empleo
   */
  toggleDetails(jobId) {
    if (this.expandedJobs.has(jobId)) {
      this.expandedJobs.delete(jobId);
      console.log(`📦 Detalles colapsados: ${jobId}`);
    } else {
      this.expandedJobs.add(jobId);
      console.log(`📂 Detalles expandidos: ${jobId}`);
    }
    this.displayJobs();
  },

  /**
   * Postular a un empleo
   */
  applyToJob(jobId) {
    console.log(`📨 Intentando postular a empleo: ${jobId}`);
    
    // Verificar autenticación
    if (!this.currentUser) {
      if (confirm('Debes iniciar sesión para postular. ¿Ir a login?')) {
        window.location.href = 'login.html';
      }
      return;
    }

    // Verificar tipo de usuario
    if (this.currentUser.type === 'employer') {
      alert('❌ Los empleadores no pueden postular a empleos');
      return;
    }

    // Verificar si ya postuló
    if (StorageManager.hasApplied(jobId, this.currentUser.id)) {
      alert('⚠️ Ya has postulado a este empleo');
      return;
    }

    // Obtener datos del empleo
    const job = StorageManager.getJobById(jobId);
    if (!job) {
      alert('❌ Empleo no encontrado');
      return;
    }

    // Crear postulación
    const applicationData = {
      jobId: jobId,
      applicantId: this.currentUser.id,
      applicantName: this.currentUser.name,
      applicantEmail: this.currentUser.email
    };

    const application = StorageManager.createApplication(applicationData);
    
    if (application) {
      console.log('✅ Postulación creada:', application);
      alert(`✅ ¡Postulación enviada exitosamente a ${job.title}!`);
      this.displayJobs(); // Refrescar para actualizar botones
    } else {
      alert('❌ Error al enviar la postulación. Intenta de nuevo.');
    }
  },

  /**
   * Obtener clase CSS para badge de tipo de empleo
   */
  getTypeBadgeClass(type) {
    const classes = {
      'Tiempo Completo': 'badge-full',
      'Medio Tiempo': 'badge-part',
      'Remoto': 'badge-remote',
      'Por Proyecto': 'badge-project'
    };
    return classes[type] || 'badge-full';
  },

  /**
   * Obtener etiqueta legible de categoría
   */
  getCategoryLabel(category) {
    const labels = {
      'servicios': 'Servicios',
      'construccion': 'Construcción',
      'tecnologia': 'Tecnología',
      'educacion': 'Educación',
      'comercio': 'Comercio',
      'transporte': 'Transporte'
    };
    return labels[category] || category;
  },

  /**
   * Formatear fecha en formato legible
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Escapar HTML para prevenir XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Verificar y aplicar parámetros de URL
   */
  checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('categoria');
    
    if (category) {
      console.log(`🔗 Categoría desde URL: ${category}`);
      this.filterByCategory(category);
    }
  },

  /**
   * Filtrar por categoría (usado desde index.html)
   */
  filterByCategory(category) {
    const { categoryFilter } = this.elements;
    
    if (categoryFilter) {
      categoryFilter.value = category;
      this.filterJobs();
      
      // Actualizar título para indicar el filtro
      const searchTitle = document.querySelector('.search-title');
      if (searchTitle) {
        const categoryLabel = this.getCategoryLabel(category);
        searchTitle.textContent = `Empleos en ${categoryLabel}`;
      }
    }
  },

  /**
   * Refrescar lista de empleos
   */
  refresh() {
    console.log('🔄 Refrescando empleos...');
    this.loadJobs();
  }
};

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializar al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Página de búsqueda cargada');
  JobsController.init();
});

/**
 * Refrescar al volver a la página (desde caché)
 */
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('🔄 Página restaurada desde caché');
    JobsController.refresh();
  }
});