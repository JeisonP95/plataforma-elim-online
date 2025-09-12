import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    const user = await User.findById(payload.userId).select("firstName lastName email phone");
    if (!user) {
      return res.status(401).json({ message: "Token inválido" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
