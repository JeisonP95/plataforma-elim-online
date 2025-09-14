import express from "express";
import { 
  createUser, 
  getUsers, 
  updateProfile, 
  changePassword, 
  requestPasswordReset, 
  resetPassword,
  saveTaskProgress,
  getUserProgress,
  enrollInCourse
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createUser);  // POST /api/users
router.get("/", getUsers);     // GET /api/users

// Rutas protegidas (requieren autenticación)
router.put("/profile", requireAuth, updateProfile);  // PUT /api/users/profile
router.put("/change-password", requireAuth, changePassword);  // PUT /api/users/change-password

// Rutas de progreso de cursos (protegidas)
router.post("/progress", requireAuth, saveTaskProgress);  // POST /api/users/progress
router.get("/progress", requireAuth, getUserProgress);    // GET /api/users/progress
router.post("/enroll", requireAuth, enrollInCourse);      // POST /api/users/enroll

// Rutas públicas para recuperación de contraseña
router.post("/request-password-reset", requestPasswordReset);  // POST /api/users/request-password-reset
router.post("/reset-password", resetPassword);  // POST /api/users/reset-password

export default router;
