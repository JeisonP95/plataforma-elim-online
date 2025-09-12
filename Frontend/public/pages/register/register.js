// register.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
  console.log("✅ Página de registro cargada");

  const form = document.querySelector("form");
  const firstName = document.getElementById("registerfirstName");
  const lastName = document.getElementById("registerlastName");
  const email = document.getElementById("registeremail");
  const phone = document.getElementById("registerphone");
  const password = document.getElementById("registerpassword");
  const confirmPassword = document.getElementById("registerconfirmPassword");

  //Validar email simple
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.toLowerCase());
  };

  //Validar teléfono opcional (solo números, 7-15 dígitos)
  const validarTelefono = (tel) => {
    if (!tel) return true; // opcional
    return /^[0-9]{7,15}$/.test(tel);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitar envío hasta validar

    //Validar campos obligatorios
    if (!firstName.value.trim() || !lastName.value.trim() || !email.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
      alert("Todos los campos obligatorios deben estar completos");
      return;
    }

    //Validar email
    if (!validarEmail(email.value)) {
      alert("Ingresa un correo electrónico válido");
      return;
    }

    //Validar teléfono
    if (!validarTelefono(phone.value)) {
      alert("El teléfono debe contener solo números (7 a 15 dígitos)");
      return;
    }

    //Validar contraseña
    if (password.value.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password.value !== confirmPassword.value) {
      alert("Las contraseñas no coinciden");
      return;
    }

    //Si todo está bien → Simulación de envío
    const data = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
    };

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(`Error: ${result.message || "No se pudo registrar"}`);
        return;
      }
      alert("✅ Registro exitoso, redirigiendo al login...");
      window.location.href = "/pages/login/login1.html";
    } catch (err) {
      console.error("❌ Error:", err);
      alert("⚠️ No se pudo conectar con el servidor");
    }
  });
});
