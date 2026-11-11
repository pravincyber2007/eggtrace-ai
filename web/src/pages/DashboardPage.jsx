import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { PageHeader, Spinner, ErrorBanner, StatusBadge } from "../components/ui";

const COLORS = { "At farm": "#94a3b8", "In transit": "#f59e0b", Delivered: "#22c55e", Recalled: "#ef4444" };

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data)).catch((e) => setError(e.response?.data?.error || "Failed to load"));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <Spinner />;

  const chartData = data.statusBreakdown.filter((s) => s.value > 0);

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name?.split(" ")[0] || ""}`} subtitle={`Role: ${user?.role} · your overview`} />

      {data.counts.recalled > 0 && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          ⚠️ {data.counts.recalled} batch(es) under recall · {data.counts.openRecalls} open recall(s)
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total batches" value={data.counts.totalBatches} />
        <Stat label="At farm" value={data.counts.activeBatches} />
        <Stat label="In transit" value={data.counts.inTransit} accent="amber" />
        <Stat label="Open recalls" value={data.counts.openRecalls} accent={data.counts.openRecalls ? "red" : "slate"} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Status chart */}
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Batches by status</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500">No batches yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {chartData.map((e) => <Cell key={e.name} fill={COLORS[e.name] || "#cbd5e1"} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent batches */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Recent batches</h2>
            <Link to="/batches" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <ul className="space-y-2">
            {data.recentBatches.map((b) => (
              <li key={b.id}>
                <Link to={`/batches/${b.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50">
                  <span className="font-mono text-xs text-brand-700">{b.id}</span>
                  <StatusBadge value={b.status} />
                </Link>
              </li>
            ))}
            {data.recentBatches.length === 0 && <li className="text-sm text-slate-500">None yet.</li>}
          </ul>
        </div>

        {/* Recent inspections */}
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Recent inspections</h2>
          <ul className="space-y-2">
            {data.recentInspections.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <Link to={`/batches/${i.batch.id}`} className="font-mono text-xs text-brand-700 hover:underline">{i.batch.id}</Link>
                <StatusBadge value={i.grade} />
              </li>
            ))}
            {data.recentInspections.length === 0 && <li className="text-sm text-slate-500">None yet.</li>}
          </ul>
        </div>
      </div>

      {data.openRecalls.length > 0 && (
        <div className="card mt-5 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Open recalls</h2>
          <ul className="space-y-2">
            {data.openRecalls.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm">
                <span className="font-medium text-red-800">{r.reason}</span>
                <span className="text-xs text-red-600">{r._count?.parties ?? 0} parties</span>
              </li>
            ))}
          </ul>
          <Link to="/recall" className="mt-3 inline-block text-xs text-brand-600 hover:underline">Manage recalls →</Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = "slate" }) {
  const accents = {
    slate: "text-slate-900",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accents[accent]}`}>{value}</div>
    </div>
  );
}
