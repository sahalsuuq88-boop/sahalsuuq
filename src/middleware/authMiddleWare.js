import { jwtSecret } from "../config/config.js";
import User from "../model/user.js";
import jwt from 'jsonwebtoken';

export const profileUser = async (req, res, next) => {
  // console.log("URL:", req.originalUrl);
  // console.log("Authorization:", req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, jwtSecret);

      // console.log("Decoded:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      // console.log("User:", req.user);

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("JWT ERROR:", error);
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }
  } else {
    console.log("No Authorization Header");
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided" });
  }
};

  export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next(); // User is an admin, allow access
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  }