import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { PageHeader, Spinner, ErrorBanner, Modal, Field, StatusBadge } from "../components/ui";

export default function RecallPage() {
  const [tab, setTab] = useState("search");
  return (
    <div>
      <PageHeader title="Search & Recall" subtitle="Trace batches and manage recalls" />
      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 max-w-sm">
        {[["search", "Search & Trace"], ["recalls", "Recalls"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            {l}
          </button>
        ))}
      </div>
      {tab === "search" ? <SearchTrace /> : <Recalls />}
    </div>
  );
}

function SearchTrace() {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [parties, setParties] = useState([]);
  const [filters, setFilters] = useState({ q: "", farmId: "", from: "", to: "", destinationPartyId: "" });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [trace, setTrace] = useState(null); // { batchId, forward, backward }
  const [recallOpen, setRecallOpen] = useState(false);
  const [elapsed, setElapsed] = useState(null);
  const canRecall = user?.role === "admin" || user?.role === "inspector";

  useEffect(() => {
    api.get("/farms").then((r) => setFarms(r.data.farms)).catch(() => {});
    api.get("/parties").then((r) => setParties(r.data.parties)).catch(() => {});
  }, []);

  async function search(e) {
    e?.preventDefault(); setError(""); setTrace(null);
    const t0 = performance.now();
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
      const res = await api.get(`/trace/search?${params}`);
      setResults(res.data.batches); setSearched(true);
      setElapsed(Math.round(performance.now() - t0));
    } catch (err) { setError(err.response?.data?.error || "Search failed"); }
  }

  async function doTrace(batchId) {
    setError("");
    try {
      const [f, b] = await Promise.all([api.get(`/trace/forward/${batchId}`), api.get(`/trace/backward/${batchId}`)]);
      setTrace({ batchId, forward: f.data, backward: b.data });
    } catch (err) { setError(err.response?.data?.error || "Trace failed"); }
  }

  return (
    <div className="space-y-5">
      <ErrorBanner message={error} />
      <form onSubmit={search} className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Batch ID"><input className="input" placeholder="EGG-..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /></Field>
          <Field label="Farm">
            <select className="input" value={filters.farmId} onChange={(e) => setFilters({ ...filters, farmId: e.target.value })}>
              <option value="">All farms</option>
              {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </Field>
          <Field label="From"><input type="date" className="input" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></Field>
          <Field label="To"><input type="date" className="input" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></Field>
          <Field label="Destination">
            <select className="input" value={filters.destinationPartyId} onChange={(e) => setFilters({ ...filters, destinationPartyId: e.target.value })}>
              <option value="">Any</option>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-3 flex justify-end"><button className="btn-primary">Search</button></div>
      </form>

      {searched && (
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500">
            <span>{results.length} result(s)</span>
            {elapsed != null && <span>found in {elapsed} ms</span>}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-2">Batch</th><th className="px-4 py-2">Farm</th><th className="px-4 py-2">Qty</th><th className="px-4 py-2">Holder</th><th className="px-4 py-2">Status</th><th className="px-4 py-2"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2"><Link to={`/batches/${b.id}`} className="font-mono text-xs text-brand-700 hover:underline">{b.id}</Link></td>
                  <td className="px-4 py-2 text-slate-600">{b.farm?.name}</td>
                  <td className="px-4 py-2">{b.quantity.toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-600">{b.currentHolder?.name || "At farm"}</td>
                  <td className="px-4 py-2"><StatusBadge value={b.status} /></td>
                  <td className="px-4 py-2 text-right"><button className="text-xs font-semibold text-brand-600 hover:underline" onClick={() => doTrace(b.id)}>Trace →</button></td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No matches.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {trace && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Trace — <span className="font-mono normal-case text-slate-800">{trace.batchId}</span></h2>
            {canRecall && <button className="btn-danger !py-1.5 text-xs" onClick={() => setRecallOpen(true)}>Create recall</button>}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Forward */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-slate-400">Forward → affected buyers ({trace.forward.parties.length})</h3>
              {trace.forward.parties.length === 0 ? <p className="text-sm text-slate-500">No downstream parties yet.</p> : (
                <div className="space-y-2">
                  {trace.forward.parties.map((p) => (
                    <div key={p.partyId} className="rounded-lg border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{p.name}</span>
                        <span className="badge bg-slate-100 text-slate-600">{p.type.replace("_", " ")}</span>
                      </div>
                      <div className="text-xs text-slate-500">{p.totalQuantity.toLocaleString()} eggs · {p.batches.length} batch(es){p.contact ? ` · ${p.contact}` : ""}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 text-xs text-slate-400">{trace.forward.batches.length} affected batch(es) in total</div>
            </div>

            {/* Backward */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-slate-400">Backward → source</h3>
              {trace.backward.source ? (
                <div className="rounded-lg border border-slate-100 p-3 text-sm">
                  <div><span className="text-slate-400">Farm:</span> <span className="font-medium">{trace.backward.source.farm?.name}</span></div>
                  <div><span className="text-slate-400">Licence:</span> {trace.backward.source.farm?.licenceNo}</div>
                  <div><span className="text-slate-400">Flock:</span> {trace.backward.source.flock?.breed}</div>
                  <div><span className="text-slate-400">Lay date:</span> {new Date(trace.backward.source.layDate).toLocaleDateString()}</div>
                </div>
              ) : <p className="text-sm text-slate-500">No source found.</p>}
              <div className="mt-2">
                <div className="text-xs text-slate-400">Parent chain:</div>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                  {trace.backward.chain.map((c, i) => (
                    <span key={c.id} className="flex items-center gap-1">
                      <span className="font-mono text-slate-600">{c.id}</span>
                      {i < trace.backward.chain.length - 1 && <span className="text-slate-300">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <CreateRecallModal open={recallOpen} onClose={() => setRecallOpen(false)} batchId={trace.batchId} onDone={() => { setRecallOpen(false); search(); setTrace(null); }} />
        </div>
      )}
    </div>
  );
}

function CreateRecallModal({ open, onClose, batchId, onDone }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const res = await api.post("/recalls", { reason, batchIds: [batchId] });
      setResult(res.data);
    } catch (err) { setError(err.response?.data?.error || "Failed to create recall"); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Create recall — ${batchId}`}>
      {result ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Recall created. {result.affectedBatchCount} affected batch(es), {result.recall.parties.length} party record(s).
          </div>
          <div className="flex justify-end"><button className="btn-primary" onClick={() => { setResult(null); setReason(""); onDone(); }}>Done</button></div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <ErrorBanner message={error} />
          <p className="text-xs text-slate-500">This traces all downstream batches/buyers and flags them for recall.</p>
          <Field label="Reason"><textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="e.g. Salmonella risk detected in flock" /></Field>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-danger" disabled={busy}>{busy ? "Creating…" : "Create recall"}</button></div>
        </form>
      )}
    </Modal>
  );
}

function Recalls() {
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    try { setRecalls((await api.get("/recalls")).data.recalls); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (selected) return <RecallDetail id={selected} onBack={() => { setSelected(null); load(); }} />;

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Parties</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3"></th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {recalls.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{r.reason}</td>
              <td className="px-4 py-3">{r._count?.parties ?? 0}</td>
              <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
              <td className="px-4 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right"><button className="text-xs font-semibold text-brand-600 hover:underline" onClick={() => setSelected(r.id)}>Open</button></td>
            </tr>
          ))}
          {recalls.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No recalls yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function RecallDetail({ id, onBack }) {
  const { user } = useAuth();
  const [recall, setRecall] = useState(null);
  const [loading, setLoading] = useState(true);
  const canManage = user?.role === "admin" || user?.role === "inspector";

  async function load() {
    setLoading(true);
    try { setRecall((await api.get(`/recalls/${id}`)).data.recall); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function setStatus(rpId, status) {
    await api.patch(`/recalls/${id}/parties/${rpId}`, { status });
    load();
  }
  async function exportCsv() {
    const res = await api.get(`/recalls/${id}/export.csv`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a"); a.href = url; a.download = `recall-${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Spinner />;
  if (!recall) return null;

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-slate-500 hover:underline">← Back to recalls</button>
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{recall.reason}</h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <StatusBadge value={recall.status} />
              <span>by {recall.createdBy?.name}</span>
              <span>· {new Date(recall.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <button className="btn-secondary !py-1.5 text-xs" onClick={exportCsv}>⬇ Export CSV</button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-3 py-2">Party</th><th className="px-3 py-2">Batch</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">Status</th>{canManage && <th className="px-3 py-2">Update</th>}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recall.parties.map((rp) => (
                <tr key={rp.id}>
                  <td className="px-3 py-2"><div className="font-medium text-slate-800">{rp.party.name}</div><div className="text-xs text-slate-400">{rp.party.type.replace("_", " ")}</div></td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{rp.batch.id}</td>
                  <td className="px-3 py-2">{rp.quantity.toLocaleString()}</td>
                  <td className="px-3 py-2"><StatusBadge value={rp.status} /></td>
                  {canManage && (
                    <td className="px-3 py-2">
                      <select className="input !py-1 text-xs" value={rp.status} onChange={(e) => setStatus(rp.id, e.target.value)}>
                        {["Notified", "Acknowledged", "Returned"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
              {recall.parties.length === 0 && <tr><td colSpan={canManage ? 5 : 4} className="px-3 py-6 text-center text-slate-500">No affected parties recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
