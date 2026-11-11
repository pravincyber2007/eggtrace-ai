import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

const STAGE_LABELS = {
  collection_centre: "Collection centre",
  warehouse: "Cold storage",
  transporter: "In transit",
  buyer: "Retailer",
};

function freshness(layDate) {
  const SHELF_DAYS = 28;
  const daysOld = Math.floor((Date.now() - new Date(layDate).getTime()) / 86400000);
  const daysRemaining = SHELF_DAYS - daysOld;
  let label = "Fresh";
  if (daysOld > SHELF_DAYS) label = "Expired";
  else if (daysOld > 14) label = "Use soon";
  return { label, daysOld: Math.max(0, daysOld), daysRemaining };
}

// GET /api/public/trace/:batchId  (no auth; no personal or commercial data)  (S7.1, S7.2, S7.3)
router.get("/trace/:batchId", async (req, res) => {
  const batch = await prisma.batch.findUnique({
    where: { id: req.params.batchId },
    include: {
      farm: { select: { name: true, location: true } },
      inspections: { orderBy: { createdAt: "desc" }, take: 1, select: { grade: true } },
      movements: { orderBy: { createdAt: "asc" }, include: { toParty: { select: { type: true } } } },
    },
  });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  // Active recall? (affected batches are flagged Recalled)
  let recall = { active: false };
  if (batch.status === "Recalled") {
    const rp = await prisma.recallParty.findFirst({
      where: { batchId: batch.id, recall: { status: "Open" } },
      include: { recall: { select: { reason: true } } },
    });
    recall = { active: true, reason: rp?.recall?.reason || "This batch is under an active recall." };
  }

  const journey = [
    { stage: "Laid at farm", date: batch.layDate, location: batch.farm?.location || null },
    ...batch.movements.map((m) => ({
      stage: STAGE_LABELS[m.toParty?.type] || "Handover",
      date: m.createdAt,
      location: m.location || null,
    })),
  ];

  res.json({
    batchId: batch.id,
    farm: batch.farm, // name + location only
    layDate: batch.layDate,
    grade: batch.inspections[0]?.grade || null,
    freshness: freshness(batch.layDate),
    journey,
    recall,
  });
});

export default router;
