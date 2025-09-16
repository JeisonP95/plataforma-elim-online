import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);  // POST /api/users
router.get("/", getUsers);     // GET /api/users

export default router;