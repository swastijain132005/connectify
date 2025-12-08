import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const authMiddleware = (req, res, next) => {
  console.log("TOKEN RECEIVED:", req.headers.authorization); // 🔹 log token
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
