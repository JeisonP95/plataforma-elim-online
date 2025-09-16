async function loadCourseDetail() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");

  if (!courseId) {
    document.getElementById("curso-detalle").innerHTML =
      "<p>❌ Curso no encontrado.</p>";
    return;
  }

  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción

  try {
    const res = await fetch(`${API_BASE}/api/courses/${courseId}`);
    if (res.status === 404) {
      document.getElementById("curso-detalle").innerHTML = `
        <p>❌ Curso no encontrado en el servidor.</p>
        <p>
          <a class="btn-primary" href="/cursos">Volver a cursos</a>
        </p>
      `;
      return;
    }
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const course = await res.json();
    console.log("📘 Curso recibido:", course);

    const detail = document.getElementById("curso-detalle");
    detail.innerHTML = `
      <section class="cursodetalle-hero">
        <h1>${course.title}</h1>
        <p>${course.description}</p>
        <img src="${course.image}" alt="${course.title}" class="curso-imagen">

        <div class="detalles-numericos">
          <div><h3>${course.duration}</h3><p>Duración total</p></div>
          <div><h3>${course.lessons}</h3><p>Lecciones</p></div>
        </div>

        <aside class="curso-compra">
          <h2>Adquiere este curso</h2>
          <p><strong>Precio:</strong> ${course.price}</p>
          <button id="btn-comprar" class="btn-primary" data-id="${
            course._id
          }">Comprar</button>
        </aside>
      </section>
      <section class="curso-contenido">
      <h2>Desarrollo del Curso</h2>
      <ul>
        ${
          course.content && course.content.length > 0
            ? course.content.map((tema) => `<li>${tema}</li>`).join("")
            : "<li>No hay contenido disponible</li>"
        }
      </ul>
      </section>
      <section class="contenido-navegacion">
        <h2>Instructor</h2>
        ${
          course.instructor
            ? `
          <img src="${course.instructor.image}" alt="${course.instructor.name}">
          <h3>${course.instructor.name}</h3>
          <p><em>${course.instructor.title}</em></p>
          <p>${course.instructor.bio}</p>
        `
            : `<p>Instructor no disponible.</p>`
        }
      </section>

      <section class="curso-contenido">
        <h2>Reseñas</h2>
        ${
          course.reviews && course.reviews.length > 0
            ? course.reviews
                .map(
                  (r) => `
            <div class="reseña">
              <p>"${r.comment}"</p>
              <p>⭐ ${r.rating} - ${r.user}</p>
            </div>
          `
                )
                .join("")
            : "<p>Aún no hay reseñas.</p>"
        }
      </section>
    `;

    // agregar listener al botón generado dinámicamente
    const buyBtn = document.getElementById("btn-comprar");
    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        const id = buyBtn.dataset.id || course._id;
        const token = localStorage.getItem("token");
        // detectar origen (si vino desde dashboard por referrer)
        const ref = document.referrer || "";
        const origin = ref.includes("dashboard") ? "dashboard" : "landing";
        const paymentUrl = `/pages/pagos/payment.html?id=${id}&from=${origin}`;

        if (!token) {
          // mandar al login y luego al payment (preservar destino)
          const next = encodeURIComponent(paymentUrl);
          window.location.href = `/pages/login/login1.html?next=${next}`;
          return;
        }

        // user logueado -> ir directo a payment
        window.location.href = paymentUrl;
      });
    }
  } catch (err) {
    console.error("Error cargando curso:", err);
    document.getElementById(
      "curso-detalle"
    ).innerHTML = `<p>❌ Error cargando curso: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadCourseDetail);
