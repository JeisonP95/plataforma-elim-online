import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    
    // Campos para recuperación de contraseña
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },

    // 🔹 Relación con los cursos
    enrolledCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // referencia al curso
        progress: { type: Number, default: 0 }, // % de progreso
        completed: { type: Boolean, default: false }, // estado
        enrolledAt: { type: Date, default: Date.now }, // fecha de inscripción
        lastAccessed: { type: Date, default: Date.now }, // última vez que accedió
      }
    ],

    // 🔹 Progreso detallado de tareas por curso
    courseProgress: [
      {
        courseId: { type: String, required: true }, // ID del curso (ej: "gestion-estres-adultos")
        courseName: { type: String, required: true }, // Nombre del curso
        tasks: [
          {
            taskId: { type: String, required: true }, // ID de la tarea
            taskTitle: { type: String, required: true }, // Título de la tarea
            completed: { type: Boolean, default: false }, // Si está completada
            completedAt: { type: Date }, // Fecha de completado
            score: { type: Number, default: 0 }, // Puntuación (opcional)
          }
        ],
        totalTasks: { type: Number, default: 0 }, // Total de tareas del curso
        completedTasks: { type: Number, default: 0 }, // Tareas completadas
        progressPercentage: { type: Number, default: 0 }, // % de progreso
        lastUpdated: { type: Date, default: Date.now }, // Última actualización
      }
    ]
  },
  { timestamps: true }
);

// 🔹 Hash de contraseña antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Método para validar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
