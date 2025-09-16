import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../src/models/Course.js";

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
    instructorId: null,
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
    // Limpiar cursos existentes
    await Course.deleteMany({});
    console.log("🗑️ Cursos existentes eliminados");

    // Insertar cursos de ejemplo
    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ ${createdCourses.length} cursos creados exitosamente`);

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
