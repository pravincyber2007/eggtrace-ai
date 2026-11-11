import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-800">Access denied</h2>
        <p className="mt-1 text-sm text-slate-500">Your role ({user.role}) cannot view this page.</p>
      </div>
    );
  }
  return children;
}
