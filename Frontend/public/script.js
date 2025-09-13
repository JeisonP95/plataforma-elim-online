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
  // Redirigir a la página de detalle del curso con el ID como parámetro
  window.location.href = `/pages/cursos/curso-detalle.html?id=${courseId}`;
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
