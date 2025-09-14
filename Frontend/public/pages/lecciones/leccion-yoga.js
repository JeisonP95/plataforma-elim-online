const tareasData = [
    { id: 'introduccion', completada: false, elemento: null },
    { id: 'video', completada: false, elemento: null },
    { id: 'actividad', completada: false, elemento: null },
  ];
  
  let videoTerminado = false;
  
  document.addEventListener('DOMContentLoaded', () => {
    tareasData.forEach(t => {
      t.elemento = document.querySelector(`[data-tarea="${t.id}"]`);
    });
  
    document.querySelectorAll('.checkbox-completada').forEach((c, i) => {
      c.addEventListener('change', e => marcarTarea(i, e.target.checked));
    });
  
    document.querySelectorAll('.btn-siguiente').forEach(btn => {
      btn.addEventListener('click', manejarSiguiente);
    });
  
    document.getElementById('video-confirmacion').addEventListener('change', e => {
      videoTerminado = e.target.checked;
      document.getElementById('btn-video-siguiente').disabled = !videoTerminado;
      actualizarProgreso();
    });
  
    actualizarProgreso();
  });
  
  function marcarTarea(index, estado) {
    tareasData[index].completada = estado;
    const tarea = tareasData[index].elemento;
    tarea.classList.toggle('completada', estado);
    tarea.querySelector('.estado-texto').textContent = estado ? 'Completada' : 'Pendiente';
    actualizarProgreso();
  }
  
  function manejarSiguiente(e) {
    const btn = e.target;
    if (btn.id === 'btn-video-siguiente' && !videoTerminado) {
      alert('Debes ver el video primero');
      return;
    }
    const siguiente = btn.dataset.siguiente;
    if (siguiente === 'resumen') {
      document.getElementById('resumen-tareas').style.display = 'block';
      actualizarProgreso();
    } else {
      const tarea = document.querySelector(`.tarea:nth-child(${siguiente})`);
      tarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  function actualizarProgreso() {
    const completadas = tareasData.filter(t => t.completada).length;
    document.getElementById('tareas-completadas-count').textContent = completadas;
    document.getElementById('barra-completada').style.width = `${(completadas / tareasData.length) * 100}%`;
  }
  