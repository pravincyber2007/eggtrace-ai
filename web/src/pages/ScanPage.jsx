import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/client";
import { PageHeader, ErrorBanner, StatusBadge } from "../components/ui";
import HandoverModal from "../components/HandoverModal";

// Extract a batch id from a scanned value (URL ".../t/<id>" or a raw id).
function parseBatchId(text) {
  if (!text) return null;
  const m = text.match(/\/t\/([^/?#\s]+)/);
  if (m) return decodeURIComponent(m[1]);
  return text.trim();
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState("");
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [done, setDone] = useState(false);
  const scannerRef = useRef(null);

  async function loadBatch(id) {
    setError(""); setDone(false);
    try {
      const res = await api.get(`/batches/${id}`);
      setBatch(res.data.batch);
    } catch (e) {
      setError(e.response?.data?.error || `Batch ${id} not found`);
      setBatch(null);
    }
  }

  async function startScan() {
    setError(""); setScanning(true);
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decoded) => {
          const id = parseBatchId(decoded);
          await stopScan();
          if (id) loadBatch(id);
        },
        () => {}
      );
    } catch (e) {
      setError("Could not start camera. Use manual entry below.");
      setScanning(false);
    }
  }

  async function stopScan() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch { /* ignore */ }
    setScanning(false);
  }

  useEffect(() => () => { stopScan(); }, []);

  return (
    <div>
      <PageHeader title="Scan & Handover" subtitle="Scan a batch QR to record a handover" />
      <ErrorBanner message={error} />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Camera scan</h2>
          <div id="qr-reader" className="overflow-hidden rounded-lg bg-slate-100" style={{ minHeight: scanning ? 260 : 0 }} />
          {!scanning ? (
            <button className="btn-primary mt-3 w-full" onClick={startScan}>📷 Start camera</button>
          ) : (
            <button className="btn-secondary mt-3 w-full" onClick={stopScan}>Stop</button>
          )}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Or enter batch ID</h3>
            <form onSubmit={(e) => { e.preventDefault(); if (manual.trim()) loadBatch(parseBatchId(manual)); }} className="flex gap-2">
              <input className="input font-mono" placeholder="EGG-..." value={manual} onChange={(e) => setManual(e.target.value)} />
              <button className="btn-primary shrink-0">Find</button>
            </form>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Batch</h2>
          {!batch ? (
            <p className="text-sm text-slate-500">Scan or enter a batch ID to begin.</p>
          ) : (
            <div>
              <Link to={`/batches/${batch.id}`} className="font-mono text-sm font-bold text-brand-700 hover:underline">{batch.id}</Link>
              <div className="mt-1"><StatusBadge value={batch.status} /></div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-slate-400">Farm</dt><dd className="font-medium">{batch.farm?.name}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Quantity</dt><dd className="font-medium">{batch.quantity.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Holder</dt><dd className="font-medium">{batch.currentHolder?.name || "At farm"}</dd></div>
              </dl>
              {done && <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">✓ Handover recorded.</div>}
              <button className="btn-primary mt-4 w-full" onClick={() => setHandoverOpen(true)}>Record handover</button>
            </div>
          )}
        </div>
      </div>

      <HandoverModal
        open={handoverOpen}
        onClose={() => setHandoverOpen(false)}
        batch={batch}
        onDone={() => { setHandoverOpen(false); setDone(true); loadBatch(batch.id); }}
      />
    </div>
  );
}
