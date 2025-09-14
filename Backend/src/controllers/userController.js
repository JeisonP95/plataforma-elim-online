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

// 🔹 Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("firstName lastName email phone createdAt");
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// 🔹 Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone } = req.body;

    // Validar campos obligatorios
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "Nombre, apellido y email son obligatorios" });
    }

    // Verificar si el email ya existe en otro usuario
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(409).json({ message: "El email ya está en uso por otro usuario" });
    }

    // Actualizar usuario
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : undefined
      },
      { new: true, runValidators: true }
    ).select("firstName lastName email phone");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado correctamente", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", details: error.message });
    }
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};


