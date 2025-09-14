/* Archivo: leccion-naturaleza.js, Curso: Conexión con la Naturaleza, Generado para: Elim Online */

/* ================== Variables globales ================== */
let tareasData = [];
let progresoLocal = {};
const CURSO_SLUG = 'conexion-naturaleza';
const STORAGE_KEY = `progreso-${CURSO_SLUG}`;

/* YouTube player */
let player;
let videoTerminado = false;

/* ================== Inicialización ================== */
document.addEventListener('DOMContentLoaded', function() {
  inicializarTareas();
  configurarEventListeners();
  cargarProgresoLocal();
  actualizarUI();

  // Mostrar fallback si la API de YouTube no carga
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
      id: 'introduccion-naturaleza',
      titulo: 'Leer: Beneficios de estar en la naturaleza',
      completada: false,
      elemento: document.querySelector('[data-tarea="introduccion-naturaleza"]')
    },
    {
      id: 'video-senderismo',
      titulo: 'Ver Video: Mini-rutina de senderismo',
      completada: false,
      elemento: document.querySelector('[data-tarea="video-senderismo"]'),
      esVideo: true
    },
    {
      id: 'actividad-fotos',
      titulo: 'Actividad: Mini-reto fotográfico',
      completada: false,
      elemento: document.querySelector('[data-tarea="actividad-fotos"]')
    },
    {
      id: 'plan-accion',
      titulo: 'Actividad: Plan personal de conexión',
      completada: false,
      elemento: document.querySelector('[data-tarea="plan-accion"]')
    }
  ];
}

/* ================== Event listeners ================== */
function configurarEventListeners() {
  // Checkboxes
  document.querySelectorAll('.checkbox-completada').forEach((checkbox, index) => {
    checkbox.addEventListener('change', (e) => manejarCheckboxChange(e, index));
  });

  // Botones "Siguiente"
  document.querySelectorAll('.btn-siguiente').forEach(btn => {
    btn.addEventListener('click', manejarClickSiguiente);
  });

  // Botón marcar todo
  const btnMarcarTodas = document.getElementById('btn-marcar-todas');
  if (btnMarcarTodas) btnMarcarTodas.addEventListener('click', marcarTodasCompletadas);

  // Botones de envío
  const btnEnviar = document.getElementById('btn-enviar-tareas');
  if (btnEnviar) btnEnviar.addEventListener('click', abrirModalConfirmacion);
  const btnEnviarFinal = document.getElementById('btn-enviar-final');
  if (btnEnviarFinal) btnEnviarFinal.addEventListener('click', abrirModalConfirmacion);

  // Modal
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', cerrarModal);
  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
  const btnConfirmarEnvio = document.getElementById('btn-confirmar-envio');
  if (btnConfirmarEnvio) btnConfirmarEnvio.addEventListener('click', enviarTareasCompletadas);

  const modal = document.getElementById('modal-confirmacion');
  if (modal) modal.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) cerrarModal();
  });

  // Fallback del video
  const videoFallback = document.getElementById('video-confirmacion');
  if (videoFallback) videoFallback.addEventListener('change', manejarFallbackVideo);

  // Listener global para errores
  window.addEventListener('error', (e) => {
    console.error('Error JS global:', e.error || e.message);
  });
}

/* ================== YouTube IFrame API ================== */
function onYouTubeIframeAPIReady() {
  try {
    if (!document.getElementById('youtube-video')) return;
    player = new YT.Player('youtube-video', {
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
    console.log('YouTube player inicializado (naturaleza).');
  } catch (err) {
    console.warn('No se pudo inicializar YouTube Player:', err);
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    videoTerminado = true;
    habilitarBotonVideoSiguiente();
    console.log('Video finalizado — habilitado siguiente (naturaleza)');
  }
}

function habilitarBotonVideoSiguiente() {
  const btn = document.getElementById('btn-video-siguiente');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Siguiente →';
  }
}

function mostrarFallbackVideo() {
  const fallback = document.getElementById('video-fallback');
  if (fallback && !player) fallback.style.display = 'block';
}

/* Manejar checkbox fallback del video */
function manejarFallbackVideo(e) {
  const btn = document.getElementById('btn-video-siguiente');
  if (!btn) return;
  if (e.target.checked) {
    videoTerminado = true;
    btn.disabled = false;
    btn.textContent = 'Siguiente →';
  } else {
    videoTerminado = false;
    btn.disabled = true;
    btn.textContent = 'Termine el video primero';
  }
  guardarProgresoLocal();
}

/* ================== Checkboxes y estado ================== */
function manejarCheckboxChange(event, index) {
  const completada = event.target.checked;
  if (!tareasData[index]) return;
  tareasData[index].completada = completada;
  actualizarEstadoTarea(tareasData[index]);
  guardarProgresoLocal();
  actualizarProgreso();
  actualizarContadorCompletadas();

  if (completada) tareasData[index].elemento?.classList.add('completada');
  else tareasData[index].elemento?.classList.remove('completada');
}

function actualizarEstadoTarea(tarea) {
  if (!tarea || !tarea.elemento) return;
  const estadoTexto = tarea.elemento.querySelector('.estado-texto');
  const checkbox = tarea.elemento.querySelector('.checkbox-completada');
  if (tarea.completada) {
    if (estadoTexto) { estadoTexto.textContent = 'Completada'; estadoTexto.style.color = '#4CAF50'; }
    if (checkbox) checkbox.checked = true;
  } else {
    if (estadoTexto) { estadoTexto.textContent = 'Pendiente'; estadoTexto.style.color = '#FF9800'; }
    if (checkbox) checkbox.checked = false;
  }
}

/* ================== Navegación entre tareas ================== */
function manejarClickSiguiente(event) {
  const btn = event.currentTarget;
  const siguienteId = btn.getAttribute('data-siguiente');
  const tareaActual = btn.closest('.tarea');
  const indiceTareaActual = Array.from(document.querySelectorAll('.tarea')).indexOf(tareaActual);

  // Si es boton del video, validar finalización
  if (btn.id === 'btn-video-siguiente' && !videoTerminado) {
    alert('Por favor, termina de ver el video antes de continuar.');
    return;
  }

  // Marcar actual completada si no lo está
  if (tareasData[indiceTareaActual] && !tareasData[indiceTareaActual].completada) {
    const checkbox = tareaActual.querySelector('.checkbox-completada');
    if (checkbox) {
      checkbox.checked = true;
      manejarCheckboxChange({ target: checkbox }, indiceTareaActual);
    }
  }

  // Navegar
  if (siguienteId === 'resumen') {
    mostrarResumen();
  } else {
    const siguienteTarea = document.querySelector(`.tarea:nth-child(${siguienteId})`);
    if (siguienteTarea) scrollToElement(siguienteTarea);
  }
}

/* Mostrar resumen */
function mostrarResumen() {
  const resumen = document.getElementById('resumen-tareas');
  if (resumen) {
    resumen.style.display = 'block';
    resumen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  actualizarContadorCompletadas();
}

/* Marcar todas completadas */
function marcarTodasCompletadas() {
  tareasData.forEach((tarea) => {
    tarea.completada = true;
    if (tarea.elemento) {
      const checkbox = tarea.elemento.querySelector('.checkbox-completada');
      if (checkbox) checkbox.checked = true;
      actualizarEstadoTarea(tarea);
      tarea.elemento.classList.add('completada');
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
  const completadas = tareasData.filter(t => t.completada).length;
  const porcentaje = tareasData.length ? Math.round((completadas / tareasData.length) * 100) : 0;
  const barra = document.getElementById('barra-completada');
  const texto = document.getElementById('porcentaje-progreso');
  if (barra) barra.style.width = `${porcentaje}%`;
  if (texto) texto.textContent = porcentaje;
}

function actualizarContadorCompletadas() {
  const completadas = tareasData.filter(t => t.completada).length;
  const contador = document.getElementById('tareas-completadas-count');
  if (contador) contador.textContent = completadas;
}

function actualizarUI() {
  actualizarProgreso();
  actualizarContadorCompletadas();
  if (tareasData.length === 0) {
    const sin = document.getElementById('sin-tareas');
    if (sin) sin.style.display = 'block';
  }
}

/* ================== localStorage ================== */
function guardarProgresoLocal() {
  const progreso = {
    curso: CURSO_SLUG,
    tareas: tareasData.map(t => ({ id: t.id, completada: t.completada })),
    videoTerminado,
    fechaActualizacion: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progreso));
    console.log('Progreso guardado localmente:', STORAGE_KEY);
  } catch (err) {
    console.warn('No se pudo guardar en localStorage:', err);
  }
}

function cargarProgresoLocal() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return;
    progresoLocal = JSON.parse(guardado);
    progresoLocal.tareas?.forEach(tareaGuardada => {
      const tarea = tareasData.find(t => t.id === tareaGuardada.id);
      if (tarea) {
        tarea.completada = tareaGuardada.completada;
        actualizarEstadoTarea(tarea);
        if (tarea.completada && tarea.elemento) tarea.elemento.classList.add('completada');
      }
    });

    if (progresoLocal.videoTerminado) {
      videoTerminado = true;
      habilitarBotonVideoSiguiente();
    }
    console.log('Progreso cargado desde localStorage');
  } catch (err) {
    console.warn('No se pudo cargar progreso:', err);
  }
}

/* ================== Modal y envío ================== */
function abrirModalConfirmacion() {
  const tareasCompletadas = tareasData.filter(t => t.completada);
  if (tareasCompletadas.length === 0) {
    alert('No hay tareas completadas para enviar. Completa al menos una tarea antes de enviar.');
    return;
  }

  const lista = document.getElementById('lista-tareas-enviar');
  if (lista) {
    lista.innerHTML = '';
    tareasCompletadas.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t.titulo;
      lista.appendChild(li);
    });
  }

  const modal = document.getElementById('modal-confirmacion');
  if (modal) modal.style.display = 'flex';
}

function cerrarModal() {
  const modal = document.getElementById('modal-confirmacion');
  if (modal) modal.style.display = 'none';
}

function enviarTareasCompletadas() {
  const tareasCompletadas = tareasData.filter(t => t.completada);
  if (tareasCompletadas.length === 0) {
    alert('No hay tareas completadas para enviar.');
    return;
  }

  const nombreUsuario = document.getElementById('nombre-estudiante')?.textContent || 'Nombre Apellido';
  const datosEnvio = {
    curso: CURSO_SLUG,
    usuario: nombreUsuario,
    tareasCompletadas: tareasCompletadas.map(t => t.id),
    fecha: new Date().toISOString(),
    progresoCompleto: (tareasCompletadas.length === tareasData.length)
  };

  console.log('Datos a enviar (plantilla):', datosEnvio);

  // TODO: Descomentar y ajustar cuando tengas backend
  /*
  fetch('/api/progreso', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(datosEnvio)
  })
  .then(resp => {
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    return resp.json();
  })
  .then(data => {
    console.log('Envío OK:', data);
    mostrarMensajeExito();
    cerrarModal();
  })
  .catch(err => {
    console.error('Error al enviar progreso:', err);
    alert('Ocurrió un error al enviar. Intenta de nuevo.');
  });
  */

  // Simulación local
  setTimeout(() => {
    mostrarMensajeExito();
    cerrarModal();
    console.log('Simulación: progreso enviado correctamente');
  }, 700);
}

function mostrarMensajeExito() {
  const notificacion = document.createElement('div');
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
  notificacion.textContent = '¡Tareas enviadas exitosamente!';
  document.body.appendChild(notificacion);
  setTimeout(() => notificacion.remove(), 3000);
}

/* ================== Utilidades ================== */
function getAuthToken() {
  // TODO: Implementar según tu sistema de auth
  // return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return 'your-auth-token-here';
}

function scrollToElement(element) {
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function esMobile() {
  return window.innerWidth <= 768;
}

/* Ajustes para móvil */
if (esMobile()) {
  const videoIframe = document.getElementById('youtube-video');
  if (videoIframe) videoIframe.style.minHeight = '200px';
}

/* ================== Mensajes de desarrollo ================== */
console.log(`
📚 Tareas del curso: ${CURSO_SLUG}
🔧 Notas para desarrollador:
  - Cambiar VIDEO_ID en el iframe del HTML por el id real del video.
  - Reemplazar "Nombre Apellido" por el dato real del usuario (ej. document.getElementById('nombre-estudiante').textContent = user.name).
  - Conectar POST /api/progreso en enviarTareasCompletadas() cuando el backend esté disponible.
  - Implementar getAuthToken() según tu auth.
`);

/* ================== FIN ================== */
