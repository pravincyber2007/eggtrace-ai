import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/dashboard  (counts + lists filtered by role)  (S8.1)
router.get("/", requireAuth, async (req, res) => {
  const { role, partyId, id: userId } = req.user;

  // Scope batches by role.
  let batchWhere = {};
  if (role === "buyer" && partyId) batchWhere = { currentHolderPartyId: partyId };
  else if (role === "logistics" && partyId) batchWhere = { OR: [{ currentHolderPartyId: partyId }, { status: "In transit" }] };
  else if (role === "farm") batchWhere = { createdById: userId };
  // admin + inspector see all.

  const [all, active, inTransit, delivered, recalled, recentBatches] = await Promise.all([
    prisma.batch.count({ where: batchWhere }),
    prisma.batch.count({ where: { ...batchWhere, status: "At farm" } }),
    prisma.batch.count({ where: { ...batchWhere, status: "In transit" } }),
    prisma.batch.count({ where: { ...batchWhere, status: "Delivered" } }),
    prisma.batch.count({ where: { ...batchWhere, status: "Recalled" } }),
    prisma.batch.findMany({
      where: batchWhere, orderBy: { createdAt: "desc" }, take: 5,
      include: { farm: { select: { name: true } }, currentHolder: { select: { name: true } } },
    }),
  ]);

  const recentInspections = await prisma.inspection.findMany({
    orderBy: { createdAt: "desc" }, take: 5,
    include: { inspector: { select: { name: true } }, batch: { select: { id: true } } },
  });

  const openRecalls = await prisma.recall.findMany({
    where: { status: "Open" }, orderBy: { createdAt: "desc" }, take: 5,
    include: { _count: { select: { parties: true } } },
  });

  res.json({
    role,
    counts: {
      totalBatches: all,
      activeBatches: active,
      inTransit,
      delivered,
      recalled,
      openRecalls: openRecalls.length,
    },
    statusBreakdown: [
      { name: "At farm", value: active },
      { name: "In transit", value: inTransit },
      { name: "Delivered", value: delivered },
      { name: "Recalled", value: recalled },
    ],
    recentBatches,
    recentInspections,
    openRecalls,
  });
});

export default router;
