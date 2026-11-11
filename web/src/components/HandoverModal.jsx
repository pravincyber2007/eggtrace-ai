import { useEffect, useState } from "react";
import api from "../api/client";
import { Modal, Field, ErrorBanner } from "./ui";

// Records a handover for a batch (S5.2). Reused by Scan page and Batch detail.
export default function HandoverModal({ open, onClose, batch, onDone }) {
  const [parties, setParties] = useState([]);
  const [form, setForm] = useState({ toPartyId: "", quantity: "", location: "", temperature: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ toPartyId: "", quantity: String(batch?.quantity ?? ""), location: "", temperature: "" });
    setError("");
    api.get("/parties").then((r) => setParties(r.data.parties)).catch(() => {});
  }, [open, batch]);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await api.post("/movements", {
        batchId: batch.id,
        toPartyId: form.toPartyId,
        quantity: Number(form.quantity),
        location: form.location,
        temperature: form.temperature,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record handover");
    } finally { setBusy(false); }
  }

  if (!batch) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Record handover — ${batch.id}`}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBanner message={error} />
        <p className="text-xs text-slate-500">Current holder: {batch.currentHolder?.name || "At farm"}</p>
        <Field label="Hand over to">
          <select className="input" value={form.toPartyId} onChange={(e) => setForm({ ...form, toPartyId: e.target.value })} required>
            <option value="">— select party —</option>
            {parties.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.type.replace("_", " ")})</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity"><input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required min={1} /></Field>
          <Field label="Temperature (°C)"><input type="number" step="0.1" className="input" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} /></Field>
        </div>
        <Field label="Location"><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Record handover"}</button>
        </div>
      </form>
    </Modal>
  );
}
