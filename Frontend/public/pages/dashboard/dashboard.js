// dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ Dashboard cargado");

  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "/pages/login/login1.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("No autorizado");
    }
    const { user } = await res.json();
    
    // Actualizar nombre en el menú
    const nameEl = document.querySelector(".user-name");
    if (nameEl && user) {
      nameEl.textContent = `¡Hola, ${user.firstName}!`;
    }
    
    // Actualizar título de bienvenida
    const welcomeTitle = document.querySelector(".welcome-title");
    if (welcomeTitle && user) {
      welcomeTitle.textContent = `¡Bienvenido de nuevo, ${user.firstName}!`;
    }
    
    // Actualizar perfil
    const profileName = document.querySelector(".profile-name");
    const profileEmail = document.querySelector(".profile-email");
    if (profileName && user) {
      profileName.textContent = `${user.firstName} ${user.lastName}`;
    }
    if (profileEmail && user) {
      profileEmail.textContent = `📧 ${user.email}`;
    }
    
    // Cargar cursos disponibles
    await loadAvailableCourses();
    
  } catch (err) {
    console.error(err);
    alert("Sesión inválida, vuelve a iniciar sesión");
    localStorage.removeItem("token");
    window.location.href = "/pages/login/login1.html";
    return;
  }

  /* Menú desplegable usuario*/
  const dropdownBtn = document.querySelector(".dropdown-btn");
  const dropdownContent = document.querySelector(".dropdown-content");

  if (dropdownBtn && dropdownContent) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownContent.classList.toggle("show");
    });

    // Cerrar menú si se hace clic fuera
    window.addEventListener("click", (e) => {
      if (!dropdownContent.contains(e.target) && e.target !== dropdownBtn) {
        dropdownContent.classList.remove("show");
      }
    });
  }

  /*Botón "Ver Detalles" en cursos inscritos*/
  document.querySelectorAll(".curso .btn-secondary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const titulo = btn.closest(".curso").querySelector("h3").textContent;
      alert(`📘 Detalles del curso: ${titulo}`);
    });
  });

  /*Botón "Inscribirse" en cursos disponibles*/
  document.querySelectorAll("#cursos-disponibles .btn-primary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const titulo = btn.closest(".curso").querySelector("h3").textContent;
      alert(`🎉 Te inscribiste en: ${titulo}`);
    });
  });

  /*Botones de acciones en perfil*/
  document.querySelectorAll(".perfil-actions button").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert(`⚙️ Acción: ${btn.textContent}`);
    });
  });
});

// Función para cargar cursos disponibles
async function loadAvailableCourses() {
  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción // Definir API_BASE localmente
  try {
    console.log("Cargando cursos desde:", `${API_BASE}/api/courses`);
    const res = await fetch(`${API_BASE}/api/courses`);
    console.log("Respuesta del servidor:", res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const courses = await res.json();
    console.log("Cursos recibidos:", courses);
    
    const coursesList = document.getElementById("available-courses-list");
    
    if (!courses || courses.length === 0) {
      coursesList.innerHTML = `
        <div class="no-courses-message">
          <h3>📚 Próximamente</h3>
          <p>Estamos preparando nuevos cursos para ti.</p>
        </div>
      `;
      return;
    }
    
    coursesList.innerHTML = courses.map(course => `
      <article class="curso">
        <img src="${course.image || 'https://www.pngitem.com/pimgs/m/420-4207035_arrow-down-icon-png-transparent-png.png'}" 
             alt="${course.title}" width="40" height="40">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <ul>
          <li>${course.duration || 'Duración variable'}</li>
          <li>${course.lessons || 0} lecciones</li>
          <li>⭐ ${course.rating || 'Nuevo'}</li>
        </ul>
        <button class="btn-primary" onclick="enrollCourse('${course._id}')">Inscribirse Gratis</button>
      </article>
    `).join('');
    
  } catch (err) {
    console.error("Error cargando cursos:", err);
    const coursesList = document.getElementById("available-courses-list");
    if (coursesList) {
      coursesList.innerHTML = `
        <div class="no-courses-message">
          <h3>❌ Error</h3>
          <p>No se pudieron cargar los cursos. Error: ${err.message}</p>
        </div>
      `;
    }
  }
}

// Función para inscribirse en un curso
function enrollCourse(courseId) {
  alert(`🎉 Te inscribiste en el curso! (ID: ${courseId})`);
  // Aquí podrías hacer una petición POST para inscribir al usuario
}
