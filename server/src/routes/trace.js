import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { traceForward, traceBackward } from "../utils/trace.js";

const router = Router();

// GET /api/trace/search?q=&farmId=&from=&to=&destinationPartyId=  (S6.1)
router.get("/search", requireAuth, async (req, res) => {
  const { q, farmId, from, to, destinationPartyId } = req.query;
  const where = {};
  if (q) where.id = { contains: q };
  if (farmId) where.farmId = farmId;
  if (from || to) {
    where.layDate = {};
    if (from) where.layDate.gte = new Date(from);
    if (to) where.layDate.lte = new Date(`${to}T23:59:59`);
  }
  if (destinationPartyId) {
    where.OR = [
      { currentHolderPartyId: destinationPartyId },
      { movements: { some: { toPartyId: destinationPartyId } } },
    ];
  }
  const batches = await prisma.batch.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      farm: { select: { name: true } },
      currentHolder: { select: { name: true } },
      _count: { select: { children: true } },
    },
  });
  res.json({ batches });
});

// GET /api/trace/forward/:batchId  (S6.2)
router.get("/forward/:batchId", requireAuth, async (req, res) => {
  const batch = await prisma.batch.findUnique({ where: { id: req.params.batchId } });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  const result = await traceForward(req.params.batchId);
  res.json(result);
});

// GET /api/trace/backward/:batchId  (S6.5)
router.get("/backward/:batchId", requireAuth, async (req, res) => {
  const batch = await prisma.batch.findUnique({ where: { id: req.params.batchId } });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  const result = await traceBackward(req.params.batchId);
  res.json(result);
});

export default router;
