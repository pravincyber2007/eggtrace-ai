import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login  (S1.1)
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, partyId: user.partyId },
  });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, role: true, partyId: true, party: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;
