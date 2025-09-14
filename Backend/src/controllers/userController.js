import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../config/email.js";

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const user = await User.create({ firstName, lastName, email, phone, password });
    const userSafe = { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone };

    res.status(201).json({ message: "Usuario creado", user: userSafe });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }
    if (error && error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", details: error.message });
    }
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName email phone createdAt");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Actualizar perfil de usuario
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const userId = req.user._id;

    // Verificar si el email ya existe en otro usuario
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: "El correo ya está en uso por otro usuario" });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("firstName lastName email phone");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado exitosamente", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", details: error.message });
    }
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Se requieren la contraseña actual y la nueva contraseña" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Se requiere el correo electrónico" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({ message: "Si el correo existe, se enviará un enlace de recuperación" });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Enviar email de recuperación
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    res.json({ 
      message: "Si el correo existe, se enviará un enlace de recuperación",
      // Solo para desarrollo - remover en producción
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Resetear contraseña con token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Se requieren el token y la nueva contraseña" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Guardar progreso de tareas del usuario
export const saveTaskProgress = async (req, res) => {
  try {
    const { courseId, courseName, tasks } = req.body;
    const userId = req.user._id;

    if (!courseId || !courseName || !Array.isArray(tasks)) {
      return res.status(400).json({ message: "Se requieren courseId, courseName y tasks" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscar si ya existe progreso para este curso
    let courseProgress = user.courseProgress.find(cp => cp.courseId === courseId);
    
    if (!courseProgress) {
      // Crear nuevo progreso para el curso
      courseProgress = {
        courseId,
        courseName,
        tasks: [],
        totalTasks: tasks.length,
        completedTasks: 0,
        progressPercentage: 0,
        lastUpdated: new Date()
      };
      user.courseProgress.push(courseProgress);
    }

    // Actualizar tareas
    tasks.forEach(taskData => {
      const existingTask = courseProgress.tasks.find(t => t.taskId === taskData.taskId);
      
      if (existingTask) {
        // Actualizar tarea existente
        existingTask.completed = taskData.completed;
        if (taskData.completed && !existingTask.completedAt) {
          existingTask.completedAt = new Date();
        }
        if (taskData.score !== undefined) {
          existingTask.score = taskData.score;
        }
      } else {
        // Agregar nueva tarea
        courseProgress.tasks.push({
          taskId: taskData.taskId,
          taskTitle: taskData.taskTitle,
          completed: taskData.completed || false,
          completedAt: taskData.completed ? new Date() : null,
          score: taskData.score || 0
        });
      }
    });

    // Recalcular estadísticas
    courseProgress.completedTasks = courseProgress.tasks.filter(t => t.completed).length;
    courseProgress.totalTasks = courseProgress.tasks.length;
    courseProgress.progressPercentage = courseProgress.totalTasks > 0 
      ? Math.round((courseProgress.completedTasks / courseProgress.totalTasks) * 100)
      : 0;
    courseProgress.lastUpdated = new Date();

    // Actualizar enrolledCourses si existe
    const enrolledCourse = user.enrolledCourses.find(ec => ec.course.toString() === courseId);
    if (enrolledCourse) {
      enrolledCourse.progress = courseProgress.progressPercentage;
      enrolledCourse.completed = courseProgress.progressPercentage === 100;
      enrolledCourse.lastAccessed = new Date();
    }

    await user.save();

    res.json({ 
      message: "Progreso guardado exitosamente", 
      progress: courseProgress 
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Obtener progreso del usuario
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("courseProgress enrolledCourses");
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ 
      courseProgress: user.courseProgress,
      enrolledCourses: user.enrolledCourses
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Inscribir usuario en un curso
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ message: "Se requiere el ID del curso" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si ya está inscrito
    const alreadyEnrolled = user.enrolledCourses.some(ec => ec.course.toString() === courseId);
    if (alreadyEnrolled) {
      return res.status(409).json({ message: "Ya estás inscrito en este curso" });
    }

    // Agregar curso a enrolledCourses
    user.enrolledCourses.push({
      course: courseId,
      progress: 0,
      completed: false,
      enrolledAt: new Date(),
      lastAccessed: new Date()
    });

    await user.save();

    res.json({ message: "Te has inscrito exitosamente en el curso" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};


