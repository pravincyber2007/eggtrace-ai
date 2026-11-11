import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/flocks?farmId=...  (any authenticated user)  (S2.2)
router.get("/", requireAuth, async (req, res) => {
  const { farmId } = req.query;
  const flocks = await prisma.flock.findMany({
    where: farmId ? { farmId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { farm: { select: { id: true, name: true } } },
  });
  res.json({ flocks });
});

// POST /api/flocks  (farm user or admin)  (S2.2)
router.post("/", requireAuth, requireRole("admin", "farm"), async (req, res) => {
  const { farmId, breed, birdCount, placementDate } = req.body || {};
  if (!farmId || !breed || !birdCount || !placementDate) {
    return res.status(400).json({ error: "farmId, breed, birdCount and placementDate are required" });
  }
  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) return res.status(404).json({ error: "Farm not found" });

  const flock = await prisma.flock.create({
    data: { farmId, breed, birdCount: Number(birdCount), placementDate: new Date(placementDate) },
    include: { farm: { select: { id: true, name: true } } },
  });
  res.status(201).json({ flock });
});

export default router;
