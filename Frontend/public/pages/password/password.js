/* ========================================
   JAVASCRIPT PARA GESTIÓN DE CONTRASEÑA
   ======================================== */

// Variables globales
let currentMode = 'recover'; // 'recover' o 'change'

// ========================================
// 1. INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    checkPasswordStrength();
});

// ========================================
// 2. CONFIGURACIÓN INICIAL
// ========================================
function initializePage() {
    // Detectar el modo basado en la URL o parámetros
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'recover';
    
    // Configurar la página según el modo
    setMode(mode);
    
    // Mostrar el formulario apropiado
    showForm(mode);
}

function setMode(mode) {
    currentMode = mode;
    
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    if (mode === 'recover') {
        pageTitle.textContent = 'Recuperar Contraseña';
        pageDescription.textContent = 'Te ayudamos a recuperar el acceso a tu cuenta';
    } else if (mode === 'change') {
        pageTitle.textContent = 'Cambiar Contraseña';
        pageDescription.textContent = 'Actualiza tu contraseña de forma segura';
    }
}

function showForm(mode) {
    const recoverForm = document.getElementById('recoverForm');
    const changeForm = document.getElementById('changeForm');
    const successMessage = document.getElementById('successMessage');
    
    // Ocultar todos los formularios
    recoverForm.style.display = 'none';
    changeForm.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Mostrar el formulario apropiado
    if (mode === 'recover') {
        recoverForm.style.display = 'flex';
    } else if (mode === 'change') {
        changeForm.style.display = 'flex';
    }
}

// ========================================
// 3. EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Formulario de recuperar contraseña
    const recoverForm = document.getElementById('recoverForm');
    recoverForm.addEventListener('submit', handleRecoverPassword);
    
    // Formulario de cambiar contraseña
    const changeForm = document.getElementById('changeForm');
    changeForm.addEventListener('submit', handleChangePassword);
    
    // Enlace para cambiar a recuperar contraseña
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        setMode('recover');
        showForm('recover');
    });
    
    // Validación de contraseña en tiempo real
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
}

// ========================================
// 4. MANEJO DE FORMULARIOS
// ========================================
async function handleRecoverPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoverEmail').value;
    
    if (!validateEmail(email)) {
        showError('Por favor, ingresa un correo electrónico válido');
        return;
    }
    
    try {
        // Simular envío de email (aquí iría la llamada al backend)
        showLoading('Enviando enlace de recuperación...');
        
        await simulateApiCall(2000); // Simular delay de API
        
        showSuccess('recover', email);
        
    } catch (error) {
        showError('Error al enviar el enlace. Por favor, intenta nuevamente.');
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validaciones
    if (!currentPassword) {
        showError('Por favor, ingresa tu contraseña actual');
        return;
    }
    
    if (!validatePassword(newPassword)) {
        showError('La nueva contraseña no cumple con los requisitos de seguridad');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }
    
    if (currentPassword === newPassword) {
        showError('La nueva contraseña debe ser diferente a la actual');
        return;
    }
    
    try {
        // Simular cambio de contraseña (aquí iría la llamada al backend)
        showLoading('Cambiando contraseña...');
        
        await simulateApiCall(2000); // Simular delay de API
        
        showSuccess('change');
        
    } catch (error) {
        showError('Error al cambiar la contraseña. Por favor, intenta nuevamente.');
    }
}

// ========================================
// 5. VALIDACIONES
// ========================================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function checkPasswordStrength() {
    const passwordInput = document.getElementById('newPassword');
    const strengthBar = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const strengthContainer = document.getElementById('passwordStrength');
    
    if (!passwordInput || !strengthBar || !strengthText) return;
    
    const password = passwordInput.value;
    
    if (password.length === 0) {
        strengthContainer.style.display = 'none';
        return;
    }
    
    strengthContainer.style.display = 'block';
    
    let strength = 0;
    let strengthLabel = '';
    
    // Criterios de fortaleza
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    // Determinar nivel de fortaleza
    if (strength <= 2) {
        strengthBar.className = 'strength-fill weak';
        strengthText.className = 'strength-text weak';
        strengthLabel = 'Débil';
    } else if (strength === 3) {
        strengthBar.className = 'strength-fill fair';
        strengthText.className = 'strength-text fair';
        strengthLabel = 'Regular';
    } else if (strength === 4) {
        strengthBar.className = 'strength-fill good';
        strengthText.className = 'strength-text good';
        strengthLabel = 'Buena';
    } else {
        strengthBar.className = 'strength-fill strong';
        strengthText.className = 'strength-text strong';
        strengthLabel = 'Fuerte';
    }
    
    strengthText.textContent = `Fortaleza: ${strengthLabel}`;
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword.length > 0) {
        if (newPassword === confirmPassword) {
            confirmInput.style.borderColor = '#27ae60';
        } else {
            confirmInput.style.borderColor = '#e74c3c';
        }
    } else {
        confirmInput.style.borderColor = '#e1e1e1';
    }
}

// ========================================
// 6. MENSAJES Y UI
// ========================================
function showSuccess(mode, email = '') {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const successActions = successMessage.querySelector('.success-actions');
    
    if (mode === 'recover') {
        successText.textContent = `Se ha enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada y sigue las instrucciones.`;
        successActions.innerHTML = `
            <a href="/pages/login/login1.html" class="btn-primary">Ir al Login</a>
        `;
    } else if (mode === 'change') {
        successText.textContent = 'Tu contraseña ha sido cambiada exitosamente. Ya puedes usar tu nueva contraseña para iniciar sesión.';
        successActions.innerHTML = `
            <a href="/pages/dashboard/dashboard.html" class="btn-primary">Ir al Dashboard</a>
            <a href="/pages/login/login1.html" class="btn-secondary">Ir al Login</a>
        `;
    }
    
    // Ocultar formularios
    document.getElementById('recoverForm').style.display = 'none';
    document.getElementById('changeForm').style.display = 'none';
    
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
// 7. UTILIDADES
// ========================================
function simulateApiCall(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

// ========================================
// 8. FUNCIONES DE NAVEGACIÓN
// ========================================
function goToRecover() {
    window.location.href = '/pages/password/password.html?mode=recover';
}

function goToChange() {
    window.location.href = '/pages/password/password.html?mode=change';
}
