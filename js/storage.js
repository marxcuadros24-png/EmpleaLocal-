// ============================================
// STORAGE MANAGER - Capa de Datos
// ============================================

const StorageManager = {
  // Claves de almacenamiento
  KEYS: {
    USERS: 'emplealocal_users',
    JOBS: 'emplealocal_jobs',
    APPLICATIONS: 'emplealocal_applications',
    CURRENT_USER: 'emplealocal_currentUser'
  },

  // ============================================
  // MÉTODOS GENÉRICOS
  // ============================================
  
  /**
   * Obtener datos del localStorage
   * @param {string} key - Clave de almacenamiento
   * @returns {any} Datos parseados o null
   */
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error al obtener ${key}:`, error);
      return null;
    }
  },

  /**
   * Guardar datos en localStorage
   * @param {string} key - Clave de almacenamiento
   * @param {any} data - Datos a guardar
   * @returns {boolean} true si fue exitoso
   */
  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
      return false;
    }
  },

  /**
   * Eliminar datos del localStorage
   * @param {string} key - Clave de almacenamiento
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
      return false;
    }
  },

  // ============================================
  // USUARIOS
  // ============================================

  /**
   * Obtener todos los usuarios
   * @returns {Array} Lista de usuarios
   */
  getUsers() {
    return this.get(this.KEYS.USERS) || [];
  },

  /**
   * Guardar lista de usuarios
   * @param {Array} users - Lista de usuarios
   */
  saveUsers(users) {
    return this.set(this.KEYS.USERS, users);
  },

  /**
   * Buscar usuario por email
   * @param {string} email - Email del usuario
   * @returns {Object|null} Usuario encontrado o null
   */
  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  },

  /**
   * Crear nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Usuario creado
   */
  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  /**
   * Validar credenciales de usuario
   * @param {string} email - Email
   * @param {string} password - Contraseña
   * @returns {Object|null} Usuario si las credenciales son válidas
   */
  validateCredentials(email, password) {
    const users = this.getUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  },

  // ============================================
  // SESIÓN
  // ============================================

  /**
   * Obtener usuario actual (sesión)
   * @returns {Object|null} Usuario logueado
   */
  getCurrentUser() {
    return this.get(this.KEYS.CURRENT_USER);
  },

  /**
   * Establecer usuario actual (login)
   * @param {Object} user - Usuario a loguear
   */
  setCurrentUser(user) {
    return this.set(this.KEYS.CURRENT_USER, user);
  },

  /**
   * Cerrar sesión
   */
  logout() {
    return this.remove(this.KEYS.CURRENT_USER);
  },

  /**
   * Verificar si hay usuario logueado
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  // ============================================
  // EMPLEOS
  // ============================================

  /**
   * Obtener todos los empleos
   * @returns {Array} Lista de empleos
   */
  getJobs() {
    return this.get(this.KEYS.JOBS) || [];
  },

  /**
   * Guardar lista de empleos
   * @param {Array} jobs - Lista de empleos
   */
  saveJobs(jobs) {
    return this.set(this.KEYS.JOBS, jobs);
  },

  /**
   * Crear nuevo empleo
   * @param {Object} jobData - Datos del empleo
   * @returns {Object} Empleo creado
   */
  createJob(jobData) {
    const jobs = this.getJobs();
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    jobs.push(newJob);
    this.saveJobs(jobs);
    return newJob;
  },

  /**
   * Obtener empleo por ID
   * @param {string} jobId - ID del empleo
   * @returns {Object|null} Empleo encontrado
   */
  getJobById(jobId) {
    const jobs = this.getJobs();
    return jobs.find(j => j.id === jobId) || null;
  },

  /**
   * Actualizar empleo
   * @param {string} jobId - ID del empleo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object|null} Empleo actualizado
   */
  updateJob(jobId, updateData) {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === jobId);
    
    if (index === -1) return null;
    
    jobs[index] = { ...jobs[index], ...updateData };
    this.saveJobs(jobs);
    return jobs[index];
  },

  /**
   * Eliminar empleo
   * @param {string} jobId - ID del empleo
   * @returns {boolean} true si fue eliminado
   */
  deleteJob(jobId) {
    const jobs = this.getJobs();
    const filtered = jobs.filter(j => j.id !== jobId);
    
    if (filtered.length === jobs.length) return false;
    
    this.saveJobs(filtered);
    return true;
  },

  /**
   * Obtener empleos por empleador
   * @param {string} employerId - ID del empleador
   * @returns {Array} Lista de empleos
   */
  getJobsByEmployer(employerId) {
    const jobs = this.getJobs();
    return jobs.filter(j => j.employerId === employerId);
  },

  /**
   * Buscar empleos con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Array} Empleos filtrados
   */
  searchJobs(filters = {}) {
    let jobs = this.getJobs();
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query)
      );
    }
    
    if (filters.category) {
      jobs = jobs.filter(j => j.category === filters.category);
    }
    
    if (filters.type) {
      jobs = jobs.filter(j => j.type === filters.type);
    }
    
    if (filters.location) {
      const location = filters.location.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(location));
    }
    
    return jobs;
  },

  // ============================================
  // POSTULACIONES
  // ============================================

  /**
   * Obtener todas las postulaciones
   * @returns {Array} Lista de postulaciones
   */
  getApplications() {
    return this.get(this.KEYS.APPLICATIONS) || [];
  },

  /**
   * Guardar lista de postulaciones
   * @param {Array} applications - Lista de postulaciones
   */
  saveApplications(applications) {
    return this.set(this.KEYS.APPLICATIONS, applications);
  },

  /**
   * Crear nueva postulación
   * @param {Object} applicationData - Datos de la postulación
   * @returns {Object} Postulación creada
   */
  createApplication(applicationData) {
    const applications = this.getApplications();
    const newApplication = {
      id: Date.now().toString(),
      ...applicationData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    applications.push(newApplication);
    this.saveApplications(applications);
    return newApplication;
  },

  /**
   * Verificar si un usuario ya postuló a un empleo
   * @param {string} jobId - ID del empleo
   * @param {string} applicantId - ID del postulante
   * @returns {boolean}
   */
  hasApplied(jobId, applicantId) {
    const applications = this.getApplications();
    return applications.some(a => a.jobId === jobId && a.applicantId === applicantId);
  },

  /**
   * Obtener postulaciones por postulante
   * @param {string} applicantId - ID del postulante
   * @returns {Array} Lista de postulaciones
   */
  getApplicationsByApplicant(applicantId) {
    const applications = this.getApplications();
    return applications.filter(a => a.applicantId === applicantId);
  },

  /**
   * Obtener postulaciones por empleo
   * @param {string} jobId - ID del empleo
   * @returns {Array} Lista de postulaciones
   */
  getApplicationsByJob(jobId) {
    const applications = this.getApplications();
    return applications.filter(a => a.jobId === jobId);
  },

  /**
   * Obtener postulaciones de empleos de un empleador
   * @param {string} employerId - ID del empleador
   * @returns {Array} Lista de postulaciones
   */
  getApplicationsByEmployer(employerId) {
    const jobs = this.getJobsByEmployer(employerId);
    const jobIds = jobs.map(j => j.id);
    const applications = this.getApplications();
    return applications.filter(a => jobIds.includes(a.jobId));
  },

  // ============================================
  // INICIALIZACIÓN Y DATOS DE EJEMPLO
  // ============================================

  /**
   * Inicializar usuarios de prueba
   */
  initTestUsers() {
    const users = this.getUsers();
    
    if (users.length === 0) {
      const testUsers = [
        {
          id: 'user_employer_1',
          email: 'empleador@test.com',
          password: '123456',
          name: 'Juan Pérez',
          type: 'employer',
          company: 'Comercial Coracora',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user_applicant_1',
          email: 'postulante@test.com',
          password: '123456',
          name: 'María García',
          type: 'applicant',
          company: '',
          createdAt: new Date().toISOString()
        }
      ];
      
      this.saveUsers(testUsers);
      console.log('✅ Usuarios de prueba creados');
    }
  },

  /**
   * Inicializar empleos de ejemplo
   */
  initSampleJobs() {
    const jobs = this.getJobs();
    
    if (jobs.length === 0) {
      const sampleJobs = [
        {
          id: 'job_1',
          title: '🛍️ Auxiliar de Ventas',
          description: 'Buscamos persona proactiva para atención al cliente en tienda de ropa. Experiencia en ventas deseable.',
          category: 'comercio',
          location: 'Barrio Central, Coracora',
          salary: 'S/1,200 - S/1,500',
          type: 'Tiempo Completo',
          requirements: '- Secundaria completa\n- Experiencia mínima 6 meses\n- Buena presencia\n- Don de gente',
          employerId: 'user_employer_1',
          employerName: 'Juan Pérez',
          company: 'Comercial Coracora',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'job_2',
          title: '🏗️ Obrero de Construcción',
          description: 'Se necesita personal para obra de construcción. Trabajo en equipo, responsable y puntual.',
          category: 'construccion',
          location: 'Chihuacc, Coracora',
          salary: 'S/1,500 - S/1,800',
          type: 'Por Proyecto',
          requirements: '- Experiencia en construcción\n- Disponibilidad inmediata\n- Trabajo en altura',
          employerId: 'user_employer_1',
          employerName: 'Juan Pérez',
          company: 'Constructora Andes',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'job_3',
          title: '📚 Docente de Primaria',
          description: 'Institución educativa requiere docente de primaria con vocación de servicio y experiencia.',
          category: 'educacion',
          location: 'Centro de Coracora',
          salary: 'S/2,000 - S/2,500',
          type: 'Tiempo Completo',
          requirements: '- Título pedagógico\n- Experiencia mínima 2 años\n- Manejo de herramientas digitales',
          employerId: 'user_employer_1',
          employerName: 'Juan Pérez',
          company: 'I.E. San Pedro',
          status: 'active',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'job_4',
          title: '💻 Soporte Técnico',
          description: 'Empresa de tecnología busca técnico en sistemas para soporte y mantenimiento de equipos.',
          category: 'tecnologia',
          location: 'Coracora (Remoto posible)',
          salary: 'S/1,800 - S/2,200',
          type: 'Remoto',
          requirements: '- Conocimientos en hardware y software\n- Experiencia en redes\n- Disponibilidad para viajes ocasionales',
          employerId: 'user_employer_1',
          employerName: 'Juan Pérez',
          company: 'TechSolutions',
          status: 'active',
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 'job_5',
          title: '🚚 Conductor de Delivery',
          description: 'Restaurante local necesita conductor con moto para entregas. Horario flexible.',
          category: 'transporte',
          location: 'Coracora',
          salary: 'S/900 + comisiones',
          type: 'Medio Tiempo',
          requirements: '- Licencia de conducir vigente\n- Moto propia\n- Conocer la zona\n- Puntualidad',
          employerId: 'user_employer_1',
          employerName: 'Juan Pérez',
          company: 'Restaurant El Sabor',
          status: 'active',
          createdAt: new Date(Date.now() - 345600000).toISOString()
        }
      ];
      
      this.saveJobs(sampleJobs);
      console.log('✅ Empleos de ejemplo creados');
    }
  },

  /**
   * Inicializar toda la base de datos
   */
  initialize() {
    this.initTestUsers();
    this.initSampleJobs();
    console.log('✅ Sistema EmpleaLocal inicializado');
  },

  /**
   * Limpiar toda la base de datos
   */
  clearAll() {
    this.remove(this.KEYS.USERS);
    this.remove(this.KEYS.JOBS);
    this.remove(this.KEYS.APPLICATIONS);
    this.remove(this.KEYS.CURRENT_USER);
    console.log('🗑️ Base de datos limpiada');
  }
};

// Inicializar automáticamente al cargar
if (typeof window !== 'undefined') {
  StorageManager.initialize();
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}