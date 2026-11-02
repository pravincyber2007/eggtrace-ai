# Product Requirements Document (PRD)

**Product:** EggTrace AI · **Team:** Code Warriors
**Status:** Living document, updated during development · **Last updated:** 2026-11-02
**Related:** [MRD](MRD.md) · [Epics and Stories](EPICS-AND-STORIES.md)

---

## 1. Purpose

Give every egg batch a digital identity and a QR label, record each inspection and handover, and enable recall of affected batches and buyers in seconds.

## 2. Goals and Non-Goals

**Goals:** batch traceability from farm to buyer, digital quality records, QR handovers, rapid recall, consumer transparency.
**Non-goals (v1):** payments and invoicing, ERP integration, IoT hardware, broiler (meat) or hatchery chains.

## 3. Release Scope

| Release | Features |
|---|---|
| **Phase 1 (MVP, hackathon)** | Auth and roles, master data, batch creation and QR, inspection and grading, QR handover scan, movement history, search, rapid recall, consumer QR page, dashboard |
| **Phase 2** | Egg image defect analysis (OpenCV), shelf-life estimate, supplier scorecards |

## 4. User Roles

Admin · Farm user · Inspector · Logistics (collection centre / warehouse / transporter) · Buyer · Consumer (public)

## 5. Functional Requirements

| ID | Requirement | Phase | Maps to |
|---|---|---|---|
| FR-1 | Users log in with email and password, and access is restricted by role | 1 | — |
| FR-2 | Admin manages farms, flocks, parties (centres, warehouses, transporters, buyers) and users | 1 | MN-1 |
| FR-3 | Farm user creates a batch (farm, flock, lay date, quantity), and the system assigns a unique ID `EGG-<farm>-<yyyymmdd>-<seq>` | 1 | MN-1 |
| FR-4 | The system generates a QR code and printable PDF label for each batch | 1 | MN-5 |
| FR-5 | Inspector records grade, defect count, rejected count, remarks and an optional photo | 1 | MN-2 |
| FR-6 | Logistics user scans the QR code to record a handover: to-party, quantity, location, temperature | 1 | MN-3, MN-5 |
| FR-7 | The system checks custody (only the current holder can hand over) and keeps movements append-only | 1 | MN-3 |
| FR-8 | A batch can be split into child batches (for example for several buyers), with links to the parent kept | 1 | MN-4 |
| FR-9 | Batch details show a full timeline of creation, inspections and movements | 1 | MN-3 |
| FR-10 | Search by batch ID, farm, date range or destination | 1 | MN-4 |
| FR-11 | Recall: given a batch, farm or date range, list all affected batches, buyers and stock locations; create a recall and track status per party; export CSV | 1 | MN-4 |
| FR-12 | Public consumer page `/t/:batchId` shows farm, lay date, grade, freshness and journey, without login | 1 | MN-6 |
| FR-13 | Dashboard shows active batches, recent inspections, open recalls and alerts | 1 | — |
| FR-14 | Inspector uploads a tray image, and the system detects cracks and shell defects and saves the counts | 2 | MN-7 |
| FR-15 | The system estimates remaining shelf life from temperature history (Fresh, Use soon, Expired) | 2 | MN-8 |
| FR-16 | Supplier scorecard: quality %, on-time delivery %, rejection rate for each farm | 2 | MN-9 |

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Recall trace returns results in **under 5 seconds** (target under 1 second) for 10,000 movements |
| NFR-2 | Mobile-first UI that works on Android Chrome at 360px width |
| NFR-3 | QR scan to saved handover in under 10 seconds of user time |
| NFR-4 | Passwords hashed (bcrypt), JWT auth, role-based access, parameterised queries |
| NFR-5 | Audit trail: movements and inspections are never edited in place |
| NFR-6 | Consumer page shows no personal or commercial data |
| NFR-7 | Available on a free cloud deployment for the demo |

## 7. Success Metrics

- Recall time under 5 seconds in the demo scenario.
- 100% of demo handovers recorded by QR scan.
- A consumer page loads from a scan in under 2 seconds.
- (Phase 2) Defect-detection accuracy of at least 85% on the test set.

## 8. Tech Stack

React (Vite) + Tailwind · Node.js/Express · PostgreSQL + Prisma · `qrcode` / `html5-qrcode` · Python FastAPI + OpenCV (Phase 2). See [Technologies and Tools](../04-technologies-and-tools.md).

## 9. Dependencies and Risks

| Risk | Mitigation |
|---|---|
| Poor connectivity at farms | Lightweight pages; offline queue as a stretch goal |
| Too little egg-defect training data | Public datasets plus augmentation; Phase 2 only |
| Handovers skipped by users | Custody validation; the receiver must scan to accept |
| Time limit | Phase 1 MVP first, advanced features later |

## 10. Change Log

| Date | Change |
|---|---|
| 2026-11-02 | Initial version |
