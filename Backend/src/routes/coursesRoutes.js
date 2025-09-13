import express from "express";
import { getCourses, getCourseById } from "../controllers/courseController.js";

const router = express.Router();

// GET /api/courses
router.get("/", getCourses);

// GET /api/courses/:id
router.get("/:id", getCourseById);

export default router;
