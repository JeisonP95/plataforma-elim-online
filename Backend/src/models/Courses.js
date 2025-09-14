import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // Nombre del curso
    description: { type: String, required: true },       // Descripción
    duration: { type: String },                          // Ej: "5 semanas"
    lessons: { type: Number, default: 0 },               // Cantidad de lecciones
    rating: { type: Number, default: 0 },                // ⭐ Promedio de calificación
    image: { type: String },                             // URL de portada
    price: { type: Number, default: 0 },                 // Precio del curso
    currency: { type: String, default: "USD" },          // Moneda
    isActive: { type: Boolean, default: true },          // Si el curso está disponible
    category: { type: String },                          // Categoría del curso
    level: { type: String, enum: ["beginner", "intermediate", "advanced"] }, // Nivel
    instructor: { type: String },                        // Nombre del instructor
    totalHours: { type: Number, default: 0 },            // Horas totales del curso
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
