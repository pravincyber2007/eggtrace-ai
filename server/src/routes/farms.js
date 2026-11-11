import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/farms  (any authenticated user - needed for dropdowns)  (S2.1)
router.get("/", requireAuth, async (_req, res) => {
  const farms = await prisma.farm.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { flocks: true, batches: true } } },
  });
  res.json({ farms });
});

// POST /api/farms  (admin)  (S2.1)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, location, licenceNo } = req.body || {};
  if (!name || !location || !licenceNo) {
    return res.status(400).json({ error: "name, location and licenceNo are required" });
  }
  const farm = await prisma.farm.create({ data: { name, location, licenceNo } });
  res.status(201).json({ farm });
});

export default router;
