import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Decide whether the acting user may hand over this batch (S5.3).
// Holder = current party; null means the batch is still at the farm.
function canHandOver(user, batch) {
  if (user.role === "admin") return true;
  if (batch.currentHolderPartyId == null) {
    // Still at farm: the farm releasing it, or a logistics operator collecting it.
    return user.role === "farm" || user.role === "logistics";
  }
  // In custody of a party: only a user belonging to that party may move it.
  return user.partyId && user.partyId === batch.currentHolderPartyId;
}

// POST /api/movements  (logistics/admin/farm as above)  (S5.2, S5.3)
router.post("/", requireAuth, requireRole("admin", "logistics", "farm"), async (req, res) => {
  const { batchId, toPartyId, quantity, location, temperature } = req.body || {};
  if (!batchId || !toPartyId || !quantity) {
    return res.status(400).json({ error: "batchId, toPartyId and quantity are required" });
  }
  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  if (!canHandOver(req.user, batch)) {
    return res.status(403).json({ error: "Only the current holder can hand over this batch" });
  }
  if (Number(quantity) > batch.quantity) {
    return res.status(400).json({ error: "Handover quantity exceeds batch quantity" });
  }
  const toParty = await prisma.party.findUnique({ where: { id: toPartyId } });
  if (!toParty) return res.status(404).json({ error: "Destination party not found" });

  // Append-only movement + update current holder/status.
  const [movement] = await prisma.$transaction([
    prisma.movement.create({
      data: {
        batchId,
        fromPartyId: batch.currentHolderPartyId, // previous holder (null = farm)
        toPartyId,
        quantity: Number(quantity),
        location: location || null,
        temperature: temperature !== undefined && temperature !== "" ? Number(temperature) : null,
        recordedById: req.user.id,
      },
      include: { fromParty: true, toParty: true, recordedBy: { select: { id: true, name: true } } },
    }),
    prisma.batch.update({
      where: { id: batchId },
      data: {
        currentHolderPartyId: toPartyId,
        status: toParty.type === "buyer" ? "Delivered" : "In transit",
      },
    }),
  ]);
  res.status(201).json({ movement });
});

// GET /api/movements?batchId=...  (append-only history)  (S5.4)
router.get("/", requireAuth, async (req, res) => {
  const { batchId } = req.query;
  const movements = await prisma.movement.findMany({
    where: batchId ? { batchId } : undefined,
    orderBy: { createdAt: "asc" },
    include: { fromParty: true, toParty: true, recordedBy: { select: { id: true, name: true } } },
  });
  res.json({ movements });
});

export default router;
