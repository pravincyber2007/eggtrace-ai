# 3. Proposed Methodology / Approach

**Project:** EggTrace AI: Egg Batch Traceability and Quality Record Management
**Team:** Code Warriors

---

## 3.1 Development Approach

We follow an **Agile, iterative approach** in short sprints. A working end-to-end flow is built first (batch, then QR, then handover, then recall), and advanced features are layered on top.

## 3.2 Phases

| Phase | Activities | Output |
|---|---|---|
| **1. Requirement analysis** | Study the egg supply chain, identify stakeholders, define data points (farm, flock, batch, inspection, movement) | Requirement list, user stories |
| **2. System design** | ER diagram, architecture, API design, UI wireframes | Solution design document |
| **3. Core development** | Batch CRUD, inspection and grading, movement logs, search | Working backend and UI |
| **4. QR integration** | QR generation per batch, camera scanning for handovers, public consumer page | Scan-based chain of custody |
| **5. Recall engine** | Graph traversal over movements and batch splits to find affected buyers | Rapid recall tool |
| **6. AI and analytics (Phase 2)** | OpenCV crack detection, shelf-life model, supplier scorecards | Quality intelligence |
| **7. Testing** | Unit, API and end-to-end tests with sample data | Tested prototype |
| **8. Deployment and demo** | Deploy to the cloud, prepare the demo dataset and presentation | Live demo |

## 3.3 Traceability Logic

- Each **batch** gets a unique ID (for example `EGG-<farm>-<yyyymmdd>-<seq>`) and a QR code holding a link to `/t/<batchId>`.
- Each **handover scan** creates a `movement` record: *from party → to party, timestamp, location, temperature, quantity*.
- **Split and merge** (for example one batch split across three buyers) is stored as parent → child links, so the recall query can **traverse the graph**:
  - *Forward trace:* batch to all downstream buyers (for recalls)
  - *Backward trace:* buyer's carton to source farm and flock (for root-cause analysis)
- PostgreSQL **recursive CTEs** perform the traversal in milliseconds.

## 3.4 Quality Analysis Approach (Phase 2)

1. **Image capture:** an inspector photographs a tray using the phone camera.
2. **Preprocessing (OpenCV):** grayscale, contrast enhancement (CLAHE), detect individual eggs with Hough circles or contours.
3. **Defect detection:** edge detection plus a lightweight CNN classifier (for example MobileNet, trained on a public egg-defect dataset) labels each egg *good / crack / dirty / deformed*.
4. **Result:** defect count and percentage are saved to the batch's inspection record automatically.

## 3.5 Shelf-Life Estimation Approach (Phase 2)

- Base shelf life is set by storage condition, for example about 14 days at ambient temperature in India and about 30 days or more refrigerated.
- Temperature readings logged at each stage are converted to **"effective age"** using a temperature-dependent decay factor (Arrhenius-style), so hotter storage counts as faster ageing.
- **Remaining shelf life = base shelf life − effective age.** It is shown as Fresh, Use soon or Expired.

## 3.6 Supplier Scorecard Approach (Phase 2)

Score = weighted mix of **quality grade %**, **on-time delivery %** and **(1 − rejection rate)**, calculated monthly for each farm and shown on a leaderboard.

## 3.7 Testing and Validation

- Seed data: 5 farms, 50 batches, 200 movements, 20 buyers.
- Scenario test: inject a "contaminated" batch and measure recall time (target under 5 seconds).
- Usability test with mobile QR scanning.
