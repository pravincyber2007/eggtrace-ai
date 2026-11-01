# 2. Proposed Solution

**Project:** EggTrace AI: Egg Batch Traceability and Quality Record Management
**Team:** Code Warriors

---

## 2.1 Solution Overview

**EggTrace AI** is a web platform, designed for mobile use, that gives every egg batch a **unique digital identity and a QR label**. The QR code is scanned at each handover (farm, collection centre, warehouse, transporter, buyer), building a complete, tamper-evident **chain of custody**. Inspection results, grading, storage conditions and movements are all linked to the batch. When a problem arises, a **rapid recall tool** finds every affected buyer in seconds.

```
Farm ──▶ Collection Centre ──▶ Warehouse ──▶ Transporter ──▶ Buyer ──▶ Consumer
  │  scan      │  scan             │  scan        │  scan       │ scan     │ scan
  └────────────┴─────────── EggTrace AI (batch ledger) ─────────┴──────────┘
```

## 2.2 Core Features

| # | Feature | Description |
|---|---|---|
| 1 | **Batch creation** | Register a batch with farm, flock ID, laying/packing date and quantity. A unique batch ID and QR label are generated. |
| 2 | **Inspection and grading records** | Inspectors record grade (for example AA/A/B by weight and quality), defects, rejected count and remarks for each batch. |
| 3 | **Storage and movement history** | Each stage logs location, timestamp, handler and temperature, giving a full timeline. |
| 4 | **Search and recall** | Search by batch ID, farm, date or destination, then start a recall for the affected batches. |

## 2.3 Advanced Features

| # | Feature | Description | Prototype phase |
|---|---|---|---|
| 5 | **QR labels at handovers** | Printable QR for trays and cartons. Scanning with a phone camera records the custody transfer. | ✅ Phase 1 |
| 6 | **Consumer QR page** | Public page showing farm, packing date, grade, freshness status and journey. | ✅ Phase 1 |
| 7 | **Rapid recall tool** | Walks the movement graph to list all affected buyers and stock locations in seconds, and exports a contact list. | ✅ Phase 1 |
| 8 | **Egg image analysis** | OpenCV and ML model to detect cracks and shell defects from tray photos. | 🔜 Phase 2 |
| 9 | **Shelf-life estimate** | Predicts remaining shelf life from the batch's temperature history. | 🔜 Phase 2 |
| 10 | **Supplier scorecards** | Rates farms on quality, on-time delivery and rejection rate. | 🔜 Phase 2 |

## 2.4 User Roles

- **Admin:** manages users, farms and master data.
- **Farm user:** creates batches and prints QR labels.
- **Inspector:** records grading and inspection results.
- **Logistics user** (collection centre, warehouse, transporter): scans handovers and logs storage.
- **Buyer:** confirms receipt and views batch history.
- **Consumer:** public, read-only QR page.

## 2.5 Key User Flow: Recall

1. A quality issue is reported for batch `EGG-2026-0042`.
2. A QA user opens **Recall** and enters the batch ID, or the farm and date range.
3. The system traces every split and movement and lists **all buyers, warehouses and in-transit stock** holding that batch.
4. A recall is issued, with notifications and an exportable list, and each affected party's status is tracked until closed.

## 2.6 Why This Solution

- **Low cost:** QR stickers and a smartphone are enough. No special hardware is needed.
- **Works for small farms:** simple, mobile-first interface.
- **Data-driven quality:** turns paper records into searchable evidence.
- **Scalable:** the same model can extend to dairy, meat and other perishables.
