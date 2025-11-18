// ============================================
// DASHBOARD CONTROLLER - Controlador del Panel
// Gestiona el panel de empleadores y postulantes
// ============================================

const DashboardController = {
  currentUser: null,

  /**
   * Inicializar dashboard
   */
  init() {
    console.log('📊 Inicializando DashboardController...');
    
    // Verificar autenticación
    if (!AuthController.requireAuth()) {
      return;
    }

    this.currentUser = AuthController.getCurrentUser();
    
    if (!this.currentUser) {
      console.error('❌ No se pudo obtener el usuario actual');
      window.location.href = 'login.html';
      return;
    }

    console.log(`👤 Usuario actual: ${this.currentUser.name} (${this.currentUser.type})`);

    this.updateUserInfo();
    
    if (this.currentUser.type === 'employer') {
      this.loadEmployerDashboard();
    } else {
      this.loadApplicantDashboard();
    }

    this.setupEventListeners();
    
    console.log('✅ DashboardController inicializado');
  },

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const actionBtn = document.getElementById('actionButton');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => this.openJobModal());
    }

    const jobForm = document.getElementById('jobForm');
    if (jobForm) {
      jobForm.addEventListener('submit', (e) => this.handleJobSubmit(e));
    }
  },

  /**
   * Actualizar información del usuario en el header
   */
  updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      const displayText = this.currentUser.type === 'employer' 
        ? this.currentUser.company 
        : this.currentUser.name;
      
      userInfo.textContent = displayText;
    }
  },

  /**
   * Cargar dashboard de empleador
   */
  loadEmployerDashboard() {
    console.log('💼 Cargando dashboard de empleador...');
    
    document.getElementById('dashboardTitle').textContent = 'Panel de Empleador';
    
    // Mostrar botón de nueva oferta
    const actionBtn = document.getElementById('actionButton');
    if (actionBtn) {
      actionBtn.style.display = 'block';
      actionBtn.textContent = '+ Nueva Oferta';
    }

    const myJobs = StorageManager.getJobsByEmployer(this.currentUser.id);
    const myApplications = StorageManager.getApplicationsByEmployer(this.currentUser.id);

    console.log(`📊 Estadísticas: ${myJobs.length} empleos, ${myApplications.length} postulaciones`);

    this.renderEmployerStats(myJobs, myApplications);
    this.renderEmployerJobs(myJobs);
  },

  /**
   * Renderizar estadísticas de empleador
   */
  renderEmployerStats(jobs, applications) {
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    
    const statsHTML = `
      <div class="stat-card">
        <div class="stat-info">
          <h3>${jobs.length}</h3>
          <p>Empleos Publicados</p>
        </div>
        <div class="stat-icon">💼</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <h3>${applications.length}</h3>
          <p>Postulaciones</p>
        </div>
        <div class="stat-icon">📨</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <h3>${activeJobs}</h3>
          <p>Activos</p>
        </div>
        <div class="stat-icon">✅</div>
      </div>
    `;
    
    document.getElementById('statsGrid').innerHTML = statsHTML;
  },

  /**
   * Renderizar empleos del empleador
   */
  renderEmployerJobs(jobs) {
    let html = '<div class="content-section"><h2>Mis Ofertas Publicadas</h2>';
    
    if (jobs.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">💼</div>
          <p>No has publicado ninguna oferta aún</p>
          <button onclick="DashboardController.openJobModal()" class="btn-primary-custom" style="margin-top: 1rem;">
            Publicar tu primera oferta
          </button>
        </div>
      `;
    } else {
      jobs.forEach(job => {
        const jobApplications = StorageManager.getApplicationsByJob(job.id);
        html += this.renderJobCard(job, jobApplications.length);
      });
    }
    
    html += '</div>';
    document.getElementById('mainContent').innerHTML = html;
  },

  /**
   * Renderizar tarjeta de empleo
   */
  renderJobCard(job, applicationsCount) {
    return `
      <div class="job-item">
        <div class="job-header">
          <div style="flex: 1;">
            <h3 class="job-title">${this.escapeHtml(job.title)}</h3>
            <p style="color: #666; margin: 0.5rem 0;">${this.escapeHtml(job.description)}</p>
            <div class="job-meta">
              <span>📍 ${this.escapeHtml(job.location)}</span>
              <span>💰 ${this.escapeHtml(job.salary)}</span>
              <span>⏰ ${this.escapeHtml(job.type)}</span>
            </div>
            <p style="margin-top: 0.5rem;">
              <strong style="color: #667eea;">${applicationsCount} postulaciones</strong>
            </p>
          </div>
          <button onclick="DashboardController.deleteJob('${job.id}')" class="btn-delete">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Cargar dashboard de postulante
   */
  loadApplicantDashboard() {
    console.log('👤 Cargando dashboard de postulante...');
    
    document.getElementById('dashboardTitle').textContent = 'Panel de Postulante';
    
    const jobs = StorageManager.getJobs();
    const myApplications = StorageManager.getApplicationsByApplicant(this.currentUser.id);

    console.log(`📊 Estadísticas: ${myApplications.length} postulaciones, ${jobs.length} empleos disponibles`);

    this.renderApplicantStats(jobs, myApplications);
    this.renderApplicantApplications(myApplications, jobs);
  },

  /**
   * Renderizar estadísticas de postulante
   */
  renderApplicantStats(allJobs, myApplications) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newJobsCount = allJobs.filter(j => new Date(j.createdAt) > weekAgo).length;

    const statsHTML = `
      <div class="stat-card">
        <div class="stat-info">
          <h3>${myApplications.length}</h3>
          <p>Postulaciones Enviadas</p>
        </div>
        <div class="stat-icon">📨</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <h3>${allJobs.length}</h3>
          <p>Empleos Disponibles</p>
        </div>
        <div class="stat-icon">💼</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <h3>${newJobsCount}</h3>
          <p>Nuevas Esta Semana</p>
        </div>
        <div class="stat-icon">🆕</div>
      </div>
    `;
    
    document.getElementById('statsGrid').innerHTML = statsHTML;
  },

  /**
   * Renderizar postulaciones del postulante
   */
  renderApplicantApplications(applications, allJobs) {
    let html = '<div class="content-section"><h2>Mis Postulaciones</h2>';
    
    if (applications.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">📨</div>
          <p>No has enviado ninguna postulación aún</p>
          <a href="buscar.html" class="btn-primary-custom" style="margin-top: 1rem; display: inline-block; text-decoration: none;">
            Buscar empleos
          </a>
        </div>
      `;
    } else {
      applications.forEach(app => {
        const job = allJobs.find(j => j.id === app.jobId);
        if (job) {
          html += this.renderApplicationCard(app, job);
        }
      });
    }
    
    html += '</div>';
    
    // CTA
    html += `
      <div class="content-section cta-section">
        <h3 style="font-size: 2rem; margin-top: 0;">¿Listo para tu próximo trabajo?</h3>
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.95;">
          Explora todas las oportunidades disponibles en Coracora
        </p>
        <a href="buscar.html" class="btn-primary-custom" style="background: white; color: #667eea; text-decoration: none; display: inline-block;">
          Ver Todos los Empleos
        </a>
      </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
  },

  /**
   * Renderizar tarjeta de postulación
   */
  renderApplicationCard(application, job) {
    const appDate = new Date(application.createdAt).toLocaleDateString('es-PE');
    
    return `
      <div class="application-item">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
          <div style="flex: 1;">
            <h3 class="job-title">${this.escapeHtml(job.title)}</h3>
            <p style="color: #666; margin: 0.3rem 0;">${this.escapeHtml(job.company)}</p>
            <div class="job-meta">
              <span>📍 ${this.escapeHtml(job.location)}</span>
              <span>💰 ${this.escapeHtml(job.salary)}</span>
            </div>
            <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #999;">
              Postulado el ${appDate}
            </p>
          </div>
          <span class="badge badge-pending">En revisión</span>
        </div>
      </div>
    `;
  },

  /**
   * Abrir modal para crear empleo
   */
  openJobModal() {
    console.log('📝 Abriendo modal de nuevo empleo...');
    const modal = document.getElementById('jobModal');
    if (modal) {
      modal.classList.add('active');
    }
  },

  /**
   * Cerrar modal
   */
  closeJobModal() {
    console.log('❌ Cerrando modal...');
    const modal = document.getElementById('jobModal');
    if (modal) {
      modal.classList.remove('active');
    }
    
    const form = document.getElementById('jobForm');
    if (form) {
      form.reset();
    }
  },

  /**
   * Manejar envío de formulario de empleo
   */
  handleJobSubmit(event) {
    event.preventDefault();
    
    console.log('💼 Creando nueva oferta de empleo...');
    
    const formData = {
      title: document.getElementById('jobTitle').value,
      description: document.getElementById('jobDescription').value,
      category: document.getElementById('jobCategory').value,
      location: document.getElementById('jobLocation').value,
      salary: document.getElementById('jobSalary').value,
      type: document.getElementById('jobType').value,
      requirements: document.getElementById('jobRequirements').value,
      employerId: this.currentUser.id,
      employerName: this.currentUser.name,
      company: this.currentUser.company
    };
    
    // Validaciones
    if (!formData.title || formData.title.length < 5) {
      alert('❌ El título debe tener al menos 5 caracteres');
      return;
    }
    
    if (!formData.description || formData.description.length < 20) {
      alert('❌ La descripción debe tener al menos 20 caracteres');
      return;
    }
    
    const newJob = StorageManager.createJob(formData);
    
    if (newJob) {
      console.log('✅ Empleo creado exitosamente:', newJob.id);
      this.closeJobModal();
      alert('✅ Oferta publicada exitosamente');
      this.loadEmployerDashboard();
    } else {
      console.error('❌ Error al crear empleo');
      alert('❌ Error al publicar la oferta. Intenta de nuevo.');
    }
  },

  /**
   * Eliminar empleo
   */
  deleteJob(jobId) {
    console.log(`🗑️ Intentando eliminar empleo: ${jobId}`);
    
    if (confirm('¿Estás seguro de eliminar esta oferta?')) {
      const deleted = StorageManager.deleteJob(jobId);
      
      if (deleted) {
        console.log('✅ Empleo eliminado');
        alert('✅ Oferta eliminada');
        this.loadEmployerDashboard();
      } else {
        console.error('❌ Error al eliminar empleo');
        alert('❌ Error al eliminar la oferta');
      }
    }
  },

  /**
   * Escapar HTML para prevenir XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ============================================
// FUNCIONES GLOBALES
// ============================================

/**
 * Función global para abrir modal de empleo
 */
function openJobModal() {
  DashboardController.openJobModal();
}

/**
 * Función global para cerrar modal
 */
function closeJobModal() {
  DashboardController.closeJobModal();
}

/**
 * Función global para eliminar empleo
 */
function deleteJob(jobId) {
  DashboardController.deleteJob(jobId);
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializar al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Página de dashboard cargada');
  DashboardController.init();
});