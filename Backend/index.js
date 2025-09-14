import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import coursesRoutes from "./src/routes/coursesRoutes.js";
import enrollmentRoutes from "./src/routes/enrollmentRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enroll", enrollmentRoutes);

export default app;
