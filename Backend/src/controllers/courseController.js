import Course from "../models/Courses.js";

// Listar todos los cursos
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().select("title description duration lessons rating image");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Obtener un curso específico por ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};