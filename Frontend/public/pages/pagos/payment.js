document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";

  // Obtener courseId desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("courseId");
  
  // Verificar autenticación
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para adquirir un curso");
    window.location.href = "/pages/login/login1.html";
    return;
  }

  if (!courseId) {
    alert("ID de curso no válido");
    window.location.href = "/index.html";
    return;
  }

  // Cargar información del curso
  await loadCourseInfo(courseId);

  const form = document.getElementById("paymentForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar datos del formulario
    const cardNumber = document.getElementById("cardNumber").value;
    const cardName = document.getElementById("cardName").value;
    const expiry = document.getElementById("expiry").value;
    const cvv = document.getElementById("cvv").value;

    if (!cardNumber || !cardName || !expiry || !cvv) {
      message.innerText = "❌ Por favor completa todos los campos";
      return;
    }

    // Simular validación de tarjeta
    if (cardNumber.length < 16) {
      message.innerText = "❌ Número de tarjeta inválido";
      return;
    }

    message.innerText = "Procesando pago...";
    message.style.color = "#FF9800";

    try {
      // Llamar a la API de inscripción
      const response = await fetch(`${API_BASE}/api/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          paymentData: {
            cardNumber,
            cardName,
            expiry,
            cvv
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al procesar el pago");
      }

      message.innerText = "✅ Pago exitoso. ¡Ya estás inscrito en el curso!";
      message.style.color = "#4CAF50";

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        window.location.href = "/pages/dashboard/dashboard.html";
      }, 2000);

    } catch (error) {
      console.error("Error en el pago:", error);
      message.innerText = `❌ Error: ${error.message}`;
      message.style.color = "#F44336";
    }
  });

  // Función para cargar información del curso
  async function loadCourseInfo(courseId) {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}`);
      
      if (!response.ok) {
        throw new Error("Error al cargar información del curso");
      }

      const course = await response.json();
      
      // Actualizar la UI con la información del curso
      document.getElementById("courseImage").src = course.image || "/images/imagenPortada-curso.jpg";
      document.getElementById("courseImage").alt = course.title;
      document.getElementById("courseTitle").textContent = course.title;
      document.getElementById("courseDescription").textContent = course.description;
      document.getElementById("coursePrice").textContent = `$${course.price || 0} ${course.currency || 'USD'}`;

    } catch (error) {
      console.error("Error cargando curso:", error);
      message.innerText = "❌ Error al cargar información del curso";
      message.style.color = "#F44336";
    }
  }
});