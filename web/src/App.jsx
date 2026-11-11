import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";

// Placeholder for pages delivered in later epics.
function Placeholder({ title }) {
  return (
    <div className="card p-8 text-center">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Coming in a later epic.</p>
    </div>
  );
}

function Shell({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Loading…</div>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Shell><Placeholder title="Dashboard" /></Shell>} />
      <Route path="/batches" element={<Shell><Placeholder title="Batches" /></Shell>} />
      <Route path="/scan" element={<Shell roles={["admin", "logistics"]}><Placeholder title="Scan & Handover" /></Shell>} />
      <Route path="/recall" element={<Shell><Placeholder title="Search & Recall" /></Shell>} />
      <Route path="/master-data" element={<Shell roles={["admin", "farm"]}><Placeholder title="Master Data" /></Shell>} />
      <Route path="/users" element={<Shell roles={["admin"]}><UsersPage /></Shell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
