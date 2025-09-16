// src/controllers/progressController.js
import Progress from "../models/Progress.js"; // crea este modelo

// Obtener progreso del usuario
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.find({ userId });
    
    // mapeamos a un formato uniforme
    const courseProgress = progress.map(p => ({
      courseId: p.courseId,
      progressPercentage: calcularProgreso(p.tasks), // función que calcula %
    }));

    res.json({ courseProgress });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo progreso" });
  }
};

const calcularProgreso= (tasks) => {
  const total = tasks.length;

  return Math.round((total / 4) * 100);
}


// Guardar o actualizar progreso
export const saveUserProgress = async (req, res) => {
  try {
    const { userId, courseId, tasks } = req.body;

    // Usamos $addToSet con $each para añadir varias tareas al array
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId },
      { $addToSet: { tasks: { $each: tasks } } },
      { new: true, upsert: true } // new = devuelve actualizado, upsert = crea si no existe
    );

    res.json({ message: "Progreso actualizado", progress });
  } catch (err) {
    console.error("Error guardando progreso:", err);
    res.status(500).json({ error: "Error guardando progreso" });
  }
};

