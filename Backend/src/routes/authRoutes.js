import express from "express";
import { register, login } from "../controllers/authController.js";
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



export default router;


