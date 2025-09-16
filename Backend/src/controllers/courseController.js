import Course from "../models/Course.js";
import Review from "../models/Review.js";
import Instructor from "../models/Instructor.js";

// Listar todos los cursos
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().select(
      "title description duration lessons rating image price"
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Listado completo (ej: panel admin)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find(); // devuelve TODO el documento
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener cursos", error: err.message });
  }
};

// Obtener curso por ID con instructor y reseñas
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).populate(
      "instructorId",
      "name title bio image"
    );

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    const reviews = await Review.find({ courseId: id }).populate("userId", "name image");

    res.json({
      ...course.toObject(),
      instructor: course.instructorId || null,
      reviews: reviews.map((r) => ({
        _id: r._id,
        comment: r.comment,
        rating: r.rating,
        createdAt: r.createdAt,
        user: r.userId?.name || "Anónimo",
        userImage: r.userId?.image || null,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener curso", error: error.message });
  }
};


