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
      nameEl.textContent = `${user.firstName}!`;
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
    
    // Cargar progreso del usuario
    await loadUserProgress();
    
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
    btn.addEventListener("click", async (e) => {
      const curso = btn.closest(".curso");
      const titulo = curso.querySelector("h3").textContent;
      
      // Mapeo de títulos a IDs de cursos
      const courseMapping = {
        'Gestión del Estrés para Adultos': 'gestion-estres-adultos',
        'Conexión con la Naturaleza': 'conexion-naturaleza',
        'Mindfulness para Niños': 'mindfulness-ninos',
        'Yoga Familiar': 'yoga-familiar'
      };
      
      const courseId = courseMapping[titulo];
      if (!courseId) {
        alert('Curso no disponible para inscripción');
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE}/api/users/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ courseId })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al inscribirse');
        }
        
        alert(`🎉 Te inscribiste exitosamente en: ${titulo}`);
        
        // Recargar el progreso del usuario para mostrar el nuevo curso
        await loadUserProgress();
        
      } catch (error) {
        console.error('Error al inscribirse:', error);
        alert(`Error al inscribirse: ${error.message}`);
      }
    });
  });
  /*Botones de acciones en perfil*/
  document.querySelectorAll(".perfil-actions button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const action = btn.textContent.trim();
      if (action.includes("Editar Perfil")) {
        window.location.href = "/pages/perfil-configuracion/perfil-configuracion.html";
      } else if (action.includes("Cambiar Contraseña")) {
        window.location.href = "/pages/password/password.html?mode=change";
      } else if (action.includes("Configuración")) {
        window.location.href = "/pages/perfil-configuracion/perfil-configuracion.html?mode=config";
      } else {
        alert(`⚙️ Acción: ${action}`);
      }
    });
  });
});
// Función para cargar el progreso del usuario
async function loadUserProgress() {
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";
  
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/api/users/progress`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error cargando progreso");
    }

    const { courseProgress, enrolledCourses } = await response.json();
    
    // Actualizar sección de cursos inscritos
    updateEnrolledCoursesSection(courseProgress, enrolledCourses);
    
    console.log("Progreso del usuario cargado:", courseProgress);
  } catch (error) {
    console.error("Error cargando progreso del usuario:", error);
  }
}

// Función para actualizar la sección de cursos inscritos
function updateEnrolledCoursesSection(courseProgress, enrolledCourses) {
  const enrolledSection = document.querySelector("#cursos-inscritos .cursos-lista");
  if (!enrolledSection) return;

  if (!courseProgress || courseProgress.length === 0) {
    enrolledSection.innerHTML = `
      <div class="no-courses-message">
        <h3>📚 Aún no estás inscrito en ningún curso</h3>
        <p>Explora nuestros cursos disponibles e inscríbete para comenzar tu aprendizaje.</p>
      </div>
    `;
    return;
  }

  // Mapeo de IDs de cursos a información
  const courseInfo = {
    'gestion-estres-adultos': {
      title: 'Gestión del Estrés para Adultos',
      description: 'Aprende técnicas efectivas para manejar el estrés en tu vida diaria',
      image: '/images/curso-adultos-estres.jpeg',
      link: '/pages/cursos/curso-adultos.html'
    },
    'conexion-naturaleza': {
      title: 'Conexión con la Naturaleza',
      description: 'Conecta con la naturaleza para mejorar tu bienestar',
      image: '/images/curso-naturaleza.jpg',
      link: '/pages/cursos/curso-naturaleza.html'
    },
    'mindfulness-ninos': {
      title: 'Mindfulness para Niños',
      description: 'Introduce a los niños al mindfulness de manera divertida',
      image: '/images/curso-niños.jpeg',
      link: '/pages/cursos/curso-ninos.html'
    },
    'yoga-familiar': {
      title: 'Yoga Familiar',
      description: 'Practica yoga en familia para fortalecer vínculos',
      image: '/images/curso-yoga-familiar.jpg',
      link: '/pages/cursos/curso-yoga.html'
    }
  };

  enrolledSection.innerHTML = courseProgress.map(progress => {
    const info = courseInfo[progress.courseId] || {
      title: progress.courseName,
      description: 'Curso de bienestar y desarrollo personal',
      image: '/images/imagenPortada-curso.jpg',
      link: '#'
    };

    const progressBar = progress.progressPercentage > 0 
      ? `<div class="progress-bar">
           <div class="progress-fill" style="width: ${progress.progressPercentage}%"></div>
         </div>
         <span class="progress-text">${progress.progressPercentage}% completado</span>`
      : '<span class="progress-text">Recién inscrito</span>';

    const statusClass = progress.progressPercentage === 100 ? 'completed' : 'in-progress';
    const statusText = progress.progressPercentage === 100 ? 'Completado' : 'En progreso';

    return `
      <article class="curso ${statusClass}">
        <img src="${info.image}" alt="${info.title}" width="40" height="40">
        <h3>${info.title}</h3>
        <p>${info.description}</p>
        <div class="course-progress">
          ${progressBar}
        </div>
        <div class="course-stats">
          <span class="status-badge">${statusText}</span>
          <span class="tasks-completed">${progress.completedTasks}/${progress.totalTasks} tareas</span>
        </div>
        <button class="btn-primary" onclick="continueCourse('${progress.courseId}')">
          ${progress.progressPercentage === 100 ? 'Ver Certificado' : 'Continuar Curso'}
        </button>
      </article>
    `;
  }).join('');
}

// Función para continuar un curso
function continueCourse(courseId) {
  const courseInfo = {
    'gestion-estres-adultos': '/pages/lecciones/leccion-adultos.html',
    'conexion-naturaleza': '/pages/cursos/curso-naturaleza.html',
    'mindfulness-ninos': '/pages/cursos/curso-ninos.html',
    'yoga-familiar': '/pages/cursos/curso-yoga.html'
  };

  const courseLink = courseInfo[courseId];
  if (courseLink) {
    window.location.href = courseLink;
  } else {
    alert('Curso no disponible en este momento');
  }
}

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

// Función para redirigir a la página de detalle del curso
function enrollCourse(courseId) {
  console.log("🎯 Redirigiendo a curso:", courseId);
  
  // Mapeo de títulos de cursos a sus páginas específicas
  const courseTitleMapping = {
    'Gestión del Estrés para Adultos': '/pages/cursos/curso-adultos.html',
    'Conexión con la Naturaleza': '/pages/cursos/curso-naturaleza.html', 
    'Mindfulness para Niños': '/pages/cursos/curso-ninos.html',
    'Yoga Familiar': '/pages/cursos/curso-yoga.html'
  };
  
  // Mapeo de IDs de cursos a sus páginas específicas (fallback)
  const courseIdMapping = {
    'curso-adultos': '/pages/cursos/curso-adultos.html',
    'curso-naturaleza': '/pages/cursos/curso-naturaleza.html', 
    'curso-ninos': '/pages/cursos/curso-ninos.html',
    'curso-yoga': '/pages/cursos/curso-yoga.html'
  };
  
  // Buscar por título primero (más confiable)
  const courseTitle = document.querySelector(`button[onclick*="${courseId}"]`)?.closest('.curso')?.querySelector('h3')?.textContent;
  console.log("📝 Título del curso encontrado:", courseTitle);
  
  if (courseTitle && courseTitleMapping[courseTitle]) {
    console.log("✅ Redirigiendo por título a:", courseTitleMapping[courseTitle]);
    window.location.href = courseTitleMapping[courseTitle];
  } else if (courseIdMapping[courseId]) {
    console.log("✅ Redirigiendo por ID a:", courseIdMapping[courseId]);
    window.location.href = courseIdMapping[courseId];
  } else {
    // Si no hay página específica, mostrar mensaje de error
    console.log("❌ No se encontró página para el curso:", courseId);
    alert("Lo sentimos, este curso no está disponible en este momento.");
  }
}
