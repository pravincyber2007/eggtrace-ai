import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const ROLES = ["admin", "farm", "inspector", "logistics", "buyer"];

// GET /api/users  (admin only)  (S1.2)
router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, partyId: true, party: true, createdAt: true },
  });
  res.json({ users });
});

// POST /api/users  (admin only, create user + assign role/party)  (S1.2)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { email, password, name, role, partyId } = req.body || {};
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "email, password, name and role are required" });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of ${ROLES.join(", ")}` });
  }
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, name, role, partyId: partyId || null },
    select: { id: true, email: true, name: true, role: true, partyId: true, createdAt: true },
  });
  res.status(201).json({ user });
});

export default router;
