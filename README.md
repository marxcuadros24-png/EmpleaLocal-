#  EmpleaLocal - Plataforma de Empleos Locales

Sistema completo de gestión de empleos para conectar trabajadores y empleadores en Coracora, Ayacucho.

## Estructura del Proyecto

```
emplealocal/
│
├── index.html                 # Página principal
├── login.html                 # Login y registro
├── dashboard.html             # Panel de control
├── buscar.html               # Búsqueda de empleos
├── oportunidades.html        # Oportunidades
├── sobre.html                # Sobre nosotros
│
├── css/
│   ├── styles.css           # Estilos generales (existente)
│   ├── auth.css             # Estilos de autenticación
│   ├── dashboard.css        # Estilos del panel
│   └── jobs.css             # Estilos de empleos
│
├── js/
│   ├── main.js              # Scripts generales (existente)
│   ├── storage.js           # Capa de datos / Base de datos
│   ├── auth.js              # Controlador de autenticación
│   ├── dashboard.js         # Controlador del panel
│   └── jobs.js              # Controlador de empleos
│
└── imagenes/                 # Imágenes del sitio
    ├── logo1.png
    ├── facebook.png
    ├── instagram.png
    └── linkedin.png
```

## Características Implementadas

### Sistema de Autenticación
- Login y registro de usuarios
- Dos tipos de usuarios: **Empleadores** y **Postulantes**
- Validación de credenciales
- Sesión persistente (localStorage)
- Protección de rutas

###  Panel de Empleador
- Publicar nuevas ofertas de empleo
- Ver todas las publicaciones
- Eliminar ofertas
- Ver estadísticas:
  - Total de empleos publicados
  - Total de postulaciones recibidas
  - Empleos activos

###  Panel de Postulante
- Ver historial de postulaciones
- Estadísticas personalizadas:
  - Postulaciones enviadas
  - Empleos disponibles
  - Nuevas ofertas esta semana

###  Búsqueda de Empleos
- Filtros avanzados:
  - Búsqueda por palabra clave
  - Filtro por categoría
  - Filtro por tipo de empleo
- Ver detalles completos de cada oferta
- Sistema de postulación con un solo clic
- Prevención de postulaciones duplicadas

###  Base de Datos Simulada
- Almacenamiento local persistente
- CRUD completo de empleos
- Gestión de usuarios
- Registro de postulaciones
- Datos de ejemplo precargados

##  Credenciales de Prueba

### Empleador
- **Email:** `empleador@test.com`
- **Contraseña:** `123456`
- **Empresa:** Comercial Coracora

### Postulante
- **Email:** `postulante@test.com`
- **Contraseña:** `123456`
- **Nombre:** María García

## Arquitectura del Sistema

### Patrón MVC (Modelo-Vista-Controlador)

#### **Modelo (storage.js)**
- Gestión de datos
- Operaciones CRUD
- Validaciones
- Inicialización de datos

#### **Vista (HTML + CSS)**
- Interfaz de usuario
- Presentación de datos
- Responsive design

#### **Controlador (auth.js, dashboard.js, jobs.js)**
- Lógica de negocio
- Manejo de eventos
- Comunicación entre Modelo y Vista

### Ventajas de esta Arquitectura

**Escalabilidad**: Fácil agregar nuevas funcionalidades
**Mantenibilidad**: Código organizado y modular
**Reutilización**: Componentes independientes
**Testeable**: Cada módulo se puede probar por separado
**Separación de Responsabilidades**: Cada archivo tiene un propósito específico

## Flujo de Datos

```
Usuario → Vista (HTML) → Controlador (JS) → Modelo (storage.js) → LocalStorage
                                    ↓
                              Actualización de Vista
```

## 🔧 API de Storage (storage.js)

### Usuarios
```javascript
StorageManager.getUsers()                    // Obtener todos
StorageManager.createUser(userData)          // Crear
StorageManager.findUserByEmail(email)        // Buscar
StorageManager.validateCredentials(email, pass) // Validar
StorageManager.getCurrentUser()              // Usuario actual
StorageManager.setCurrentUser(user)          // Establecer sesión
StorageManager.logout()                      // Cerrar sesión
```

### Empleos
```javascript
StorageManager.getJobs()                     // Obtener todos
StorageManager.createJob(jobData)            // Crear
StorageManager.getJobById(id)                // Buscar por ID
StorageManager.updateJob(id, data)           // Actualizar
StorageManager.deleteJob(id)                 // Eliminar
StorageManager.getJobsByEmployer(employerId) // Por empleador
StorageManager.searchJobs(filters)           // Buscar con filtros
```

### Postulaciones
```javascript
StorageManager.getApplications()                    // Obtener todas
StorageManager.createApplication(appData)           // Crear
StorageManager.hasApplied(jobId, applicantId)       // Verificar
StorageManager.getApplicationsByApplicant(id)       // Por postulante
StorageManager.getApplicationsByJob(jobId)          // Por empleo
StorageManager.getApplicationsByEmployer(employerId) // Por empleador
```

## Cómo Extender el Sistema

### Agregar una nueva funcionalidad

1. **Crear nuevo controlador** (ej: `notifications.js`)
2. **Agregar métodos al storage** si es necesario
3. **Crear estilos específicos** (ej: `notifications.css`)
4. **Crear vista HTML**
5. **Importar scripts en orden correcto**

Ejemplo:
```html
<script src="js/storage.js"></script>
<script src="js/auth.js"></script>
<script src="js/notifications.js"></script> <!-- NUEVO -->
```

## Depuración

### Ver datos en consola
```javascript
// En la consola del navegador
console.log(StorageManager.getUsers());
console.log(StorageManager.getJobs());
console.log(StorageManager.getApplications());
```

### Limpiar base de datos
```javascript
StorageManager.clearAll();
StorageManager.initialize(); // Reiniciar con datos de ejemplo
```

##  Compatibilidad

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Navegadores móviles modernos

##  Seguridad

**IMPORTANTE**: Este es un sistema de demostración que usa localStorage.

Para producción, deberías:
- Implementar backend real (Node.js, PHP, Python, etc.)
- Usar base de datos real (MySQL, PostgreSQL, MongoDB)
- Implementar autenticación segura (JWT, OAuth)
- Encriptar contraseñas (bcrypt, Argon2)
- Usar HTTPS
- Validar datos en servidor
- Implementar rate limiting
- Agregar protección CSRF

##  Próximas Mejoras 

1. **Sistema de Mensajería** entre empleadores y postulantes
2. **Notificaciones** de nuevas ofertas y postulaciones
3. **Subida de CV** en formato PDF
4. **Calificaciones y Reseñas** para empleadores
5. **Mapa Interactivo** con ubicaciones de empleos
6. **Filtros Avanzados** (rango salarial, experiencia)
7. **PWA** (aplicación instalable offline)
8. **Exportar CV** a diferentes formatos
9. **Panel de Analytics** para empleadores
10. **Sistema de Favoritos** para postulantes

##  Soporte

Para dudas o problemas:
- Email: info@emplealocal.pe
- Tel: +51 999 999 999
- Ubicación: Coracora, Ayacucho, Perú

##  Licencia

© 2025 EmpleaLocal - Todos los derechos reservados

---

**Desarrollado con cariño para la comunidad de Coracora**