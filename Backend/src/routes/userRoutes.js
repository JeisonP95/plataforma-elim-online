import express from "express";
import { createUser, getUsers, getProfile, updateProfile } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createUser);  // POST /api/users
router.get("/", getUsers);     // GET /api/users

// Rutas protegidas
router.get("/profile", requireAuth, getProfile);        // GET /api/users/profile
router.put("/profile", requireAuth, updateProfile);     // PUT /api/users/profile

export default router;
