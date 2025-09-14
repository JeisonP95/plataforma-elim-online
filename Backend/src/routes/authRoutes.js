import express from "express";
import { register, login, forgotPassword, resetPassword, changePassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/register
router.post("/register", register);

// POST /api/login
router.post("/login", login);

// GET /api/me (protegida)
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/reset-password
router.post("/reset-password", resetPassword);

// POST /api/change-password (protegida)
router.post("/change-password", requireAuth, changePassword);

export default router;


