import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import coursesRoutes from "./src/routes/courseRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import userCourseRoutes from "./src/routes/userCoursesRoutes.js";
import progressRoutes from "./src/routes/progressRoutes.js";
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
app.use("/api/payments", paymentRoutes);
app.use("/api/user-courses", userCourseRoutes);
app.use("/api/progress", progressRoutes);

export default app;
