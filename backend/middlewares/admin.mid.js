import jwt from "jsonwebtoken";
import config from "../config.js";

function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD);
    req.adminId = decoded.id;
    console.log("Admin authenticated:", req.adminId);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please login again.", expired: true });
    }

    if (error.name === "JsonWebTokenError") {
      console.error("Error in admin middleware: Invalid token format");
      return res.status(401).json({ error: "Invalid token" });
    }

    console.error("Error in admin middleware:", error.message);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

export default adminMiddleware;
