// LOGIN (login.html)
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:3000"; // Ajusta si tu backend corre en otro host/puerto
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita recargar la página

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    //Validación frontend
    if (!email || !password) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (!email.includes("@")) {
      alert("Ingresa un correo válido");
      return;
    }
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      //Enviar datos al backend
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        //error desde backend
        alert(`Error: ${result.message || "Credenciales inválidas"}`);
        return;
      }
      //Si el login fue correcto
      alert("✅ Inicio de sesión exitoso, redirigiendo...");
      // Guardar token en localStorage (para futuras peticiones)
      localStorage.setItem("token", result.token);
      // Redirigir al dashboard
      window.location.href = "/pages/dashboard/dashboard.html";
    } catch (err) {
      console.error("Error de conexión:", err);
      alert("⚠️ No se pudo conectar con el servidor, intenta más tarde");
    }
  });
});
