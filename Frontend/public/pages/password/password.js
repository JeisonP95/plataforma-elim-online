// password.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";

  console.log("✅ Página de gestión de contraseñas cargada");

  // Elementos del DOM
  const recoverForm = document.getElementById("recoverForm");
  const changeForm = document.getElementById("changeForm");
  const successMessage = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const successActions = document.querySelector(".success-actions");

  // Obtener parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const token = urlParams.get("token");

  // Inicializar página según el modo
  initPage();

  function initPage() {
    if (mode === "change") {
      showChangePasswordForm();
    } else if (mode === "reset" && token) {
      showResetPasswordForm();
    } else {
      showRecoverPasswordForm();
    }
  }

  function showRecoverPasswordForm() {
    recoverForm.style.display = "block";
    changeForm.style.display = "none";
    successMessage.style.display = "none";
  }

  function showChangePasswordForm() {
    recoverForm.style.display = "none";
    changeForm.style.display = "block";
    successMessage.style.display = "none";
    
    // Configurar enlace de recuperación
    const forgotLink = document.getElementById("forgotPasswordLink");
    if (forgotLink) {
      forgotLink.addEventListener("click", (e) => {
        e.preventDefault();
        showRecoverPasswordForm();
      });
    }
  }

  function showResetPasswordForm() {
    recoverForm.style.display = "none";
    changeForm.style.display = "block";
    successMessage.style.display = "none";
    
    // Cambiar texto del formulario para reset
    const formHeader = changeForm.querySelector(".form-header h2");
    const formDescription = changeForm.querySelector(".form-header p");
    const currentPasswordField = document.getElementById("currentPassword");
    const forgotLink = document.getElementById("forgotPasswordLink");

    if (formHeader) formHeader.textContent = "Restablecer Contraseña";
    if (formDescription) formDescription.textContent = "Ingresa tu nueva contraseña";
    if (currentPasswordField) currentPasswordField.style.display = "none";
    if (forgotLink) forgotLink.style.display = "none";
  }

  // Validación de email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.toLowerCase());
  };

  // Validación de fortaleza de contraseña
  const validarFortalezaPassword = (password) => {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let score = 0;
    if (minLength) score++;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChar) score++;

    return { score, minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar };
  };

  // Mostrar indicador de fortaleza de contraseña
  const mostrarFortalezaPassword = (password) => {
    const strengthDiv = document.getElementById("passwordStrength");
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (!password) {
      strengthDiv.style.display = "none";
      return;
    }

    const validation = validarFortalezaPassword(password);
    strengthDiv.style.display = "block";

    // Actualizar barra de progreso
    const percentage = (validation.score / 5) * 100;
    strengthFill.style.width = `${percentage}%`;

    // Actualizar colores y texto
    let color, text;
    if (validation.score < 2) {
      color = "#e74c3c";
      text = "Muy débil";
    } else if (validation.score < 3) {
      color = "#f39c12";
      text = "Débil";
    } else if (validation.score < 4) {
      color = "#f1c40f";
      text = "Regular";
    } else if (validation.score < 5) {
      color = "#2ecc71";
      text = "Fuerte";
    } else {
      color = "#27ae60";
      text = "Muy fuerte";
    }

    strengthFill.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
  };

  // Event listener para mostrar fortaleza de contraseña
  const newPasswordField = document.getElementById("newPassword");
  if (newPasswordField) {
    newPasswordField.addEventListener("input", (e) => {
      mostrarFortalezaPassword(e.target.value);
    });
  }

  // Manejar formulario de recuperación
  if (recoverForm) {
    recoverForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = document.getElementById("recoverEmail").value.trim();
      
      if (!email) {
        alert("Por favor ingresa tu correo electrónico");
        return;
      }

      if (!validarEmail(email)) {
        alert("Por favor ingresa un correo electrónico válido");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (response.ok) {
          showSuccessMessage(
            "Email enviado correctamente",
            "Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.",
            [
              { text: "Volver al Login", href: "/pages/login/login1.html" },
              { text: "Intentar de nuevo", action: () => showRecoverPasswordForm() }
            ]
          );
        } else {
          alert(`Error: ${result.message || "No se pudo enviar el email"}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión. Por favor intenta de nuevo.");
      }
    });
  }

  // Manejar formulario de cambio/restablecimiento de contraseña
  if (changeForm) {
    changeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validaciones
      if (!newPassword || !confirmPassword) {
        alert("Por favor completa todos los campos");
        return;
      }

      if (newPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      // Si es modo reset (con token), no validar contraseña actual
      if (mode === "reset" && token) {
        try {
          const response = await fetch(`${API_BASE}/api/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword })
          });

          const result = await response.json();

          if (response.ok) {
            showSuccessMessage(
              "Contraseña restablecida",
              "Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.",
              [
                { text: "Iniciar Sesión", href: "/pages/login/login1.html" }
              ]
            );
          } else {
            alert(`Error: ${result.message || "No se pudo restablecer la contraseña"}`);
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Error de conexión. Por favor intenta de nuevo.");
        }
      } else {
        // Modo cambio de contraseña (requiere autenticación)
        if (!currentPassword) {
          alert("Por favor ingresa tu contraseña actual");
          return;
        }

        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("Debes iniciar sesión para cambiar tu contraseña");
            window.location.href = "/pages/login/login1.html";
            return;
          }

          const response = await fetch(`${API_BASE}/api/change-password`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
          });

          const result = await response.json();

          if (response.ok) {
            showSuccessMessage(
              "Contraseña cambiada",
              "Tu contraseña ha sido cambiada correctamente.",
              [
                { text: "Volver al Perfil", href: "/pages/perfil-configuracion/perfil-configuracion.html" },
                { text: "Ir al Dashboard", href: "/pages/dashboard/dashboard.html" }
              ]
            );
          } else {
            if (response.status === 401) {
              alert("Sesión expirada. Por favor inicia sesión de nuevo.");
              localStorage.removeItem("token");
              window.location.href = "/pages/login/login1.html";
            } else {
              alert(`Error: ${result.message || "No se pudo cambiar la contraseña"}`);
            }
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Error de conexión. Por favor intenta de nuevo.");
        }
      }
    });
  }

  // Función para mostrar mensaje de éxito
  function showSuccessMessage(title, message, actions = []) {
    successMessage.style.display = "block";
    recoverForm.style.display = "none";
    changeForm.style.display = "none";
    
    successText.innerHTML = `<strong>${title}</strong><br>${message}`;
    
    // Limpiar acciones anteriores
    successActions.innerHTML = "";
    
    // Agregar botones de acción
    actions.forEach(action => {
      const button = document.createElement("a");
      button.textContent = action.text;
      button.className = "btn-primary";
      
      if (action.href) {
        button.href = action.href;
      } else if (action.action) {
        button.addEventListener("click", action.action);
        button.style.cursor = "pointer";
      }
      
      successActions.appendChild(button);
    });
  }
});
