# Market Requirements Document (MRD)

**Product:** EggTrace AI: Egg Batch Traceability and Quality Record Management
**Team:** Code Warriors · **Status:** Living document, updated during development · **Last updated:** 2026-11-02

---

## 1. Market Problem

Eggs move through farms, collection centres, warehouses and transporters before reaching buyers. Records are kept on paper or in spreadsheets, and custody changes are not logged. When a quality issue (cracks, contamination, spoilage) is found, tracing the source and the affected buyers takes **days**. This leads to over-recall, wasted stock, disputes and low buyer trust.

## 2. Market Opportunity

- India is among the world's largest egg producers (more than 130 billion eggs a year), with clusters in Namakkal (Tamil Nadu), Andhra Pradesh, Telangana and Haryana.
- The supply chain is fragmented: thousands of small and mid-size layer farms, aggregators and traders.
- Pressure for traceability is growing from **FSSAI** food-safety rules, institutional buyers (hotels, quick-service restaurants, mid-day meal schemes) and **export markets** (the Middle East and others).
- Smartphones are now common across the supply chain, so QR-based tracking costs almost nothing to adopt.

## 3. Target Market and Segments

| Segment | Description | Priority |
|---|---|---|
| Layer farms and poultry cooperatives | Produce and pack eggs | Primary |
| Collection centres / aggregators | Consolidate eggs from many farms | Primary |
| Warehouses and cold storage | Store eggs | Secondary |
| Transporters / logistics | Move consignments | Secondary |
| Institutional buyers and retailers | Purchase in bulk and need quality assurance | Primary |
| Consumers | End users who scan cartons | Tertiary (trust) |
| Regulators / auditors | Compliance checks | Tertiary |

## 4. User Personas

- **Ravi, farm manager (Namakkal):** about 20,000 birds. Wants to prove his eggs are good quality so he gets better prices. Uses an Android phone and has basic digital skills.
- **Priya, QA inspector:** grades batches at the collection centre. Fed up with paper registers and arguments over defects.
- **Arjun, logistics coordinator:** handles warehouse and transport. Needs proof of condition at each handover.
- **Meena, retail buyer:** needs to know where eggs came from and how fresh they are, and wants fast recalls.
- **Consumer:** wants to see farm and freshness information before buying.

## 5. Market Needs

| ID | Need | Importance |
|---|---|---|
| MN-1 | Uniquely identify each egg batch from the farm | Must |
| MN-2 | Record inspection and grading results digitally | Must |
| MN-3 | Track storage and movement at every stage | Must |
| MN-4 | Find and recall affected batches and buyers fast | Must |
| MN-5 | Record handovers with minimal effort (scan, not typing) | Must |
| MN-6 | Show origin and freshness to consumers | Should |
| MN-7 | Detect cracks and defects objectively | Should |
| MN-8 | Estimate shelf life from storage conditions | Could |
| MN-9 | Rate suppliers on quality and delivery | Could |

## 6. Competitive Landscape

| Alternative | Limitation |
|---|---|
| Paper registers / Excel | Not linked, slow to search, no chain of custody |
| General ERP (SAP, Tally) | Expensive, not built for egg batches, poor mobile support |
| Generic food-traceability SaaS | Costly subscriptions, not suited to Indian smallholder workflows |
| Blockchain pilots | Complex, high cost, low adoption |

**Our edge:** built specifically for eggs, low cost (QR plus smartphone), mobile-first, rapid recall in seconds, and AI-assisted quality checks.

## 7. Business Goals

- Show recall tracing in **under 5 seconds** in the demo.
- Have a pilot-ready prototype for one cooperative or collection centre.
- Possible later model: freemium for farms, subscription for aggregators and buyers.

## 8. Constraints and Assumptions

- Users have Android smartphones with a camera, but internet may be patchy.
- Phase 1 needs no special hardware (IoT sensors come later).
- Hackathon timeline is short, so advanced AI features are Phase 2.
