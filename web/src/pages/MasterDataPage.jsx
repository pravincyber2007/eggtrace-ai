import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { PageHeader, Spinner, ErrorBanner, Modal, Field } from "../components/ui";

const TABS = ["Farms", "Flocks", "Parties"];
const PARTY_TYPES = ["collection_centre", "warehouse", "transporter", "buyer"];

export default function MasterDataPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Farms");
  const isAdmin = user?.role === "admin";

  return (
    <div>
      <PageHeader title="Master Data" subtitle="Farms, flocks and parties" />
      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Farms" && <Farms isAdmin={isAdmin} />}
      {tab === "Flocks" && <Flocks canAdd={isAdmin || user?.role === "farm"} />}
      {tab === "Parties" && <Parties isAdmin={isAdmin} />}
    </div>
  );
}

function Farms({ isAdmin }) {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", licenceNo: "" });

  async function load() {
    setLoading(true);
    try { setFarms((await api.get("/farms")).data.farms); }
    catch (e) { setError(e.response?.data?.error || "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault(); setError("");
    try { await api.post("/farms", form); setOpen(false); setForm({ name: "", location: "", licenceNo: "" }); load(); }
    catch (e) { setError(e.response?.data?.error || "Failed to create farm"); }
  }

  if (loading) return <Spinner />;
  return (
    <div>
      <ErrorBanner message={error} />
      {isAdmin && <div className="mb-3 flex justify-end"><button className="btn-primary" onClick={() => setOpen(true)}>+ New farm</button></div>}
      <div className="grid gap-3 sm:grid-cols-2">
        {farms.map((f) => (
          <div key={f.id} className="card p-4">
            <div className="font-semibold text-slate-900">{f.name}</div>
            <div className="text-sm text-slate-500">{f.location}</div>
            <div className="mt-1 text-xs text-slate-400">Licence: {f.licenceNo}</div>
            <div className="mt-2 flex gap-3 text-xs text-slate-500">
              <span>{f._count?.flocks ?? 0} flocks</span>
              <span>{f._count?.batches ?? 0} batches</span>
            </div>
          </div>
        ))}
        {farms.length === 0 && <div className="text-sm text-slate-500">No farms yet.</div>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add farm">
        <form onSubmit={create} className="space-y-3">
          <ErrorBanner message={error} />
          <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Location"><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Field>
          <Field label="Licence number"><input className="input" value={form.licenceNo} onChange={(e) => setForm({ ...form, licenceNo: e.target.value })} required /></Field>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary">Create</button></div>
        </form>
      </Modal>
    </div>
  );
}

function Flocks({ canAdd }) {
  const [flocks, setFlocks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ farmId: "", breed: "", birdCount: "", placementDate: "" });

  async function load() {
    setLoading(true);
    try {
      const [fl, fa] = await Promise.all([api.get("/flocks"), api.get("/farms")]);
      setFlocks(fl.data.flocks); setFarms(fa.data.farms);
    } catch (e) { setError(e.response?.data?.error || "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault(); setError("");
    try { await api.post("/flocks", form); setOpen(false); setForm({ farmId: "", breed: "", birdCount: "", placementDate: "" }); load(); }
    catch (e) { setError(e.response?.data?.error || "Failed to create flock"); }
  }

  if (loading) return <Spinner />;
  return (
    <div>
      <ErrorBanner message={error} />
      {canAdd && <div className="mb-3 flex justify-end"><button className="btn-primary" onClick={() => setOpen(true)}>+ New flock</button></div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Breed</th><th className="px-4 py-3">Farm</th><th className="px-4 py-3">Birds</th><th className="px-4 py-3">Placed</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flocks.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{f.breed}</td>
                <td className="px-4 py-3 text-slate-600">{f.farm?.name}</td>
                <td className="px-4 py-3">{f.birdCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(f.placementDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {flocks.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No flocks yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add flock">
        <form onSubmit={create} className="space-y-3">
          <ErrorBanner message={error} />
          <Field label="Farm">
            <select className="input" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value })} required>
              <option value="">— select farm —</option>
              {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </Field>
          <Field label="Breed"><input className="input" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} required /></Field>
          <Field label="Bird count"><input type="number" className="input" value={form.birdCount} onChange={(e) => setForm({ ...form, birdCount: e.target.value })} required min={1} /></Field>
          <Field label="Placement date"><input type="date" className="input" value={form.placementDate} onChange={(e) => setForm({ ...form, placementDate: e.target.value })} required /></Field>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary">Create</button></div>
        </form>
      </Modal>
    </div>
  );
}

function Parties({ isAdmin }) {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "buyer", contact: "", location: "" });

  async function load() {
    setLoading(true);
    try { setParties((await api.get("/parties")).data.parties); }
    catch (e) { setError(e.response?.data?.error || "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault(); setError("");
    try { await api.post("/parties", form); setOpen(false); setForm({ name: "", type: "buyer", contact: "", location: "" }); load(); }
    catch (e) { setError(e.response?.data?.error || "Failed to create party"); }
  }

  if (loading) return <Spinner />;
  return (
    <div>
      <ErrorBanner message={error} />
      {isAdmin && <div className="mb-3 flex justify-end"><button className="btn-primary" onClick={() => setOpen(true)}>+ New party</button></div>}
      <div className="grid gap-3 sm:grid-cols-2">
        {parties.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">{p.name}</div>
              <span className="badge bg-slate-100 text-slate-600">{p.type.replace("_", " ")}</span>
            </div>
            {p.location && <div className="text-sm text-slate-500">{p.location}</div>}
            {p.contact && <div className="mt-1 text-xs text-slate-400">{p.contact}</div>}
          </div>
        ))}
        {parties.length === 0 && <div className="text-sm text-slate-500">No parties yet.</div>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add party">
        <form onSubmit={create} className="space-y-3">
          <ErrorBanner message={error} />
          <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Type">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {PARTY_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Contact"><input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
          <Field label="Location"><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary">Create</button></div>
        </form>
      </Modal>
    </div>
  );
}
