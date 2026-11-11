# Epics and User Stories

**Product:** EggTrace AI · **Team:** Code Warriors
**Status:** Living document. Update the status as stories are built. **Last updated:** 2026-11-11
**Related:** [PRD](PRD.md)

Status legend: ⬜ To do · 🟨 In progress · ✅ Done
Priority: **P1** = MVP (Phase 1) · **P2** = Phase 2

---

## Epic Summary

| Epic | Name | Phase | FRs | Status |
|---|---|---|---|---|
| E1 | Auth and user management | 1 | FR-1 | ✅ |
| E2 | Master data (farms, flocks, parties) | 1 | FR-2 | ✅ |
| E3 | Batch creation and QR labels | 1 | FR-3, FR-4, FR-8 | ✅ |
| E4 | Inspection and grading | 1 | FR-5 | ✅ |
| E5 | QR handover and movement history | 1 | FR-6, FR-7, FR-9 | ✅ |
| E6 | Search and rapid recall | 1 | FR-10, FR-11 | ✅ |
| E7 | Consumer QR page | 1 | FR-12 | ✅ |
| E8 | Dashboard | 1 | FR-13 | ✅ |
| E9 | Egg image defect analysis | 2 | FR-14 | ⬜ |
| E10 | Shelf-life estimation | 2 | FR-15 | ⬜ |
| E11 | Supplier scorecards | 2 | FR-16 | ⬜ |

---

## E1: Auth and User Management

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S1.1 | As a user, I want to log in with email and password so that I can access my role's features | Valid login returns a JWT; invalid login shows an error; password stored as a bcrypt hash | P1 | ✅ |
| S1.2 | As an admin, I want to create users and assign roles and a party so that access is controlled | Admin-only endpoint; role is one of admin, farm, inspector, logistics, buyer | P1 | ✅ |
| S1.3 | As the system, I want to block endpoints by role so that users only do what they're allowed to | Unauthorised call returns 403; tested for each role | P1 | ✅ |

## E2: Master Data

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S2.1 | As an admin, I want to add farms (name, location, licence no.) | Farm saved and listed; required fields validated | P1 | ✅ |
| S2.2 | As a farm user, I want to add flocks (breed, bird count, placement date) to my farm | Flock linked to the farm and selectable during batch creation | P1 | ✅ |
| S2.3 | As an admin, I want to add parties (collection centre, warehouse, transporter, buyer) | Party saved with its type and available in handover selection | P1 | ✅ |

## E3: Batch Creation and QR Labels

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S3.1 | As a farm user, I want to create a batch with farm, flock, lay date and quantity | Unique ID `EGG-<farm>-<yyyymmdd>-<seq>` generated; status "At farm" | P1 | ✅ |
| S3.2 | As a farm user, I want a QR code and printable label for my batch so that I can stick it on trays and cartons | QR encodes `/t/<batchId>`; PDF label downloads with the batch ID, farm and date | P1 | ✅ |
| S3.3 | As a logistics user, I want to split a batch into child batches so that each buyer's share can be traced | Child quantities sum to no more than the parent's; each child has a parent link and its own QR | P1 | ✅ |

## E4: Inspection and Grading

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S4.1 | As an inspector, I want to record grade, defect count, rejected count and remarks for a batch | Inspection saved with inspector and timestamp; shown in the batch timeline | P1 | ✅ |
| S4.2 | As an inspector, I want to attach a tray photo as evidence | Image uploaded and viewable from the inspection | P1 | ✅ |
| S4.3 | As a buyer, I want to see all inspections for a batch | Read-only list on the batch details page | P1 | ✅ |

## E5: QR Handover and Movement History

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S5.1 | As a logistics user, I want to scan a batch QR with my phone camera so that I don't have to type IDs | Camera scanner opens the batch; works on Android Chrome | P1 | ✅ |
| S5.2 | As a logistics user, I want to record a handover (to-party, quantity, location, temperature) | Movement saved; batch's current holder updated | P1 | ✅ |
| S5.3 | As the system, I want to allow handover only by the current holder | Non-holder gets an error; movements are append-only | P1 | ✅ |
| S5.4 | As any user, I want a full timeline of a batch (created, inspected, moved) | Chronological timeline with stages, parties and temperatures | P1 | ✅ |

## E6: Search and Rapid Recall

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S6.1 | As a QA user, I want to search batches by ID, farm, date range or destination | Filtered results in under 1 second for the demo data | P1 | ✅ |
| S6.2 | As a QA user, I want to trace a batch forward to all affected buyers, including split child batches | Recursive trace lists buyers, quantities and dates; under 5 seconds | P1 | ✅ |
| S6.3 | As a QA user, I want to create a recall with a reason and track each party's status | Recall saved; each affected party marked Notified, Acknowledged or Returned | P1 | ✅ |
| S6.4 | As a QA user, I want to export the affected-buyers list as CSV | CSV download with party, contact, batch and quantity | P1 | ✅ |
| S6.5 | As a QA user, I want to trace a buyer's batch back to the source farm and flock | Backward trace shows the parent chain to the farm | P1 | ✅ |

## E7: Consumer QR Page

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S7.1 | As a consumer, I want to scan a carton QR and see farm, lay date and grade | Public page with no login; loads in under 2 seconds on mobile | P1 | ✅ |
| S7.2 | As a consumer, I want to see freshness and the journey of my eggs | Freshness badge and stage list; no personal or commercial data shown | P1 | ✅ |
| S7.3 | As a consumer, I want to be warned if the batch is under recall | A recall banner is shown when the batch is part of an active recall | P1 | ✅ |

## E8: Dashboard

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S8.1 | As a user, I want a dashboard of active batches, recent inspections and open recalls | Shows counts and lists filtered by my role | P1 | ✅ |

## E9: Egg Image Defect Analysis (Phase 2)

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S9.1 | As an inspector, I want to upload a tray photo and get crack and defect counts automatically | Python service returns detected eggs and labels (good, crack, dirty, deformed); counts saved to the inspection | P2 | ⬜ |
| S9.2 | As an inspector, I want defects highlighted on the image | Returned image shows bounding boxes | P2 | ⬜ |

## E10: Shelf-Life Estimation (Phase 2)

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S10.1 | As a buyer, I want the remaining shelf life estimated from the temperature history | Shows days remaining and Fresh, Use soon or Expired; updates with each new temperature log | P2 | ⬜ |

## E11: Supplier Scorecards (Phase 2)

| ID | Story | Acceptance criteria | Pri | Status |
|---|---|---|---|---|
| S11.1 | As a buyer or admin, I want a scorecard per farm (quality %, on-time %, rejection rate) | Weighted score calculated monthly; ranked table and chart | P2 | ⬜ |
