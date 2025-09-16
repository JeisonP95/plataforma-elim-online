import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: String }, // Ej: "5 semanas"
    lessons: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    image: { type: String },
    price: { type: String }, // precio del curso
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }, // relación
    lessonPage: { type: String, required: true },
  },
  { timestamps: true }
);

// Evita el error de OverwriteModelError
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
