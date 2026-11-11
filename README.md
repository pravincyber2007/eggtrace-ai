# EggTrace AI

**Egg Batch Traceability and Quality Record Management**: Week 2 Hackathon, Team **Code Warriors**

Farm-to-destination tracking of egg batches with QR handovers, inspection records, rapid recall and AI quality analysis.

## Submission Documents

1. [Problem Statement Analysis](docs/01-problem-statement-analysis.md)
2. [Proposed Solution](docs/02-proposed-solution.md)
3. [Proposed Methodology / Approach](docs/03-proposed-methodology.md)
4. [Technologies and Tools to be Used](docs/04-technologies-and-tools.md)
5. [Expected Outcomes](docs/05-expected-outcomes.md)
6. [Initial Prototype / Solution Design](docs/06-solution-design.md)

## Product Documents (living, updated during development)

- [MRD: Market Requirements](docs/product%20documents/MRD.md)
- [PRD: Product Requirements](docs/product%20documents/PRD.md)
- [Epics and User Stories](docs/product%20documents/EPICS-AND-STORIES.md)

**Stack:** React · Node.js · PostgreSQL · QR scanning · OpenCV

---

## Application (Phase 1 MVP)

A working monorepo implementing all eight Phase-1 epics (E1–E8):

- **`server/`** — Node.js + Express REST API, Prisma ORM. SQLite for local dev (zero setup); the schema is portable to PostgreSQL (Neon/Supabase) for deployment.
- **`web/`** — React (Vite) + Tailwind CSS, React Router, Axios, Recharts, `html5-qrcode`.

### Features

| Epic | Feature |
|---|---|
| E1 | Email/password auth (bcrypt + JWT), role-based access, admin user management |
| E2 | Master data: farms, flocks, parties (centres, warehouses, transporters, buyers) |
| E3 | Batch creation with unique IDs `EGG-<farm>-<yyyymmdd>-<seq>`, QR codes, printable PDF labels, batch splitting |
| E4 | Inspection and grading with tray-photo upload |
| E5 | QR-scan handovers with custody validation, append-only movement history, batch timeline |
| E6 | Search, recursive forward/backward trace, rapid recall with per-party status and CSV export |
| E7 | Public consumer QR page `/t/:batchId` (no login) with freshness, journey and recall banner |
| E8 | Role-filtered dashboard with status chart and alerts |

### Run locally

Two terminals. **Backend:**

```bash
cd server
npm install
npm run db:reset   # creates SQLite db, applies schema, seeds demo data
npm run dev        # API on http://localhost:4000
```

**Frontend:**

```bash
cd web
npm install
npm run dev        # app on http://localhost:5173
```

Open http://localhost:5173.

### Demo accounts (password: `password123`)

| Email | Role |
|---|---|
| `admin@eggtrace.ai` | admin |
| `farm@eggtrace.ai` | farm |
| `inspector@eggtrace.ai` | inspector |
| `logistics@eggtrace.ai` | logistics |
| `buyer@eggtrace.ai` | buyer |

### Deploy notes

To use PostgreSQL in production, set `provider = "postgresql"` in [server/prisma/schema.prisma](server/prisma/schema.prisma) and point `DATABASE_URL` at a managed Postgres (Neon/Supabase). Frontend → Vercel/Netlify, backend → Render/Railway.
