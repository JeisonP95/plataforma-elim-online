// password.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Página de gestión de contraseña cargada");

  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";

  // Elementos del DOM
  const recoverForm = document.getElementById("recoverForm");
  const changeForm = document.getElementById("changeForm");
  const successMessage = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const successActions = document.querySelector(".success-actions");

  // Elementos de formularios
  const recoverEmail = document.getElementById("recoverEmail");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordStrength = document.getElementById("passwordStrength");
  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");

  // Enlaces
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  // Verificar el modo desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");

  // Mostrar el formulario correspondiente
  if (mode === "change") {
    showChangePasswordForm();
  } else {
    showRecoverPasswordForm();
  }

  // Event listeners
  if (recoverForm) {
    recoverForm.addEventListener("submit", handlePasswordRecovery);
  }

  if (changeForm) {
    changeForm.addEventListener("submit", handlePasswordChange);
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRecoverPasswordForm();
    });
  }

  // Validación de fortaleza de contraseña
  if (newPassword) {
    newPassword.addEventListener("input", validatePasswordStrength);
  }

  if (confirmPassword) {
    confirmPassword.addEventListener("input", validatePasswordMatch);
  }

  function showRecoverPasswordForm() {
    hideAllForms();
    if (recoverForm) recoverForm.style.display = "block";
  }

  function showChangePasswordForm() {
    hideAllForms();
    if (changeForm) changeForm.style.display = "block";
  }

  function hideAllForms() {
    if (recoverForm) recoverForm.style.display = "none";
    if (changeForm) changeForm.style.display = "none";
    if (successMessage) successMessage.style.display = "none";
  }

  async function handlePasswordRecovery(e) {
    e.preventDefault();
    
    const email = recoverEmail.value.trim();
    if (!email) {
      alert("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Por favor ingresa un correo electrónico válido");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccessMessage(
          "Solicitud enviada",
          "Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.",
          [
            { text: "Volver al Login", href: "/pages/login/login1.html" },
            { text: "Intentar de Nuevo", action: () => showRecoverPasswordForm() }
          ]
        );
      } else {
        alert(`Error: ${result.message || "No se pudo procesar la solicitud"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Por favor intenta de nuevo.");
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPass = currentPassword.value;
    const newPass = newPassword.value;
    const confirmPass = confirmPassword.value;

    // Validaciones
    if (!currentPass || !newPass || !confirmPass) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (newPass.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPass !== confirmPass) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Verificar token de autenticación
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para cambiar tu contraseña");
      window.location.href = "/pages/login/login1.html";
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccessMessage(
          "Contraseña actualizada",
          "Tu contraseña ha sido cambiada exitosamente.",
          [
            { text: "Volver al Dashboard", href: "/pages/dashboard/dashboard.html" },
            { text: "Editar Perfil", href: "/pages/perfil-configuracion/perfil-configuracion.html" }
          ]
        );
      } else {
        alert(`Error: ${result.message || "No se pudo cambiar la contraseña"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Por favor intenta de nuevo.");
    }
  }

  function validatePasswordStrength() {
    const password = newPassword.value;
    const strength = calculatePasswordStrength(password);
    
    if (password.length > 0) {
      passwordStrength.style.display = "block";
      strengthFill.style.width = `${strength.score * 25}%`;
      strengthText.textContent = strength.text;
      
      // Cambiar color según la fortaleza
      strengthFill.className = "strength-fill";
      if (strength.score >= 3) {
        strengthFill.classList.add("strong");
      } else if (strength.score >= 2) {
        strengthFill.classList.add("medium");
      } else {
        strengthFill.classList.add("weak");
      }
    } else {
      passwordStrength.style.display = "none";
    }
  }

  function calculatePasswordStrength(password) {
    let score = 0;
    let text = "";

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 2) {
      text = "Débil";
    } else if (score < 4) {
      text = "Media";
    } else {
      text = "Fuerte";
    }

    return { score, text };
  }

  function validatePasswordMatch() {
    const newPass = newPassword.value;
    const confirmPass = confirmPassword.value;

    if (confirmPass && newPass !== confirmPass) {
      confirmPassword.setCustomValidity("Las contraseñas no coinciden");
    } else {
      confirmPassword.setCustomValidity("");
    }
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function showSuccessMessage(title, message, actions = []) {
    hideAllForms();
    
    if (successMessage) {
      successMessage.style.display = "block";
      successMessage.querySelector("h2").textContent = title;
      successText.textContent = message;
      
      // Limpiar acciones anteriores
      successActions.innerHTML = "";
      
      // Agregar nuevas acciones
      actions.forEach(action => {
        const button = document.createElement("button");
        button.textContent = action.text;
        button.className = "btn-primary";
        
        if (action.href) {
          button.addEventListener("click", () => {
            window.location.href = action.href;
          });
        } else if (action.action) {
          button.addEventListener("click", action.action);
        }
        
        successActions.appendChild(button);
      });
    }
  }
});
