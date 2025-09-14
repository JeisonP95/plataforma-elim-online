/* Archivo: leccion-yoga.js
   Curso: Yoga Familiar
   Generado para: Elim Online
   Versión corregida: inicializa tareas desde el DOM y maneja fallback y storage correctamente.
*/

const CURSO_SLUG = 'yoga-familiar';
const STORAGE_KEY = `progreso-${CURSO_SLUG}`;

let tareasData = [];
let progresoLocal = {};
let player = null;
let videoTerminado = false;

/* ------------------ Inicialización ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  inicializarTareasDesdeDOM();
  configurarEventListeners();
  cargarProgresoLocal();
  actualizarUI();

  // Si la API de YouTube no carga en 3s, mostramos fallback
  setTimeout(() => {
    if (!window.YT) mostrarFallbackVideo();
  }, 3000);
});

/* Inicializa tareas leyendo las .tarea del DOM */
function inicializarTareasDesdeDOM() {
  const tareaEls = Array.from(document.querySelectorAll('.tarea'));
  tareasData = tareaEls.map((el) => {
    const id = el.dataset.tarea || `tarea-${Math.random().toString(36).slice(2,8)}`;
    const tituloEl = el.querySelector('.tarea-info h3');
    const titulo = tituloEl ? tituloEl.textContent.trim() : id;
    const esVideo = !!el.querySelector('#youtube-video') || !!el.querySelector('.video-container');
    return {
      id,
      titulo,
      completada: false,
      elemento: el,
      esVideo: !!esVideo
    };
  });
}

/* ------------------ Event listeners ------------------ */
function configurarEventListeners() {
  // Checkboxes (puede haber 1..N)
  document.querySelectorAll('.checkbox-completada').forEach((checkbox, index) => {
    checkbox.addEventListener('change', (e) => {
      // si el index no existe en tareasData, buscamos por el elemento padre
      if (!tareasData[index]) {
        const tareaEl = checkbox.closest('.tarea');
        const tareaIndex = tareasData.findIndex(t => t.elemento === tareaEl);
        if (tareaIndex >= 0) return manejarCheckboxChange(e, tareaIndex);
        return; // no podemos mapear, salimos
      }
      manejarCheckboxChange(e, index);
    });
  });

  // Botones Siguiente
  document.querySelectorAll('.btn-siguiente').forEach(btn => btn.addEventListener('click', manejarClickSiguiente));

  // Botón marcar todo
  const btnMarcarTodas = document.getElementById('btn-marcar-todas');
  if (btnMarcarTodas) btnMarcarTodas.addEventListener('click', marcarTodasCompletadas);

  // Botones envío
  const btnEnviar = document.getElementById('btn-enviar-tareas');
  if (btnEnviar) btnEnviar.addEventListener('click', abrirModalConfirmacion);
  const btnEnviarFinal = document.getElementById('btn-enviar-final');
  if (btnEnviarFinal) btnEnviarFinal.addEventListener('click', abrirModalConfirmacion);

  // Modal acciones
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', cerrarModal);
  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
  const btnConfirmarEnvio = document.getElementById('btn-confirmar-envio');
  if (btnConfirmarEnvio) btnConfirmarEnvio.addEventListener('click', enviarTareasCompletadas);

  const modal = document.getElementById('modal-confirmacion');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) cerrarModal();
    });
  }

  // Fallback video (si existe)
  const videoFallbackCheckbox = document.getElementById('video-confirmacion');
  if (videoFallbackCheckbox) videoFallbackCheckbox.addEventListener('change', manejarFallbackVideo);
}

/* ------------------ YouTube IFrame API ------------------
   Si el iframe tiene id="youtube-video", la API llamará a esta función.
*/
function onYouTubeIframeAPIReady() {
  const iframe = document.getElementById('youtube-video');
  if (!iframe) return;
  try {
    player = new YT.Player('youtube-video', {
      events: { 'onStateChange': onPlayerStateChange }
    });
    console.log('YouTube player inicializado (yoga).');
  } catch (err) {
    console.warn('Error al inicializar YT player:', err);
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    videoTerminado = true;
    habilitarBotonVideoSiguiente();
    guardarProgresoLocal();
  }
}

function habilitarBotonVideoSiguiente() {
  const btn = document.getElementById('btn-video-siguiente');
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = 'Siguiente →';
}

function mostrarFallbackVideo() {
  const fallback = document.getElementById('video-fallback');
  if (fallback) fallback.style.display = 'block';
}

/* Manejar cambio del checkbox fallback del video */
function manejarFallbackVideo(e) {
  videoTerminado = !!e.target.checked;
  const btn = document.getElementById('btn-video-siguiente');
  if (btn) btn.disabled = !videoTerminado;
  if (videoTerminado) habilitarBotonVideoSiguiente();
  guardarProgresoLocal();
}

/* ------------------ Checkboxes ------------------ */
function manejarCheckboxChange(event, index) {
  if (!tareasData[index]) return;
  const completada = event.target.checked;
  tareasData[index].completada = completada;

  // Actualizar UI de la tarea
  actualizarEstadoTarea(tareasData[index]);

  // Guardar y actualizar progreso global
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

/* ------------------ Navegación entre tareas ------------------ */
function manejarClickSiguiente(e) {
  const btn = e.currentTarget;
  if (!btn) return;
  // Si es botón del video, validar finalización
  if (btn.id === 'btn-video-siguiente' && !videoTerminado) {
    alert('Por favor, termina de ver el video antes de continuar.');
    return;
  }

  const siguienteId = btn.getAttribute('data-siguiente');
  const tareaActualEl = btn.closest('.tarea');
  const indiceTareaActual = Array.from(document.querySelectorAll('.tarea')).indexOf(tareaActualEl);

  // Marcar actual completada si no lo está
  if (tareasData[indiceTareaActual] && !tareasData[indiceTareaActual].completada) {
    const ch = tareaActualEl.querySelector('.checkbox-completada');
    if (ch) {
      ch.checked = true;
      manejarCheckboxChange({ target: ch }, indiceTareaActual);
    }
  }

  if (siguienteId === 'resumen') {
    mostrarResumen();
  } else {
    // asumimos que "siguienteId" es un número posicional
    const siguienteTarea = document.querySelector(`.tarea:nth-child(${siguienteId})`);
    if (siguienteTarea) scrollToElement(siguienteTarea);
  }
}

/* ------------------ Resumen y marcar todas ------------------ */
function mostrarResumen() {
  const resumen = document.getElementById('resumen-tareas');
  if (resumen) {
    resumen.style.display = 'block';
    resumen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  actualizarContadorCompletadas();
}

function marcarTodasCompletadas() {
  tareasData.forEach(t => {
    t.completada = true;
    if (t.elemento) {
      const ch = t.elemento.querySelector('.checkbox-completada');
      if (ch) ch.checked = true;
      actualizarEstadoTarea(t);
      t.elemento.classList.add('completada');
    }
  });

  // Considerar video como terminado
  videoTerminado = true;
  habilitarBotonVideoSiguiente();
  guardarProgresoLocal();
  actualizarUI();
  mostrarResumen();
}

/* ------------------ Progreso UI ------------------ */
function actualizarProgreso() {
  const completadas = tareasData.filter(t => t.completada).length;
  const total = tareasData.length || 1;
  const porcentaje = Math.round((completadas / total) * 100);
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

/* ------------------ localStorage ------------------ */
function guardarProgresoLocal() {
  const progreso = {
    curso: CURSO_SLUG,
    tareas: tareasData.map(t => ({ id: t.id, completada: t.completada })),
    videoTerminado,
    fechaActualizacion: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progreso));
    // console.log('Progreso guardado', STORAGE_KEY);
  } catch (err) {
    console.warn('Error guardando en localStorage', err);
  }
}

function cargarProgresoLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    progresoLocal = JSON.parse(raw);
    progresoLocal.tareas?.forEach(saved => {
      const tarea = tareasData.find(t => t.id === saved.id);
      if (tarea) {
        tarea.completada = saved.completada;
        actualizarEstadoTarea(tarea);
        if (tarea.completada) tarea.elemento?.classList.add('completada');
      }
    });
    if (progresoLocal.videoTerminado) {
      videoTerminado = true;
      habilitarBotonVideoSiguiente();
    }
  } catch (err) {
    console.warn('No se pudo cargar progreso', err);
  }
}

/* ------------------ Modal / envío ------------------ */
function abrirModalConfirmacion() {
  const tareasCompletadas = tareasData.filter(t => t.completada);
  if (tareasCompletadas.length === 0) {
    alert('No hay tareas completadas para enviar.');
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
    progresoCompleto: tareasCompletadas.length === tareasData.length
  };

  console.log('Datos a enviar (plantilla):', datosEnvio);

  // TODO: cuando tengas backend, descomenta y adapta fetch()
  /*
  fetch('/api/progreso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
    body: JSON.stringify(datosEnvio)
  })
  .then(r => r.json())
  .then(() => { mostrarMensajeExito(); cerrarModal(); })
  .catch(() => alert('Error al enviar, intenta nuevamente'));
  */

  // Simulación local
  setTimeout(() => {
    mostrarMensajeExito();
    cerrarModal();
  }, 700);
}

function mostrarMensajeExito() {
  const n = document.createElement('div');
  n.style.cssText = `position:fixed;top:20px;right:20px;background:#4CAF50;color:#fff;padding:1rem;border-radius:8px;z-index:9999;`;
  n.textContent = '¡Tareas enviadas exitosamente!';
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

/* ------------------ Utilidades ------------------ */
function getAuthToken() { return 'your-auth-token-here'; }
function scrollToElement(el) { if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
function esMobile() { return window.innerWidth <= 768; }
if (esMobile()) {
  const vf = document.getElementById('youtube-video'); if (vf) vf.style.minHeight = '200px';
}

console.log(`Curso: ${CURSO_SLUG} — tareas detectadas: ${tareasData.length}`);
