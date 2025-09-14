// perfil-configuracion.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";

  console.log("✅ Página de perfil y configuración cargada");

  // Elementos del DOM
  const editarPerfilForm = document.getElementById("editarPerfilForm");
  const configuracionForm = document.getElementById("configuracionForm");
  const successMessage = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const successActions = document.querySelector(".success-actions");
  const pageTitle = document.getElementById("pageTitle");
  const pageDescription = document.getElementById("pageDescription");

  // Obtener parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");

  // Verificar autenticación
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para acceder a esta página");
    window.location.href = "/pages/login/login1.html";
    return;
  }

  // Inicializar página
  initPage();

  function initPage() {
    if (mode === "config") {
      showConfiguracionForm();
    } else {
      showEditarPerfilForm();
    }
    
    // Cargar datos del usuario
    loadUserProfile();
    
    // Configurar navegación entre modos
    setupModeNavigation();
  }

  function setupModeNavigation() {
    const profileModeBtn = document.getElementById("profileModeBtn");
    const configModeBtn = document.getElementById("configModeBtn");

    if (profileModeBtn) {
      profileModeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showEditarPerfilForm();
        // Actualizar URL sin recargar página
        const url = new URL(window.location);
        url.searchParams.set("mode", "profile");
        window.history.pushState({}, "", url);
      });
    }

    if (configModeBtn) {
      configModeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showConfiguracionForm();
        // Actualizar URL sin recargar página
        const url = new URL(window.location);
        url.searchParams.set("mode", "config");
        window.history.pushState({}, "", url);
      });
    }
  }

  function showEditarPerfilForm() {
    editarPerfilForm.style.display = "block";
    configuracionForm.style.display = "none";
    successMessage.style.display = "none";
    
    if (pageTitle) pageTitle.textContent = "Editar Perfil";
    if (pageDescription) pageDescription.textContent = "Actualiza tu información personal";
  }

  function showConfiguracionForm() {
    editarPerfilForm.style.display = "none";
    configuracionForm.style.display = "block";
    successMessage.style.display = "none";
    
    if (pageTitle) pageTitle.textContent = "Configuración";
    if (pageDescription) pageDescription.textContent = "Personaliza tu experiencia en la plataforma";
  }

  // Cargar perfil del usuario
  async function loadUserProfile() {
    try {
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        // Llenar formulario de editar perfil
        if (user) {
          document.getElementById("nombre").value = `${user.firstName} ${user.lastName}`;
          document.getElementById("email").value = user.email || "";
          document.getElementById("telefono").value = user.phone || "";
          
          // Actualizar avatar si existe
          const avatar = document.getElementById("currentAvatar");
          if (avatar && user.avatar) {
            avatar.src = user.avatar;
          }
        }
      } else if (response.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión de nuevo.");
        localStorage.removeItem("token");
        window.location.href = "/pages/login/login1.html";
      } else {
        console.error("Error cargando perfil:", response.statusText);
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  }

  // Validación de email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.toLowerCase());
  };

  // Validación de teléfono
  const validarTelefono = (tel) => {
    if (!tel) return true; // opcional
    return /^[0-9]{7,15}$/.test(tel);
  };

  // Manejar formulario de editar perfil
  if (editarPerfilForm) {
    editarPerfilForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const nombreCompleto = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const telefono = document.getElementById("telefono").value.trim();

      // Validaciones
      if (!nombreCompleto || !email) {
        alert("Nombre y email son obligatorios");
        return;
      }

      if (!validarEmail(email)) {
        alert("Por favor ingresa un correo electrónico válido");
        return;
      }

      if (telefono && !validarTelefono(telefono)) {
        alert("El teléfono debe contener solo números (7 a 15 dígitos)");
        return;
      }

      // Separar nombre y apellido
      const nombreParts = nombreCompleto.split(" ");
      const firstName = nombreParts[0];
      const lastName = nombreParts.slice(1).join(" ") || "";

      if (!firstName) {
        alert("Por favor ingresa al menos tu nombre");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/users/profile`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone: telefono || undefined
          })
        });

        const result = await response.json();

        if (response.ok) {
          showSuccessMessage(
            "Perfil actualizado",
            "Tu información personal ha sido actualizada correctamente.",
            [
              { text: "Ver Configuración", action: () => showConfiguracionForm() },
              { text: "Volver al Dashboard", href: "/pages/dashboard/dashboard.html" }
            ]
          );
        } else if (response.status === 401) {
          alert("Sesión expirada. Por favor inicia sesión de nuevo.");
          localStorage.removeItem("token");
          window.location.href = "/pages/login/login1.html";
        } else {
          alert(`Error: ${result.message || "No se pudo actualizar el perfil"}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión. Por favor intenta de nuevo.");
      }
    });
  }

  // Manejar formulario de configuración
  if (configuracionForm) {
    configuracionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Obtener valores de configuración
      const notificacionesEmail = document.getElementById("notificacionesEmail").checked;
      const recordatorios = document.getElementById("recordatorios").checked;
      const tema = document.getElementById("tema").value;
      const idioma = document.getElementById("idioma").value;
      const perfilPublico = document.getElementById("perfilPublico").checked;

      // Guardar configuración en localStorage (simulado)
      const configuracion = {
        notificacionesEmail,
        recordatorios,
        tema,
        idioma,
        perfilPublico,
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem("userConfig", JSON.stringify(configuracion));
        
        showSuccessMessage(
          "Configuración guardada",
          "Tus preferencias han sido guardadas correctamente.",
          [
            { text: "Editar Perfil", action: () => showEditarPerfilForm() },
            { text: "Volver al Dashboard", href: "/pages/dashboard/dashboard.html" }
          ]
        );
      } catch (error) {
        console.error("Error guardando configuración:", error);
        alert("Error guardando configuración. Por favor intenta de nuevo.");
      }
    });
  }

  // Cargar configuración guardada
  function loadUserConfig() {
    try {
      const savedConfig = localStorage.getItem("userConfig");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        document.getElementById("notificacionesEmail").checked = config.notificacionesEmail || false;
        document.getElementById("recordatorios").checked = config.recordatorios || false;
        document.getElementById("tema").value = config.tema || "claro";
        document.getElementById("idioma").value = config.idioma || "es";
        document.getElementById("perfilPublico").checked = config.perfilPublico || false;
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    }
  }

  // Cargar configuración al mostrar el formulario
  const configuracionFormElement = document.getElementById("configuracionForm");
  if (configuracionFormElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          if (configuracionFormElement.style.display !== "none") {
            loadUserConfig();
          }
        }
      });
    });
    observer.observe(configuracionFormElement, { attributes: true });
  }

  // Manejar cambio de avatar
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const avatar = document.getElementById("currentAvatar");
            if (avatar) {
              avatar.src = e.target.result;
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  }

  // Función para mostrar mensaje de éxito
  function showSuccessMessage(title, message, actions = []) {
    successMessage.style.display = "block";
    editarPerfilForm.style.display = "none";
    configuracionForm.style.display = "none";
    
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

  // Aplicar tema guardado
  function applyTheme() {
    try {
      const savedConfig = localStorage.getItem("userConfig");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.tema) {
          document.body.setAttribute("data-theme", config.tema);
        }
      }
    } catch (error) {
      console.error("Error aplicando tema:", error);
    }
  }

  // Aplicar tema al cargar
  applyTheme();
});
