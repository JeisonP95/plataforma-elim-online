import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // Nombre del curso
    description: { type: String, required: true },       // Descripción
    duration: { type: String },                          // Ej: "5 semanas"
    lessons: { type: Number, default: 0 },               // Cantidad de lecciones
    rating: { type: Number, default: 0 },                // ⭐ Promedio de calificación
    image: { type: String },                             // URL de portada
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
