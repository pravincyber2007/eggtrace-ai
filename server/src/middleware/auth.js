import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eggtrace-dev-secret";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, partyId: user.partyId, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Requires a valid JWT; attaches req.user
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Restricts a route to one or more roles. Use after requireAuth.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}
