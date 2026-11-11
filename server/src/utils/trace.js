import { prisma } from "../db.js";

// All descendant batches (self + recursive children via split links).
export async function descendants(rootId) {
  const out = [];
  const seen = new Set();
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    const b = await prisma.batch.findUnique({
      where: { id },
      include: {
        farm: { select: { id: true, name: true } },
        currentHolder: true,
        children: { select: { id: true } },
      },
    });
    if (!b) continue;
    out.push(b);
    b.children.forEach((c) => queue.push(c.id));
  }
  return out;
}

// Forward trace: all affected batches + the buyers/parties that hold or received them. (S6.2)
export async function traceForward(rootId) {
  const batches = await descendants(rootId);
  const ids = batches.map((b) => b.id);
  if (ids.length === 0) return { batches: [], parties: [] };

  const movements = await prisma.movement.findMany({
    where: { batchId: { in: ids } },
    include: { toParty: true },
  });

  const map = new Map(); // partyId -> { party, batches:[{batchId, quantity, date}], total, lastDate }
  function add(party, batchId, quantity, date) {
    if (!party) return;
    const e = map.get(party.id) || { party, batches: [], total: 0, lastDate: null };
    if (!e.batches.some((x) => x.batchId === batchId)) {
      e.batches.push({ batchId, quantity, date });
      e.total += quantity;
      if (!e.lastDate || new Date(date) > new Date(e.lastDate)) e.lastDate = date;
      map.set(party.id, e);
    }
  }

  // Parties that received affected batches.
  movements.forEach((m) => add(m.toParty, m.batchId, m.quantity, m.createdAt));
  // Current holders (covers delivered stock that is the holder but may lack a later movement).
  batches.forEach((b) => { if (b.currentHolder) add(b.currentHolder, b.id, b.quantity, b.createdAt); });

  return {
    batches: batches.map((b) => ({
      id: b.id, quantity: b.quantity, status: b.status,
      farm: b.farm?.name, holder: b.currentHolder?.name || "At farm",
    })),
    parties: [...map.values()].map((e) => ({
      partyId: e.party.id, name: e.party.name, type: e.party.type, contact: e.party.contact,
      location: e.party.location, batches: e.batches, totalQuantity: e.total, lastDate: e.lastDate,
    })),
  };
}

// Backward trace: follow parent chain to the source farm + flock. (S6.5)
export async function traceBackward(batchId) {
  const chain = [];
  let id = batchId;
  const seen = new Set();
  let root = null;
  while (id && !seen.has(id)) {
    seen.add(id);
    const b = await prisma.batch.findUnique({
      where: { id },
      include: { farm: true, flock: true, parent: { select: { id: true } } },
    });
    if (!b) break;
    chain.push({ id: b.id, quantity: b.quantity, status: b.status, parentId: b.parent?.id || null });
    root = b;
    id = b.parent?.id || null;
  }
  return {
    chain, // ordered from scanned batch up to the root
    source: root ? { farm: root.farm, flock: root.flock, layDate: root.layDate } : null,
  };
}
