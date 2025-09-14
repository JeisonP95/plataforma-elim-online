import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../src/models/Courses.js";

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

// Cursos de ejemplo
const sampleCourses = [
  {
    title: "Gestión del Estrés para Adultos",
    description: "Aprende técnicas efectivas para manejar el estrés y la ansiedad en tu vida diaria. Incluye ejercicios prácticos y herramientas de relajación.",
    duration: "6 semanas",
    lessons: 18,
    rating: 4.8,
    image: "/images/curso-adultos-estres.jpeg",
    price: 49.99,
    currency: "USD",
    isActive: true,
    category: "Bienestar",
    level: "beginner",
    instructor: "María López",
    totalHours: 12
  },
  {
    title: "Conexión con la Naturaleza",
    description: "Conecta con la naturaleza para mejorar tu bienestar mental y físico. Aprende técnicas de mindfulness en entornos naturales.",
    duration: "4 semanas",
    lessons: 12,
    rating: 4.6,
    image: "/images/curso-naturaleza.jpg",
    price: 39.99,
    currency: "USD",
    isActive: true,
    category: "Mindfulness",
    level: "beginner",
    instructor: "Carlos Ruiz",
    totalHours: 8
  },
  {
    title: "Mindfulness para Niños",
    description: "Introduce a los niños al mindfulness de manera divertida y efectiva. Técnicas adaptadas para diferentes edades.",
    duration: "5 semanas",
    lessons: 15,
    rating: 4.9,
    image: "/images/curso-niños.jpeg",
    price: 29.99,
    currency: "USD",
    isActive: true,
    category: "Familia",
    level: "beginner",
    instructor: "Ana García",
    totalHours: 10
  },
  {
    title: "Yoga Familiar",
    description: "Practica yoga en familia para fortalecer vínculos y mejorar la salud de todos. Posturas adaptadas para todas las edades.",
    duration: "8 semanas",
    lessons: 24,
    rating: 4.7,
    image: "/images/curso-yoga-familiar.jpg",
    price: 59.99,
    currency: "USD",
    isActive: true,
    category: "Ejercicio",
    level: "beginner",
    instructor: "Luis Martínez",
    totalHours: 16
  }
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
    createdCourses.forEach(course => {
      console.log(`📚 ${course.title} - $${course.price} ${course.currency}`);
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
