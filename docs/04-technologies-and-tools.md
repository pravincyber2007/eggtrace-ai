# 4. Technologies and Tools to be Used

**Project:** EggTrace AI: Egg Batch Traceability and Quality Record Management
**Team:** Code Warriors

---

## 4.1 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React (Vite), Tailwind CSS | Responsive, mobile-first web app |
| | React Router, Axios | Navigation and API calls |
| | Recharts | Dashboards, scorecards, temperature charts |
| **Backend** | Node.js + Express.js | REST API server |
| | JWT + bcrypt | Authentication and role-based access |
| **Database** | PostgreSQL | Relational store for batches, inspections and movements; recursive queries for recall |
| | Prisma ORM | Schema, migrations, type-safe queries |
| **QR / barcode** | `qrcode` (Node) | Generate QR labels per batch |
| | `html5-qrcode` / ZXing | Scan QR codes with the phone camera in the browser |
| | PDF label generation (`pdfkit`) | Printable tray and carton labels |
| **Computer vision** | OpenCV (Python) | Egg detection, crack and shell-defect analysis |
| | TensorFlow / PyTorch (MobileNet) | Defect classification model |
| | FastAPI | Python micro-service exposing the image-analysis API |
| **Analytics** | Node / Python scripts | Shelf-life estimation, supplier scoring |

## 4.2 Development Tools

| Tool | Use |
|---|---|
| **Git and GitHub** | Version control, collaboration (`pravincyber2007/eggtrace-ai`) |
| **VS Code** | Code editor |
| **Claude Code** | AI-assisted development and documentation |
| **Postman** | API testing |
| **pgAdmin / DBeaver** | Database management |
| **Figma** | UI wireframes |
| **draw.io / Mermaid** | Architecture and ER diagrams |
| **Jest / Supertest** | Backend testing |

## 4.3 Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel / Netlify |
| Backend API | Render / Railway |
| Database | Neon / Supabase (managed PostgreSQL) |
| CV service | Render (Python) / Hugging Face Spaces |

## 4.4 Why This Stack

- **React + Node.js:** JavaScript across the whole stack, quick to build, a large ecosystem, and works well on mobile.
- **PostgreSQL:** strong relational integrity for audit trails, and **recursive CTEs** for fast recall tracing.
- **QR codes:** zero-cost labels, and any smartphone can scan them.
- **OpenCV:** proven, free computer-vision library that suits defect detection.
- **All open source:** affordable for small farms and cooperatives.
