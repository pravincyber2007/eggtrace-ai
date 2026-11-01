# 6. Initial Prototype / Solution Design

**Project:** EggTrace AI: Egg Batch Traceability and Quality Record Management
**Team:** Code Warriors

---

## 6.1 System Architecture

```mermaid
flowchart LR
  subgraph Clients
    A[Farm / Inspector / Logistics<br/>React web app on mobile]
    B[Consumer<br/>Public QR page]
    C[Admin / QA dashboard]
  end
  A & B & C -->|HTTPS / REST| API[Node.js + Express API<br/>JWT auth, RBAC]
  API --> DB[(PostgreSQL<br/>Prisma ORM)]
  API --> QR[QR service<br/>generate labels / PDF]
  API -->|image upload| CV[Python FastAPI<br/>OpenCV + CNN defect detection]
  API --> AN[Analytics<br/>shelf-life, scorecards]
  CV --> DB
  AN --> DB
```

## 6.2 Data Model (ER Diagram)

```mermaid
erDiagram
  FARM ||--o{ FLOCK : has
  FARM ||--o{ BATCH : produces
  FLOCK ||--o{ BATCH : lays
  BATCH ||--o{ INSPECTION : graded_by
  BATCH ||--o{ MOVEMENT : moves
  BATCH ||--o{ BATCH : split_into
  PARTY ||--o{ MOVEMENT : from_to
  BATCH ||--o{ TEMP_LOG : records
  BATCH ||--o{ RECALL_ITEM : affected
  RECALL ||--o{ RECALL_ITEM : contains
  USER }o--|| PARTY : belongs_to

  FARM { int id string name string location string license_no }
  FLOCK { int id int farm_id string breed int bird_count date placed_on }
  BATCH { string batch_id int farm_id int flock_id date lay_date int quantity string status string parent_batch_id }
  INSPECTION { int id string batch_id string grade int defect_count int rejected string image_url int inspector_id timestamp at }
  PARTY { int id string name string type }
  MOVEMENT { int id string batch_id int from_party int to_party int quantity float temp_c string location timestamp at }
  TEMP_LOG { int id string batch_id float temp_c timestamp at }
  RECALL { int id string reason string status timestamp created_at }
  RECALL_ITEM { int id int recall_id string batch_id int party_id string status }
  USER { int id string name string role int party_id }
```

`PARTY.type` is one of: farm, collection_centre, warehouse, transporter, buyer.

## 6.3 Key API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login (JWT) |
| POST | `/api/batches` | Create batch and generate QR |
| GET | `/api/batches/:id` | Batch details and full timeline |
| GET | `/api/batches/:id/label` | Printable QR label (PDF) |
| POST | `/api/batches/:id/split` | Split a batch into child batches |
| POST | `/api/inspections` | Add inspection and grading |
| POST | `/api/movements/scan` | Record a handover via QR scan |
| GET | `/api/search?q=&destination=&from=&to=` | Search batches |
| POST | `/api/recalls` | Start a recall, returning all affected buyers |
| GET | `/t/:batchId` | Public consumer page |
| POST | `/api/cv/analyze` | (Phase 2) Image defect analysis |
| GET | `/api/suppliers/scorecard` | (Phase 2) Supplier scores |

## 6.4 Recall Trace Query

```sql
WITH RECURSIVE tree AS (
  SELECT batch_id FROM batch WHERE batch_id = $1
  UNION
  SELECT b.batch_id FROM batch b JOIN tree t ON b.parent_batch_id = t.batch_id
)
SELECT DISTINCT p.name, p.type, m.quantity, m.at
FROM movement m
JOIN tree t ON m.batch_id = t.batch_id
JOIN party p ON p.id = m.to_party
WHERE p.type = 'buyer';
```

## 6.5 Handover Sequence

```mermaid
sequenceDiagram
  participant T as Transporter (phone)
  participant W as Web app
  participant API as API
  participant DB as PostgreSQL
  T->>W: Scan QR on carton
  W->>API: POST /movements/scan {batchId, toParty, temp, qty}
  API->>DB: Validate custody and insert movement
  DB-->>API: OK
  API-->>W: Updated timeline
```

## 6.6 UI Screens (Prototype)

1. **Login**: role-based.
2. **Dashboard**: active batches, recent inspections, open recalls, alerts.
3. **Create Batch**: farm, flock, date, quantity, then the QR label is shown and can be printed.
4. **Scan Handover**: camera scanner, then confirm the receiving party, quantity and temperature.
5. **Batch Details**: timeline (farm, centre, warehouse, transporter, buyer), inspections, temperature chart.
6. **Inspection Form**: grade, defects, photo upload.
7. **Search and Recall**: search filters, a "Trace and Recall" button, and the list of affected buyers.
8. **Consumer Page** (public): farm, packing date, grade, freshness badge, journey map.
9. **Supplier Scorecard** (Phase 2): ranking table and charts.

## 6.7 Project Structure

```
eggtrace-ai/
├── docs/            # submission documents
├── client/          # React (Vite) frontend
├── server/          # Node.js + Express API, Prisma schema
└── cv-service/      # Python FastAPI + OpenCV (Phase 2)
```

## 6.8 Security Considerations

- JWT authentication with role-based access control.
- Public consumer page shows only non-sensitive fields.
- Movement records are append-only (audit trail), and custody is validated before a transfer.
- Input validation and parameterised queries (Prisma) prevent injection.
