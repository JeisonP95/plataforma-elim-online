import express from "express";
import { getCourses, getCourseById, getAllCourses } from "../controllers/courseController.js";

const router = express.Router();

// GET /api/courses
router.get("/", getCourses);
router.get("/all", getAllCourses); // <-- mover antes de "/:id"
router.get("/:id", getCourseById);

export default router;
