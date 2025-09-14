import express from "express";
import { 
  enrollUser, 
  getUserCourses, 
  updateCourseProgress, 
  getUserCourseDetails 
} from "../controllers/enrollmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// POST /api/enroll - Inscribir usuario en curso (con pago simulado)
router.post("/", enrollUser);

// GET /api/my-courses - Obtener cursos del usuario con progreso
router.get("/my-courses", getUserCourses);

// GET /api/enroll/:id - Obtener detalles de un curso específico del usuario
router.get("/:id", getUserCourseDetails);

// PUT /api/enroll/:id/progress - Actualizar progreso de un curso
router.put("/:id/progress", updateCourseProgress);

export default router;
