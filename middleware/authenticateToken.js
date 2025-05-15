// middleware/authenticateToken.js
import jwt from "jsonwebtoken";

/**
 * Middleware to validate JWT tokens.
 * Expects the token in the `Authorization` header as "Bearer <token>".
 * If valid, the decoded token payload is attached to req.user.
 */

export default function authenticateToken(req, res, next) {
  // First, check for token in cookies (set via res.cookie)
  let token = req.cookies?.token;

  // Fallback: If no token in cookies, check the Authorization header.
  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  // Verify token using the secret stored in environment variables.
  jwt.verify(token, process.env.JWT_SIGNATURE, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Token is valid; attach decoded payload to req.user for downstream middleware/routes.
    req.user = decoded;
    next();
  });
}
