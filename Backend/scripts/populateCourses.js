import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../src/models/Course.js";
import Instructor from "../src/models/Instructor.js";
import Review from "../src/models/Review.js";

dotenv.config();

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/elim-online");
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

// Instructores de ejemplo
const sampleInstructors = [
  {
    name: "María López",
    title: "Psicóloga Clínica",
    bio: "Especialista en manejo del estrés y mindfulness.",
    image: "/images/mariaperfil.jpeg",
  },
  {
    name: "Carlos Ruiz",
    title: "Guía de actividades al aire libre",
    bio: "Facilitador de prácticas de conexión con la naturaleza.",
    image: "/images/carlos.png",
  },
  {
    name: "Andrea Silva",
    title: "Psicóloga Infantil",
    bio: "Apasionada por el bienestar emocional de la niñez.",
    image: "/images/andrea.png",
  },
  {
    name: "Juan Pérez",
    title: "Instructor de Yoga",
    bio: "10+ años enseñando yoga para todas las edades.",
    image: "/images/juan.png",
  },
];

// Cursos de ejemplo (ajustados al schema de Course.js)
const sampleCourses = [
  {
    title: "Gestión del Estrés para Adultos",
    description:
      "Aprende técnicas efectivas para manejar el estrés y la ansiedad en tu vida diaria. Incluye ejercicios prácticos y herramientas de relajación.",
    duration: "6 semanas",
    lessons: 18,
    rating: 5,
    image: "/images/curso-adultos-estres.jpeg",
    price: "49.99 USD",
    instructorId: null, // se setea al insertar instructores
    lessonPage: "leccion-adultos.html",
  },
  {
    title: "Conexión con la Naturaleza",
    description:
      "Conecta con la naturaleza para mejorar tu bienestar mental y físico. Aprende técnicas de mindfulness en entornos naturales.",
    duration: "4 semanas",
    lessons: 12,
    rating: 5,
    image: "/images/curso-naturaleza.jpg",
    price: "39.99 USD",
    instructorId: null,
    lessonPage: "leccion-naturaleza.html",
  },
  {
    title: "Mindfulness para Niños",
    description:
      "Introduce a los niños al mindfulness de manera divertida y efectiva. Técnicas adaptadas para diferentes edades.",
    duration: "5 semanas",
    lessons: 15,
    rating: 5,
    image: "/images/curso-niños.jpeg",
    price: "29.99 USD",
    instructorId: null,
    lessonPage: "leccion-ninos.html",
  },
  {
    title: "Yoga Familiar",
    description:
      "Practica yoga en familia para fortalecer vínculos y mejorar la salud de todos. Posturas adaptadas para todas las edades.",
    duration: "8 semanas",
    lessons: 24,
    rating: 5,
    image: "/images/curso-yoga-familiar.jpg",
    price: "59.99 USD",
    instructorId: null,
    lessonPage: "leccion-yoga.html",
  },
];

// Función para poblar la base de datos
const populateCourses = async () => {
  try {
    // Limpiar colecciones
    await Review.deleteMany({});
    await Course.deleteMany({});
    await Instructor.deleteMany({});
    console.log("🗑️ Cursos existentes eliminados");

    // Insertar instructores y asociarlos a cursos
    const createdInstructors = await Instructor.insertMany(sampleInstructors);
    const coursesToInsert = sampleCourses.map((c, idx) => ({
      ...c,
      instructorId: createdInstructors[idx % createdInstructors.length]._id,
    }));

    // Insertar cursos de ejemplo
    const createdCourses = await Course.insertMany(coursesToInsert);
    console.log(`✅ ${createdCourses.length} cursos creados exitosamente`);

    // Crear reseñas básicas por curso
    const sampleComments = [
      "Muy útil y práctico.",
      "Me encantó la estructura del curso.",
      "Contenidos claros y bien explicados.",
    ];
    const reviewsToInsert = createdCourses.flatMap((course, i) =>
      sampleComments.map((comment, j) => ({
        courseId: course._id,
        userId: null,
        comment,
        rating: 5 - (j % 2),
      }))
    );
    await Review.insertMany(reviewsToInsert);

    // Mostrar los cursos creados
    createdCourses.forEach((course) => {
      console.log(`📚 ${course.title} - ${course.price} (id: ${course._id})`);
    });

  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log("🔌 Conexión a MongoDB cerrada");
    process.exit(0);
  }
};

// Ejecutar el script
const run = async () => {
  await connectDB();
  await populateCourses();
};

run();
