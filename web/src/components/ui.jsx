// Small shared UI helpers used across pages.

export function Spinner({ label = "Loading…" }) {
  return <div className="p-8 text-center text-slate-500">{label}</div>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const statusStyles = {
  "At farm": "bg-slate-100 text-slate-700",
  "In transit": "bg-amber-100 text-amber-800",
  Delivered: "bg-green-100 text-green-800",
  Recalled: "bg-red-100 text-red-800",
  A: "bg-green-100 text-green-800",
  B: "bg-amber-100 text-amber-800",
  C: "bg-orange-100 text-orange-800",
  Reject: "bg-red-100 text-red-800",
  Notified: "bg-amber-100 text-amber-800",
  Acknowledged: "bg-blue-100 text-blue-800",
  Returned: "bg-green-100 text-green-800",
  Open: "bg-red-100 text-red-800",
  Closed: "bg-slate-100 text-slate-700",
};

export function StatusBadge({ value }) {
  const cls = statusStyles[value] || "bg-slate-100 text-slate-700";
  return <span className={`badge ${cls}`}>{value}</span>;
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
