async function loadAvailableCourses() {
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";

  try {
    console.log("Cargando cursos desde:", `${API_BASE}/api/courses`);
    const res = await fetch(`${API_BASE}/api/courses`);

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

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
        <img src="${course.image}" width="70" height="70" style="border-radius: 50%;" alt="${course.title}" class="curso-imagen">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <ul>
          <li>${course.duration}</li>
          <li>${course.lessons} lecciones</li>
        </ul>
        <button class="btn-primary" onclick="viewCourse('${course._id}')">Ver Curso</button>
      </article>
    `).join('');
    
  } catch (err) {
    console.error("Error cargando cursos:", err);
  }
}

// Redirigir a la página de detalle con el ID del curso
function viewCourse(courseId) {
  window.location.href = `/pages/cursos/cursos.html?id=${courseId}`;
}

document.addEventListener("DOMContentLoaded", loadAvailableCourses);
