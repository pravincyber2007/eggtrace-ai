import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Spinner, ErrorBanner, Modal, Field, StatusBadge } from "../components/ui";
import HandoverModal from "../components/HandoverModal";

export default function BatchDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [splitOpen, setSplitOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBatch((await api.get(`/batches/${id}`)).data.batch); }
    catch (e) { setError(e.response?.data?.error || "Failed to load batch"); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function downloadLabel() {
    const res = await api.get(`/batches/${id}/label`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url; a.download = `label-${id}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Spinner />;
  if (!batch) return <ErrorBanner message={error || "Not found"} />;

  const canSplit = user?.role === "logistics" || user?.role === "admin";
  const canHandover = user?.role === "logistics" || user?.role === "admin" || user?.role === "farm";

  return (
    <div>
      <div className="mb-4">
        <Link to="/batches" className="text-sm text-slate-500 hover:underline">← Back to batches</Link>
      </div>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-slate-900">{batch.id}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge value={batch.status} />
            {batch.parent && <Link to={`/batches/${batch.parent.id}`} className="text-xs text-slate-500 hover:underline">child of {batch.parent.id}</Link>}
          </div>
        </div>
        <div className="flex gap-2">
          {canHandover && <button className="btn-primary" onClick={() => setHandoverOpen(true)}>Record handover</button>}
          {canSplit && <button className="btn-secondary" onClick={() => setSplitOpen(true)}>Split batch</button>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Info */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Batch details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Farm" value={batch.farm?.name} />
            <Info label="Licence" value={batch.farm?.licenceNo} />
            <Info label="Flock / breed" value={batch.flock?.breed} />
            <Info label="Lay date" value={new Date(batch.layDate).toLocaleDateString()} />
            <Info label="Quantity" value={`${batch.quantity.toLocaleString()} eggs`} />
            <Info label="Current holder" value={batch.currentHolder?.name || "At farm"} />
          </dl>

          {batch.children?.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Split into</h3>
              <div className="space-y-1">
                {batch.children.map((c) => (
                  <Link key={c.id} to={`/batches/${c.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50">
                    <span className="font-mono text-xs text-brand-700">{c.id}</span>
                    <span className="text-slate-500">{c.quantity.toLocaleString()} eggs</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QR / label */}
        <div className="card p-5 text-center">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">QR label</h2>
          <img src={`/api/batches/${batch.id}/qr`} alt="Batch QR" className="mx-auto h-40 w-40 rounded-lg border border-slate-100" />
          <p className="mt-2 break-all text-xs text-slate-400">/t/{batch.id}</p>
          <button className="btn-primary mt-3 w-full" onClick={downloadLabel}>⬇ Download PDF label</button>
        </div>
      </div>

      {/* Inspections (E4) */}
      <Inspections batch={batch} user={user} onChange={load} />

      {/* Timeline (expanded in E5) */}
      <Timeline batch={batch} />

      <SplitModal open={splitOpen} onClose={() => setSplitOpen(false)} batch={batch} onDone={() => { setSplitOpen(false); load(); }} />
      <HandoverModal open={handoverOpen} onClose={() => setHandoverOpen(false)} batch={batch} onDone={() => { setHandoverOpen(false); load(); }} />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}

function Inspections({ batch, user, onChange }) {
  const [open, setOpen] = useState(false);
  const canAdd = user?.role === "inspector" || user?.role === "admin";
  const inspections = batch.inspections || [];

  return (
    <div className="card mt-5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Inspections ({inspections.length})</h2>
        {canAdd && <button className="btn-secondary !py-1.5 text-xs" onClick={() => setOpen(true)}>+ Add inspection</button>}
      </div>
      {inspections.length === 0 ? (
        <p className="text-sm text-slate-500">No inspections recorded.</p>
      ) : (
        <div className="space-y-3">
          {inspections.map((i) => (
            <div key={i.id} className="flex gap-4 rounded-lg border border-slate-100 p-3">
              {i.photoPath && (
                <a href={i.photoPath} target="_blank" rel="noreferrer">
                  <img src={i.photoPath} alt="Tray" className="h-16 w-16 rounded-md object-cover" />
                </a>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge value={i.grade} />
                  <span className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-sm text-slate-700">{i.defectCount} defects · {i.rejectedCount} rejected</div>
                {i.remarks && <div className="text-xs text-slate-500">{i.remarks}</div>}
                <div className="text-xs text-slate-400">by {i.inspector?.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddInspectionModal open={open} onClose={() => setOpen(false)} batch={batch} onDone={() => { setOpen(false); onChange(); }} />
    </div>
  );
}

function AddInspectionModal({ open, onClose, batch, onDone }) {
  const [form, setForm] = useState({ grade: "A", defectCount: "", rejectedCount: "", remarks: "" });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("batchId", batch.id);
      fd.append("grade", form.grade);
      fd.append("defectCount", form.defectCount || 0);
      fd.append("rejectedCount", form.rejectedCount || 0);
      fd.append("remarks", form.remarks);
      if (photo) fd.append("photo", photo);
      await api.post("/inspections", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm({ grade: "A", defectCount: "", rejectedCount: "", remarks: "" }); setPhoto(null);
      onDone();
    } catch (err) { setError(err.response?.data?.error || "Failed to save inspection"); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record inspection">
      <form onSubmit={submit} className="space-y-3">
        <ErrorBanner message={error} />
        <Field label="Grade">
          <select className="input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
            {["A", "B", "C", "Reject"].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Defect count"><input type="number" className="input" value={form.defectCount} onChange={(e) => setForm({ ...form, defectCount: e.target.value })} min={0} /></Field>
          <Field label="Rejected count"><input type="number" className="input" value={form.rejectedCount} onChange={(e) => setForm({ ...form, rejectedCount: e.target.value })} min={0} /></Field>
        </div>
        <Field label="Remarks"><textarea className="input" rows={2} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Field>
        <Field label="Tray photo (optional)"><input type="file" accept="image/*" className="input" onChange={(e) => setPhoto(e.target.files?.[0] || null)} /></Field>
        <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save inspection"}</button></div>
      </form>
    </Modal>
  );
}

function Timeline({ batch }) {
  const events = [];
  events.push({ t: batch.createdAt, title: "Batch created", detail: `${batch.quantity.toLocaleString()} eggs at ${batch.farm?.name}`, icon: "📦" });
  (batch.inspections || []).forEach((i) =>
    events.push({ t: i.createdAt, title: `Inspection — grade ${i.grade}`, detail: `${i.defectCount} defects, ${i.rejectedCount} rejected · ${i.inspector?.name}`, icon: "🔍" })
  );
  (batch.movements || []).forEach((m) =>
    events.push({ t: m.createdAt, title: `Handover → ${m.toParty?.name}`, detail: `${m.quantity.toLocaleString()} eggs${m.temperature != null ? ` · ${m.temperature}°C` : ""}${m.location ? ` · ${m.location}` : ""}`, icon: "🚚" })
  );
  events.sort((a, b) => new Date(a.t) - new Date(b.t));

  return (
    <div className="card mt-5 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase text-slate-500">Timeline</h2>
      <ol className="relative border-l border-slate-200 pl-6">
        {events.map((e, i) => (
          <li key={i} className="mb-5 last:mb-0">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm">{e.icon}</span>
            <div className="text-sm font-semibold text-slate-800">{e.title}</div>
            <div className="text-xs text-slate-500">{e.detail}</div>
            <div className="text-xs text-slate-400">{new Date(e.t).toLocaleString()}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SplitModal({ open, onClose, batch, onDone }) {
  const [rows, setRows] = useState([{ quantity: "", toPartyId: "" }]);
  const [parties, setParties] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) api.get("/parties").then((r) => setParties(r.data.parties)).catch(() => {}); }, [open]);

  const total = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await api.post(`/batches/${batch.id}/split`, {
        children: rows.filter((r) => r.quantity).map((r) => ({ quantity: Number(r.quantity), toPartyId: r.toPartyId || null })),
      });
      onDone();
    } catch (err) { setError(err.response?.data?.error || "Failed to split"); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Split ${batch.id}`}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBanner message={error} />
        <p className="text-xs text-slate-500">Parent quantity: {batch.quantity.toLocaleString()} eggs. Child totals must not exceed it.</p>
        {rows.map((r, idx) => (
          <div key={idx} className="flex gap-2">
            <input type="number" placeholder="Quantity" className="input" value={r.quantity}
              onChange={(e) => setRows(rows.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x))} min={1} />
            <select className="input" value={r.toPartyId}
              onChange={(e) => setRows(rows.map((x, i) => i === idx ? { ...x, toPartyId: e.target.value } : x))}>
              <option value="">— holder (optional) —</option>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button type="button" className="text-sm text-brand-600 hover:underline" onClick={() => setRows([...rows, { quantity: "", toPartyId: "" }])}>+ Add child</button>
          <span className={`text-xs ${total > batch.quantity ? "text-red-600" : "text-slate-500"}`}>Total: {total.toLocaleString()}</span>
        </div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy || total > batch.quantity}>{busy ? "Splitting…" : "Split"}</button></div>
      </form>
    </Modal>
  );
}
