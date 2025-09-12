/* ========================================
   JAVASCRIPT PARA PERFIL Y CONFIGURACIÓN
   ======================================== */

// Variables globales
let currentMode = 'perfil'; // 'perfil' o 'configuracion'

// ========================================
// 1. INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadUserData();
});

// ========================================
// 2. CONFIGURACIÓN INICIAL
// ========================================
function initializePage() {
    // Detectar el modo basado en la URL o parámetros
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'perfil';
    
    // Configurar la página según el modo
    setMode(mode);
    
    // Mostrar el formulario apropiado
    showForm(mode);
}

function setMode(mode) {
    currentMode = mode;
    
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    if (mode === 'perfil') {
        pageTitle.textContent = 'Editar Perfil';
        pageDescription.textContent = 'Actualiza tu información personal';
    } else if (mode === 'configuracion') {
        pageTitle.textContent = 'Configuración';
        pageDescription.textContent = 'Personaliza tu experiencia en la plataforma';
    }
}

function showForm(mode) {
    const editarPerfilForm = document.getElementById('editarPerfilForm');
    const configuracionForm = document.getElementById('configuracionForm');
    const successMessage = document.getElementById('successMessage');
    
    // Ocultar todos los formularios
    editarPerfilForm.style.display = 'none';
    configuracionForm.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Mostrar el formulario apropiado
    if (mode === 'perfil') {
        editarPerfilForm.style.display = 'flex';
    } else if (mode === 'configuracion') {
        configuracionForm.style.display = 'flex';
    }
}

// ========================================
// 3. EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Formulario de editar perfil
    const editarPerfilForm = document.getElementById('editarPerfilForm');
    editarPerfilForm.addEventListener('submit', handleEditarPerfil);
    
    // Formulario de configuración
    const configuracionForm = document.getElementById('configuracionForm');
    configuracionForm.addEventListener('submit', handleConfiguracion);
    
    // Botón de cambiar avatar
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', handleChangeAvatar);
    }
    
    // Validación en tiempo real
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', validateEmail);
    }
    
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', validateTelefono);
    }
}

// ========================================
// 4. MANEJO DE FORMULARIOS
// ========================================
async function handleEditarPerfil(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    
    // Validaciones básicas
    if (!nombre.trim()) {
        showError('El nombre es obligatorio');
        return;
    }
    
    if (!validateEmailFormat(email)) {
        showError('Por favor, ingresa un correo electrónico válido');
        return;
    }
    
    if (telefono && !validateTelefonoFormat(telefono)) {
        showError('Por favor, ingresa un teléfono válido');
        return;
    }
    
    try {
        // Simular actualización de perfil (aquí iría la llamada al backend)
        showLoading('Guardando cambios...');
        
        await simulateApiCall(2000); // Simular delay de API
        
        showSuccess('perfil', { nombre, email });
        
    } catch (error) {
        showError('Error al guardar los cambios. Por favor, intenta nuevamente.');
    }
}

async function handleConfiguracion(e) {
    e.preventDefault();
    
    const notificacionesEmail = document.getElementById('notificacionesEmail').checked;
    const recordatorios = document.getElementById('recordatorios').checked;
    const tema = document.getElementById('tema').value;
    const idioma = document.getElementById('idioma').value;
    const perfilPublico = document.getElementById('perfilPublico').checked;
    
    try {
        // Simular guardado de configuración (aquí iría la llamada al backend)
        showLoading('Guardando configuración...');
        
        await simulateApiCall(1500); // Simular delay de API
        
        showSuccess('configuracion');
        
    } catch (error) {
        showError('Error al guardar la configuración. Por favor, intenta nuevamente.');
    }
}

// ========================================
// 5. FUNCIONES DE AVATAR
// ========================================
function handleChangeAvatar() {
    // Crear input de archivo temporal
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño del archivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('La imagen debe ser menor a 5MB');
                return;
            }
            
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showError('Por favor, selecciona una imagen válida');
                return;
            }
            
            // Mostrar preview de la imagen
            const reader = new FileReader();
            reader.onload = function(e) {
                const currentAvatar = document.getElementById('currentAvatar');
                currentAvatar.src = e.target.result;
                showSuccess('avatar');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// ========================================
// 6. VALIDACIONES
// ========================================
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    
    if (email && !validateEmailFormat(email)) {
        emailInput.style.background = '#ffe6e6';
        emailInput.style.border = '2px solid #e74c3c';
    } else {
        emailInput.style.background = '#f6f6fa';
        emailInput.style.border = 'none';
    }
}

function validateTelefono() {
    const telefonoInput = document.getElementById('telefono');
    const telefono = telefonoInput.value;
    
    if (telefono && !validateTelefonoFormat(telefono)) {
        telefonoInput.style.background = '#ffe6e6';
        telefonoInput.style.border = '2px solid #e74c3c';
    } else {
        telefonoInput.style.background = '#f6f6fa';
        telefonoInput.style.border = 'none';
    }
}

function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateTelefonoFormat(telefono) {
    // Acepta formatos como: +34 123 456 789, 123-456-789, (123) 456-789
    const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return telefonoRegex.test(telefono);
}

// ========================================
// 7. CARGA DE DATOS
// ========================================
function loadUserData() {
    // Simular carga de datos del usuario (aquí iría la llamada al backend)
    // Por ahora usamos datos de ejemplo
    const userData = {
        nombre: 'María González',
        email: 'maria.gonzalez@email.com',
        telefono: '+34 123 456 789',
        fechaNacimiento: '1990-05-15',
        avatar: '/Frontend/src/images/fotoperfil-profesor.jpg',
        configuracion: {
            notificacionesEmail: true,
            recordatorios: true,
            tema: 'claro',
            idioma: 'es',
            perfilPublico: false
        }
    };
    
    // Cargar datos en el formulario de perfil
    if (currentMode === 'perfil') {
        document.getElementById('nombre').value = userData.nombre;
        document.getElementById('email').value = userData.email;
        document.getElementById('telefono').value = userData.telefono;
        document.getElementById('fechaNacimiento').value = userData.fechaNacimiento;
    }
    
    // Cargar datos en el formulario de configuración
    if (currentMode === 'configuracion') {
        document.getElementById('notificacionesEmail').checked = userData.configuracion.notificacionesEmail;
        document.getElementById('recordatorios').checked = userData.configuracion.recordatorios;
        document.getElementById('tema').value = userData.configuracion.tema;
        document.getElementById('idioma').value = userData.configuracion.idioma;
        document.getElementById('perfilPublico').checked = userData.configuracion.perfilPublico;
    }
}

// ========================================
// 8. MENSAJES Y UI
// ========================================
function showSuccess(mode, data = {}) {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const successActions = successMessage.querySelector('.success-actions');
    
    if (mode === 'perfil') {
        successText.textContent = `¡Perfil actualizado exitosamente! Los cambios se han guardado para ${data.nombre}.`;
        successActions.innerHTML = `
            <a href="/pages/dashboard/dashboard.html" class="btn-primary">Ir al Dashboard</a>
            <a href="/pages/perfil-configuracion/perfil-configuracion.html?mode=configuracion" class="btn-secondary">Ir a Configuración</a>
        `;
    } else if (mode === 'configuracion') {
        successText.textContent = '¡Configuración guardada exitosamente! Tus preferencias han sido actualizadas.';
        successActions.innerHTML = `
            <a href="/pages/dashboard/dashboard.html" class="btn-primary">Ir al Dashboard</a>
            <a href="/pages/perfil-configuracion/perfil-configuracion.html?mode=perfil" class="btn-secondary">Editar Perfil</a>
        `;
    } else if (mode === 'avatar') {
        successText.textContent = '¡Foto de perfil actualizada! La nueva imagen se ha guardado correctamente.';
        successActions.innerHTML = `
            <a href="/pages/dashboard/dashboard.html" class="btn-primary">Ir al Dashboard</a>
        `;
    }
    
    // Ocultar formularios
    document.getElementById('editarPerfilForm').style.display = 'none';
    document.getElementById('configuracionForm').style.display = 'none';
    
    // Mostrar mensaje de éxito
    successMessage.style.display = 'block';
}

function showError(message) {
    // Crear o actualizar mensaje de error
    let errorDiv = document.getElementById('errorMessage');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: rgba(255, 107, 107, 0.2);
            color: #fff;
            padding: 1rem;
            border-radius: 8px;
            border: 2px solid rgba(255, 107, 107, 0.5);
            margin-bottom: 1rem;
            text-align: center;
            backdrop-filter: blur(5px);
            font-weight: 600;
        `;
        
        const form = document.querySelector('.contact-form');
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.textContent = message;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.remove();
        }
    }, 5000);
}

function showLoading(message) {
    // Crear mensaje de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingMessage';
    loadingDiv.className = 'loading-message';
    loadingDiv.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        padding: 1rem;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        margin-bottom: 1rem;
        text-align: center;
        backdrop-filter: blur(5px);
        font-weight: 600;
    `;
    loadingDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <div style="width: 20px; height: 20px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            ${message}
        </div>
    `;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    const form = document.querySelector('.contact-form');
    form.insertBefore(loadingDiv, form.firstChild);
    
    // Ocultar botones del formulario
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';
    }
}

// ========================================
// 9. UTILIDADES
// ========================================
function simulateApiCall(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

// ========================================
// 10. FUNCIONES DE NAVEGACIÓN
// ========================================
function goToPerfil() {
    window.location.href = '/pages/perfil-configuracion/perfil-configuracion.html?mode=perfil';
}

function goToConfiguracion() {
    window.location.href = '/pages/perfil-configuracion/perfil-configuracion.html?mode=configuracion';
}
