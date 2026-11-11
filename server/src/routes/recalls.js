import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { traceForward } from "../utils/trace.js";

const router = Router();

const STATUSES = ["Notified", "Acknowledged", "Returned"];

// GET /api/recalls  (list)
router.get("/", requireAuth, async (_req, res) => {
  const recalls = await prisma.recall.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { parties: true } },
    },
  });
  res.json({ recalls });
});

// GET /api/recalls/:id  (detail)
router.get("/:id", requireAuth, async (req, res) => {
  const recall = await prisma.recall.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: { select: { name: true } },
      parties: { include: { party: true, batch: { select: { id: true, quantity: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!recall) return res.status(404).json({ error: "Recall not found" });
  res.json({ recall });
});

// POST /api/recalls  (admin/inspector create)  (S6.3)
// Body: { reason, batchIds: [rootBatchId, ...] }
router.post("/", requireAuth, requireRole("admin", "inspector"), async (req, res) => {
  const { reason, batchIds } = req.body || {};
  if (!reason || !Array.isArray(batchIds) || batchIds.length === 0) {
    return res.status(400).json({ error: "reason and at least one batchId are required" });
  }

  // Expand each root to all affected batches + parties.
  const affectedBatchIds = new Set();
  const partyBatchRows = new Map(); // key partyId|batchId -> {partyId, batchId, quantity}
  for (const rootId of batchIds) {
    const t = await traceForward(rootId);
    t.batches.forEach((b) => affectedBatchIds.add(b.id));
    t.parties.forEach((p) =>
      p.batches.forEach((b) => {
        partyBatchRows.set(`${p.partyId}|${b.batchId}`, { partyId: p.partyId, batchId: b.batchId, quantity: b.quantity });
      })
    );
  }
  if (affectedBatchIds.size === 0) {
    return res.status(404).json({ error: "No batches found for the given IDs" });
  }

  const recall = await prisma.recall.create({ data: { reason, createdById: req.user.id } });

  // One RecallParty per (party, affected batch), initial status Notified.
  const rows = [...partyBatchRows.values()].map((r) => ({
    recallId: recall.id, partyId: r.partyId, batchId: r.batchId, quantity: r.quantity, status: "Notified",
  }));
  if (rows.length) await prisma.recallParty.createMany({ data: rows });

  // Flag affected batches as Recalled (consumer page shows a banner).
  await prisma.batch.updateMany({ where: { id: { in: [...affectedBatchIds] } }, data: { status: "Recalled" } });

  const full = await prisma.recall.findUnique({
    where: { id: recall.id },
    include: { parties: { include: { party: true, batch: true } } },
  });
  res.status(201).json({ recall: full, affectedBatchCount: affectedBatchIds.size });
});

// PATCH /api/recalls/:id/parties/:rpId  (update per-party status)  (S6.3)
router.patch("/:id/parties/:rpId", requireAuth, requireRole("admin", "inspector"), async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
  const rp = await prisma.recallParty.update({ where: { id: req.params.rpId }, data: { status } });
  res.json({ recallParty: rp });
});

// PATCH /api/recalls/:id  (close a recall)
router.patch("/:id", requireAuth, requireRole("admin", "inspector"), async (req, res) => {
  const { status } = req.body || {};
  if (!["Open", "Closed"].includes(status)) return res.status(400).json({ error: "status must be Open or Closed" });
  const recall = await prisma.recall.update({ where: { id: req.params.id }, data: { status } });
  res.json({ recall });
});

// GET /api/recalls/:id/export.csv  (affected buyers CSV)  (S6.4)
router.get("/:id/export.csv", requireAuth, async (req, res) => {
  const recall = await prisma.recall.findUnique({
    where: { id: req.params.id },
    include: { parties: { include: { party: true, batch: true } } },
  });
  if (!recall) return res.status(404).json({ error: "Recall not found" });

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Party", "Type", "Contact", "Location", "Batch", "Quantity", "Status"];
  const lines = [header.join(",")];
  recall.parties.forEach((rp) => {
    lines.push([
      esc(rp.party.name), esc(rp.party.type), esc(rp.party.contact), esc(rp.party.location),
      esc(rp.batch.id), esc(rp.quantity), esc(rp.status),
    ].join(","));
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="recall-${recall.id}.csv"`);
  res.send(lines.join("\n"));
});

export default router;
