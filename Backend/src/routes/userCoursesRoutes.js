import express from "express";
import { completeLesson, getUserCourses } from "../controllers/userCourseController.js";
const router = express.Router();

router.put("/:userCourseId/lesson/:lessonId", completeLesson);
router.get("/:userId", getUserCourses);

export default router;
