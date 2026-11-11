import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { PageHeader, Spinner, ErrorBanner, Modal, Field, StatusBadge } from "../components/ui";

export default function BatchesPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const canCreate = user?.role === "farm" || user?.role === "admin";

  async function load() {
    setLoading(true);
    try { setBatches((await api.get("/batches")).data.batches); }
    catch (e) { setError(e.response?.data?.error || "Failed to load batches"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  return (
    <div>
      <PageHeader title="Batches" subtitle="Egg batches from farm to buyer">
        {canCreate && <button className="btn-primary" onClick={() => setOpen(true)}>+ New batch</button>}
      </PageHeader>
      <ErrorBanner message={error} />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Batch ID</th>
              <th className="px-4 py-3">Farm</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Holder</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/batches/${b.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">{b.id}</Link>
                  {b._count?.children > 0 && <span className="ml-2 text-xs text-slate-400">({b._count.children} splits)</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{b.farm?.name}</td>
                <td className="px-4 py-3">{b.quantity.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">{b.currentHolder?.name || "At farm"}</td>
                <td className="px-4 py-3"><StatusBadge value={b.status} /></td>
              </tr>
            ))}
            {batches.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No batches yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <NewBatchModal open={open} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); load(); }} />
    </div>
  );
}

function NewBatchModal({ open, onClose, onCreated }) {
  const [farms, setFarms] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [form, setForm] = useState({ farmId: "", flockId: "", layDate: "", quantity: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get("/farms").then((r) => setFarms(r.data.farms)).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!form.farmId) { setFlocks([]); return; }
    api.get(`/flocks?farmId=${form.farmId}`).then((r) => setFlocks(r.data.flocks)).catch(() => {});
  }, [form.farmId]);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await api.post("/batches", { ...form, quantity: Number(form.quantity) });
      setForm({ farmId: "", flockId: "", layDate: "", quantity: "" });
      onCreated();
    } catch (err) { setError(err.response?.data?.error || "Failed to create batch"); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create batch">
      <form onSubmit={submit} className="space-y-3">
        <ErrorBanner message={error} />
        <Field label="Farm">
          <select className="input" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value, flockId: "" })} required>
            <option value="">— select farm —</option>
            {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </Field>
        <Field label="Flock">
          <select className="input" value={form.flockId} onChange={(e) => setForm({ ...form, flockId: e.target.value })} required disabled={!form.farmId}>
            <option value="">— select flock —</option>
            {flocks.map((f) => <option key={f.id} value={f.id}>{f.breed}</option>)}
          </select>
        </Field>
        <Field label="Lay date"><input type="date" className="input" value={form.layDate} onChange={(e) => setForm({ ...form, layDate: e.target.value })} required /></Field>
        <Field label="Quantity (eggs)"><input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required min={1} /></Field>
        <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? "Creating…" : "Create batch"}</button></div>
      </form>
    </Modal>
  );
}
