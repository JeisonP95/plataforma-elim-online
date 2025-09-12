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
