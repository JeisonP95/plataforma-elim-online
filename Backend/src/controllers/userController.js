import User from "../models/User.js";

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


