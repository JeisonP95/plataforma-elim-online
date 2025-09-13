// JavaScript para la página de detalle del curso
document.addEventListener('DOMContentLoaded', async function() {
  // Obtener el ID del curso desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  
  if (!courseId) {
    console.error('No se proporcionó ID del curso');
    showError('No se encontró el curso solicitado');
    return;
  }

  // Cargar los datos del curso
  await loadCourseDetails(courseId);
});

async function loadCourseDetails(courseId) {
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://plataforma-elim-online.onrender.com";

  try {
    console.log("Cargando detalles del curso:", `${API_BASE}/api/courses/${courseId}`);
    const res = await fetch(`${API_BASE}/api/courses/${courseId}`);
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const course = await res.json();
    console.log("Curso recibido:", course);
    
    // Actualizar la información del curso en la página
    updateCourseInfo(course);
    
  } catch (err) {
    console.error("Error cargando detalles del curso:", err);
    showError(`No se pudieron cargar los detalles del curso: ${err.message}`);
  }
}

function updateCourseInfo(course) {
  // Actualizar el título del curso
  const titleElement = document.querySelector('.cursodetalle-hero h1');
  if (titleElement) {
    titleElement.textContent = course.title || 'Curso';
  }

  // Actualizar la descripción
  const descriptionElement = document.querySelector('.cursodetalle-hero p');
  if (descriptionElement) {
    descriptionElement.textContent = course.description || 'Descripción del curso no disponible';
  }

  // Actualizar la imagen del curso
  const imageElement = document.querySelector('.curso-imagenPortada img');
  if (imageElement) {
    imageElement.src = course.image || '/images/imagenPortada-curso.jpg';
    imageElement.alt = course.title || 'Imagen del curso';
  }

  // Actualizar los detalles numéricos
  updateNumericDetails(course);

  // Actualizar el contenido del curso
  updateCourseContent(course);

  // Actualizar la información del instructor
  updateInstructorInfo(course);

  // Actualizar el precio y detalles de compra
  updatePurchaseInfo(course);
}

function updateNumericDetails(course) {
  const detailsContainer = document.querySelector('.detalles-numericos');
  if (!detailsContainer) return;

  // Limpiar contenido existente
  detailsContainer.innerHTML = '';

  // Duración
  const durationItem = createDetailItem(
    course.duration || 'Duración variable',
    'Duración total'
  );
  detailsContainer.appendChild(durationItem);

  // Lecciones
  const lessonsItem = createDetailItem(
    `${course.lessons || 0} lecciones`,
    'Contenido completo'
  );
  detailsContainer.appendChild(lessonsItem);

  // Estudiantes inscritos (simulado)
  const studentsItem = createDetailItem(
    `${course.students || Math.floor(Math.random() * 200) + 50} Estudiantes`,
    'Ya inscritos'
  );
  detailsContainer.appendChild(studentsItem);
}

function createDetailItem(value, label) {
  const item = document.createElement('div');
  item.className = 'detalle-item';
  item.innerHTML = `
    <h3>${value}</h3>
    <p>${label}</p>
  `;
  return item;
}

function updateCourseContent(course) {
  const contentSection = document.querySelector('#contenido');
  if (!contentSection) return;

  // Actualizar el contenido del curso
  const contentList = contentSection.querySelector('ul');
  if (contentList && course.content) {
    contentList.innerHTML = course.content.map(item => `<li>${item}</li>`).join('');
  } else if (contentList) {
    // Contenido por defecto si no hay contenido específico
    contentList.innerHTML = `
      <li>Introducción al curso</li>
      <li>Conceptos fundamentales</li>
      <li>Ejercicios prácticos</li>
      <li>Evaluación final</li>
    `;
  }
}

function updateInstructorInfo(course) {
  const instructorSection = document.querySelector('#instructor');
  if (!instructorSection) return;

  const instructorInfo = instructorSection.querySelector('.instructor-info');
  if (!instructorInfo) return;

  // Actualizar nombre del instructor
  const instructorName = instructorInfo.querySelector('h2');
  if (instructorName) {
    instructorName.textContent = course.instructor?.name || 'Instructor';
  }

  // Actualizar título del instructor
  const instructorTitle = instructorInfo.querySelector('h3');
  if (instructorTitle) {
    instructorTitle.textContent = course.instructor?.title || 'Instructor Principal';
  }

  // Actualizar descripción del instructor
  const instructorDescription = instructorInfo.querySelector('p');
  if (instructorDescription) {
    instructorDescription.textContent = course.instructor?.description || 
      'Experto en el área con amplia experiencia en la enseñanza.';
  }

  // Actualizar imagen del instructor
  const instructorImage = instructorInfo.querySelector('.instructor-imagen img');
  if (instructorImage) {
    instructorImage.src = course.instructor?.image || '/images/fotoperfil-profesor.jpg';
    instructorImage.alt = course.instructor?.name || 'Foto del instructor';
  }
}

function updatePurchaseInfo(course) {
  const purchaseSection = document.querySelector('.compra-container');
  if (!purchaseSection) return;

  // Actualizar precio
  const priceElement = purchaseSection.querySelector('.compra-detalles li');
  if (priceElement) {
    priceElement.innerHTML = `<strong>Precio:</strong> $${course.price || '49.99'} USD`;
  }

  // Actualizar botón de compra
  const buyButton = purchaseSection.querySelector('.btn-comprar');
  if (buyButton) {
    buyButton.textContent = course.price ? `Adquirir por $${course.price} USD` : 'Adquirir Curso';
    buyButton.onclick = () => handleCoursePurchase(course._id);
  }
}

function handleCoursePurchase(courseId) {
  // Aquí puedes implementar la lógica de compra
  alert(`🎉 ¡Procesando compra del curso! (ID: ${courseId})`);
  // Aquí podrías redirigir a una página de pago o procesar la compra
}

function showError(message) {
  const heroSection = document.querySelector('.cursodetalle-hero');
  if (heroSection) {
    heroSection.innerHTML = `
      <h1>❌ Error</h1>
      <p>${message}</p>
      <a href="/index.html" class="btn-primary">Volver al Inicio</a>
    `;
  }
}

// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.contenido-seccion');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remover clase active de todos los links
      navLinks.forEach(l => l.classList.remove('active'));
      // Agregar clase active al link clickeado
      this.classList.add('active');
      
      // Ocultar todas las secciones
      sections.forEach(section => section.classList.remove('active'));
      
      // Mostrar la sección correspondiente
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
});
