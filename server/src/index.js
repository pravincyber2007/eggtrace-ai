import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import farmRoutes from "./routes/farms.js";
import flockRoutes from "./routes/flocks.js";
import partyRoutes from "./routes/parties.js";
import batchRoutes from "./routes/batches.js";
import inspectionRoutes from "./routes/inspections.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Static uploads (inspection photos)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "eggtrace-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/flocks", flockRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/inspections", inspectionRoutes);

// 404 for unknown API routes
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`EggTrace API listening on http://localhost:${PORT}`));
