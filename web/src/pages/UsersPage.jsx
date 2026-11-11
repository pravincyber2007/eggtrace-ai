import { useEffect, useState } from "react";
import api from "../api/client";
import { PageHeader, Spinner, ErrorBanner, Modal, Field } from "../components/ui";

const ROLES = ["admin", "farm", "inspector", "logistics", "buyer"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const u = await api.get("/users");
      setUsers(u.data.users);
      // Parties endpoint is added in E2; tolerate its absence here.
      try {
        const p = await api.get("/parties");
        setParties(p.data.parties);
      } catch { /* parties not available yet */ }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Users" subtitle="Create users and assign roles and parties">
        <button className="btn-primary" onClick={() => setOpen(true)}>+ New user</button>
      </PageHeader>
      <ErrorBanner message={error} />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Party</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3 text-slate-600">{u.party?.name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewUserModal open={open} onClose={() => setOpen(false)} parties={parties} onCreated={() => { setOpen(false); load(); }} />
    </div>
  );
}

function NewUserModal({ open, onClose, parties, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "farm", partyId: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      await api.post("/users", { ...form, partyId: form.partyId || null });
      onCreated();
      setForm({ name: "", email: "", password: "", role: "farm", partyId: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user");
    } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create user">
      <form onSubmit={submit} className="space-y-3">
        <ErrorBanner message={error} />
        <Field label="Name"><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
        <Field label="Email"><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></Field>
        <Field label="Password"><input className="input" type="text" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={6} /></Field>
        <Field label="Role">
          <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
        </Field>
        <Field label="Party (optional, for logistics/buyer)">
          <select className="input" value={form.partyId} onChange={(e) => set("partyId", e.target.value)}>
            <option value="">— none —</option>
            {parties.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Creating…" : "Create user"}</button>
        </div>
      </form>
    </Modal>
  );
}
