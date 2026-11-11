import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

const GRADES = ["A", "B", "C", "Reject"];

// GET /api/inspections?batchId=...  (read-only list; any authenticated user, incl. buyer)  (S4.3)
router.get("/", requireAuth, async (req, res) => {
  const { batchId } = req.query;
  const inspections = await prisma.inspection.findMany({
    where: batchId ? { batchId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      inspector: { select: { id: true, name: true } },
      batch: { select: { id: true, farm: { select: { name: true } } } },
    },
  });
  res.json({ inspections });
});

// POST /api/inspections  (inspector or admin; optional tray photo)  (S4.1, S4.2)
router.post("/", requireAuth, requireRole("inspector", "admin"), upload.single("photo"), async (req, res) => {
  const { batchId, grade, defectCount, rejectedCount, remarks } = req.body || {};
  if (!batchId || !grade) return res.status(400).json({ error: "batchId and grade are required" });
  if (!GRADES.includes(grade)) return res.status(400).json({ error: `grade must be one of ${GRADES.join(", ")}` });

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  const inspection = await prisma.inspection.create({
    data: {
      batchId,
      inspectorId: req.user.id,
      grade,
      defectCount: Number(defectCount) || 0,
      rejectedCount: Number(rejectedCount) || 0,
      remarks: remarks || null,
      photoPath: req.file ? `/uploads/${req.file.filename}` : null,
    },
    include: { inspector: { select: { id: true, name: true } } },
  });
  res.status(201).json({ inspection });
});

export default router;
