import jwt from "jsonwebtoken";
import config from "../config.js";

function userMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ errors: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_USER_PASSWORD);
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ errors: "Token expired. Please login again.", expired: true });
    }

    if (error.name === "JsonWebTokenError") {
      console.error("Error in user middleware: Invalid token format");
      return res.status(401).json({ errors: "Invalid token" });
    }

    console.error("Error in user middleware:", error.message);
    return res.status(401).json({ errors: "Authentication failed" });
  }
}

export default userMiddleware;
