import { Router } from "express";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generateBatchId } from "../utils/batchId.js";

const router = Router();

const batchInclude = {
  farm: true,
  flock: true,
  parent: { select: { id: true } },
  children: { select: { id: true, quantity: true, status: true, currentHolderPartyId: true } },
  currentHolder: true,
};

function publicUrl(batchId) {
  const base = process.env.PUBLIC_BASE_URL || "http://localhost:5173";
  return `${base}/t/${batchId}`;
}

// GET /api/batches  (list; basic filters, full search in E6)
router.get("/", requireAuth, async (req, res) => {
  const { farmId, status } = req.query;
  const batches = await prisma.batch.findMany({
    where: { ...(farmId ? { farmId } : {}), ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      farm: { select: { id: true, name: true } },
      flock: { select: { id: true, breed: true } },
      currentHolder: { select: { id: true, name: true } },
      _count: { select: { children: true, inspections: true, movements: true } },
    },
  });
  res.json({ batches });
});

// GET /api/batches/:id  (details with timeline parts)
router.get("/:id", requireAuth, async (req, res) => {
  const batch = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: {
      ...batchInclude,
      inspections: { include: { inspector: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
      movements: {
        include: { fromParty: true, toParty: true, recordedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  res.json({ batch });
});

// POST /api/batches  (farm user or admin)  (S3.1)
router.post("/", requireAuth, requireRole("admin", "farm"), async (req, res) => {
  const { farmId, flockId, layDate, quantity } = req.body || {};
  if (!farmId || !flockId || !layDate || !quantity) {
    return res.status(400).json({ error: "farmId, flockId, layDate and quantity are required" });
  }
  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) return res.status(404).json({ error: "Farm not found" });
  const flock = await prisma.flock.findUnique({ where: { id: flockId } });
  if (!flock || flock.farmId !== farmId) {
    return res.status(400).json({ error: "Flock does not belong to the selected farm" });
  }
  const id = await generateBatchId(farm, layDate);
  const batch = await prisma.batch.create({
    data: {
      id, farmId, flockId, layDate: new Date(layDate), quantity: Number(quantity),
      status: "At farm", createdById: req.user.id,
    },
    include: batchInclude,
  });
  res.status(201).json({ batch });
});

// GET /api/batches/:id/qr  (public PNG; only encodes the public trace URL)  (S3.2)
router.get("/:id/qr", async (req, res) => {
  const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  const png = await QRCode.toBuffer(publicUrl(batch.id), { width: 300, margin: 1 });
  res.type("png").send(png);
});

// GET /api/batches/:id/label  (printable PDF label)  (S3.2)
router.get("/:id/label", requireAuth, async (req, res) => {
  const batch = await prisma.batch.findUnique({ where: { id: req.params.id }, include: { farm: true } });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  const qrDataUrl = await QRCode.toDataURL(publicUrl(batch.id), { width: 300, margin: 1 });
  const qrPng = Buffer.from(qrDataUrl.split(",")[1], "base64");

  const doc = new PDFDocument({ size: [283, 283], margin: 14 }); // ~100x100mm label
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="label-${batch.id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(14).fillColor("#111").font("Helvetica-Bold").text("EggTrace", { align: "center" });
  doc.moveDown(0.2);
  doc.image(qrPng, (283 - 150) / 2, 44, { width: 150, height: 150 });
  doc.moveTo(0, 205);
  doc.fontSize(11).font("Helvetica-Bold").fillColor("#000").text(batch.id, 14, 205, { align: "center", width: 255 });
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica").fillColor("#333");
  doc.text(`Farm: ${batch.farm.name}`, { align: "center" });
  doc.text(`Lay date: ${new Date(batch.layDate).toLocaleDateString()}`, { align: "center" });
  doc.text(`Qty: ${batch.quantity.toLocaleString()} eggs`, { align: "center" });
  doc.text("Scan to trace this batch", { align: "center" });
  doc.end();
});

// POST /api/batches/:id/split  (logistics or admin)  (S3.3)
router.post("/:id/split", requireAuth, requireRole("admin", "logistics"), async (req, res) => {
  const parent = await prisma.batch.findUnique({ where: { id: req.params.id } });
  if (!parent) return res.status(404).json({ error: "Parent batch not found" });

  const { children } = req.body || {};
  if (!Array.isArray(children) || children.length === 0) {
    return res.status(400).json({ error: "children array is required" });
  }
  const total = children.reduce((s, c) => s + Number(c.quantity || 0), 0);
  if (children.some((c) => !c.quantity || Number(c.quantity) <= 0)) {
    return res.status(400).json({ error: "each child needs a positive quantity" });
  }
  if (total > parent.quantity) {
    return res.status(400).json({ error: `child quantities (${total}) exceed parent quantity (${parent.quantity})` });
  }

  const farm = await prisma.farm.findUnique({ where: { id: parent.farmId } });
  const created = [];
  for (const c of children) {
    const id = await generateBatchId(farm, parent.layDate, { seqStart: 101 });
    const child = await prisma.batch.create({
      data: {
        id, farmId: parent.farmId, flockId: parent.flockId, layDate: parent.layDate,
        quantity: Number(c.quantity), status: parent.status, parentId: parent.id,
        currentHolderPartyId: c.toPartyId || parent.currentHolderPartyId || null,
        createdById: req.user.id,
      },
    });
    created.push(child);
  }
  res.status(201).json({ children: created });
});

export default router;
