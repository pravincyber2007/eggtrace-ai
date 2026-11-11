import { prisma } from "../db.js";

// Short farm code from the farm name: alphanumerics, uppercase, first 4 chars.
export function farmCode(name) {
  const code = String(name || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return code || "FARM";
}

function ymd(date) {
  const d = new Date(date);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

// Generate a unique batch ID: EGG-<farm>-<yyyymmdd>-<seq>
export async function generateBatchId(farm, layDate, { seqStart = 1 } = {}) {
  const code = farmCode(farm.name);
  const datePart = ymd(layDate);
  const prefix = `EGG-${code}-${datePart}-`;
  const existing = await prisma.batch.count({ where: { id: { startsWith: prefix } } });
  let seq = Math.max(existing + 1, seqStart);
  // Ensure uniqueness in case of collisions.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const id = `${prefix}${String(seq).padStart(3, "0")}`;
    const hit = await prisma.batch.findUnique({ where: { id } });
    if (!hit) return id;
    seq += 1;
  }
}
