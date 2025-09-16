/* Archivo: leccion-ninos.js, Curso: Mindfulness para Niños, Generado para: Elim Online */

let tareasData = [];
let progresoLocal = {};
const CURSO_SLUG = "Conexión con la Naturaleza";
const STORAGE_KEY = `progreso-${CURSO_SLUG}`;

let player;
let videoTerminado = false;

/* ================== Inicialización ================== */
document.addEventListener("DOMContentLoaded", async () => {
  inicializarTareas();
  configurarEventListeners();
  cargarProgresoLocal();
  actualizarUI();

  setTimeout(() => {
    if (!window.YT) {
      mostrarFallbackVideo();
    }
  }, 3000);
});

/* ================== Inicializar tareas ================== */
function inicializarTareas() {
  tareasData = [
    {
      id: "introduccion-mindfulness",
      titulo: "Leer: ¿Qué es Mindfulness para Niños?",
      completada: false,
      elemento: document.querySelector('[data-tarea="introduccion-mindfulness"]'),
    },
    {
      id: "video-respiracion-ninos",
      titulo: "Ver Video: Respiración para Niños",
      completada: false,
      elemento: document.querySelector('[data-tarea="video-respiracion-ninos"]'),
      esVideo: true,
    },
    {
      id: "juego-atencion",
      titulo: "Actividad: Juego de Atención",
      completada: false,
      elemento: document.querySelector('[data-tarea="juego-atencion"]'),
    },
    {
      id: "rutina-duerme-mindful",
      titulo: "Actividad: Rutina de Sueño Mindful",
      completada: false,
      elemento: document.querySelector('[data-tarea="rutina-duerme-mindful"]'),
    },
  ];
}

/* ================== Event listeners ================== */
function configurarEventListeners() {
  document.querySelectorAll(".checkbox-completada").forEach((checkbox, index) => {
    checkbox.addEventListener("change", (e) => manejarCheckboxChange(e, index));
  });

  document.querySelectorAll(".btn-siguiente").forEach((btn) => {
    btn.addEventListener("click", manejarClickSiguiente);
  });

  const btnMarcarTodas = document.getElementById("btn-marcar-todas");
  if (btnMarcarTodas) btnMarcarTodas.addEventListener("click", marcarTodasCompletadas);

  const btnEnviar = document.getElementById("btn-enviar-tareas");
  if (btnEnviar) btnEnviar.addEventListener("click", abrirModalConfirmacion);

  const btnEnviarFinal = document.getElementById("btn-enviar-final");
  if (btnEnviarFinal) btnEnviarFinal.addEventListener("click", abrirModalConfirmacion);

  const modalClose = document.getElementById("modal-close");
  if (modalClose) modalClose.addEventListener("click", cerrarModal);

  const btnCancelar = document.getElementById("btn-cancelar");
  if (btnCancelar) btnCancelar.addEventListener("click", cerrarModal);

  const btnConfirmarEnvio = document.getElementById("btn-confirmar-envio");
  if (btnConfirmarEnvio) btnConfirmarEnvio.addEventListener("click", enviarTareasCompletadas);

  const modal = document.getElementById("modal-confirmacion");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) cerrarModal();
    });
  }

  const videoFallback = document.getElementById("video-confirmacion");
  if (videoFallback) {
    videoFallback.addEventListener("change", manejarFallbackVideo);
  }

  window.addEventListener("error", function (e) {
    console.error("Error JavaScript global:", e.error || e.message);
  });
}

/* ================== YouTube API ================== */
function onYouTubeIframeAPIReady() {
  try {
    if (!document.getElementById("youtube-video")) return;
    player = new YT.Player("youtube-video", {
      events: { onStateChange: onPlayerStateChange },
    });
    console.log("YouTube Player inicializado");
  } catch (err) {
    console.warn("No se pudo inicializar YouTube Player:", err);
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    videoTerminado = true;
    habilitarBotonVideoSiguiente();
    console.log("Video finalizado (API) — botón siguiente habilitado");
  }
}

function habilitarBotonVideoSiguiente() {
  const btnVideoSiguiente = document.getElementById("btn-video-siguiente");
  if (btnVideoSiguiente) {
    btnVideoSiguiente.disabled = false;
    btnVideoSiguiente.textContent = "Siguiente →";
  }
}

function mostrarFallbackVideo() {
  const videoFallback = document.getElementById("video-fallback");
  if (videoFallback && !player) {
    videoFallback.style.display = "block";
    console.log("Mostrando fallback manual del video");
  }
}

function manejarFallbackVideo(e) {
  const btnVideoSiguiente = document.getElementById("btn-video-siguiente");
  if (!btnVideoSiguiente) return;

  if (e.target.checked) {
    videoTerminado = true;
    btnVideoSiguiente.disabled = false;
    btnVideoSiguiente.textContent = "Siguiente →";
  } else {
    videoTerminado = false;
    btnVideoSiguiente.disabled = true;
    btnVideoSiguiente.textContent = "Termine el video primero";
  }

  guardarProgresoLocal();
}

/* ================== Manejo de checkboxes ================== */
function manejarCheckboxChange(event, index) {
  const completada = event.target.checked;
  if (!tareasData[index]) return;

  tareasData[index].completada = completada;
  actualizarEstadoTarea(tareasData[index]);
  guardarProgresoLocal();
  actualizarProgreso();
  actualizarContadorCompletadas();

  if (completada) {
    event.target.disabled = true; // 🔒 Bloquear el check
    saveToServer([tareasData[index]]); // 📤 Enviar solo esa tarea
    tareasData[index].elemento?.classList.add("completada");
  }
}

function actualizarEstadoTarea(tarea) {
  if (!tarea || !tarea.elemento) return;
  const estadoTexto = tarea.elemento.querySelector(".estado-texto");
  const checkbox = tarea.elemento.querySelector(".checkbox-completada");

  if (tarea.completada) {
    if (estadoTexto) {
      estadoTexto.textContent = "Completada";
      estadoTexto.style.color = "#4CAF50";
    }
    if (checkbox) {
      checkbox.checked = true;
      checkbox.disabled = true; // Asegurar que quede bloqueado
    }
  } else {
    if (estadoTexto) {
      estadoTexto.textContent = "Pendiente";
      estadoTexto.style.color = "#FF9800";
    }
    if (checkbox) checkbox.checked = false;
  }
}

/* ================== Navegación ================== */
function manejarClickSiguiente(event) {
  const btn = event.currentTarget;
  const siguienteId = btn.getAttribute("data-siguiente");
  const tareaActual = btn.closest(".tarea");
  const indiceTareaActual = Array.from(document.querySelectorAll(".tarea")).indexOf(tareaActual);

  if (btn.id === "btn-video-siguiente" && !videoTerminado) {
    alert("Por favor, termina de ver el video antes de continuar.");
    return;
  }

  if (tareasData[indiceTareaActual] && !tareasData[indiceTareaActual].completada) {
    const checkbox = tareaActual.querySelector(".checkbox-completada");
    if (checkbox) {
      checkbox.checked = true;
      manejarCheckboxChange({ target: checkbox }, indiceTareaActual);
    }
  }

  if (siguienteId === "resumen") {
    mostrarResumen();
  } else {
    const siguienteTarea = document.querySelector(`.tarea:nth-child(${siguienteId})`);
    if (siguienteTarea) scrollToElement(siguienteTarea);
  }
}

function mostrarResumen() {
  const resumen = document.getElementById("resumen-tareas");
  if (resumen) {
    resumen.style.display = "block";
    resumen.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  actualizarContadorCompletadas();
}

function marcarTodasCompletadas() {
  tareasData.forEach((tarea) => {
    if (!tarea.completada) {
      tarea.completada = true;
      if (tarea.elemento) {
        const checkbox = tarea.elemento.querySelector(".checkbox-completada");
        if (checkbox) {
          checkbox.checked = true;
          checkbox.disabled = true;
        }
        actualizarEstadoTarea(tarea);
        tarea.elemento.classList.add("completada");
      }
      saveToServer([tarea]); // enviar cada una
    }
  });

  videoTerminado = true;
  habilitarBotonVideoSiguiente();

  guardarProgresoLocal();
  actualizarUI();
  mostrarResumen();
}

/* ================== Progreso UI ================== */
function actualizarProgreso() {
  const completadas = tareasData.filter((t) => t.completada).length;
  const porcentaje = tareasData.length ? Math.round((completadas / tareasData.length) * 100) : 0;
  const barraCompletada = document.getElementById("barra-completada");
  const porcentajeTexto = document.getElementById("porcentaje-progreso");

  if (barraCompletada) barraCompletada.style.width = `${porcentaje}%`;
  if (porcentajeTexto) porcentajeTexto.textContent = porcentaje;
}

function actualizarContadorCompletadas() {
  const completadas = tareasData.filter((t) => t.completada).length;
  const contador = document.getElementById("tareas-completadas-count");
  if (contador) contador.textContent = completadas;
}

function actualizarUI() {
  actualizarProgreso();
  actualizarContadorCompletadas();

  if (tareasData.length === 0) {
    const sinTareas = document.getElementById("sin-tareas");
    if (sinTareas) sinTareas.style.display = "block";
  }
}

/* ================== localStorage ================== */
function guardarProgresoLocal() {
  const progreso = {
    curso: CURSO_SLUG,
    tareas: tareasData.map((t) => ({ id: t.id, completada: t.completada })),
    videoTerminado,
    fechaActualizacion: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progreso));
    console.log("Progreso guardado localmente:", STORAGE_KEY);
  } catch (error) {
    console.warn("Error guardando en localStorage:", error);
  }
}

function cargarProgresoLocal() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return;

    progresoLocal = JSON.parse(guardado);
    progresoLocal.tareas?.forEach((tareaGuardada) => {
      const tarea = tareasData.find((t) => t.id === tareaGuardada.id);
      if (tarea) {
        tarea.completada = tareaGuardada.completada;
        actualizarEstadoTarea(tarea);
        if (tarea.completada && tarea.elemento) {
          tarea.elemento.classList.add("completada");
        }
      }
    });

    if (progresoLocal.videoTerminado) {
      videoTerminado = true;
      habilitarBotonVideoSiguiente();
    }

    console.log("Progreso cargado desde localStorage");
  } catch (error) {
    console.warn("No se pudo cargar progreso desde localStorage:", error);
  }
}

/* ================== Modal y envío ================== */
function abrirModalConfirmacion() {
  const tareasCompletadas = tareasData.filter((t) => t.completada);
  if (tareasCompletadas.length === 0) {
    alert("No hay tareas completadas para enviar.");
    return;
  }

  const lista = document.getElementById("lista-tareas-enviar");
  if (lista) {
    lista.innerHTML = "";
    tareasCompletadas.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t.titulo;
      lista.appendChild(li);
    });
  }

  const modal = document.getElementById("modal-confirmacion");
  if (modal) modal.style.display = "flex";
}

function cerrarModal() {
  const modal = document.getElementById("modal-confirmacion");
  if (modal) modal.style.display = "none";
}

function enviarTareasCompletadas() {
  const tareasCompletadas = tareasData.filter((t) => t.completada);
  if (tareasCompletadas.length === 0) {
    alert("No hay tareas completadas para enviar.");
    return;
  }

  saveToServer(tareasCompletadas);
  setTimeout(() => {
    mostrarMensajeExito();
    cerrarModal();
  }, 800);
}

/* ================== Envío al backend ================== */
const saveToServer = async (data) => {
  const idUsuario = JSON.parse(localStorage.getItem("user")) || {};
  const datosEnvio = {
    courseId: CURSO_SLUG,
    userId: idUsuario.id,
    tasks: data.map((t) => t.id),
    fecha: new Date().toISOString(),
  };

  console.log("Datos a enviar:", datosEnvio);

  const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000" // cuando pruebas en local
    : "https://plataforma-elim-online.onrender.com"; // cuando está en producción
  fetch(`${API_BASE}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosEnvio),
  })
    .then((resp) => {
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.json();
    })
    .then((data) => {
      console.log("Envío exitoso:", data);
      mostrarMensajeExito();
    })
    .catch((err) => {
      console.error("Error al enviar progreso:", err);
      alert("Ocurrió un error al enviar. Intenta de nuevo.");
    });
};

/* ================== Notificación ================== */
function mostrarMensajeExito() {
  const notificacion = document.createElement("div");
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 1001;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notificacion.textContent = "¡Tarea enviada exitosamente!";
  document.body.appendChild(notificacion);
  setTimeout(() => notificacion.remove(), 3000);
}

/* ================== Utilidades ================== */
function getAuthToken() {
  return "your-auth-token-here";
}

function scrollToElement(element) {
  if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
}

function esMobile() {
  return window.innerWidth <= 768;
}

if (esMobile()) {
  const videoIframe = document.getElementById("youtube-video");
  if (videoIframe) videoIframe.style.minHeight = "200px";
}


/* ================== Mensajes de desarrollo / instrucciones ================== */
console.log(`
📚 Tareas del curso: ${CURSO_SLUG}
🔧 Notas para desarrollador:
  - Cambiar VIDEO_ID en el iframe del HTML por el id real del video.
  - Reemplazar el texto "Nombre Apellido" por el dato real del usuario (ej. document.getElementById('nombre-estudiante').textContent = user.name).
  - Conectar POST /api/progreso en enviarTareasCompletadas() cuando el backend esté disponible.
  - Implementar getAuthToken() según tu sistema de autenticación.
`);

/* ================== FIN ================== */
