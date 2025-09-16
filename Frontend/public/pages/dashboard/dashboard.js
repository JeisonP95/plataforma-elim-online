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
    // Obtener usuario logueado
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("No autorizado");

    const { user } = await res.json();

    // Actualizar datos en UI
    document.querySelector(".user-name").textContent = user.firstName || "";
    document.querySelector(
      ".welcome-title"
    ).textContent = `¡Bienvenido de nuevo, ${user.firstName}!`;
    document.querySelector(
      ".profile-name"
    ).textContent = `${user.firstName} ${user.lastName}`;
    document.querySelector(".profile-email").textContent = `📧 ${user.email}`;

    // Cargar progreso y cursos
    await loadUserProgress(token);
    await loadMyCourses(user._id, token);
    await loadAvailableCourses();
  } catch (err) {
    console.error(err);
    alert("Sesión inválida, vuelve a iniciar sesión");
    localStorage.removeItem("token");
    window.location.href = "/pages/login/login1.html";
    return;
  }

  /* Menú desplegable usuario */
  const dropdownBtn = document.querySelector(".dropdown-btn");
  const dropdownContent = document.querySelector(".dropdown-content");
  if (dropdownBtn && dropdownContent) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownContent.classList.toggle("show");
    });

    window.addEventListener("click", (e) => {
      if (!dropdownContent.contains(e.target) && e.target !== dropdownBtn) {
        dropdownContent.classList.remove("show");
      }
    });
  }

  /* Delegación de eventos para botones dinámicos */
  document.addEventListener("click", (e) => {
    // 🔹 Solo los botones de cursos disponibles
    if (e.target.classList.contains("ver-curso-btn")) {
      const courseId = e.target.closest(".curso").dataset.id;
      window.location.href = `/pages/cursos/cursosdash.html?id=${courseId}`;
    }

    if (e.target.closest(".perfil-actions button")) {
      alert(`⚙️ Acción: ${e.target.textContent}`);
    }
  });
});

const user = JSON.parse(localStorage.getItem("user")) || {};
// Progreso general del usuario
async function loadUserProgress(token) {
  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
  try {
    const res = await fetch(`${API_BASE}/api/progress/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al cargar progreso");

    const { courseProgress } = await res.json();    

    const totalCourses = courseProgress.length;
    const avgProgress =
      totalCourses > 0
        ? Math.round(
            courseProgress.reduce(
              (sum, c) => sum + (c.progressPercentage || 0),
              0
            ) / totalCourses
          )
        : 0;

    document.querySelector(".courses-count").textContent = totalCourses;
    document.querySelector(".progress-percent").textContent = `${avgProgress}%`;
    document.querySelector(".certificates-count").textContent =
      courseProgress.filter((c) => c.progressPercentage === 100).length;
  } catch (err) {
    console.error("Error cargando progreso general:", err);
  }
}

// Cursos inscritos del usuario
async function loadMyCourses(userId, token) {
  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
  try {
    const res = await fetch(`${API_BASE}/api/user-courses/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Error al cargar cursos inscritos");

    const { courses } = await res.json();
    console.log("Cursos inscritos:", courses);
    const myCoursesList = document.getElementById("my-courses-list");

    if (!courses || courses.length === 0) {
      myCoursesList.innerHTML = `
        <div class="no-courses-message">
          <h3>¡Aún no tienes cursos inscritos!</h3>
          <p>Explora nuestros cursos disponibles y comienza tu viaje de bienestar.</p>
        </div>`;
      return;
    }

    const progress = courses.length;

    myCoursesList.innerHTML = courses
      .map(
        (c) => `
      <article class="curso" data-id="${c.courseId._id}">
        <img src="${
          c.courseId.image
        }" width="70" height="70" style="border-radius: 50%;" alt="${
          c.courseId.title
        }">
        <h3>${c.courseId.title}</h3>
        <p>${c.courseId.description}</p>
        <button class="btn-secondary continuar-btn" 
         data-course="${c.courseId._id}" 
         data-lesson="${c.currentLessonId || ""}" 
         data-page="${c.courseId.lessonPage}">
        Continuar
        </button>
      </article>
    `
      )
      .join("");

    document.querySelectorAll(".continuar-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const courseId = e.target.dataset.course;
        const lessonId = e.target.dataset.lesson || "1"; // primera lección por defecto
        const lessonPage = e.target.dataset.page;

        window.location.href = `/pages/lecciones/${lessonPage}?courseId=${courseId}&lessonId=${lessonId}`;
      });
    });
  } catch (err) {
    console.error("Error cargando mis cursos:", err);
  }
}

// Cursos disponibles
async function loadAvailableCourses() {
  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
  try {
    console.log("Cargando cursos desde:", `${API_BASE}/api/courses`);
    const res = await fetch(`${API_BASE}/api/courses`);

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const courses = await res.json();
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

    coursesList.innerHTML = courses
      .map(
        (course) => `
      <article class="curso" data-id="${course._id}">
        <img src="${course.image}" width="70" height="70" style="border-radius: 50%;" alt="${course.title}" class="curso-imagen">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <ul>
          <li>${course.duration}</li>
          <li>${course.lessons} lecciones</li>
        </ul>
        <button class="btn-primary ver-curso-btn">Ver Curso</button>
      </article>
    `
      )
      .join("");
  } catch (err) {
    console.error("Error cargando cursos:", err);
  }
}
