// Función para cargar cursos disponibles
async function loadAvailableCourses() {
  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
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
        </ul>
        <button class="btn-primary" onclick="enrollCourse('${course._id}')">Ver Curso</button>
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
    'Gestión del Estrés para Adultos': '/pages/curso-adultos/curso-adultos.html',
    'Conexión con la Naturaleza': '/pages/curso-naturaleza/curso-naturaleza.html', 
    'Mindfulness para Niños': '/pages/curso-ninos/curso-ninos.html',
    'Yoga Familiar': '/pages/curso-yoga/curso-yoga.html'
  };
  
  // Mapeo de IDs de cursos a sus páginas específicas (fallback)
  const courseIdMapping = {
    'curso-adultos': '/pages/curso-adultos/curso-adultos.html',
    'curso-naturaleza': '/pages/curso-naturaleza/curso-naturaleza.html', 
    'curso-ninos': '/pages/curso-ninos/curso-ninos.html',
    'curso-yoga': '/pages/curso-yoga/curso-yoga.html'
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

// Esperar a que todo el HTML cargue
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Página cargada y lista");

  // Cargar cursos disponibles al cargar la página
  loadAvailableCourses();

  // Formulario de contacto
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault(); // Evita recargar la página

      const nombre = form.querySelector('input[type="text"]').value.trim();
      const email = form.querySelector('input[type="email"]').value.trim();
      const mensaje = form.querySelector("textarea").value.trim();

      if (!nombre || !email || !mensaje) {
        alert("Por favor completa todos los campos");
        return;
      }

      // Validación muy simple del email
      if (!email.includes("@")) {
        alert("Ingresa un correo válido");
        return;
      }

      try {
        // Enviar datos al backend
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, mensaje })
        });

        const result = await response.json();

        if (!response.ok) {
          alert(`Error: ${result.message || "No se pudo enviar el mensaje"}`);
          return;
        }

        alert("✅ Mensaje enviado correctamente");
        form.reset();
      } catch (err) {
        console.error("Error de conexión:", err);
        alert("No se pudo conectar con el servidor, intenta más tarde");
      }
    });
  }
});
