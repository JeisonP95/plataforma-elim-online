import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" });
};

export const register = async (req, res) => {
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
    const token = signToken(user._id);
    const userSafe = { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone };
    res.status(201).json({ message: "Registro exitoso", token, user: userSafe });
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = signToken(user._id);
    const userSafe = { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone };
    res.json({ message: "Login exitoso", token, user: userSafe });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// 🔹 Configuración de nodemailer para Vercel
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'tu-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'tu-app-password'
    }
  });
};

// 🔹 Función para enviar email de recuperación
const sendResetEmail = async (email, resetToken, firstName) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/pages/password/password.html?token=${resetToken}&mode=reset`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'tu-email@gmail.com',
    to: email,
    subject: 'Recuperar Contraseña - Elim Online',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Hola ${firstName}!</h2>
        <p>Recibiste este email porque solicitaste recuperar tu contraseña en Elim Online.</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
        <p style="margin-top: 20px; color: #7f8c8d; font-size: 14px;">
          Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.
        </p>
        <p style="color: #7f8c8d; font-size: 12px;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
          ${resetUrl}
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

// 🔹 Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email es obligatorio" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No existe un usuario con ese email" });
    }

    // Generar token de recuperación
    const resetToken = user.generateResetToken();
    await user.save();

    // Enviar email
    const emailSent = await sendResetEmail(email, resetToken, user.firstName);
    
    if (!emailSent) {
      return res.status(500).json({ message: "Error enviando email de recuperación" });
    }

    res.json({ message: "Email de recuperación enviado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// 🔹 Restablecer contraseña con token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token y nueva contraseña son obligatorios" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contraseña restablecida correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// 🔹 Cambiar contraseña (usuario autenticado)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Contraseña actual y nueva contraseña son obligatorias" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};


