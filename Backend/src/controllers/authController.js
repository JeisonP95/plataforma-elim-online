import jwt from "jsonwebtoken";
import User from "../models/User.js";

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


