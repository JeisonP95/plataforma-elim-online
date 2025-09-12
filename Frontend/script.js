// Esperar a que todo el HTML cargue
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Página cargada y lista");

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
