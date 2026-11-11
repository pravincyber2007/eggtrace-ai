import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function batchId(farmCode, date, seq) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `EGG-${farmCode}-${y}${m}${d}-${String(seq).padStart(3, "0")}`;
}

async function main() {
  console.log("Seeding EggTrace demo data...");

  // ---- Parties (E2) ----
  const centre = await prisma.party.create({
    data: { name: "Namakkal Collection Centre", type: "collection_centre", contact: "+91 90000 11111", location: "Namakkal" },
  });
  const warehouse = await prisma.party.create({
    data: { name: "Chennai Cold Store", type: "warehouse", contact: "+91 90000 22222", location: "Chennai" },
  });
  const transporter = await prisma.party.create({
    data: { name: "FreshMove Logistics", type: "transporter", contact: "+91 90000 33333", location: "Tamil Nadu" },
  });
  const buyerA = await prisma.party.create({
    data: { name: "GreenMart Supermarket", type: "buyer", contact: "+91 90000 44444", location: "Chennai" },
  });
  const buyerB = await prisma.party.create({
    data: { name: "DailyFresh Grocery", type: "buyer", contact: "+91 90000 55555", location: "Bengaluru" },
  });

  // ---- Users (E1) ----
  const pw = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.create({
    data: { email: "admin@eggtrace.ai", passwordHash: pw, name: "Admin User", role: "admin" },
  });
  const farmUser = await prisma.user.create({
    data: { email: "farm@eggtrace.ai", passwordHash: pw, name: "Sunrise Farm Manager", role: "farm" },
  });
  const inspector = await prisma.user.create({
    data: { email: "inspector@eggtrace.ai", passwordHash: pw, name: "Quality Inspector", role: "inspector" },
  });
  const logistics = await prisma.user.create({
    data: { email: "logistics@eggtrace.ai", passwordHash: pw, name: "Logistics Operator", role: "logistics", partyId: transporter.id },
  });
  const buyer = await prisma.user.create({
    data: { email: "buyer@eggtrace.ai", passwordHash: pw, name: "GreenMart Buyer", role: "buyer", partyId: buyerA.id },
  });

  // ---- Farms & flocks (E2) ----
  const farm1 = await prisma.farm.create({
    data: { name: "Sunrise Poultry Farm", location: "Namakkal, Tamil Nadu", licenceNo: "TN-NMK-0042" },
  });
  const farm2 = await prisma.farm.create({
    data: { name: "Golden Yolk Farm", location: "Erode, Tamil Nadu", licenceNo: "TN-ERD-0098" },
  });
  const flock1 = await prisma.flock.create({
    data: { farmId: farm1.id, breed: "BV-300 Brown", birdCount: 5000, placementDate: daysAgo(180) },
  });
  const flock2 = await prisma.flock.create({
    data: { farmId: farm1.id, breed: "Lohmann White", birdCount: 3000, placementDate: daysAgo(120) },
  });
  const flock3 = await prisma.flock.create({
    data: { farmId: farm2.id, breed: "Hy-Line Brown", birdCount: 4000, placementDate: daysAgo(150) },
  });

  // ---- Batches (E3) ----
  const b1date = daysAgo(5);
  const batch1 = await prisma.batch.create({
    data: {
      id: batchId("SUNR", b1date, 1),
      farmId: farm1.id, flockId: flock1.id, layDate: b1date, quantity: 10000,
      status: "In transit", currentHolderPartyId: warehouse.id, createdById: farmUser.id, createdAt: b1date,
    },
  });
  const b2date = daysAgo(3);
  const batch2 = await prisma.batch.create({
    data: {
      id: batchId("SUNR", b2date, 2),
      farmId: farm1.id, flockId: flock2.id, layDate: b2date, quantity: 6000,
      status: "At farm", currentHolderPartyId: null, createdById: farmUser.id, createdAt: b2date,
    },
  });
  const b3date = daysAgo(2);
  const batch3 = await prisma.batch.create({
    data: {
      id: batchId("GOLD", b3date, 1),
      farmId: farm2.id, flockId: flock3.id, layDate: b3date, quantity: 8000,
      status: "At farm", currentHolderPartyId: null, createdById: farmUser.id, createdAt: b3date,
    },
  });

  // Split batch1 into two children for two buyers (E3 S3.3)
  const child1 = await prisma.batch.create({
    data: {
      id: batchId("SUNR", b1date, 101),
      farmId: farm1.id, flockId: flock1.id, layDate: b1date, quantity: 6000,
      status: "Delivered", parentId: batch1.id, currentHolderPartyId: buyerA.id, createdById: logistics.id, createdAt: daysAgo(1),
    },
  });
  const child2 = await prisma.batch.create({
    data: {
      id: batchId("SUNR", b1date, 102),
      farmId: farm1.id, flockId: flock1.id, layDate: b1date, quantity: 4000,
      status: "Delivered", parentId: batch1.id, currentHolderPartyId: buyerB.id, createdById: logistics.id, createdAt: daysAgo(1),
    },
  });

  // ---- Inspections (E4) ----
  await prisma.inspection.create({
    data: { batchId: batch1.id, inspectorId: inspector.id, grade: "A", defectCount: 45, rejectedCount: 20, remarks: "Good shell quality, minor cracks within tolerance." },
  });
  await prisma.inspection.create({
    data: { batchId: batch2.id, inspectorId: inspector.id, grade: "B", defectCount: 120, rejectedCount: 60, remarks: "Some dirty eggs, recommend re-cleaning." },
  });

  // ---- Movements (E5) ----
  await prisma.movement.create({
    data: { batchId: batch1.id, fromPartyId: null, toPartyId: centre.id, quantity: 10000, location: "Namakkal", temperature: 18.5, recordedById: logistics.id, createdAt: daysAgo(4) },
  });
  await prisma.movement.create({
    data: { batchId: batch1.id, fromPartyId: centre.id, toPartyId: warehouse.id, quantity: 10000, location: "Chennai", temperature: 8.0, recordedById: logistics.id, createdAt: daysAgo(3) },
  });
  await prisma.movement.create({
    data: { batchId: child1.id, fromPartyId: warehouse.id, toPartyId: buyerA.id, quantity: 6000, location: "Chennai", temperature: 7.5, recordedById: logistics.id, createdAt: daysAgo(1) },
  });
  await prisma.movement.create({
    data: { batchId: child2.id, fromPartyId: warehouse.id, toPartyId: buyerB.id, quantity: 4000, location: "Bengaluru", temperature: 9.0, recordedById: logistics.id, createdAt: daysAgo(1) },
  });

  console.log("Seed complete.");
  console.log("\nDemo logins (password: password123):");
  console.log("  admin@eggtrace.ai       (admin)");
  console.log("  farm@eggtrace.ai        (farm)");
  console.log("  inspector@eggtrace.ai   (inspector)");
  console.log("  logistics@eggtrace.ai   (logistics)");
  console.log("  buyer@eggtrace.ai       (buyer)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
