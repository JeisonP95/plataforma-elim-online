import mongoose from "mongoose";

const userCourseSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["active", "completed", "paused", "cancelled"], 
      default: "active" 
    },
    progress: { 
      type: Number, 
      min: 0, 
      max: 100, 
      default: 0 
    },
    enrolledAt: { 
      type: Date, 
      default: Date.now 
    },
    completedAt: { 
      type: Date 
    },
    lastAccessed: { 
      type: Date, 
      default: Date.now 
    },
    paymentStatus: { 
      type: String, 
      enum: ["paid", "pending", "refunded"], 
      default: "paid" 
    },
    // Metadatos adicionales
    totalLessons: { 
      type: Number, 
      default: 0 
    },
    completedLessons: { 
      type: Number, 
      default: 0 
    },
    // Notas del usuario para el curso
    notes: { 
      type: String 
    },
    // Calificación del curso (cuando lo complete)
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    review: { 
      type: String 
    }
  },
  { timestamps: true }
);

// Índices para optimizar consultas
userCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userCourseSchema.index({ userId: 1, status: 1 });
userCourseSchema.index({ courseId: 1 });

// Middleware para actualizar lastAccessed cuando se actualiza el progreso
userCourseSchema.pre('save', function(next) {
  if (this.isModified('progress') || this.isModified('completedLessons')) {
    this.lastAccessed = new Date();
  }
  next();
});

// Middleware para marcar como completado cuando el progreso llega al 100%
userCourseSchema.pre('save', function(next) {
  if (this.progress >= 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  next();
});

const UserCourse = mongoose.model("UserCourse", userCourseSchema);
export default UserCourse;
