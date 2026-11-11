import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const TYPES = ["collection_centre", "warehouse", "transporter", "buyer"];

// GET /api/parties?type=buyer  (any authenticated user - for handover/user dropdowns)  (S2.3)
router.get("/", requireAuth, async (req, res) => {
  const { type } = req.query;
  const parties = await prisma.party.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json({ parties });
});

// POST /api/parties  (admin)  (S2.3)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, type, contact, location } = req.body || {};
  if (!name || !type) return res.status(400).json({ error: "name and type are required" });
  if (!TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of ${TYPES.join(", ")}` });
  }
  const party = await prisma.party.create({ data: { name, type, contact: contact || null, location: location || null } });
  res.status(201).json({ party });
});

export default router;
