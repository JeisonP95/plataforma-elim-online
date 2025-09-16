document.addEventListener("DOMContentLoaded", () => {
  // obtener courseId desde la URL (ej: ?id=...)
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  const from = params.get("from"); // "landing" | "dashboard" | null
  // obtener token/usuario desde localStorage (ajusta la key si usas otra)
  const token = localStorage.getItem("token");
  // opcional: userId desde sesión (si la guardas)
  const userId = localStorage.getItem("userId") || "68c19eb5ae77b4db53cb8b80";

  const backLink = document.querySelector("a.btn-secondary");
  if (backLink) {
    if (from === "dashboard") {
      backLink.href = "/pages/dashboard/dashboard.html";
      backLink.textContent = "Volver al Dashboard";
    } else if (from === "landing") {
      backLink.href = "/index.html"; // ajusta si tu landing está en otra ruta
      backLink.textContent = "Volver";
    } else {
      // fallback: si viene logueado ir a dashboard, si no ir a login
      if (token) {
        backLink.href = "/src/pages/dashboard/dashboard.html";
        backLink.textContent = "Volver al Dashboard";
      } else {
        backLink.href = "/src/pages/login/login1.html";
        backLink.textContent = "Volver ";
      }
    }
  }

  // rellenar info del curso desde la API si está disponible
  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`);
      if (!res.ok) return;
      const course = await res.json();
      document.getElementById("courseImage").src = course.image || "";
      document.getElementById("courseTitle").innerText =
        course.title || "Título del curso";
      document.getElementById("courseDescription").innerText =
        course.description || "";
      document.getElementById("coursePrice").innerText = course.price || "";
    } catch (err) {
      console.error("No se pudo cargar curso:", err);
    }
  })();

  const form = document.getElementById("paymentForm");
  const message = document.getElementById("message");

  // al enviar pago, si no hay token redirigir a login con next hacia esta misma payment page
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!token) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.href = `/pages/login/login1.html?next=${returnUrl}`;
      return;
    }

    // Aquí simulamos un pago exitoso (cuando el usuario está logueado)
    message.innerText = "Procesando pago...";

    setTimeout(async () => {
      try {
        // 1️Registrar pago
        const paymentRes = await fetch(`${API_BASE}/api/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            courseId,
            amount: 100,
            transactionId: "SIMULATED123",
          }),
        });

        const paymentData = await paymentRes.json();
        if (!paymentRes.ok)
          throw new Error(paymentData.error || "Error registrando pago");

        // 2️⃣ Obtener inscripción del usuario en el curso
        const userCourseRes = await fetch(
          `${API_BASE}/api/user-courses/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { courses } = await userCourseRes.json();
        const userCourse = courses.find((c) => c.courseId._id === courseId);

        if (!userCourse)
          throw new Error("No se pudo encontrar la inscripción del curso");

        message.innerText = "✅ Pago exitoso. ¡Ya estás inscrito en el curso!";

        // 3️⃣ Redirigir a la primera lección del curso
        setTimeout(async () => {
          try {
            // leer course para conocer su lessonPage
            const courseRes = await fetch(`${API_BASE}/api/courses/${courseId}`);
            const course = courseRes.ok ? await courseRes.json() : null;
            const lessonPage = course?.lessonPage || "leccion-adultos.html";
            const firstLessonId = 1;
            window.location.href = `/pages/lecciones/${lessonPage}?courseId=${courseId}&lessonId=${firstLessonId}`;
          } catch (_) {
            window.location.href = `/pages/lecciones/leccion-adultos.html?courseId=${courseId}&lessonId=1`;
          }
        }, 1200);
      } catch (error) {
        console.error(error);
        message.innerText = "❌ Error al procesar el pago.";
      }
    }, 2000);
  });
});
