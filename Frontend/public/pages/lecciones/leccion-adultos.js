/* Archivo: tareas-gestion-estres-adultos.js, Curso: Gestión del Estrés para Adultos, Generado para: Elim Online */

// Variables globales para manejo del estado
let tareasData = [];
let progresoLocal = {};
const CURSO_SLUG = 'gestion-estres-adultos';
const STORAGE_KEY = `progreso-${CURSO_SLUG}`;

// Variables para el reproductor de YouTube
let player;
let videoTerminado = false;

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    inicializarTareas();
    configurarEventListeners();
    cargarProgresoLocal();
    actualizarUI();
    
    // Mostrar fallback del video si la API de YouTube no se puede cargar
    setTimeout(() => {
        if (!window.YT) {
            mostrarFallbackVideo();
        }
    }, 3000);
});

// Función principal de inicialización de tareas
function inicializarTareas() {
    tareasData = [
        {
            id: 'introduccion-estres',
            titulo: 'Leer: Introducción al Estrés',
            completada: false,
            elemento: document.querySelector('[data-tarea="introduccion-estres"]')
        },
        {
            id: 'video-tecnicas-respiracion',
            titulo: 'Ver Video: Técnicas de Respiración',
            completada: false,
            elemento: document.querySelector('[data-tarea="video-tecnicas-respiracion"]'),
            esVideo: true
        },
        {
            id: 'ejercicio-relajacion',
            titulo: 'Práctica: Ejercicio de Relajación',
            completada: false,
            elemento: document.querySelector('[data-tarea="ejercicio-relajacion"]')
        },
        {
            id: 'diario-estres',
            titulo: 'Actividad: Diario de Estrés',
            completada: false,
            elemento: document.querySelector('[data-tarea="diario-estres"]')
        }
    ];
}

// Configurar todos los event listeners
function configurarEventListeners() {
    // Checkboxes de completado
    document.querySelectorAll('.checkbox-completada').forEach((checkbox, index) => {
        checkbox.addEventListener('change', (e) => manejarCheckboxChange(e, index));
    });
    
    // Botones "Siguiente"
    document.querySelectorAll('.btn-siguiente').forEach(btn => {
        btn.addEventListener('click', manejarClickSiguiente);
    });
    
    // Botón "Marcar todo completado"
    document.getElementById('btn-marcar-todas').addEventListener('click', marcarTodasCompletadas);
    
    // Botones de envío
    document.getElementById('btn-enviar-tareas').addEventListener('click', abrirModalConfirmacion);
    document.getElementById('btn-enviar-final').addEventListener('click', abrirModalConfirmacion);
    
    // Modal de confirmación
    document.getElementById('modal-close').addEventListener('click', cerrarModal);
    document.getElementById('btn-cancelar').addEventListener('click', cerrarModal);
    document.getElementById('btn-confirmar-envio').addEventListener('click', enviarTareasCompletadas);
    
    // Cerrar modal haciendo click fuera
    document.getElementById('modal-confirmacion').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) cerrarModal();
    });
    
    // Fallback del video manual
    const videoFallback = document.getElementById('video-confirmacion');
    if (videoFallback) {
        videoFallback.addEventListener('change', manejarFallbackVideo);
    }
}

// Función que se ejecuta cuando YouTube API está lista
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-video', {
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

// Detectar cuando el video termina
function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED = 0
    if (event.data === YT.PlayerState.ENDED) {
        videoTerminado = true;
        habilitarBotonVideoSiguiente();
        console.log('Video terminado - habilitando botón siguiente');
    }
}

// Habilitar el botón siguiente del video cuando termina
function habilitarBotonVideoSiguiente() {
    const btnVideoSiguiente = document.getElementById('btn-video-siguiente');
    if (btnVideoSiguiente) {
        btnVideoSiguiente.disabled = false;
        btnVideoSiguiente.textContent = 'Siguiente →';
    }
}

// Mostrar fallback manual si la API de YouTube falla
function mostrarFallbackVideo() {
    const videoFallback = document.getElementById('video-fallback');
    if (videoFallback && !player) {
        videoFallback.style.display = 'block';
        console.log('Mostrando fallback manual para el video');
    }
}

// Manejar el checkbox manual del video (fallback)
function manejarFallbackVideo(e) {
    const btnVideoSiguiente = document.getElementById('btn-video-siguiente');
    if (btnVideoSiguiente) {
        btnVideoSiguiente.disabled = !e.target.checked;
        if (e.target.checked) {
            videoTerminado = true;
            btnVideoSiguiente.textContent = 'Siguiente →';
        } else {
            videoTerminado = false;
            btnVideoSiguiente.textContent = 'Termine el video primero';
        }
    }
}

// Manejar cambios en los checkboxes de completado
function manejarCheckboxChange(event, index) {
    const completada = event.target.checked;
    tareasData[index].completada = completada;
    
    // Actualizar estado visual de la tarea
    actualizarEstadoTarea(tareasData[index]);
    
    // Guardar progreso y actualizar UI
    guardarProgresoLocal();
    actualizarProgreso();
    actualizarContadorCompletadas();
    
    // Animación suave
    if (completada) {
        tareasData[index].elemento.classList.add('completada');
    } else {
        tareasData[index].elemento.classList.remove('completada');
    }
}

// Actualizar el estado visual de una tarea específica
function actualizarEstadoTarea(tarea) {
    const estadoTexto = tarea.elemento.querySelector('.estado-texto');
    const checkbox = tarea.elemento.querySelector('.checkbox-completada');
    
    if (tarea.completada) {
        estadoTexto.textContent = 'Completada';
        estadoTexto.style.color = '#4CAF50';
        checkbox.checked = true;
    } else {
        estadoTexto.textContent = 'Pendiente';
        estadoTexto.style.color = '#FF9800';
        checkbox.checked = false;
    }
}

// Manejar clicks en botones "Siguiente"
function manejarClickSiguiente(event) {
    const btn = event.target;
    const siguienteId = btn.getAttribute('data-siguiente');
    const tareaActual = btn.closest('.tarea');
    const indiceTareaActual = Array.from(document.querySelectorAll('.tarea')).indexOf(tareaActual);
    
    // Si es el botón del video, verificar que haya terminado
    if (btn.id === 'btn-video-siguiente' && !videoTerminado) {
        alert('Por favor, termina de ver el video completo antes de continuar.');
        return;
    }
    
    // Marcar tarea actual como completada si no lo está
    if (!tareasData[indiceTareaActual].completada) {
        const checkbox = tareaActual.querySelector('.checkbox-completada');
        checkbox.checked = true;
        manejarCheckboxChange({ target: checkbox }, indiceTareaActual);
    }
    
    // Navegar al siguiente elemento
    if (siguienteId === 'resumen') {
        mostrarResumen();
    } else {
        const siguienteTarea = document.querySelector(`.tarea:nth-child(${siguienteId})`);
        if (siguienteTarea) {
            siguienteTarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Mostrar la sección de resumen
function mostrarResumen() {
    const resumen = document.getElementById('resumen-tareas');
    resumen.style.display = 'block';
    resumen.scrollIntoView({ behavior: 'smooth', block: 'center' });
    actualizarContadorCompletadas();
}

// Marcar todas las tareas como completadas
function marcarTodasCompletadas() {
    tareasData.forEach((tarea, index) => {
        if (!tarea.completada) {
            tarea.completada = true;
            const checkbox = tarea.elemento.querySelector('.checkbox-completada');
            checkbox.checked = true;
            actualizarEstadoTarea(tarea);
            tarea.elemento.classList.add('completada');
        }
    });
    
    // Para la tarea del video, también habilitar el botón
    videoTerminado = true;
    habilitarBotonVideoSiguiente();
    
    guardarProgresoLocal();
    actualizarUI();
    mostrarResumen();
}

// Actualizar barra de progreso
function actualizarProgreso() {
    const completadas = tareasData.filter(t => t.completada).length;
    const porcentaje = Math.round((completadas / tareasData.length) * 100);
    
    const barraCompletada = document.getElementById('barra-completada');
    const porcentajeTexto = document.getElementById('porcentaje-progreso');
    
    if (barraCompletada && porcentajeTexto) {
        barraCompletada.style.width = `${porcentaje}%`;
        porcentajeTexto.textContent = porcentaje;
    }
}

// Actualizar contador de tareas completadas en el resumen
function actualizarContadorCompletadas() {
    const completadas = tareasData.filter(t => t.completada).length;
    const contador = document.getElementById('tareas-completadas-count');
    if (contador) {
        contador.textContent = completadas;
    }
}

// Función para actualizar toda la UI
function actualizarUI() {
    actualizarProgreso();
    actualizarContadorCompletadas();
    
    // Si no hay tareas, mostrar mensaje
    if (tareasData.length === 0) {
        document.getElementById('sin-tareas').style.display = 'block';
    }
}

// Guardar progreso en localStorage
function guardarProgresoLocal() {
    const progreso = {
        curso: CURSO_SLUG,
        tareas: tareasData.map(t => ({
            id: t.id,
            completada: t.completada
        })),
        videoTerminado: videoTerminado,
        fechaActualizacion: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progreso));
        console.log('Progreso guardado localmente');
    } catch (error) {
        console.warn('No se pudo guardar en localStorage:', error);
    }
}

// Cargar progreso desde localStorage
function cargarProgresoLocal() {
    try {
        const progresoGuardado = localStorage.getItem(STORAGE_KEY);
        if (progresoGuardado) {
            progresoLocal = JSON.parse(progresoGuardado);
            
            // Restaurar estado de las tareas
            progresoLocal.tareas?.forEach(tareaGuardada => {
                const tarea = tareasData.find(t => t.id === tareaGuardada.id);
                if (tarea) {
                    tarea.completada = tareaGuardada.completada;
                    actualizarEstadoTarea(tarea);
                    if (tarea.completada) {
                        tarea.elemento.classList.add('completada');
                    }
                }
            });
            
            // Restaurar estado del video
            if (progresoLocal.videoTerminado) {
                videoTerminado = true;
                habilitarBotonVideoSiguiente();
            }
            
            console.log('Progreso cargado desde localStorage');
        }
    } catch (error) {
        console.warn('No se pudo cargar desde localStorage:', error);
    }
}

// Abrir modal de confirmación de envío
function abrirModalConfirmacion() {
    const tareasCompletadas = tareasData.filter(t => t.completada);
    
    if (tareasCompletadas.length === 0) {
        alert('No hay tareas completadas para enviar. Complete al menos una tarea antes de enviar.');
        return;
    }
    
    // Llenar lista de tareas en el modal
    const lista = document.getElementById('lista-tareas-enviar');
    lista.innerHTML = '';
    
    tareasCompletadas.forEach(tarea => {
        const li = document.createElement('li');
        li.textContent = tarea.titulo;
        lista.appendChild(li);
    });
    
    // Mostrar modal
    document.getElementById('modal-confirmacion').style.display = 'flex';
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('modal-confirmacion').style.display = 'none';
}

// Enviar tareas completadas al backend
function enviarTareasCompletadas() {
    const tareasCompletadas = tareasData.filter(t => t.completada);
    
    if (tareasCompletadas.length === 0) {
        alert('No hay tareas completadas para enviar.');
        return;
    }
    
    // TODO: Reemplazar por el nombre real del usuario logueado
    const nombreUsuario = document.getElementById('nombre-estudiante').textContent;
    
    // Plantilla JSON para enviar al backend
    const datosEnvio = {
        curso: CURSO_SLUG,
        usuario: nombreUsuario,
        tareasCompletadas: tareasCompletadas.map(t => t.id),
        fecha: new Date().toISOString(),
        progresoCompleto: (tareasCompletadas.length === tareasData.length)
    };
    
    console.log('Datos a enviar:', datosEnvio);
    
    // TODO: Descomenta y modifica la siguiente línea cuando tengas el endpoint del backend
    /*
    fetch('/api/progreso', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}` // Si usas autenticación
        },
        body: JSON.stringify(datosEnvio)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Tareas enviadas exitosamente:', data);
        mostrarMensajeExito();
        cerrarModal();
        
        // Opcional: redirigir o limpiar estado local
        // window.location.href = '/pages/cursos/curso-detalle.html';
    })
    .catch(error => {
        console.error('Error al enviar tareas:', error);
        alert('Hubo un error al enviar las tareas. Por favor, inténtalo de nuevo.');
    });
    */
    
    // Simulación para desarrollo (remover cuando tengas el backend)
    setTimeout(() => {
        console.log('✅ Simulación: Tareas enviadas exitosamente');
        mostrarMensajeExito();
        cerrarModal();
    }, 1000);
}

// Mostrar mensaje de éxito después del envío
function mostrarMensajeExito() {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;
    notificacion.textContent = '¡Tareas enviadas exitosamente!';
    
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

// TODO: Función para obtener el token de autenticación (implementar según tu sistema)
function getAuthToken() {
    // return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return 'your-auth-token-here';
}

// Funciones de utilidad para scroll suave
function scrollToElement(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error JavaScript:', e.error);
});

// Detectar si el usuario está en móvil para ajustar UX
function esMobile() {
    return window.innerWidth <= 768;
}

// Ajustes específicos para móvil
if (esMobile()) {
    // Ajustar altura mínima de video en móvil
    const videoIframe = document.getElementById('youtube-video');
    if (videoIframe) {
        videoIframe.style.minHeight = '200px';
    }
}

// Log de información para desarrollo
console.log(`
📚 Tareas del curso: ${CURSO_SLUG}
🔧 Para desarrollo:
   - Cambiar VIDEO_ID en el iframe del video
   - Reemplazar {{user.name}} por datos reales del usuario
   - Conectar endpoint POST /api/progreso para envío de tareas
   - Implementar getAuthToken() según tu sistema de autenticación
`);

/*
INSTRUCCIONES PARA EL DESARROLLADOR:

1. DATOS DEL USUARIO:
   - Reemplazar el texto "Nombre Apellido" en el HTML por el dato real del usuario
   - Ejemplo: document.getElementById('nombre-estudiante').textContent = usuario.nombreCompleto;

2. VIDEO DE YOUTUBE:
   - Cambiar el VIDEO_ID en el iframe (actualmente: dQw4w9WgXcQ)
   - Reemplazar por el ID real del video del curso

3. BACKEND API:
   - Descomenta y modifica el fetch() en enviarTareasCompletadas()
   - Endpoint sugerido: POST /api/progreso
   - Implementa getAuthToken() según tu sistema de autenticación

4. NAVEGACIÓN:
   - Actualizar la ruta en "Volver al Curso" si es diferente a /pages/cursos/curso-detalle.html

5. PERSONALIZACIÓN:
   - Ajusta los títulos y descripciones de las tareas según el contenido real del curso
   - Modifica los colores en el CSS si deseas una paleta diferente
*/