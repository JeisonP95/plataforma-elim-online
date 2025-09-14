// perfil-configuracion.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ Página de perfil y configuración cargada");

  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";

  // Verificar autenticación
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para acceder a esta página");
    window.location.href = "/pages/login/login1.html";
    return;
  }

  // Elementos del DOM
  const editarPerfilForm = document.getElementById("editarPerfilForm");
  const configuracionForm = document.getElementById("configuracionForm");
  const successMessage = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const successActions = document.querySelector(".success-actions");

  // Elementos del formulario de perfil
  const nombre = document.getElementById("nombre");
  const email = document.getElementById("email");
  const telefono = document.getElementById("telefono");
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  const currentAvatar = document.getElementById("currentAvatar");

  // Elementos de configuración
  const notificacionesEmail = document.getElementById("notificacionesEmail");
  const recordatorios = document.getElementById("recordatorios");
  const tema = document.getElementById("tema");
  const idioma = document.getElementById("idioma");
  const perfilPublico = document.getElementById("perfilPublico");

  // Verificar el modo desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");

  // Cargar datos del usuario
  await loadUserData();

  // Mostrar el formulario correspondiente
  if (mode === "config") {
    showConfiguracionForm();
  } else {
    showEditarPerfilForm();
  }

  // Event listeners
  if (editarPerfilForm) {
    editarPerfilForm.addEventListener("submit", handleProfileUpdate);
  }

  if (configuracionForm) {
    configuracionForm.addEventListener("submit", handleConfiguracionUpdate);
  }

  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener("click", handleAvatarChange);
  }

  // Validación de email en tiempo real
  if (email) {
    email.addEventListener("blur", validateEmail);
  }

  // Validación de teléfono en tiempo real
  if (telefono) {
    telefono.addEventListener("input", validatePhone);
  }

  async function loadUserData() {
    try {
      const response = await fetch(`${API_BASE}/api/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No autorizado");
      }

      const { user } = await response.json();
      
      // Actualizar campos del formulario de perfil
      if (nombre) {
        nombre.value = `${user.firstName} ${user.lastName}`;
      }
      if (email) {
        email.value = user.email || "";
      }
      if (telefono) {
        telefono.value = user.phone || "";
      }

      // Cargar configuraciones guardadas (si las hay)
      loadUserSettings();

    } catch (error) {
      console.error("Error cargando datos del usuario:", error);
      alert("Error cargando datos del usuario. Por favor recarga la página.");
    }
  }

  function loadUserSettings() {
    // Cargar configuraciones desde localStorage
    const settings = JSON.parse(localStorage.getItem("userSettings") || "{}");
    
    if (notificacionesEmail) {
      notificacionesEmail.checked = settings.notificacionesEmail !== false;
    }
    if (recordatorios) {
      recordatorios.checked = settings.recordatorios !== false;
    }
    if (tema) {
      tema.value = settings.tema || "claro";
    }
    if (idioma) {
      idioma.value = settings.idioma || "es";
    }
    if (perfilPublico) {
      perfilPublico.checked = settings.perfilPublico || false;
    }
  }

  function showEditarPerfilForm() {
    hideAllForms();
    if (editarPerfilForm) editarPerfilForm.style.display = "block";
  }

  function showConfiguracionForm() {
    hideAllForms();
    if (configuracionForm) configuracionForm.style.display = "block";
  }

  function hideAllForms() {
    if (editarPerfilForm) editarPerfilForm.style.display = "none";
    if (configuracionForm) configuracionForm.style.display = "none";
    if (successMessage) successMessage.style.display = "none";
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const fullName = nombre.value.trim();
    const userEmail = email.value.trim();
    const userPhone = telefono.value.trim();

    // Validaciones
    if (!fullName || !userEmail) {
      alert("El nombre y el correo electrónico son obligatorios");
      return;
    }

    if (!isValidEmail(userEmail)) {
      alert("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (userPhone && !isValidPhone(userPhone)) {
      alert("El teléfono debe contener solo números (7 a 15 dígitos)");
      return;
    }

    // Separar nombre y apellido
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: userEmail,
          phone: userPhone || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccessMessage(
          "Perfil actualizado",
          "Tu información personal ha sido actualizada exitosamente.",
          [
            { text: "Ver Configuración", action: () => showConfiguracionForm() },
            { text: "Volver al Dashboard", href: "/pages/dashboard/dashboard.html" }
          ]
        );
      } else {
        alert(`Error: ${result.message || "No se pudo actualizar el perfil"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Por favor intenta de nuevo.");
    }
  }

  function handleConfiguracionUpdate(e) {
    e.preventDefault();
    
    // Recopilar configuraciones
    const settings = {
      notificacionesEmail: notificacionesEmail ? notificacionesEmail.checked : false,
      recordatorios: recordatorios ? recordatorios.checked : false,
      tema: tema ? tema.value : "claro",
      idioma: idioma ? idioma.value : "es",
      perfilPublico: perfilPublico ? perfilPublico.checked : false,
    };

    // Guardar en localStorage
    localStorage.setItem("userSettings", JSON.stringify(settings));

    showSuccessMessage(
      "Configuración guardada",
      "Tus preferencias han sido guardadas exitosamente.",
      [
        { text: "Editar Perfil", action: () => showEditarPerfilForm() },
        { text: "Volver al Dashboard", href: "/pages/dashboard/dashboard.html" }
      ]
    );
  }

  function handleAvatarChange() {
    // Crear input de archivo temporal
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("La imagen debe ser menor a 5MB");
          return;
        }

        // Validar tipo
        if (!file.type.startsWith("image/")) {
          alert("Por favor selecciona una imagen válida");
          return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (currentAvatar) {
            currentAvatar.src = e.target.result;
          }
        };
        reader.readAsDataURL(file);

        // Aquí podrías subir la imagen al servidor
        alert("Funcionalidad de cambio de avatar en desarrollo. La imagen se actualizará cuando implementemos el servidor de archivos.");
      }
    });

    input.click();
  }

  function validateEmail() {
    const emailValue = email.value.trim();
    if (emailValue && !isValidEmail(emailValue)) {
      email.setCustomValidity("Por favor ingresa un correo electrónico válido");
    } else {
      email.setCustomValidity("");
    }
  }

  function validatePhone() {
    const phoneValue = telefono.value.trim();
    if (phoneValue && !isValidPhone(phoneValue)) {
      telefono.setCustomValidity("El teléfono debe contener solo números (7 a 15 dígitos)");
    } else {
      telefono.setCustomValidity("");
    }
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function isValidPhone(phone) {
    return /^[0-9]{7,15}$/.test(phone);
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
