import express from "express";
import { getUserProgress, saveUserProgress } from "../controllers/progressController.js";

const router = express.Router();

// GET progreso de un usuario
router.get("/:userId", getUserProgress);

// POST guardar progreso
router.post("/", saveUserProgress);

export default router;
