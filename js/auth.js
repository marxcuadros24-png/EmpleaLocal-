// ============================================
// AUTH CONTROLLER - Controlador de Autenticación
// Gestiona login, registro, sesiones y validaciones
// ============================================

const AuthController = {
  // Estado del controlador
  isLoginMode: true,
  selectedUserType: 'applicant',
  
  /**
   * Inicializar el formulario de login/registro
   */
  init() {
    console.log('🔐 Inicializando AuthController...');
    this.setupEventListeners();
    this.updateUI();
    console.log('✅ AuthController inicializado');
  },

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const form = document.getElementById('authForm');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleMode());
    }
  },

  /**
   * Alternar entre modo login y registro
   */
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    console.log(`🔄 Modo cambiado a: ${this.isLoginMode ? 'Login' : 'Registro'}`);
    this.updateUI();
    this.clearForm();
    this.clearAlert();
  },

  /**
   * Actualizar interfaz según el modo
   */
  updateUI() {
    const elements = {
      formTitle: document.getElementById('formTitle'),
      formSubtitle: document.getElementById('formSubtitle'),
      submitBtn: document.getElementById('submitBtn'),
      toggleText: document.getElementById('toggleText'),
      toggleBtn: document.getElementById('toggleBtn'),
      userTypeSelector: document.getElementById('userTypeSelector'),
      nameGroup: document.getElementById('nameGroup'),
      companyGroup: document.getElementById('companyGroup')
    };

    // Verificar que los elementos existan
    if (!elements.formTitle) {
      console.error('❌ Elementos del formulario no encontrados');
      return;
    }

    if (this.isLoginMode) {
      // Modo Login
      elements.formTitle.textContent = '👋 Bienvenido';
      elements.formSubtitle.textContent = 'Inicia sesión para continuar';
      elements.submitBtn.textContent = 'Iniciar Sesión';
      elements.toggleText.textContent = '¿No tienes cuenta?';
      elements.toggleBtn.textContent = 'Regístrate';
      elements.userTypeSelector.style.display = 'none';
      elements.nameGroup.style.display = 'none';
      elements.companyGroup.style.display = 'none';
    } else {
      // Modo Registro
      elements.formTitle.textContent = '🚀 Crear Cuenta';
      elements.formSubtitle.textContent = 'Únete a EmpleaLocal';
      elements.submitBtn.textContent = 'Crear Cuenta';
      elements.toggleText.textContent = '¿Ya tienes cuenta?';
      elements.toggleBtn.textContent = 'Inicia sesión';
      elements.userTypeSelector.style.display = 'grid';
      elements.nameGroup.style.display = 'block';
      this.selectUserType('applicant');
    }
  },

  /**
   * Seleccionar tipo de usuario (empleador/postulante)
   */
  selectUserType(type) {
    this.selectedUserType = type;
    console.log(`👤 Tipo de usuario seleccionado: ${type}`);
    
    const buttons = document.querySelectorAll('.user-type-btn');
    buttons.forEach(btn => {
      if (btn.dataset.type === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    const companyGroup = document.getElementById('companyGroup');
    const companyInput = document.getElementById('company');
    
    if (type === 'employer') {
      companyGroup.style.display = 'block';
      companyInput.required = true;
    } else {
      companyGroup.style.display = 'none';
      companyInput.required = false;
    }
  },

  /**
   * Manejar envío del formulario
   */
  handleSubmit(event) {
    event.preventDefault();
    this.clearAlert();
    
    const formData = this.getFormData();
    
    console.log(`📝 Procesando formulario en modo: ${this.isLoginMode ? 'Login' : 'Registro'}`);
    
    if (this.isLoginMode) {
      this.handleLogin(formData);
    } else {
      this.handleRegister(formData);
    }
  },

  /**
   * Obtener datos del formulario
   */
  getFormData() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('name');
    const companyInput = document.getElementById('company');
    
    const formData = {
      email: emailInput ? emailInput.value.trim() : '',
      password: passwordInput ? passwordInput.value : '',
      name: nameInput ? nameInput.value.trim() : '',
      company: companyInput ? companyInput.value.trim() : '',
      type: this.selectedUserType
    };
    
    console.log('📋 Datos del formulario obtenidos:', {
      email: formData.email,
      hasPassword: formData.password.length > 0,
      name: formData.name,
      company: formData.company,
      type: formData.type
    });
    
    return formData;
  },

  /**
   * Manejar login
   */
  handleLogin(formData) {
    console.log('🔑 Intentando iniciar sesión...');
    
    const user = StorageManager.validateCredentials(formData.email, formData.password);
    
    if (user) {
      console.log('✅ Login exitoso:', user.email);
      StorageManager.setCurrentUser(user);
      this.showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      console.log('❌ Login fallido: Credenciales incorrectas');
      this.showAlert('Email o contraseña incorrectos', 'error');
    }
  },

  /**
   * Manejar registro
   */
  handleRegister(formData) {
    console.log('📝 Intentando crear cuenta...');
    console.log('Datos del formulario:', formData);
    
    // Validaciones
    if (!formData.name || formData.name.trim() === '') {
      this.showAlert('Por favor, ingresa tu nombre', 'error');
      return;
    }
    
    if (formData.name.length < 3) {
      this.showAlert('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }
    
    if (formData.type === 'employer' && (!formData.company || formData.company.trim() === '')) {
      this.showAlert('Por favor, ingresa el nombre de tu empresa', 'error');
      return;
    }
    
    if (formData.type === 'employer' && formData.company.length < 3) {
      this.showAlert('El nombre de la empresa debe tener al menos 3 caracteres', 'error');
      return;
    }
    
    if (!this.validateEmail(formData.email)) {
      this.showAlert('Por favor, ingresa un email válido', 'error');
      return;
    }
    
    if (formData.password.length < 6) {
      this.showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    
    // Verificar si StorageManager está disponible
    if (typeof StorageManager === 'undefined') {
      console.error('❌ StorageManager no está disponible');
      this.showAlert('Error del sistema. Por favor, recarga la página.', 'error');
      return;
    }
    
    // Verificar si el email ya existe
    const existingUser = StorageManager.findUserByEmail(formData.email);
    if (existingUser) {
      console.log('❌ Registro fallido: Email ya existe');
      this.showAlert('Este email ya está registrado', 'error');
      return;
    }
    
    // Crear usuario
    try {
      const newUser = StorageManager.createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        type: formData.type,
        company: formData.company || ''
      });
      
      if (!newUser) {
        throw new Error('No se pudo crear el usuario');
      }
      
      console.log('✅ Usuario creado exitosamente:', newUser.email);
      
      // Login automático
      const saved = StorageManager.setCurrentUser(newUser);
      if (!saved) {
        throw new Error('No se pudo guardar la sesión');
      }
      
      console.log('✅ Sesión iniciada automáticamente');
      this.showAlert('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
      
      setTimeout(() => {
        console.log('🔄 Redirigiendo a dashboard...');
        window.location.href = 'dashboard.html';
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error al crear cuenta:', error);
      this.showAlert('Error al crear la cuenta. Por favor, intenta de nuevo.', 'error');
    }
  },

  /**
   * Validar formato de email
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Mostrar alerta
   */
  showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) {
      console.warn('⚠️ AlertBox no encontrado');
      return;
    }
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const icon = type === 'success' ? '✅' : '❌';
    
    alertBox.innerHTML = `<div class="alert ${alertClass}">${icon} ${message}</div>`;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.clearAlert();
    }, 5000);
  },

  /**
   * Limpiar alerta
   */
  clearAlert() {
    const alertBox = document.getElementById('alertBox');
    if (alertBox) {
      alertBox.innerHTML = '';
    }
  },

  /**
   * Limpiar formulario
   */
  clearForm() {
    const form = document.getElementById('authForm');
    if (form) {
      form.reset();
    }
  },

  /**
   * Verificar si el usuario está autenticado
   * Redirigir al login si no lo está
   */
  requireAuth(redirectUrl = 'login.html') {
    if (!StorageManager.isAuthenticated()) {
      console.log('⚠️ Usuario no autenticado, redirigiendo a login...');
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  /**
   * Cerrar sesión
   */
  logout(redirectUrl = 'index.html') {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      console.log('👋 Cerrando sesión...');
      StorageManager.logout();
      window.location.href = redirectUrl;
    }
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return StorageManager.getCurrentUser();
  }
};

// ============================================
// FUNCIONES GLOBALES
// ============================================

/**
 * Función global para cerrar sesión (usada en los enlaces del navbar)
 */
function logout() {
  AuthController.logout();
}

/**
 * Función global para seleccionar tipo de usuario
 */
function selectUserType(type) {
  AuthController.selectUserType(type);
}

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================

// Inicializar solo si estamos en la página de login
document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');
  if (authForm) {
    console.log('🚀 Página de autenticación detectada');
    AuthController.init();
  }
});