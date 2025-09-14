/* Archivo: leccion-ninos.js, Curso: Mindfulness para Niños, Generado para: Elim Online */

/*
  Este archivo está basado en tu JS original (leccion-adultos.js).
  Cambios principales:
   - CURSO_SLUG = 'mindfulness-ninos'
   - ids/data-tarea adaptados al HTML de niños
   - mantiene detección de YouTube + fallback manual
   - guarda/lee progreso en localStorage con clave progreso-mindfulness-ninos
*/

/* ================== Variables globales ================== */
let tareasData = [];
let progresoLocal = {};
const CURSO_SLUG = 'mindfulness-ninos';
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

  // Si la API de YouTube no carga, mostrar fallback manual
  setTimeout(() => {
    if (!window.YT) {
      mostrarFallbackVideo();
    }
  }, 3000);
});

/* ================== Inicializar tareas (mapa de tareas) ================== */
function inicializarTareas() {
  tareasData = [
    {
      id: 'introduccion-mindfulness',
      titulo: 'Leer: ¿Qué es Mindfulness para Niños?',
      completada: false,
      elemento: document.querySelector('[data-tarea="introduccion-mindfulness"]')
    },
    {
      id: 'video-respiracion-ninos',
      titulo: 'Ver Video: Respiración para Niños',
      completada: false,
      elemento: document.querySelector('[data-tarea="video-respiracion-ninos"]'),
      esVideo: true
    },
    {
      id: 'juego-atencion',
      titulo: 'Actividad: Juego de Atención',
      completada: false,
      elemento: document.querySelector('[data-tarea="juego-atencion"]')
    },
    {
      id: 'rutina-duerme-mindful',
      titulo: 'Actividad: Rutina de Sueño Mindful',
      completada: false,
      elemento: document.querySelector('[data-tarea="rutina-duerme-mindful"]')
    }
  ];
}

/* ================== Event listeners ================== */
function configurarEventListeners() {
  // Checkboxes de completado (se asume que aparecen en el DOM en el mismo orden de tareasData)
  document.querySelectorAll('.checkbox-completada').forEach((checkbox, index) => {
    checkbox.addEventListener('change', (e) => manejarCheckboxChange(e, index));
  });

  // Botones "Siguiente"
  document.querySelectorAll('.btn-siguiente').forEach(btn => {
    btn.addEventListener('click', manejarClickSiguiente);
  });

  // Botón "Marcar todo completado"
  const btnMarcarTodas = document.getElementById('btn-marcar-todas');
  if (btnMarcarTodas) btnMarcarTodas.addEventListener('click', marcarTodasCompletadas);

  // Botones de envío
  const btnEnviar = document.getElementById('btn-enviar-tareas');
  if (btnEnviar) btnEnviar.addEventListener('click', abrirModalConfirmacion);
  const btnEnviarFinal = document.getElementById('btn-enviar-final');
  if (btnEnviarFinal) btnEnviarFinal.addEventListener('click', abrirModalConfirmacion);

  // Modal de confirmación
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', cerrarModal);
  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
  const btnConfirmarEnvio = document.getElementById('btn-confirmar-envio');
  if (btnConfirmarEnvio) btnConfirmarEnvio.addEventListener('click', enviarTareasCompletadas);

  // Cerrar modal al hacer click fuera
  const modal = document.getElementById('modal-confirmacion');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) cerrarModal();
    });
  }

  // Fallback manual del video
  const videoFallback = document.getElementById('video-confirmacion');
  if (videoFallback) {
    videoFallback.addEventListener('change', manejarFallbackVideo);
  }

  // Listener global para errores (útil en desarrollo)
  window.addEventListener('error', function(e) {
    console.error('Error JavaScript global:', e.error || e.message);
  });
}

/* ================== YouTube IFrame API ================== */
/* La API de YT llama a onYouTubeIframeAPIReady cuando esté lista */
function onYouTubeIframeAPIReady() {
  try {
    if (!document.getElementById('youtube-video')) return;
    player = new YT.Player('youtube-video', {
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
    console.log('YouTube Player inicializado');
  } catch (err) {
    console.warn('No se pudo inicializar YouTube Player:', err);
  }
}

function onPlayerStateChange(event) {
  // YT.PlayerState.ENDED === 0
  if (event.data === YT.PlayerState.ENDED) {
    videoTerminado = true;
    habilitarBotonVideoSiguiente();
    console.log('Video finalizado (API) — botón siguiente habilitado');
  }
}

/* Habilitar botón siguiente del video */
function habilitarBotonVideoSiguiente() {
  const btnVideoSiguiente = document.getElementById('btn-video-siguiente');
  if (btnVideoSiguiente) {
    btnVideoSiguiente.disabled = false;
    btnVideoSiguiente.textContent = 'Siguiente →';
  }
}

/* Mostrar fallback manual si la API no carga o hay restricciones */
function mostrarFallbackVideo() {
  const videoFallback = document.getElementById('video-fallback');
  if (videoFallback && !player) {
    videoFallback.style.display = 'block';
    console.log('Mostrando fallback manual del video');
  }
}

/* Manejar cambio del checkbox fallback del video */
function manejarFallbackVideo(e) {
  const btnVideoSiguiente = document.getElementById('btn-video-siguiente');
  if (!btnVideoSiguiente) return;

  if (e.target.checked) {
    videoTerminado = true;
    btnVideoSiguiente.disabled = false;
    btnVideoSiguiente.textContent = 'Siguiente →';
  } else {
    videoTerminado = false;
    btnVideoSiguiente.disabled = true;
    btnVideoSiguiente.textContent = 'Termine el video primero';
  }

  guardarProgresoLocal();
}

/* ================== Manejo de checkboxes ================== */
function manejarCheckboxChange(event, index) {
  const completada = event.target.checked;
  if (!tareasData[index]) return;

  tareasData[index].completada = completada;

  // Actualizar estado visual
  actualizarEstadoTarea(tareasData[index]);

  // Guardar y actualizar UI
  guardarProgresoLocal();
  actualizarProgreso();
  actualizarContadorCompletadas();

  // Añadir/quitar clase para animación
  if (completada) {
    tareasData[index].elemento?.classList.add('completada');
  } else {
    tareasData[index].elemento?.classList.remove('completada');
  }
}

/* Actualizar estado visual de una tarea */
function actualizarEstadoTarea(tarea) {
  if (!tarea || !tarea.elemento) return;
  const estadoTexto = tarea.elemento.querySelector('.estado-texto');
  const checkbox = tarea.elemento.querySelector('.checkbox-completada');

  if (tarea.completada) {
    if (estadoTexto) {
      estadoTexto.textContent = 'Completada';
      estadoTexto.style.color = '#4CAF50';
    }
    if (checkbox) checkbox.checked = true;
  } else {
    if (estadoTexto) {
      estadoTexto.textContent = 'Pendiente';
      estadoTexto.style.color = '#FF9800';
    }
    if (checkbox) checkbox.checked = false;
  }
}

/* ================== Navegación entre tareas ================== */
function manejarClickSiguiente(event) {
  const btn = event.currentTarget;
  const siguienteId = btn.getAttribute('data-siguiente');
  const tareaActual = btn.closest('.tarea');
  const indiceTareaActual = Array.from(document.querySelectorAll('.tarea')).indexOf(tareaActual);

  // Si es el botón del video, verificar que haya terminado
  if (btn.id === 'btn-video-siguiente' && !videoTerminado) {
    alert('Por favor, termina de ver el video con el niño antes de continuar.');
    return;
  }

  // Marcar tarea actual como completada si aún no lo está
  if (tareasData[indiceTareaActual] && !tareasData[indiceTareaActual].completada) {
    const checkbox = tareaActual.querySelector('.checkbox-completada');
    if (checkbox) {
      checkbox.checked = true;
      manejarCheckboxChange({ target: checkbox }, indiceTareaActual);
    }
  }

  // Navegar al siguiente
  if (siguienteId === 'resumen') {
    mostrarResumen();
  } else {
    // "siguienteId" está diseñado como número (posicional). Si usas otro esquema, ajusta aquí.
    const siguienteTarea = document.querySelector(`.tarea:nth-child(${siguienteId})`);
    if (siguienteTarea) {
      scrollToElement(siguienteTarea);
    }
  }
}

/* Mostrar resumen final */
function mostrarResumen() {
  const resumen = document.getElementById('resumen-tareas');
  if (resumen) {
    resumen.style.display = 'block';
    resumen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  actualizarContadorCompletadas();
}

/* Marcar todas las tareas como completadas */
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

  // Si hay tarea de video, considerarla como terminada
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
  const barraCompletada = document.getElementById('barra-completada');
  const porcentajeTexto = document.getElementById('porcentaje-progreso');

  if (barraCompletada) barraCompletada.style.width = `${porcentaje}%`;
  if (porcentajeTexto) porcentajeTexto.textContent = porcentaje;
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
    const sinTareas = document.getElementById('sin-tareas');
    if (sinTareas) sinTareas.style.display = 'block';
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
  } catch (error) {
    console.warn('Error guardando en localStorage:', error);
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
  } catch (error) {
    console.warn('No se pudo cargar progreso desde localStorage:', error);
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

/* Enviar tareas completadas al backend (simulado) */
function enviarTareasCompletadas() {
  const tareasCompletadas = tareasData.filter(t => t.completada);
  if (tareasCompletadas.length === 0) {
    alert('No hay tareas completadas para enviar.');
    return;
  }

  // Nombre de usuario (TODO: reemplazar por dato real)
  const nombreUsuario = document.getElementById('nombre-estudiante')?.textContent || 'Nombre Apellido';

  const datosEnvio = {
    curso: CURSO_SLUG,
    usuario: nombreUsuario,
    tareasCompletadas: tareasCompletadas.map(t => t.id),
    fecha: new Date().toISOString(),
    progresoCompleto: (tareasCompletadas.length === tareasData.length)
  };

  console.log('Datos a enviar al backend (plantilla):', datosEnvio);

  // TODO: Descomentar y actualizar el endpoint y getAuthToken() cuando tengas backend
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
    console.log('Envío exitoso:', data);
    mostrarMensajeExito();
    cerrarModal();
  })
  .catch(err => {
    console.error('Error al enviar progreso:', err);
    alert('Ocurrió un error al enviar. Intenta de nuevo.');
  });
  */

  // Simulación (desarrollo)
  setTimeout(() => {
    mostrarMensajeExito();
    cerrarModal();
    console.log('Simulación: progreso enviado correctamente');
  }, 800);
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

/* Ajustes pequeños para móvil */
if (esMobile()) {
  const videoIframe = document.getElementById('youtube-video');
  if (videoIframe) {
    videoIframe.style.minHeight = '200px';
  }
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
