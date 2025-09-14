import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    
    // 🔹 Tokens para recuperación de contraseña
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // 🔹 Relación con los cursos
    enrolledCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // referencia al curso
        progress: { type: Number, default: 0 }, // % de progreso
        completed: { type: Boolean, default: false }, // estado
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

// 🔹 Método para generar token de recuperación
userSchema.methods.generateResetToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hora
  return token;
};

const User = mongoose.model("User", userSchema);
export default User;
