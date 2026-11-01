# 1. Problem Statement Analysis

**Project:** EggTrace AI: Egg Batch Traceability and Quality Record Management
**Team:** Code Warriors

---

## 1.1 Problem Statement

Eggs pass through farms, collection centres, warehouses and transporters before they reach buyers. When a quality issue appears, such as cracked shells, contamination, *Salmonella* risk or spoilage, finding the source is slow. Records are scattered across paper registers, spreadsheets and phone calls. The industry needs a **batch-tracking system that gives full visibility from farm to destination**.

## 1.2 Industry Context (India)

- India is one of the **world's largest egg producers**, with more than 130 billion eggs a year. Production is concentrated in clusters such as **Namakkal (Tamil Nadu)**, Andhra Pradesh, Telangana and Haryana.
- Supply chains are **fragmented**: many small and mid-size layer farms sell to aggregators and traders, who sell on to wholesalers, retailers, institutions (hotels, schools, mid-day meal schemes) and exporters.
- **Cold-chain coverage is limited.** Most eggs travel and are stored at ambient temperature, which speeds up quality loss in hot months.
- **FSSAI** food safety rules and export markets (for example the Middle East) increasingly expect **traceability and documented quality checks**.

## 1.3 Stakeholders

| Stakeholder | Role | Pain today |
|---|---|---|
| Farm / flock manager | Produces and packs eggs | No easy way to prove the quality of their batches |
| Collection centre | Aggregates eggs from several farms | Batches get mixed, and the source is lost |
| Quality inspector | Grades and inspects | Results on paper, not linked to batches |
| Warehouse operator | Stores eggs | No temperature or duration history per batch |
| Transporter | Moves consignments | Handovers are not recorded, so there is no chain of custody |
| Buyer / retailer | Purchases eggs | Cannot check origin or freshness |
| Consumer | Final user | No visibility of farm or packing date |
| Regulator / auditor | Compliance | Slow, manual audits and recalls |

## 1.4 Root-Cause Analysis

1. **No unique batch identity.** Trays and cartons carry no scannable ID, so batches lose their identity when consolidated.
2. **Paper-based records.** Inspection, grading and storage logs are not digitised or linked.
3. **Handover gaps.** Custody changes between parties are not recorded.
4. **No temperature history.** Freshness and shelf life cannot be estimated reliably.
5. **Manual, subjective inspection.** Crack and shell-defect detection depends on the person inspecting.
6. **No supplier accountability data.** Rejection rates and delivery performance are not tracked, so poor suppliers go unnoticed.

## 1.5 Impact of the Problem

- **Slow recalls:** tracing affected buyers takes days, while unsafe eggs stay on the market.
- **Over-recall:** without precise data, whole lots are discarded, causing financial loss.
- **Low buyer trust:** buyers and consumers cannot verify freshness or origin.
- **Quality disputes:** without evidence, nobody can show where damage or spoilage happened.
- **Compliance risk:** FSSAI and export audits are hard to satisfy.

## 1.6 Problem Scope

**In scope:** batch creation, inspection and grading records, storage and movement history, QR-based handovers, search and recall, consumer QR page, image-based defect detection, shelf-life estimation, supplier scorecards.

**Out of scope (for the hackathon):** payment and invoicing, full ERP integration, IoT hardware manufacturing, and hatchery or broiler (meat) chains.

## 1.7 Success Criteria

- Trace any batch from farm to every buyer in **under 5 seconds**.
- **100% of handovers** recorded through a QR scan.
- A consumer can see farm and freshness details with **one scan**.
- The system flags defective eggs from images automatically.
