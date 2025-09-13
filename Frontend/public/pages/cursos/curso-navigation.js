// JavaScript común para navegación entre secciones en páginas de cursos
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.contenido-seccion');

  // Si no hay elementos de navegación, no hacer nada
  if (navLinks.length === 0 || sections.length === 0) {
    return;
  }

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
